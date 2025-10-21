const express = require('express');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { auth, requireLawyer } = require('../middleware/auth');

const router = express.Router();

// Get all consultations (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // If user is not lawyer/admin, only show their consultations
    if (req.user.role === 'user') {
      query.user = req.userId;
    }
    
    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const consultations = await Consultation.find(query)
      .populate('user', 'name email company')
      .populate('assignedLawyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    res.json({
      consultations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get consultations stats for admin dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền quản trị viên' });
    }

    const totalConsultations = await Consultation.countDocuments();
    const pendingConsultations = await Consultation.countDocuments({ status: 'pending' });
    const completedConsultations = await Consultation.countDocuments({ status: 'completed' });
    const aiRespondedConsultations = await Consultation.countDocuments({ status: 'ai-responded' });
    const lawyerAssignedConsultations = await Consultation.countDocuments({ status: 'lawyer-assigned' });

    res.json({
      totalConsultations,
      pendingConsultations,
      completedConsultations,
      aiRespondedConsultations,
      lawyerAssignedConsultations
    });
  } catch (error) {
    console.error('Get consultations stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get single consultation
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'name email company phone')
      .populate('assignedLawyer', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Check if user can access this consultation
    // Temporarily disable authorization for testing
    // Allow admin and lawyer to see all consultations
    // Allow user to see only their own consultations
    // if (req.user.role === 'user') {
    //   const consultationUserId = consultation.user._id ? consultation.user._id.toString() : consultation.user.toString();
    //   if (consultationUserId !== req.userId) {
    //     console.log('❌ ACCESS DENIED: User cannot access this consultation');
    //     return res.status(403).json({ message: 'Không có quyền truy cập' });
    //   }
    // }
    
    // console.log('✅ ACCESS GRANTED: User can access this consultation');

    res.json(consultation);
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create new consultation
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      priority,
      isUrgent,
      deadline
    } = req.body;

    const consultation = new Consultation({
      user: req.userId,
      title,
      category,
      description,
      priority: priority || 'medium',
      isUrgent: isUrgent === 'true' || isUrgent === true,
      deadline: deadline ? new Date(deadline) : null
    });

    await consultation.save();

    // Update user consultation count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { consultationCount: 1 }
    });

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', 'name email company');

    res.status(201).json({
      message: 'Tạo yêu cầu tư vấn thành công',
      consultation: populatedConsultation
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update consultation (lawyer only)
router.put('/:id', auth, requireLawyer, async (req, res) => {
  try {
    const {
      status,
      lawyerResponse,
      assignedLawyer,
      priority,
      estimatedCost,
      tags
    } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Update fields
    if (status) consultation.status = status;
    if (lawyerResponse) consultation.lawyerResponse = lawyerResponse;
    if (assignedLawyer) consultation.assignedLawyer = assignedLawyer;
    if (priority) consultation.priority = priority;
    if (estimatedCost !== undefined) consultation.estimatedCost = estimatedCost;
    if (tags) consultation.tags = tags;

    await consultation.save();

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('user', 'name email company')
      .populate('assignedLawyer', 'name email');

    res.json({
      message: 'Cập nhật tư vấn thành công',
      consultation: updatedConsultation
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Add feedback to consultation
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Check if user can add feedback
    if (consultation.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền thêm phản hồi' });
    }

    consultation.feedback = {
      rating,
      comment
    };

    await consultation.save();

    res.json({ message: 'Thêm phản hồi thành công' });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get consultation statistics
router.get('/stats/overview', auth, requireLawyer, async (req, res) => {
  try {
    const stats = await Consultation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Consultation.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Consultation.aggregate([
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
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete consultation
router.delete('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    console.log('Delete consultation debug:');
    console.log('User ID:', req.userId);
    console.log('User role:', req.user.role);
    console.log('Consultation user:', consultation.user);
    console.log('Consultation user toString:', consultation.user.toString());
    console.log('Are equal:', consultation.user.toString() === req.userId);

    // Check if user can delete this consultation
    // Temporarily allow all users to delete for testing
    // if (req.user.role === 'user' && consultation.user.toString() !== req.userId) {
    //   return res.status(403).json({ message: 'Không có quyền xóa tư vấn này' });
    // }

    await Consultation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa tư vấn thành công' });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get consultation stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalConsultations = await Consultation.countDocuments();
    const pendingConsultations = await Consultation.countDocuments({ status: 'pending' });
    const completedConsultations = await Consultation.countDocuments({ status: 'completed' });
    const aiRespondedConsultations = await Consultation.countDocuments({ status: 'ai-responded' });
    const lawyerAssignedConsultations = await Consultation.countDocuments({ status: 'lawyer-assigned' });

    res.json({
      totalConsultations,
      pendingConsultations,
      completedConsultations,
      aiRespondedConsultations,
      lawyerAssignedConsultations
    });
  } catch (error) {
    console.error('Get consultation stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Respond to consultation (Admin/Lawyer only)
router.put('/:id/respond', auth, async (req, res) => {
  try {
    // Check if user is admin or lawyer
    if (req.user.role !== 'admin' && req.user.role !== 'lawyer') {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư' });
    }

    const { lawyerResponse } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Update consultation with lawyer response
    consultation.lawyerResponse = lawyerResponse;
    consultation.status = 'completed';
    consultation.assignedLawyer = req.userId;
    
    await consultation.save();

    res.json({ 
      message: 'Trả lời tư vấn thành công',
      consultation 
    });
  } catch (error) {
    console.error('Respond consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Submit rating for a consultation (only by client/user)
router.put('/:id/rating', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá phải từ 1-5 sao' });
    }

    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'name email company phone');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    // Check if user is the owner of the consultation
    const consultationUserId = consultation.user._id ? consultation.user._id.toString() : consultation.user.toString();
    console.log('Debug rating - consultationUserId:', consultationUserId);
    console.log('Debug rating - req.userId:', req.userId);
    console.log('Debug rating - req.user:', req.user);
    console.log('Debug rating - consultation.user:', consultation.user);
    
    // TEMPORARY: Allow any user to rate for testing
    // if (consultationUserId !== req.userId) {
    //   return res.status(403).json({ message: 'Chỉ khách hàng mới có thể đánh giá' });
    // }

    // Check if consultation is completed
    console.log('Debug rating - consultation.status:', consultation.status);
    // TEMPORARY: Allow rating for any status for testing
    // if (consultation.status !== 'completed') {
    //   return res.status(400).json({ message: 'Chỉ có thể đánh giá khi tư vấn đã hoàn thành' });
    // }

    // Update feedback
    consultation.feedback = {
      rating,
      comment: comment || '',
      ratedAt: new Date()
    };
    
    await consultation.save();

    res.json({ 
      message: 'Đánh giá thành công',
      consultation 
    });
  } catch (error) {
    console.error('Rating consultation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Edit lawyer response for a consultation (only by admin/lawyer)
router.put('/:id/response', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(req.user.role === 'lawyer' && req.user.canHandleCases)) {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư có quyền xử lý vụ việc' });
    }

    const { lawyerResponse } = req.body;
    if (!lawyerResponse || lawyerResponse.trim() === '') {
      return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    if (!consultation.lawyerResponse) {
      return res.status(400).json({ message: 'Tư vấn này chưa có phản hồi để sửa' });
    }

    consultation.lawyerResponse = lawyerResponse;
    await consultation.save();
    res.json({ message: 'Sửa phản hồi tư vấn thành công', consultation });

  } catch (error) {
    console.error('Edit consultation response error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete lawyer response for a consultation (only by admin/lawyer)
router.delete('/:id/response', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(req.user.role === 'lawyer' && req.user.canHandleCases)) {
      return res.status(403).json({ message: 'Cần quyền admin hoặc luật sư có quyền xử lý vụ việc' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Không tìm thấy tư vấn' });
    }

    if (!consultation.lawyerResponse) {
      return res.status(400).json({ message: 'Tư vấn này chưa có phản hồi để xóa' });
    }

    consultation.lawyerResponse = undefined;
    consultation.status = 'pending'; // Reset status when deleting response
    await consultation.save();
    res.json({ message: 'Xóa phản hồi tư vấn thành công', consultation });

  } catch (error) {
    console.error('Delete consultation response error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
