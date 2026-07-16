package backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class AIChatController {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        // If API key is not present, use Mock Mode
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            return ResponseEntity.ok(generateMockResponse(request.getMessage()));
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

            // Prepare Gemini Request Payload
            Map<String, Object> payload = new HashMap<>();

            // Contents list (conversation history + latest message)
            List<Map<String, Object>> contents = new ArrayList<>();

            // 1. Add history
            if (request.getHistory() != null) {
                for (ChatMessage msg : request.getHistory()) {
                    Map<String, Object> contentObj = new HashMap<>();
                    // Gemini expects "user" and "model", map accordingly
                    String role = msg.getRole();
                    if ("assistant".equals(role)) {
                        role = "model";
                    }
                    contentObj.put("role", role);
                    
                    Map<String, String> part = new HashMap<>();
                    part.put("text", msg.getMessage());
                    contentObj.put("parts", Collections.singletonList(part));
                    
                    contents.add(contentObj);
                }
            }

            // 2. Add latest user message
            Map<String, Object> latestContent = new HashMap<>();
            latestContent.put("role", "user");
            Map<String, String> latestPart = new HashMap<>();
            latestPart.put("text", request.getMessage());
            latestContent.put("parts", Collections.singletonList(latestPart));
            contents.add(latestContent);

            payload.put("contents", contents);

            // 3. System Instruction
            Map<String, Object> systemInstruction = new HashMap<>();
            Map<String, String> instructionPart = new HashMap<>();
            instructionPart.put("text", 
                "Bạn là trợ lý dinh dưỡng AI thông minh và thân thiện của cửa hàng 'Healthy Food'. " +
                "Nhiệm vụ của bạn là tư vấn cho khách hàng về dinh dưỡng, thực phẩm lành mạnh, gợi ý thực đơn (cho người tập gym, giảm cân, tiểu đường, phụ nữ mang thai...) và giới thiệu các sản phẩm tốt cho sức khoẻ. " +
                "Hãy trả lời một cách lịch sự, ngắn gọn, dễ hiểu và hoàn toàn bằng tiếng Việt. Nếu khách hỏi những câu không liên quan đến sức khỏe/dinh dưỡng/thực phẩm, hãy khéo léo hướng họ quay lại chủ đề của shop."
            );
            systemInstruction.put("parts", Collections.singletonList(instructionPart));
            payload.put("systemInstruction", systemInstruction);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Send request to Gemini API
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // Parse response: responseBody.candidates[0].content.parts[0].text
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                    if (content != null) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String aiResponseText = (String) parts.get(0).get("text");
                            
                            Map<String, Object> responseMap = new HashMap<>();
                            responseMap.put("success", true);
                            responseMap.put("reply", aiResponseText);
                            return ResponseEntity.ok(responseMap);
                        }
                    }
                }
            }
            
            // Fallback if structure is unexpected
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Không thể phân tích phản hồi từ AI"));

        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            // In case of any API error (e.g. invalid key, quota limit), fallback to Mock Mode with warning
            Map<String, Object> mockRes = generateMockResponse(request.getMessage());
            mockRes.put("warning", "Lỗi kết nối Gemini API: " + e.getMessage() + ". Đã chuyển sang Mock Mode.");
            return ResponseEntity.ok(mockRes);
        }
    }

    private Map<String, Object> generateMockResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        String reply;

        if (msg.contains("gym") || msg.contains("tập gym") || msg.contains("tăng cơ") || msg.contains("cơ bắp")) {
            reply = "Chào bạn! Đối với người tập gym, chế độ ăn giàu protein (đạm) là cực kỳ quan trọng để xây dựng và phục hồi cơ bắp. Cửa hàng Healthy Food có các nhóm thực phẩm giàu đạm như ức gà, các loại hạt dinh dưỡng (hạt chia, óc chó, hạnh nhân), ngũ cốc nguyên hạt và Whey Protein chất lượng cao. Bạn có thể tham khảo danh mục 'Protein & Supplements' của shop để chọn sản phẩm phù hợp nhé!";
        } else if (msg.contains("giảm cân") || msg.contains("calo") || msg.contains("béo") || msg.contains("diet")) {
            reply = "Chào bạn! Để giảm cân lành mạnh, nguyên tắc cốt lõi là thâm hụt calo (năng lượng nạp vào ít hơn năng lượng tiêu thụ) nhưng vẫn đảm bảo đủ chất dinh dưỡng. Bạn nên ăn các thực phẩm giàu chất xơ, ít calo để no lâu hơn. Healthy Food gợi ý cho bạn: gạo lứt, yến mạch, các loại rau củ hữu cơ và trái cây tươi ít ngọt (như táo, bưởi, bơ). Hãy ghé xem danh mục 'Organic Foods' của tụi mình nhé!";
        } else if (msg.contains("tiểu đường") || msg.contains("đường huyết")) {
            reply = "Chào bạn! Đối với người bệnh tiểu đường, việc kiểm soát chỉ số đường huyết (GI) trong thực phẩm là rất quan trọng. Bạn nên hạn chế đường tinh luyện và tinh bột hấp thu nhanh. Hãy ưu tiên tinh bột hấp thu chậm (gạo lứt, yến mạch), chất béo tốt (các loại hạt, dầu oliu) và chất xơ. Healthy Food có phân loại riêng các sản phẩm phù hợp cho người tiểu đường ở mục 'Target: Diabetes'. Bạn có thể tham khảo nha!";
        } else if (msg.contains("bầu") || msg.contains("mang thai") || msg.contains("mẹ bầu") || msg.contains("có thai")) {
            reply = "Chào bạn! Phụ nữ mang thai cần chế độ dinh dưỡng phong phú và giàu acid folic, sắt, canxi, omega-3 để thai nhi phát triển tốt nhất. Bạn nên bổ sung sữa hữu cơ, trái cây tươi giàu vitamin C (để hấp thụ sắt tốt hơn), các loại cá béo hoặc hạt giàu omega-3 (óc chó, hạnh nhân). Mời bạn vào mục tìm kiếm nhóm sản phẩm cho 'Pregnant Women' để mua sắm an toàn nhé!";
        } else if (msg.contains("sản phẩm") || msg.contains("bán gì") || msg.contains("mua") || msg.contains("đồ ăn")) {
            reply = "Cửa hàng Healthy Food hiện tại đang bán các dòng sản phẩm chất lượng cao bao gồm:\n" +
                    "1. 🥦 **Organic Foods**: Thực phẩm hữu cơ tự nhiên.\n" +
                    "2. 💪 **Protein & Supplements**: Đạm & Thực phẩm hỗ trợ tập luyện.\n" +
                    "3. 🍎 **Fresh Fruits**: Trái cây tươi sạch mỗi ngày.\n" +
                    "4. 🥜 **Healthy Snacks**: Đồ ăn vặt dinh dưỡng lành mạnh.\n" +
                    "Bạn có thể click vào danh mục trên trang chủ để xem chi tiết sản phẩm!";
        } else {
            reply = "Xin chào! Mình là trợ lý dinh dưỡng AI của Healthy Food. Mình có thể giúp gì cho bạn? Bạn có thể hỏi mình về chế độ ăn uống lành mạnh, tư vấn thực đơn cho người tập gym, giảm cân, người tiểu đường hoặc tìm hiểu các sản phẩm của shop nhé!";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reply", "[Mock Mode] " + reply);
        return response;
    }

    // DTO classes
    public static class ChatRequest {
        private String message;
        private List<ChatMessage> history;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<ChatMessage> getHistory() { return history; }
        public void setHistory(List<ChatMessage> history) { this.history = history; }
    }

    public static class ChatMessage {
        private String role; // "user" or "model"
        private String message;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
