const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: [
      'thành-lập-doanh-nghiệp',
      'hợp-đồng-thương-mại',
      'sở-hữu-trí-tuệ',
      'lao-động-nhân-sự',
      'thuế-tài-chính',
      'đầu-tư-kinh-doanh',
      'giải-quyết-tranh-chấp',
      'khác'
    ]
  },
  description: {
    type: String,
    required: [true, 'Mô tả là bắt buộc'],
    trim: true,
    maxlength: [2000, 'Mô tả không được quá 2000 ký tự']
  },
  aiResponse: {
    type: String,
    trim: true
  },
  lawyerResponse: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'ai-responded', 'lawyer-assigned', 'completed', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    ratedAt: {
      type: Date
    }
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
consultationSchema.index({ user: 1, createdAt: -1 });
consultationSchema.index({ status: 1, priority: 1 });
consultationSchema.index({ category: 1 });

// Virtual for formatted category name
consultationSchema.virtual('categoryName').get(function() {
  const categoryNames = {
    'thành-lập-doanh-nghiệp': 'Thành lập doanh nghiệp',
    'hợp-đồng-thương-mại': 'Hợp đồng thương mại',
    'sở-hữu-trí-tuệ': 'Sở hữu trí tuệ',
    'lao-động-nhân-sự': 'Lao động & Nhân sự',
    'thuế-tài-chính': 'Thuế & Tài chính',
    'đầu-tư-kinh-doanh': 'Đầu tư & Kinh doanh',
    'giải-quyết-tranh-chấp': 'Giải quyết tranh chấp',
    'khác': 'Khác'
  };
  return categoryNames[this.category] || this.category;
});

module.exports = mongoose.model('Consultation', consultationSchema, 'tu_van');
