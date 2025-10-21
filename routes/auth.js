const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user' // Default to 'user' if not specified
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', { userId: user._id, email: user.email, role: user.role });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        consultationCount: user.consultationCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get all users (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền admin' });
    }

    const users = await User.find({}, 'name email role createdAt canHandleCases isActive lastLogin').sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments();

    res.json({
      users,
      totalUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update user permissions
router.put('/users/:id/permissions', auth, async (req, res) => {
  try {
    // Only admin can update permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
    }

    const { canHandleCases } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Only update permissions for lawyers
    if (user.role !== 'lawyer') {
      return res.status(400).json({ message: 'Chỉ có thể cập nhật quyền cho tài khoản luật sư' });
    }

    user.canHandleCases = canHandleCases;
    await user.save();

    res.json({ 
      message: 'Cập nhật quyền thành công',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canHandleCases: user.canHandleCases
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get users stats for admin dashboard
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền quản trị viên' });
    }

    const totalUsers = await User.countDocuments();
    const totalLawyers = await User.countDocuments({ role: 'lawyer' });
    const totalClients = await User.countDocuments({ role: 'user' });
    const lawyersWithPermission = await User.countDocuments({ 
      role: 'lawyer', 
      canHandleCases: true 
    });

    res.json({
      totalUsers,
      totalLawyers,
      totalClients,
      lawyersWithPermission
    });
  } catch (error) {
    console.error('Get users stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền quản trị viên' });
    }

    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check if user has any related data (consultations, cases)
    const Consultation = require('../models/Consultation');
    const LegalCase = require('../models/LegalCase');
    
    const userConsultations = await Consultation.countDocuments({ user: userId });
    const userCases = await LegalCase.countDocuments({ client: userId });
    const assignedCases = await LegalCase.countDocuments({ assignedLawyer: userId });

    if (userConsultations > 0 || userCases > 0 || assignedCases > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa tài khoản này vì có dữ liệu liên quan: ${userConsultations} tư vấn, ${userCases} vụ việc khách hàng, ${assignedCases} vụ việc được giao` 
      });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
