const express = require('express');
const LegalDocument = require('../models/LegalDocument');
const { auth, requireLawyer, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all documents (public - with pagination)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      documentType, 
      status = 'active',
      search,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { status };
    
    // Add filters
    if (category) query.category = category;
    if (documentType) query.documentType = documentType;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    const documents = await LegalDocument.find(query)
      .select('-content -embedding') // Exclude full content for list view
      .sort(search ? { score: { $meta: 'textScore' } } : { effectiveDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LegalDocument.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id)
      .populate('relatedDocuments.documentId', 'title documentNumber documentType')
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản' });
    }

    // Increment view count
    await document.incrementViewCount();

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Search documents by text
router.post('/search', async (req, res) => {
  try {
    const { query, category, documentType } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Cần cung cấp từ khóa tìm kiếm' });
    }

    let searchQuery = {
      $text: { $search: query },
      status: 'active'
    };

    if (category) searchQuery.category = category;
    if (documentType) searchQuery.documentType = documentType;

    const documents = await LegalDocument.find(
      searchQuery,
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(50)
    .select('-content -embedding');

    // Increment search count for found documents
    documents.forEach(doc => doc.incrementSearchCount());

    res.json({
      message: 'Tìm kiếm thành công',
      results: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get document by document number
router.get('/number/:documentNumber', async (req, res) => {
  try {
    const document = await LegalDocument.findOne({ 
      documentNumber: req.params.documentNumber 
    })
    .populate('relatedDocuments.documentId', 'title documentNumber documentType');

    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản' });
    }

    await document.incrementViewCount();

    res.json(document);
  } catch (error) {
    console.error('Get document by number error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create new document (Admin only)
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      documentNumber,
      category,
      documentType,
      issuedBy,
      issuedDate,
      effectiveDate,
      expiryDate,
      content,
      summary,
      chapters,
      tags,
      keywords,
      source,
      sourceUrl,
      notes
    } = req.body;

    // Check if document number already exists
    const existingDoc = await LegalDocument.findOne({ documentNumber });
    if (existingDoc) {
      return res.status(400).json({ message: 'Số văn bản đã tồn tại' });
    }

    const document = new LegalDocument({
      title,
      documentNumber,
      category,
      documentType,
      issuedBy,
      issuedDate,
      effectiveDate,
      expiryDate,
      content,
      summary,
      chapters,
      tags,
      keywords,
      source,
      sourceUrl,
      notes,
      uploadedBy: req.userId
    });

    await document.save();

    res.status(201).json({
      message: 'Thêm văn bản thành công',
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update document (Admin only)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      status,
      summary,
      tags,
      keywords,
      notes,
      expiryDate
    } = req.body;

    const document = await LegalDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản' });
    }

    // Update fields
    if (title) document.title = title;
    if (status) document.status = status;
    if (summary) document.summary = summary;
    if (tags) document.tags = tags;
    if (keywords) document.keywords = keywords;
    if (notes) document.notes = notes;
    if (expiryDate) document.expiryDate = expiryDate;

    await document.save();

    res.json({
      message: 'Cập nhật văn bản thành công',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete document (Admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản' });
    }

    await document.deleteOne();

    res.json({ message: 'Xóa văn bản thành công' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get statistics
router.get('/stats/overview', auth, requireLawyer, async (req, res) => {
  try {
    const totalDocuments = await LegalDocument.countDocuments();
    const activeDocuments = await LegalDocument.countDocuments({ status: 'active' });
    
    const byCategory = await LegalDocument.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byType = await LegalDocument.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);

    const mostViewed = await LegalDocument.find({ status: 'active' })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('title documentNumber viewCount');

    res.json({
      totalDocuments,
      activeDocuments,
      byCategory,
      byType,
      mostViewed
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get categories list
router.get('/meta/categories', (req, res) => {
  const categories = [
    { id: 'thành-lập-doanh-nghiệp', name: 'Thành lập doanh nghiệp' },
    { id: 'hợp-đồng-thương-mại', name: 'Hợp đồng thương mại' },
    { id: 'sở-hữu-trí-tuệ', name: 'Sở hữu trí tuệ' },
    { id: 'lao-động-nhân-sự', name: 'Lao động & Nhân sự' },
    { id: 'thuế-tài-chính', name: 'Thuế & Tài chính' },
    { id: 'đầu-tư-kinh-doanh', name: 'Đầu tư & Kinh doanh' },
    { id: 'giải-quyết-tranh-chấp', name: 'Giải quyết tranh chấp' },
    { id: 'khác', name: 'Khác' }
  ];

  res.json(categories);
});

// Get document types list
router.get('/meta/types', (req, res) => {
  const types = [
    { id: 'Luật', name: 'Luật' },
    { id: 'Bộ luật', name: 'Bộ luật' },
    { id: 'Nghị định', name: 'Nghị định' },
    { id: 'Thông tư', name: 'Thông tư' },
    { id: 'Quyết định', name: 'Quyết định' },
    { id: 'Nghị quyết', name: 'Nghị quyết' },
    { id: 'Hướng dẫn', name: 'Hướng dẫn' }
  ];

  res.json(types);
});

module.exports = router;
