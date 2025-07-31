import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  requireAdmin, 
  requirePermission, 
  requireMinLevel 
} from '../middleware/adminAuth.js';
import adminService from '../services/adminService.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/users', requirePermission('analytics', 'read'), async (req, res, next) => {
  try {
    const userStats = await adminService.getUserStats();
    const userGrowth = await adminService.getUserGrowthStats();
    
    res.json({
      stats: userStats,
      growth: userGrowth
    });
  } catch (error) {
    next(error);
  }
});

// User Management
router.get('/users', requirePermission('users', 'read'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search
    };

    const result = await adminService.getUsers(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', requirePermission('users', 'read'), async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/users', requirePermission('users', 'create'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, isVerified } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new ApiError('Missing required fields', 400, 'MISSING_FIELDS');
    }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      isVerified
    };

    const newUser = await adminService.createUser(req.admin.id, userData);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', requirePermission('users', 'update'), async (req, res, next) => {
  try {
    const updateData = req.body;
    const updatedUser = await adminService.updateUser(req.admin.id, req.params.id, updateData);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requirePermission('users', 'delete'), async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.admin.id) {
      throw new ApiError('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
    }

    const result = await adminService.deleteUser(req.admin.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Admin Management
router.get('/admins', requirePermission('admins', 'read'), async (req, res, next) => {
  try {
    const admins = await adminService.getAdmins();
    res.json(admins);
  } catch (error) {
    next(error);
  }
});

router.post('/admins/:id/promote', requireMinLevel('admin'), async (req, res, next) => {
  try {
    const { level = 'moderator' } = req.body;
    
    if (!['moderator', 'admin', 'super_admin'].includes(level)) {
      throw new ApiError('Invalid admin level', 400, 'INVALID_ADMIN_LEVEL');
    }

    const promotedUser = await adminService.promoteToAdmin(req.admin.id, req.params.id, level);
    res.json(promotedUser);
  } catch (error) {
    next(error);
  }
});

router.put('/admins/:id/level', requireMinLevel('super_admin'), async (req, res, next) => {
  try {
    const { level } = req.body;
    
    if (!['moderator', 'admin', 'super_admin'].includes(level)) {
      throw new ApiError('Invalid admin level', 400, 'INVALID_ADMIN_LEVEL');
    }

    const updatedAdmin = await adminService.updateAdminLevel(req.admin.id, req.params.id, level);
    res.json(updatedAdmin);
  } catch (error) {
    next(error);
  }
});

router.delete('/admins/:id', requireMinLevel('super_admin'), async (req, res, next) => {
  try {
    // Prevent self-demotion
    if (req.params.id === req.admin.id) {
      throw new ApiError('Cannot revoke your own admin privileges', 400, 'CANNOT_REVOKE_SELF');
    }

    const result = await adminService.revokeAdmin(req.admin.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Activity Logs
router.get('/logs', requirePermission('logs', 'read'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
      adminId: req.query.adminId,
      action: req.query.action,
      targetType: req.query.targetType,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await adminService.getActivityLogs(page, limit, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// System Information
router.get('/system', requirePermission('system', 'read'), async (req, res, next) => {
  try {
    const systemHealth = await adminService.getSystemHealth();
    res.json(systemHealth);
  } catch (error) {
    next(error);
  }
});

// Admin Profile
router.get('/profile', async (req, res, next) => {
  try {
    const adminProfile = await adminService.getUserById(req.admin.id);
    res.json(adminProfile);
  } catch (error) {
    next(error);
  }
});

export default router; 