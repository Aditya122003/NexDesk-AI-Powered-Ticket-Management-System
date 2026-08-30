const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    url: String
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Billing', 'Account', 'Feature Request', 'General', 'Uncategorized'],
      default: 'Uncategorized'
    },
    customerPriority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    attachment: attachmentSchema,
    statusHistory: [statusHistorySchema],
    aiTriaged: {
      type: Boolean,
      default: false
    },
    aiReasoning: {
      type: String,
      default: ''
    },
    aiSuggestedSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate ticketId (e.g. TCK-1001) if not set
ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TCK-${1000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
