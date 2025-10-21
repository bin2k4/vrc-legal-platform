import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import { Bot, Send, Loader, MessageSquare, FileText, Plus, Mic, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  topic?: string;
  relevantDocuments?: Array<{
    id: string;
    title: string;
    documentNumber: string;
  }>;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sessionId, setSessionId] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/quick-question', {
        question: input,
        category: selectedCategory,
        sessionId: sessionId || undefined
      });

      // Save session ID for conversation continuity
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        topic: response.data.topic,
        relevantDocuments: response.data.relevantDocuments
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId('');
    setSelectedCategory('');
  };

  const sendMessage = () => {
    handleSendMessage();
  };

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Lịch sử trò chuyện</h3>
          <div className="space-y-2">
            {/* Sample chat history items */}
            <div className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200">
              <div className="text-sm font-medium text-gray-900">Thành lập công ty TNHH</div>
              <div className="text-xs text-gray-500">Hôm nay</div>
            </div>
            <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200">
              <div className="text-sm font-medium text-gray-900">Hợp đồng lao động</div>
              <div className="text-xs text-gray-500">Hôm qua</div>
            </div>
            <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200">
              <div className="text-sm font-medium text-gray-900">Thuế doanh nghiệp</div>
              <div className="text-xs text-gray-500">2 ngày trước</div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">
            VRC LEGAL Bot - Trợ lý Pháp lý
          </h1>
          <p className="text-sm text-gray-600">
            Chatbot chuyên về luật doanh nghiệp - Hoạt động 24/7, không cần internet
          </p>
        </div>

        {/* Conditional Content */}
        {messages.length === 0 ? (
          // Welcome screen with centered input
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
            <Bot className="h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Hôm nay bạn muốn làm gì?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md text-center">
              Đặt câu hỏi về luật doanh nghiệp và nhận tư vấn từ VRC LEGAL Bot chuyên nghiệp
            </p>
            
            {/* Centered Input Bar */}
            <div className="w-full max-w-3xl">
              <div className="flex items-end bg-white rounded-xl p-2 shadow-sm border border-gray-300">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Plus className="h-5 w-5" />
                </button>
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 py-2 px-2 max-h-48 overflow-y-auto resize-none"
                  rows={1}
                  placeholder="Hỏi bất kỳ điều gì..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Status Bar - Centered below input */}
              <div className="mt-2 text-xs text-gray-500 flex justify-center items-center">
                <span>
                  Trạng thái: {loading ? 'Đang xử lý...' : 'Sẵn sàng'} | Model: VRC-LEGAL-Bot | Cuộc trò chuyện: {messages.length / 2} lượt
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Standard chat view with messages and bottom input
          <>
            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-3xl ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        message.type === 'user' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      {message.type === 'user' ? 'U' : 'B'}
                    </div>
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                        {message.topic && message.topic !== 'general' && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {message.topic.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {message.relevantDocuments && message.relevantDocuments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                          <p className="font-semibold mb-1">Tài liệu liên quan:</p>
                          <ul className="list-disc list-inside">
                            {message.relevantDocuments.map((doc) => (
                              <li key={doc.id}>
                                <a
                                  href={`/documents/${doc.id}`}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {doc.title} ({doc.documentNumber})
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-gray-600">VRC LEGAL Bot đang suy nghĩ...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="max-w-3xl mx-auto flex items-end bg-white rounded-xl p-2 shadow-sm border border-gray-300">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Plus className="h-5 w-5" />
                </button>
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 py-2 px-2 max-h-48 overflow-y-auto resize-none"
                  rows={1}
                  placeholder="Hỏi bất kỳ điều gì..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Status Bar */}
              <div className="mt-2 text-xs text-gray-500 flex justify-center items-center">
                <span>
                  Trạng thái: {loading ? 'Đang xử lý...' : 'Sẵn sàng'} | Model: VRC-LEGAL-Bot | Cuộc trò chuyện: {messages.length / 2} lượt
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;