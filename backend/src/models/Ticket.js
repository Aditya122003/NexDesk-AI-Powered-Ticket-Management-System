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

// Collision-proof Pre-save hook to generate unique ticketId (e.g. TCK-1001)
ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    try {
      // Find latest ticket to get highest reference sequence number
      const lastTicket = await mongoose.model('Ticket')
        .findOne({}, { ticketId: 1 })
        .sort({ createdAt: -1, _id: -1 });

      let nextNum = 1001;
      if (lastTicket && lastTicket.ticketId) {
        const match = lastTicket.ticketId.match(/TCK-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }

      // Loop safeguard to ensure candidateId is 100% unique in DB
      let candidateId = `TCK-${nextNum}`;
      let exists = await mongoose.model('Ticket').exists({ ticketId: candidateId });
      while (exists) {
        nextNum += 1;
        candidateId = `TCK-${nextNum}`;
        exists = await mongoose.model('Ticket').exists({ ticketId: candidateId });
      }

      this.ticketId = candidateId;
    } catch (err) {
      console.error('[TicketModel] Auto-id generation error, using fallback:', err);
      this.ticketId = `TCK-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
