const express = require('express');
const VRCBot = require('../utils/chatbot');
const Consultation = require('../models/Consultation');
const LegalDocument = require('../models/LegalDocument');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize VRC Bot
const vrcBot = new VRCBot();

// Chat history storage (in production, use Redis or database)
const chatHistories = new Map();

// AI consultation endpoint
router.post('/consult', auth, async (req, res) => {
  try {
    const { consultationId, question } = req.body;

    if (!consultationId && !question) {
      return res.status(400).json({ message: 'Cần cung cấp consultationId hoặc question' });
    }

    let consultation = null;
    let context = '';

    if (consultationId) {
      consultation = await Consultation.findById(consultationId)
        .populate('user', 'name company');
      
      if (!consultation) {
        return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
      }

      // Check if user can access this consultation
      if (consultation.user._id.toString() !== req.userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }

      context = `
        Thông tin khách hàng: ${consultation.user.name}
        Công ty: ${consultation.user.company || 'Chưa cung cấp'}
        Danh mục: ${consultation.categoryName}
        Mô tả vấn đề: ${consultation.description}
      `;
    }

    const prompt = `
Bạn là một luật sư chuyên về luật doanh nghiệp tại Việt Nam. Hãy tư vấn pháp lý một cách chuyên nghiệp và chính xác.

${context ? `Thông tin bối cảnh: ${context}` : ''}

Câu hỏi: ${question || consultation?.description}

Hãy trả lời theo cấu trúc sau:
1. **Phân tích vấn đề**: Phân tích chi tiết vấn đề pháp lý
2. **Cơ sở pháp lý**: Các văn bản pháp luật liên quan
3. **Giải pháp đề xuất**: Các bước thực hiện cụ thể
4. **Lưu ý quan trọng**: Những điểm cần chú ý
5. **Khuyến nghị**: Lời khuyên chuyên nghiệp

Lưu ý:
- Trả lời bằng tiếng Việt
- Sử dụng ngôn ngữ pháp lý chuyên nghiệp nhưng dễ hiểu
- Đưa ra các giải pháp thực tế và khả thi
- Luôn nhấn mạnh rằng đây chỉ là tư vấn sơ bộ, cần tham khảo ý kiến luật sư chuyên nghiệp
- Tập trung vào luật doanh nghiệp Việt Nam
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là một luật sư chuyên nghiệp về luật doanh nghiệp tại Việt Nam với hơn 10 năm kinh nghiệm."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // If consultation exists, save AI response
    if (consultation) {
      consultation.aiResponse = aiResponse;
      consultation.status = 'ai-responded';
      await consultation.save();
    }

    res.json({
      message: 'Tư vấn AI thành công',
      response: aiResponse,
      consultationId: consultation?._id
    });

  } catch (error) {
    console.error('AI consultation error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        message: 'Hết quota OpenAI API. Vui lòng liên hệ quản trị viên.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi AI service', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi server' 
    });
  }
});

// Get AI response for consultation
router.get('/consultation/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Check if user can access this consultation
    if (consultation.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({
      aiResponse: consultation.aiResponse,
      status: consultation.status
    });
  } catch (error) {
    console.error('Get AI response error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Quick AI question with RAG (Retrieval-Augmented Generation)
router.post('/quick-question', auth, async (req, res) => {
  try {
    const { question, category, sessionId } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Câu hỏi là bắt buộc' });
    }

    // Step 1: Search relevant legal documents
    let relevantDocs = [];
    try {
      let searchQuery = { status: 'active' };
      if (category) searchQuery.category = category;

      relevantDocs = await LegalDocument.find(
        { ...searchQuery, $text: { $search: question } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .select('title documentNumber content summary');
    } catch (error) {
      console.log('Document search error:', error);
    }

    // Step 2: Build context from legal documents
    let legalContext = '';
    if (relevantDocs.length > 0) {
      legalContext = '\n\n**Các văn bản pháp luật liên quan:**\n\n';
      relevantDocs.forEach((doc, index) => {
        legalContext += `${index + 1}. **${doc.documentNumber}**: ${doc.title}\n`;
        // Get first 500 chars of content
        const contentPreview = doc.content.substring(0, 1500);
        legalContext += `${contentPreview}...\n\n`;
      });
    }

    // Step 3: Get or create chat history
    const userSessionId = sessionId || `${req.userId}-${Date.now()}`;
    let chatHistory = chatHistories.get(userSessionId) || [];

    // Step 4: Build messages for ChatGPT-like conversation
    const systemMessage = {
      role: "system",
      content: `Bạn là VRC AI Assistant - một trợ lý AI chuyên về luật doanh nghiệp tại Việt Nam với hơn 10 năm kinh nghiệm. 

Nhiệm vụ của bạn:
- Tư vấn pháp lý chính xác dựa trên văn bản pháp luật Việt Nam
- Trả lời bằng tiếng Việt chuyên nghiệp nhưng dễ hiểu
- Trích dẫn cụ thể điều luật khi có thể
- Đưa ra lời khuyên thực tế và khả thi
- Luôn nhấn mạnh: "Đây là tư vấn sơ bộ, nên tham khảo luật sư chuyên nghiệp cho trường hợp cụ thể"

Phong cách giao tiếp:
- Thân thiện, nhiệt tình như ChatGPT
- Giải thích rõ ràng, có ví dụ minh họa
- Có thể hỏi lại để hiểu rõ hơn nhu cầu
- Ghi nhớ ngữ cảnh cuộc hội thoại

${legalContext}`
    };

    // Add user question
    chatHistory.push({
      role: "user",
      content: question
    });

    // Limit chat history to last 10 messages to avoid token limit
    const recentHistory = chatHistory.slice(-10);

    // Step 5: Use VRC Bot instead of OpenAI
    const botResponse = await vrcBot.processQuestion(question);
    const response = botResponse.response;

    // Step 6: Save assistant response to history
    chatHistory.push({
      role: "assistant",
      content: response
    });

    // Update chat history (limit to 20 messages)
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }
    chatHistories.set(userSessionId, chatHistory);

    // Step 7: Return response with metadata
    res.json({
      message: 'Trả lời AI thành công',
      response,
      sessionId: userSessionId,
      relevantDocuments: relevantDocs.map(doc => ({
        id: doc._id,
        title: doc.title,
        documentNumber: doc.documentNumber
      })),
      conversationLength: chatHistory.length / 2, // Number of exchanges
      topic: botResponse.topic || 'general',
      model: 'VRC-Bot'
    });

  } catch (error) {
    console.error('VRC Bot error:', error);
    
    res.status(500).json({ 
      message: 'Lỗi chatbot service', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi server' 
    });
  }
});

// Clear chat history
router.post('/clear-history', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      chatHistories.delete(sessionId);
    }
    
    res.json({ message: 'Đã xóa lịch sử chat' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get chat statistics
router.get('/chat-stats', auth, async (req, res) => {
  try {
    res.json({
      activeSessions: chatHistories.size,
      model: process.env.CHAT_MODEL || "gpt-4o-mini",
      features: [
        'Conversation Memory',
        'RAG with Legal Documents',
        'Context-Aware Responses',
        'Multi-turn Dialogue'
      ]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get legal categories for AI
router.get('/categories', (req, res) => {
  const categories = [
    {
      id: 'thành-lập-doanh-nghiệp',
      name: 'Thành lập doanh nghiệp',
      description: 'Tư vấn về thủ tục thành lập công ty, doanh nghiệp'
    },
    {
      id: 'hợp-đồng-thương-mại',
      name: 'Hợp đồng thương mại',
      description: 'Soạn thảo, rà soát hợp đồng kinh doanh'
    },
    {
      id: 'sở-hữu-trí-tuệ',
      name: 'Sở hữu trí tuệ',
      description: 'Bảo hộ thương hiệu, sáng chế, bản quyền'
    },
    {
      id: 'lao-động-nhân-sự',
      name: 'Lao động & Nhân sự',
      description: 'Luật lao động, hợp đồng lao động, tranh chấp'
    },
    {
      id: 'thuế-tài-chính',
      name: 'Thuế & Tài chính',
      description: 'Tư vấn thuế, báo cáo tài chính, tuân thủ'
    },
    {
      id: 'đầu-tư-kinh-doanh',
      name: 'Đầu tư & Kinh doanh',
      description: 'M&A, đầu tư, mở rộng kinh doanh'
    },
    {
      id: 'giải-quyết-tranh-chấp',
      name: 'Giải quyết tranh chấp',
      description: 'Hòa giải, trọng tài, khởi kiện'
    }
  ];

  res.json(categories);
});

module.exports = router;
