package backend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ── Serve uploaded images statically ──────────────────────────
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(System.getProperty("user.dir"), "Backend", "uploads");
        String uploadUri = uploadPath.toUri().toString();

        System.out.println("📁 Serving uploads from: " + uploadUri);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri);
    }

    // ── CORS — allow React frontend on port 5173 ──────────────────
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",  // Vite dev server
                        "http://localhost:3000"   // CRA fallback
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}