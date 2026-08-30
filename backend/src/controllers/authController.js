const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendPasswordResetEmail } = require('../services/emailService');

const SUPERADMIN_EMAIL = 'adityatiwari5175@gmail.com';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      isApproved: user.isApproved
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_helpdesk_2026_secure',
    { expiresIn: '30d' }
  );
};

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z)';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      return res.status(400).json({ success: false, message: passwordErr });
    }

    const lowerEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Determine Role & Approval Status
    let userRole = 'customer';
    let isApproved = true;

    if (lowerEmail === SUPERADMIN_EMAIL) {
      userRole = 'superadmin';
      isApproved = true;
    } else if (role === 'admin') {
      userRole = 'admin';
      isApproved = false; // Pending Superadmin approval!
    }

    const user = await User.create({
      name,
      email: lowerEmail,
      password,
      role: userRole,
      isApproved,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    if (!isApproved) {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: `Admin registration submitted! Superadmin (${SUPERADMIN_EMAIL}) must approve your account before you can log in as Admin.`
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: lowerEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Enforce Superadmin Approval check for Admin accounts
    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message: `Admin account approval pending. Superadmin (${SUPERADMIN_EMAIL}) must approve your account before you can log in.`
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Sign-In / Verification
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { credential, email: bodyEmail, name: bodyName, googleId: bodyGoogleId, avatar: bodyAvatar } = req.body;

    let userEmail = bodyEmail;
    let userName = bodyName;
    let googleId = bodyGoogleId;
    let userAvatar = bodyAvatar;

    if (credential) {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      try {
        const client = new OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId || undefined
        });
        const payload = ticket.getPayload();
        userEmail = payload.email;
        userName = payload.name;
        googleId = payload.sub;
        userAvatar = payload.picture;
      } catch (err) {
        console.warn('[GoogleAuth] Token verify fallback:', err.message);
        try {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
          userEmail = payload.email;
          userName = payload.name;
          googleId = payload.sub;
          userAvatar = payload.picture;
        } catch (decodeErr) {
          console.error('[GoogleAuth] Decode error:', decodeErr);
        }
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Valid Google account email is required' });
    }

    const lowerEmail = userEmail.toLowerCase().trim();
    let user = await User.findOne({ email: lowerEmail });

    if (user) {
      // If user is superadmin email, ensure role is superadmin
      if (lowerEmail === SUPERADMIN_EMAIL && user.role !== 'superadmin') {
        user.role = 'superadmin';
        user.isApproved = true;
        await user.save();
      }
      if (!user.googleId) {
        user.googleId = googleId || `google_${Date.now()}`;
        if (userAvatar) user.avatar = userAvatar;
        await user.save();
      }
    } else {
      const isSuperadmin = lowerEmail === SUPERADMIN_EMAIL;
      user = await User.create({
        name: userName || lowerEmail.split('@')[0],
        email: lowerEmail,
        googleId: googleId || `google_${Date.now()}`,
        role: isSuperadmin ? 'superadmin' : 'customer',
        isApproved: true,
        avatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lowerEmail)}`
      });
    }

    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message: `Admin account approval pending. Superadmin (${SUPERADMIN_EMAIL}) must approve your account.`
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isApproved: req.user.isApproved,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt
    }
  });
};

// @desc    Update user profile (Name & Avatar)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Send reset link to user email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'no user exist with this email'
      });
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

    await user.save({ validateBeforeSave: false });

    // Generate Reset URL
    const clientOrigin = req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;

    // Send Reset Email
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({
      success: true,
      message: 'Password reset link sent successfully! Please check your email inbox.',
      resetUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter a new password' });
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      return res.status(400).json({ success: false, message: passwordErr });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Hash token from URL parameter to find matching user in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new link.'
      });
    }

    // Set new password (User model pre-save hook will hash it automatically)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  SUPERADMIN_EMAIL
};
