const { analyzeTicketWithGroq } = require('../services/groqService');

// @desc    Analyze ticket text using Groq LLM API to auto-suggest category and priority
// @route   POST /api/triage/analyze
// @access  Private
const analyzeTicket = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for AI analysis'
      });
    }

    const result = await analyzeTicketWithGroq(title, description);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeTicket };
