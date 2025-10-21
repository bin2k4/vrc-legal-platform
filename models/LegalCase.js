const mongoose = require('mongoose');

const legalCaseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề vụ việc là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
      'giải-quyết-tranh-chấp',
      'tư-vấn-pháp-lý',
      'khác'
    ]
  },
  description: {
    type: String,
    required: [true, 'Mô tả vụ việc là bắt buộc'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'pending-client', 'pending-court', 'completed', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  timeline: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      required: true
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  estimatedDuration: {
    type: Number, // in days
    min: 1
  },
  actualDuration: {
    type: Number // in days
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  courtInfo: {
    courtName: String,
    caseNumber: String,
    hearingDate: Date,
    judge: String
  },
  outcome: {
    type: String,
    trim: true
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isConfidential: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
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
  lawyerResponse: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Auto-generate case number
legalCaseSchema.pre('save', async function(next) {
  if (this.isNew && !this.caseNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.caseNumber = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for better query performance
legalCaseSchema.index({ caseNumber: 1 });
legalCaseSchema.index({ client: 1, createdAt: -1 });
legalCaseSchema.index({ assignedLawyer: 1, status: 1 });
legalCaseSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('LegalCase', legalCaseSchema, 'vu_an_phap_ly');
