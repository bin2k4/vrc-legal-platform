const mongoose = require('mongoose');

const legalDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true,
    maxlength: [300, 'Tiêu đề không được quá 300 ký tự']
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Ví dụ: Luật số 59/2020/QH14, Nghị định 01/2021/NĐ-CP
  },
  category: {
    type: String,
    required: true,
    enum: [
      'thành-lập-doanh-nghiệp',
      'hợp-đồng-thương-mại',
      'sở-hữu-trí-tuệ',
      'lao-động-nhân-sự',
      'thuế-tài-chính',
      'đầu-tư-kinh-doanh',
      'cạnh-tranh',
      'giải-quyết-tranh-chấp',
      'khác'
    ]
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Luật',
      'Bộ luật',
      'Nghị định',
      'Thông tư',
      'Quyết định',
      'Nghị quyết',
      'Hướng dẫn'
    ]
  },
  issuedBy: {
    type: String,
    required: true,
    // Ví dụ: Quốc hội, Chính phủ, Bộ Tài chính, Bộ Lao động - Thương binh và Xã hội
  },
  issuedDate: {
    type: Date,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'amended', 'repealed'],
    default: 'active'
  },
  content: {
    type: String,
    required: [true, 'Nội dung văn bản là bắt buộc']
    // Lưu toàn bộ nội dung văn bản pháp luật
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Tóm tắt không được quá 2000 ký tự']
  },
  chapters: [{
    chapterNumber: String,
    chapterTitle: String,
    articles: [{
      articleNumber: String,
      articleTitle: String,
      articleContent: String
    }]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  relatedDocuments: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalDocument'
    },
    relationshipType: {
      type: String,
      enum: ['amends', 'repeals', 'supplements', 'implements', 'references']
    },
    description: String
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  searchCount: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    // Vector embedding cho semantic search với AI
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    // Nguồn văn bản: Cổng thông tin điện tử Chính phủ, Công báo, etc.
  },
  sourceUrl: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better search performance
legalDocumentSchema.index({ title: 'text', content: 'text', summary: 'text' });
legalDocumentSchema.index({ documentNumber: 1 });
legalDocumentSchema.index({ category: 1, status: 1 });
legalDocumentSchema.index({ effectiveDate: -1 });
legalDocumentSchema.index({ tags: 1 });
legalDocumentSchema.index({ keywords: 1 });

// Virtual for formatted document type
legalDocumentSchema.virtual('formattedType').get(function() {
  return `${this.documentType} ${this.documentNumber}`;
});

// Method to increment view count
legalDocumentSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment search count
legalDocumentSchema.methods.incrementSearchCount = function() {
  this.searchCount += 1;
  return this.save();
};

// Static method to search documents
legalDocumentSchema.statics.searchDocuments = async function(query) {
  return this.find(
    { $text: { $search: query }, status: 'active' },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('LegalDocument', legalDocumentSchema, 'van_ban_phap_ly');
