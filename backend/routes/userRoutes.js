const express = require("express");
const router = express.Router();
const { upload } = require("../utils/multer");
// const passport = require("passport");

const {
    getUserProfile,
    updatePassword,
    UpdateUserProfile,
    searchUsers,
    updateProfileAvatar

} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");

router.route("/profile").get(isAuthenticatedUser,getUserProfile);
router.route("/change-password").patch(isAuthenticatedUser,updatePassword);
router.route("/profile").put(isAuthenticatedUser,UpdateUserProfile);
router.route("/change-avatar").put(isAuthenticatedUser,upload.single("image"),updateProfileAvatar);
router.route("/search").get(isAuthenticatedUser,searchUsers);




module.exports = router;