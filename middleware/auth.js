const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware to check if user is lawyer or admin
const requireLawyer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Cần đăng nhập' });
    }

    if (req.user.role !== 'lawyer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền luật sư' });
    }

    // For lawyers, check if they have permission to handle cases
    if (req.user.role === 'lawyer' && !req.user.canHandleCases) {
      return res.status(403).json({ 
        message: 'Bạn chưa được cấp quyền xử lý vụ việc. Vui lòng liên hệ admin.' 
      });
    }

    next();
  } catch (error) {
    console.error('Require lawyer error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Cần đăng nhập' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cần quyền quản trị viên' });
    }

    next();
  } catch (error) {
    console.error('Require admin error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { auth, requireLawyer, requireAdmin };
