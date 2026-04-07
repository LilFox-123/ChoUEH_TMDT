const Product = require('../models/Product');

// Search intent keywords
const SEARCH_KEYWORDS = ['tìm', 'cần', 'mua', 'có không', 'giá', 'bao nhiêu', 'sách', 'laptop', 'xe', 'điện thoại', 'máy tính', 'đồ', 'bán'];

// Category mappings
const CATEGORY_MAP = {
  'sách': 'sach',
  'giáo trình': 'sach',
  'tài liệu': 'sach',
  'điện tử': 'dien-tu',
  'laptop': 'dien-tu',
  'máy tính': 'dien-tu',
  'điện thoại': 'dien-tu',
  'đồ dùng': 'do-dung',
  'thời trang': 'thoi-trang',
  'quần áo': 'thoi-trang',
  'xe': 'xe',
  'xe máy': 'xe',
  'xe đạp': 'xe'
};

// System prompt (hardcoded, cannot be modified by user)
const SYSTEM_PROMPT = `Bạn là Zeen AI — trợ lý thông minh của Chợ UEH, nền tảng mua bán đồ cũ dành riêng cho sinh viên Đại học Kinh tế TP. Hồ Chí Minh (UEH).

Nhiệm vụ của bạn:
- Giúp sinh viên tìm sản phẩm phù hợp trên Chợ UEH
- Gợi ý danh mục: Sách & Tài liệu (sach), Điện tử (dien-tu), Đồ dùng (do-dung), Thời trang (thoi-trang), Xe & Phương tiện (xe)
- Hướng dẫn cách đăng tin, cách nhắn tin người bán, cách đánh giá
- Giải thích các tính năng: UEH Green Score, transactionStatus, điểm hẹn campus
- Khuyến khích tái sử dụng đồ cũ vì môi trường (UEH Green Campus)

Quy tắc:
- Chỉ trả lời bằng tiếng Việt
- Câu trả lời ngắn gọn, thân thiện, dùng emoji phù hợp
- KHÔNG bịa ra sản phẩm — chỉ đề cập sản phẩm nếu có trong [PRODUCT_CONTEXT]
- Nếu không tìm được sản phẩm phù hợp, gợi ý user đăng bài "đang cần" hoặc mở rộng từ khóa
- Nếu câu hỏi không liên quan đến Chợ UEH, lịch sự từ chối và hướng về chủ đề mua bán
- Tối đa 150 từ mỗi câu trả lời

[PRODUCT_CONTEXT]
{{PRODUCTS_JSON}}`;

// Detect search intent and extract query
function detectSearchIntent(message) {
  const lowerMsg = message.toLowerCase();

  // Check for search keywords
  const hasSearchIntent = SEARCH_KEYWORDS.some(keyword => lowerMsg.includes(keyword));
  if (!hasSearchIntent) return null;

  // Extract potential search query by removing common words
  let query = message
    .replace(/tìm|cần|mua|có không|giá|bao nhiêu|cho mình|giúp mình|muốn|đang|ở đâu|không|nào|nhé|ạ|vậy|\?/gi, '')
    .trim();

  // If query is too short, use original message
  if (query.length < 2) {
    query = message;
  }

  return query;
}

// Detect category from message
function detectCategory(message) {
  const lowerMsg = message.toLowerCase();

  for (const [keyword, slug] of Object.entries(CATEGORY_MAP)) {
    if (lowerMsg.includes(keyword)) {
      return slug;
    }
  }

  return null;
}

// @desc    Chat with Zeen AI
// @route   POST /api/ai/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot chưa được cấu hình'
      });
    }

    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tin nhắn không hợp lệ'
      });
    }

    const userMessage = message.trim().slice(0, 500); // Limit message length

    // STEP 1: Detect intent
    const searchQuery = detectSearchIntent(userMessage);
    const category = detectCategory(userMessage);

    // STEP 2: Search products if search intent detected
    let products = [];
    if (searchQuery) {
      const searchFilter = {
        status: 'available',
        listingType: 'sell',
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { courseCode: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      // Add category filter if detected
      if (category) {
        searchFilter.category = category;
      }

      products = await Product.find(searchFilter)
        .select('title price category images _id transactionStatus')
        .limit(4)
        .lean();
    }

    // STEP 3: Build system prompt with product context
    const productsJson = products.length > 0
      ? JSON.stringify(products.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        category: p.category
      })))
      : 'Không tìm thấy sản phẩm phù hợp với từ khóa.';

    const systemPrompt = SYSTEM_PROMPT.replace('{{PRODUCTS_JSON}}', productsJson);

    // Build messages array from history (limit to last 8 turns)
    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
    const messages = [
      ...safeHistory.map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content || '').slice(0, 500)
      })),
      { role: 'user', content: userMessage }
    ];

    // STEP 4: Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!groqRes.ok) {
      console.error('Groq API error:', groqRes.status, await groqRes.text());
      return res.status(502).json({
        success: false,
        message: 'Zeen AI đang bận, vui lòng thử lại'
      });
    }

    const groqData = await groqRes.json();

    // Extract reply from response
    const reply = groqData.choices?.[0]?.message?.content
      || 'Xin lỗi, mình chưa hiểu ý bạn. Bạn có thể diễn đạt khác được không? 🤔';

    res.json({
      success: true,
      reply,
      products
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra, vui lòng thử lại'
    });
  }
};
