const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { analyzeTicketWithGroq } = require('../services/groqService');
const path = require('path');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Customer Only)
const createTicket = async (req, res, next) => {
  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins and Superadmins cannot raise support tickets; only Customers are authorized.'
      });
    }

    const { title, description, category: inputCategory, priority: inputPriority, customerPriority: inputCustomerPriority, autoTriage } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const customerPriority = inputCustomerPriority || inputPriority || 'Medium';
    let category = inputCategory;
    let priority = inputPriority;
    let aiReasoning = '';
    let aiSuggestedSummary = '';
    let aiTriaged = false;

    // AI Auto-triage if requested or category/priority missing
    if (autoTriage === 'true' || autoTriage === true || !category || !priority) {
      const aiResult = await analyzeTicketWithGroq(title, description);
      if (!category) category = aiResult.category;
      if (!priority) priority = aiResult.priority;
      aiReasoning = aiResult.reasoning;
      aiSuggestedSummary = aiResult.suggestedSummary;
      aiTriaged = aiResult.isAiSuccess;
    }

    // Attachment file check
    let attachment = null;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      };
    }

    const ticket = new Ticket({
      title,
      description,
      category: category || 'Uncategorized',
      customerPriority: customerPriority,
      priority: priority || customerPriority || 'Medium',
      status: 'Open',
      customer: req.user._id,
      attachment,
      aiTriaged,
      aiReasoning,
      aiSuggestedSummary,
      statusHistory: [
        {
          status: 'Open',
          changedBy: req.user._id,
          note: 'Ticket created',
          timestamp: new Date()
        }
      ]
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar role')
      .populate('statusHistory.changedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets with search, filter, and pagination
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { status, priority, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};

    // Role-based scoping: Customers can only see their own tickets
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    // Filter by status
    if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) {
      query.status = status;
    }

    // Filter by priority (match either AI priority or customer priority)
    if (priority && ['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      query.$or = [
        { priority: priority },
        { customerPriority: priority }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search query on title, description, ticketId
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Date Range (startDate & endDate)
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};

      if (req.query.startDate && req.query.startDate !== 'undefined') {
        const startStr = req.query.startDate.includes('T')
          ? req.query.startDate
          : `${req.query.startDate}T00:00:00.000Z`;
        const start = new Date(startStr);
        if (!isNaN(start.getTime())) {
          query.createdAt.$gte = start;
        }
      }

      if (req.query.endDate && req.query.endDate !== 'undefined') {
        let endStr = req.query.endDate;
        if (!endStr.includes('T')) {
          endStr = `${endStr}T23:59:59.999Z`;
        } else if (endStr.endsWith('00:00:00.000Z')) {
          endStr = endStr.replace('00:00:00.000Z', '23:59:59.999Z');
        }
        const end = new Date(endStr);
        if (!isNaN(end.getTime())) {
          query.createdAt.$lte = end;
        }
      }

      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email avatar role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        count: tickets.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket details
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email avatar role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Access control: customer can only view their own ticket
    if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status and category (Admin workflow)
// @route   PUT /api/tickets/:id/status
// @access  Private (Admin)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, note, category } = req.body;

    if (status && !['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Open, In Progress, or Resolved' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const previousStatus = ticket.status;
    if (status) ticket.status = status;

    // Allow category reclassification by Admin/Superadmin
    if (category && ['Technical', 'Billing', 'Account', 'Feature Request', 'General', 'Uncategorized'].includes(category)) {
      ticket.category = category;
    }

    // Push new status entry into status history
    ticket.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status updated from ${previousStatus} to ${status}`,
      timestamp: new Date()
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    // Create notification for customer
    await Notification.create({
      user: ticket.customer,
      ticket: ticket._id,
      title: `Ticket ${ticket.ticketId} Status Updated`,
      message: `Your ticket status was changed to "${status}" by ${req.user.name}.${note ? ` Note: ${note}` : ''}`,
      type: 'STATUS_CHANGE'
    });

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin or Ticket Creator)
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only admin or ticket owner can delete
    if (req.user.role !== 'admin' && ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this ticket' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket details by Customer owner
// @route   PUT /api/tickets/:id
// @access  Private (Customer / Ticket Owner)
const updateTicketDetails = async (req, res, next) => {
  try {
    const { title, description, customerPriority } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this ticket' });
    }

    if (ticket.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'This ticket has been resolved and cannot be edited.' });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (customerPriority && ['Urgent', 'High', 'Medium', 'Low'].includes(customerPriority)) {
      ticket.customerPriority = customerPriority;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    res.json({
      success: true,
      message: 'Ticket details updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketDetails,
  deleteTicket
};
