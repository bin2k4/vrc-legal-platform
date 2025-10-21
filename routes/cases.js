const express = require('express');
const LegalCase = require('../models/LegalCase');
const Consultation = require('../models/Consultation');
const { auth, requireLawyer } = require('../middleware/auth');

const router = express.Router();

// Test route to check user info
router.get('/test-user', auth, async (req, res) => {
  try {
    res.json({
      userId: req.userId,
      userRole: req.user.role,
      userInfo: req.user,
      message: 'User info retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting user info', error: error.message });
  }
});

// Test route to check case access
router.get('/test-access/:id', auth, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const clientObjectId = legalCase.client._id ? legalCase.client._id : new mongoose.Types.ObjectId(legalCase.client);
    
    res.json({
      userId: req.userId,
      userRole: req.user.role,
      caseClientId: legalCase.client,
      userObjectId: userObjectId.toString(),
      clientObjectId: clientObjectId.toString(),
      areEqual: userObjectId.equals(clientObjectId),
      canAccess: req.user.role === 'admin' || 
                 req.user.role === 'lawyer' && req.user.canHandleCases ||
                 req.user.role === 'user' && userObjectId.equals(clientObjectId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking access', error: error.message });
  }
});

// Get all cases
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // If user is not lawyer/admin, only show their cases
    if (req.user.role === 'user') {
      query.client = req.userId;
    } else if (req.user.role === 'lawyer') {
      // Only show cases if lawyer has permission to handle cases
      if (!req.user.canHandleCases) {
        return res.status(403).json({ 
          message: 'Bạn chưa được cấp quyền xử lý vụ việc. Vui lòng liên hệ admin.' 
        });
      }
      // Lawyers with permission can see ALL cases (no assignedLawyer filter)
    }
    
    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const cases = await LegalCase.find(query)
      .populate('client', 'name email company')
      .populate('assignedLawyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LegalCase.countDocuments(query);

    res.json({
      cases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get case stats - MUST be before /:id route
router.get('/stats', auth, async (req, res) => {
  try {
    const totalCases = await LegalCase.countDocuments();
    const activeCases = await LegalCase.countDocuments({ status: 'active' });
    const onHoldCases = await LegalCase.countDocuments({ status: 'on-hold' });
    const completedCases = await LegalCase.countDocuments({ status: 'completed' });
    const closedCases = await LegalCase.countDocuments({ status: 'closed' });

    res.json({
      totalCases,
      activeCases,
      onHoldCases,
      completedCases,
      closedCases
    });
  } catch (error) {
    console.error('Get case stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get cases stats for admin dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền quản trị viên' });
    }

    const totalCases = await LegalCase.countDocuments();
    const activeCases = await LegalCase.countDocuments({ 
      status: { $in: ['new', 'in-progress', 'pending-client', 'pending-court'] } 
    });
    const completedCases = await LegalCase.countDocuments({ status: 'completed' });
    const closedCases = await LegalCase.countDocuments({ status: 'closed' });

    res.json({
      totalCases,
      activeCases,
      completedCases,
      closedCases
    });
  } catch (error) {
    console.error('Get cases stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get single case
router.get('/:id', auth, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('assignedLawyer', 'name email')
      .populate('timeline.performedBy', 'name')
      .populate('notes.createdBy', 'name');

    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Check if user can access this case
    console.log('User role:', req.user.role);
    console.log('User ID:', req.userId);
    console.log('Case client ID:', legalCase.client);
    
    if (req.user.role === 'user') {
      // Users can only see their own cases
      const clientId = legalCase.client._id ? legalCase.client._id.toString() : legalCase.client.toString();
      console.log('Client ID from case:', clientId);
      console.log('User ID from request:', req.userId);
      console.log('Are they equal?', clientId === req.userId);
      
      // Use Mongoose ObjectId comparison for better accuracy
      const mongoose = require('mongoose');
      const userObjectId = new mongoose.Types.ObjectId(req.userId);
      const clientObjectId = legalCase.client._id ? legalCase.client._id : new mongoose.Types.ObjectId(legalCase.client);
      
      console.log('User ObjectId:', userObjectId);
      console.log('Client ObjectId:', clientObjectId);
      console.log('ObjectId equal?', userObjectId.equals(clientObjectId));
      
      if (!userObjectId.equals(clientObjectId)) {
        return res.status(403).json({ message: 'Không có quyền truy cập vụ việc này' });
      }
    } else if (req.user.role === 'lawyer') {
      // Lawyers with permission can see ALL cases
      if (!req.user.canHandleCases) {
        return res.status(403).json({ 
          message: 'Bạn chưa được cấp quyền xử lý vụ việc. Vui lòng liên hệ admin.' 
        });
      }
    }
    // Admin can see all cases (no additional check needed)

    res.json(legalCase);
  } catch (error) {
    console.error('Get case error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create new case from consultation
router.post('/from-consultation/:consultationId', auth, requireLawyer, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.consultationId)
      .populate('user', 'name email company');

    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    const {
      assignedLawyer,
      estimatedDuration,
      estimatedCost,
      priority
    } = req.body;

    const legalCase = new LegalCase({
      title: consultation.title,
      client: consultation.user._id,
      assignedLawyer: assignedLawyer || req.userId,
      category: consultation.category,
      description: consultation.description,
      documents: consultation.documents.map(doc => ({
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploadedBy: req.userId
      })),
      estimatedDuration,
      estimatedCost,
      priority: priority || consultation.priority,
      timeline: [{
        action: 'Tạo vụ việc từ tư vấn',
        description: `Vụ việc được tạo từ yêu cầu tư vấn: ${consultation.title}`,
        performedBy: req.userId
      }]
    });

    await legalCase.save();

    // Update consultation status
    consultation.status = 'lawyer-assigned';
    await consultation.save();

    const populatedCase = await LegalCase.findById(legalCase._id)
      .populate('client', 'name email company')
      .populate('assignedLawyer', 'name email');

    res.status(201).json({
      message: 'Tạo vụ việc thành công',
      case: populatedCase
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create new case directly
router.post('/', auth, async (req, res) => {
  try {
    console.log('Create case - User ID:', req.userId);
    console.log('Create case - User role:', req.user.role);
    
    const {
      title,
      category,
      description,
      priority,
      deadline
    } = req.body;

    // Generate case number
    const caseCount = await LegalCase.countDocuments();
    const caseNumber = `CASE-${String(caseCount + 1).padStart(4, '0')}-${new Date().getFullYear()}`;

    const legalCase = new LegalCase({
      caseNumber,
      title,
      client: req.userId,
      category,
      description,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
      timeline: [{
        action: 'Tạo vụ việc mới',
        description: `Vụ việc mới: ${title}`,
        performedBy: req.userId
      }]
    });

    console.log('Case created with client ID:', legalCase.client);

    await legalCase.save();

    const populatedCase = await LegalCase.findById(legalCase._id)
      .populate('client', 'name email company')
      .populate('assignedLawyer', 'name email');

    console.log('Case created successfully:', populatedCase);

    res.status(201).json({
      message: 'Tạo vụ việc thành công',
      case: populatedCase
    });
  } catch (error) {
    console.error('Create case error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Có lỗi xảy ra khi tạo vụ việc'
    });
  }
});

// Update case
router.put('/:id', auth, requireLawyer, async (req, res) => {
  try {
    const {
      status,
      priority,
      estimatedDuration,
      estimatedCost,
      actualCost,
      courtInfo,
      outcome,
      deadline
    } = req.body;

    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Check if user can update this case
    if (legalCase.assignedLawyer.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật vụ việc này' });
    }

    // Update fields
    if (status) legalCase.status = status;
    if (priority) legalCase.priority = priority;
    if (estimatedDuration) legalCase.estimatedDuration = estimatedDuration;
    if (estimatedCost !== undefined) legalCase.estimatedCost = estimatedCost;
    if (actualCost !== undefined) legalCase.actualCost = actualCost;
    if (courtInfo) legalCase.courtInfo = courtInfo;
    if (outcome) legalCase.outcome = outcome;
    if (deadline) legalCase.deadline = new Date(deadline);

    // Add timeline entry
    legalCase.timeline.push({
      action: 'Cập nhật thông tin vụ việc',
      description: 'Thông tin vụ việc đã được cập nhật',
      performedBy: req.userId
    });

    await legalCase.save();

    const updatedCase = await LegalCase.findById(legalCase._id)
      .populate('client', 'name email company')
      .populate('assignedLawyer', 'name email');

    res.json({
      message: 'Cập nhật vụ việc thành công',
      case: updatedCase
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Add note to case
router.post('/:id/notes', auth, requireLawyer, async (req, res) => {
  try {
    const { content } = req.body;

    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Check if user can add note
    if (legalCase.assignedLawyer.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền thêm ghi chú' });
    }

    legalCase.notes.push({
      content,
      createdBy: req.userId
    });

    await legalCase.save();

    res.json({ message: 'Thêm ghi chú thành công' });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get case statistics
router.get('/stats/overview', auth, requireLawyer, async (req, res) => {
  try {
    const stats = await LegalCase.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await LegalCase.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await LegalCase.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Get case stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete case
router.delete('/:id', auth, requireLawyer, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Check if user can delete this case
    if (legalCase.assignedLawyer.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa vụ việc này' });
    }

    await LegalCase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa vụ việc thành công' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// This endpoint is no longer needed - lawyers with permission can handle all cases

// Submit rating for a case (only by client/user)
router.put('/:id/rating', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá phải từ 1-5 sao' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Get client ID (handle both populated and unpopulated)
    const clientId = legalCase.client._id ? legalCase.client._id.toString() : legalCase.client.toString();

    // Check if user is the client of the case
    if (clientId !== req.userId) {
      return res.status(403).json({ message: 'Chỉ khách hàng mới có thể đánh giá' });
    }

    // Check if case is completed
    if (legalCase.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá khi vụ việc đã hoàn thành' });
    }

    // Update feedback
    legalCase.feedback = {
      rating,
      comment: comment || '',
      ratedAt: new Date()
    };
    
    await legalCase.save();

    res.json({ 
      message: 'Đánh giá thành công',
      case: legalCase 
    });
  } catch (error) {
    console.error('Rating case error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Respond to a case (only by admin/lawyer with canHandleCases)
router.put('/:id/respond', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(req.user.role === 'lawyer' && req.user.canHandleCases)) {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư có quyền xử lý vụ việc' });
    }

    const { lawyerResponse } = req.body;
    if (!lawyerResponse || lawyerResponse.trim() === '') {
      return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // Only allow responding if the case is not already completed
    if (legalCase.status === 'completed') {
      return res.status(400).json({ message: 'Vụ việc đã hoàn thành, không thể trả lời thêm' });
    }

    legalCase.lawyerResponse = lawyerResponse;
    legalCase.status = 'completed'; // Mark as completed after response

    await legalCase.save();
    res.json({ message: 'Trả lời vụ việc thành công', legalCase });

  } catch (error) {
    console.error('Respond case error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Edit lawyer response (only by admin/lawyer with canHandleCases)
router.put('/:id/response', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(req.user.role === 'lawyer' && req.user.canHandleCases)) {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư có quyền xử lý vụ việc' });
    }

    const { lawyerResponse } = req.body;
    if (!lawyerResponse || lawyerResponse.trim() === '') {
      return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    if (!legalCase.lawyerResponse) {
      return res.status(400).json({ message: 'Vụ việc chưa có phản hồi để sửa' });
    }

    legalCase.lawyerResponse = lawyerResponse;
    await legalCase.save();
    res.json({ message: 'Sửa phản hồi thành công', legalCase });

  } catch (error) {
    console.error('Edit response error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete lawyer response (only by admin/lawyer with canHandleCases)
router.delete('/:id/response', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(req.user.role === 'lawyer' && req.user.canHandleCases)) {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư có quyền xử lý vụ việc' });
    }

    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    if (!legalCase.lawyerResponse) {
      return res.status(400).json({ message: 'Vụ việc chưa có phản hồi để xóa' });
    }

    legalCase.lawyerResponse = undefined;
    legalCase.status = 'in-progress'; // Reset status when deleting response
    await legalCase.save();
    res.json({ message: 'Xóa phản hồi thành công', legalCase });

  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Add note to case
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung ghi chú không được để trống' });
    }

    const note = {
      content: content.trim(),
      createdAt: new Date(),
      createdBy: req.userId
    };

    legalCase.notes.push(note);
    await legalCase.save();

    // Populate the createdBy field
    await legalCase.populate('notes.createdBy', 'name email');

    res.json({ message: 'Thêm ghi chú thành công', legalCase });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Upload document to case
router.post('/:id/documents', auth, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    // For now, just return success - file upload would need multer middleware
    res.json({ message: 'Upload tài liệu thành công (chức năng đang phát triển)' });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update case status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Không tìm thấy vụ việc' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái không được để trống' });
    }

    const validStatuses = ['new', 'in-progress', 'pending-client', 'pending-court', 'completed', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    legalCase.status = status;
    
    // Add to timeline
    legalCase.timeline.push({
      date: new Date(),
      action: `Cập nhật trạng thái thành: ${getStatusText(status)}`,
      description: `Trạng thái được cập nhật bởi ${req.user.name}`,
      performedBy: req.userId
    });

    await legalCase.save();

    // Populate the performedBy field
    await legalCase.populate('timeline.performedBy', 'name email');

    res.json({ message: 'Cập nhật trạng thái thành công', legalCase });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Helper function to get status text
function getStatusText(status) {
  const statusMap = {
    'new': 'Mới',
    'in-progress': 'Đang xử lý',
    'pending-client': 'Chờ khách hàng',
    'pending-court': 'Chờ tòa án',
    'completed': 'Hoàn thành',
    'closed': 'Đã đóng'
  };
  return statusMap[status] || status;
}

module.exports = router;
