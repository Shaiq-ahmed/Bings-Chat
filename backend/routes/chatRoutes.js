const express = require("express");
const router = express.Router();

const {
    accessChat,
    fetchChats,
    CreateGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
    leaveChat,
    fetchGroupChats,
    fetchChatDetails,
    updateGroupImage

} = require("../controllers/chatController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { upload } = require("../utils/multer");

router.route("/").post(isAuthenticatedUser,accessChat);
router.route("/").get(isAuthenticatedUser,fetchChats);
router.route("/details/:chatId").get(isAuthenticatedUser,fetchChatDetails);
router.route("/group").get(isAuthenticatedUser,fetchGroupChats);
router.route("/group").post(isAuthenticatedUser,upload.single('image'),CreateGroupChat);
router.route("/group/img/:chatId/upload").put(isAuthenticatedUser,upload.single('image'),updateGroupImage);
router.route("/group/:chatId/rename").put(isAuthenticatedUser,renameGroup);
router.route("/group/:chatId/remove-user").put(isAuthenticatedUser,removeFromGroup);
router.route("/group/:chatId/add-user").put(isAuthenticatedUser, addToGroup);
router.route("/group/:chatId/leave-chat").put(isAuthenticatedUser,leaveChat);


module.exports = router;