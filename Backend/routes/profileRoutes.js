const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  uploadAvatar
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.put('/', updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
