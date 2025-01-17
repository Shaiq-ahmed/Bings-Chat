const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markNotificationAsRead,
  clearNotifications
} = require('../controllers/notificationController');

router.use(isAuthenticatedUser);

router.route('/').get(getNotifications).delete(clearNotifications);
router.route('/:id/read').put(markNotificationAsRead);

module.exports = router;

