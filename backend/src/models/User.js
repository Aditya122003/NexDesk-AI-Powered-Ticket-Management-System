const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId;
      },
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'superadmin'],
      default: 'customer'
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    googleId: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: ''
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (supports bcrypt hashes & plain-text fallback)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
