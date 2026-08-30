const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketDetails,
  deleteTicket
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('customer'), upload.single('attachment'), createTicket)
  .get(getTickets);

router
  .route('/:id')
  .get(getTicketById)
  .put(updateTicketDetails)
  .delete(deleteTicket);

router
  .route('/:id/status')
  .put(authorize('admin'), updateTicketStatus);

module.exports = router;
