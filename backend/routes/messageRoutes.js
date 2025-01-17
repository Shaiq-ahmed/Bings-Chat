const express = require("express");
const router = express.Router();
const { upload } = require("../utils/multer");
const { sendMessage, getAllMessages, uploadFile} = require("../controllers/messageController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
// const multer = require("multer");
// const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.route("/send/:chatId").post(upload.single("image"),isAuthenticatedUser,sendMessage);
router.route("/:chatId").get(isAuthenticatedUser,getAllMessages);

// Define the upload route
router.route("/upload").post(isAuthenticatedUser, upload.single('file'), uploadFile); 


module.exports = router;

