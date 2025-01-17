const { StatusCodes } = require("http-status-codes");
const Chat = require("../models/chatSchema");
const User = require("../models/userModel");
const Message = require("../models/messageSchema");
const cloudinary = require("../utils/cloudinary");
const { io, getOnlineUsers, emitNewMessageNotification } = require("../socket");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const user = req.user.id;

    let imageUrl;
    if (req.file) {
      const uploadImage = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadImage.secure_url;
      // Remove the file from disk after successful upload
      await unlinkAsync(req.file.path);
    }

    const message = await Message.create({
      chat: chatId,
      senderId: user,
      text,
      image: imageUrl,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name avatar")
      .populate("chat");

    io.to(chatId).emit("message", populatedMessage);

    // Send notifications to online users
    const chat = await Chat.findById(chatId)
      .populate("users", "_id")
      .populate("latestMessage");
    chat.latestMessage = message._id;
    await chat.save();
    const onlineUsers = getOnlineUsers();
    console.log(onlineUsers);
    chat.users.forEach((chatUser) => {
      if (
        chatUser._id.toString() !== user &&
        onlineUsers.includes(chatUser._id.toString())
      ) {
        emitNewMessageNotification(chatUser._id.toString(), {
          message: populatedMessage,
          chat: chat,
        });
      }
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ message: populatedMessage, success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// fetch all the chat messages
const getAllMessages = async (req, res, next) => {
  const chatId = req.params.chatId;
  const user = req.user.id;
  const { offset = 0, limit = 20 } = req.query;

  if (!chatId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error:
        "Chat ID is required. Please ensure you've entered a valid chat ID.",
    });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Chat not found" });
    }

    const userExist = chat.users.find((userCheck) => userCheck.equals(user));

    if (!userExist) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Insufficient Permission", success: false });
    }

    const fetchChatMessages = await Message.find({ chat: chatId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset)) // Skip the first 'offset' messages
      .limit(parseInt(limit)); // Limit the number of messages returned

    return res
      .status(StatusCodes.OK)
      .json({ messages: fetchChatMessages, success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const uploadFile = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "No file uploaded" });
    }

    // Respond with success message
    res.status(StatusCodes.OK).json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("File upload error:", error);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while uploading the file." });
  }
};

module.exports = {
  getAllMessages,
  uploadFile,
  sendMessage,
};
