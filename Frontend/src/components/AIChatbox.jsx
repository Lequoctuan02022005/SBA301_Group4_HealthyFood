import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChatbubbleEllipses, IoClose, IoSend, IoSparkles, IoTrashOutline } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './AIChatbox.css';

const AIChatbox = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Get current user info to key chat history
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userKey = user?.email || 'guest';
  const storageKey = `healthyfood_chat_${userKey}`;

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    } else {
      // Default welcome message
      setMessages([
        {
          role: 'model',
          message: `Chào ${user?.fullName || 'bạn'}! Mình là trợ lý dinh dưỡng AI của Healthy Food. Mình có thể giúp gì cho bạn hôm nay?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [storageKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Scroll to bottom when messages update or panel opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Check if user is logged in (don't render chatbox on login/register pages)
  const token = localStorage.getItem('token');
  if (!token) return null;

  const handleSend = async (textToSend) => {
    const messageContent = textToSend || inputValue;
    if (!messageContent.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }

    // Add user message
    const newUserMessage = {
      role: 'user',
      message: messageContent,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Map history for Gemini API formatting
      // Backend expects role "user" or "model"
      const history = messages
        .filter((msg, idx) => idx > 0) // Skip first welcome message
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          message: msg.message
        }));

      const response = await api.post('/chat', {
        message: messageContent,
        history: history
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            message: response.data.reply,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          message: 'Xin lỗi bạn, kết nối của mình đang gặp sự cố. Bạn vui lòng thử lại sau nhé!',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xoá lịch sử trò chuyện này không?')) {
      const defaultMsg = [
        {
          role: 'model',
          message: `Chào ${user?.fullName || 'bạn'}! Mình là trợ lý dinh dưỡng AI của Healthy Food. Mình có thể giúp gì cho bạn hôm nay?`,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(defaultMsg);
      localStorage.setItem(storageKey, JSON.stringify(defaultMsg));
    }
  };

  const suggestions = [
    'Tập gym nên ăn gì?',
    'Gợi ý thực đơn giảm cân',
    'Dinh dưỡng cho người tiểu đường',
    'Sản phẩm nổi bật của shop'
  ];

  return (
    <div className="ai-chatbox-container">
      {/* Floating Chat Bubble */}
      <motion.button
        className="chat-bubble-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Mở trợ lý AI"
      >
        {isOpen ? <IoClose size={26} /> : <IoChatbubbleEllipses size={26} />}
        {!isOpen && (
          <span className="chat-badge">
            <IoSparkles className="spark-icon" /> AI
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="avatar-ai">
                  <IoSparkles size={16} className="avatar-icon" />
                </div>
                <div>
                  <h4>Trợ lý Dinh Dưỡng AI</h4>
                  <span className="online-status">Đang hoạt động</span>
                </div>
              </div>
              <div className="header-actions">
                <button 
                  onClick={handleClearChat} 
                  title="Xoá lịch sử chat" 
                  className="clear-chat-btn"
                >
                  <IoTrashOutline size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  title="Đóng chat"
                  className="close-panel-btn"
                >
                  <IoClose size={20} />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="chat-messages-body">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-wrapper ${msg.role === 'user' ? 'msg-user' : 'msg-ai'} ${msg.isError ? 'msg-err' : ''}`}
                >
                  {msg.role !== 'user' && (
                    <div className="message-avatar">
                      <IoSparkles size={12} />
                    </div>
                  )}
                  <div className="message-content">
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="message-wrapper msg-ai">
                  <div className="message-avatar">
                    <IoSparkles size={12} />
                  </div>
                  <div className="message-content typing-indicator-container">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length <= 1 && !isLoading && (
              <div className="chat-suggestions">
                <p className="suggestion-title">Gợi ý câu hỏi:</p>
                <div className="suggestions-list">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      className="suggestion-chip"
                      onClick={() => handleSend(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="chat-input-area">
              <textarea
                placeholder="Nhập câu hỏi của bạn về dinh dưỡng..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button 
                className="send-message-btn" 
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
              >
                <IoSend size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbox;
