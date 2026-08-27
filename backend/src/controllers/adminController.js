const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendAdminApprovalEmail, sendAdminDisapprovalEmail } = require('../services/emailService');

// @desc    Get admin analytics overview (Backed by Mongoose Aggregations)
// @route   GET /api/admin/analytics
// @access  Private (Admin/Superadmin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });

    const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0;

    const statusBreakdown = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityBreakdown = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const categoryBreakdown = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const timelineData = await Ticket.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin', isApproved: true });
    const pendingAdminsCount = await User.countDocuments({ role: 'admin', isApproved: false });

    const classificationLogs = await Ticket.find()
      .populate('customer', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        metrics: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          resolutionRate: Number(resolutionRate),
          totalCustomers,
          totalAdmins,
          pendingAdminsCount
        },
        statusBreakdown: statusBreakdown.map(item => ({ status: item._id, count: item.count })),
        priorityBreakdown: priorityBreakdown.map(item => ({ priority: item._id, count: item.count })),
        categoryBreakdown: categoryBreakdown.map(item => ({ category: item._id, count: item.count })),
        timelineData: timelineData.map(item => ({ date: item._id, total: item.total, resolved: item.resolved })),
        classificationLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending admin approval requests
// @route   GET /api/admin/pending-admins
// @access  Private (Superadmin Only)
const getPendingAdmins = async (req, res, next) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only Superadmin is authorized to view pending admin requests.' });
    }

    const pendingAdmins = await User.find({ role: 'admin', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingAdmins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve admin role request & Send notification email
// @route   PUT /api/admin/approve-admin/:id
// @access  Private (Superadmin Only)
const approveAdmin = async (req, res, next) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only Superadmin is authorized to approve admin requests.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    // Trigger Approval Email Notification
    await sendAdminApprovalEmail(user.email, user.name);

    res.json({
      success: true,
      message: `User ${user.email} approved as Admin successfully! Email notification sent.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject / Disapprove admin role request with reason & email
// @route   POST /api/admin/reject-admin/:id (also PUT/DELETE)
// @access  Private (Superadmin Only)
const rejectAdmin = async (req, res, next) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only Superadmin is authorized to reject admin requests.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { reason } = req.body || {};

    user.role = 'customer';
    user.isApproved = true;
    await user.save();

    // Trigger Disapproval Email Notification with Reason
    await sendAdminDisapprovalEmail(user.email, user.name, reason || 'Admin privileges not approved.');

    res.json({
      success: true,
      message: `User ${user.email} admin request disapproved. Reason sent via email notification.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admins & Customers) for Superadmin management
// @route   GET /api/admin/users
// @access  Private (Superadmin / Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any user (Admin or Customer) by Superadmin
// @route   DELETE /api/admin/users/:id
// @access  Private (Superadmin)
const deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent Superadmin from deleting themselves
    if (targetUser.email === 'adityatiwari5175@gmail.com' || targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin account cannot be deleted' });
    }

    // Delete user and associated tickets
    await User.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ customer: req.params.id });

    res.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) and associated tickets deleted successfully!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
  getAllUsers,
  deleteUser
};
