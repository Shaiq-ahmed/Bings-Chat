const { Server } = require("socket.io");
const { createServer } = require("http");
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const server = createServer(app);
const mongoose = require("mongoose");
const Notification = require("./models/notificationSchema");
const Chat = require("./models/chatSchema");
const User = require("./models/userModel");

const io = new Server(server, {
  // pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.userId;
    next();
  });
};

io.use(authenticateSocket)

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_connected", async (userId) => {
    onlineUsers.set(userId, socket.id);
    // io.emit("user_status_change", { userId, status: "online" });
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log("User online:", userId);
    console.log("User online:", onlineUsers);
    // Send pending notifications to the user
    const pendingNotifications = await Notification.find({
      recipient: userId,
      read: false,
    })
      .populate("sender", "name avatar")
      .populate("chat", "chatName isGroupChat");
    if (pendingNotifications.length > 0) {
      socket.emit("pending_notifications", pendingNotifications);
    }
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log("User joined chat:", chatId);
  });

  socket.on("leave chat", (chatId) => {
    socket.leave(chatId);
    console.log("User left chat:", chatId);
  });

  socket.on("callUser", ({ userToCall, signalData, from, name, type }) => {
    console.log(`User ${from} is calling ${userToCall}`);
    const userSocketId = onlineUsers.get(userToCall);
    if (userSocketId) {
      io.to(userSocketId).emit("callUser", {
        signal: signalData,
        from,
        name,
        type,
      });
    } else {
      console.error(`User ${userToCall} is not online`);
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    console.log(`User is answering the call for ${to}`);
    const userSocketId = onlineUsers.get(to);
    if (userSocketId) {
      io.to(userSocketId).emit("callAccepted", signal);
    } else {
      console.error(`User ${to} is not online`);
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    console.log(`Sending ICE candidate to ${to}`);
    const userSocketId = onlineUsers.get(to);
    if (userSocketId) {
      io.to(userSocketId).emit("ice-candidate", { candidate });
    } else {
      console.error(`User ${to} is not online`);
    }
  });

  socket.on("endCall", ({ to }) => {
    console.log(`Call ended for user ${to}`);
    const userSocketId = onlineUsers.get(to);
    if (userSocketId) {
      io.to(userSocketId).emit("callEnded");
    } else {
      console.error(`User ${to} is not online`);
    }
  });

  socket.on("new_message", async (message) => {
    const chatId = message.chat._id;
    socket.to(chatId).emit("new_message", message);

    // Create notifications for offline users
    const offlineUsers = message.chat.users.filter(userId => !onlineUsers.has(userId.toString()));
    for (const userId of offlineUsers) {
      const notification = new Notification({
        type: "new_message",
        sender: socket.userId,
        recipient: userId,
        chat: chatId,
        content: message.content,
      });
      await notification.save();
      
      // If the user comes online, send the notification
      const userSocketId = onlineUsers.get(userId.toString());
      if (userSocketId) {
        io.to(userSocketId).emit("new_notification", notification);
      }
    }
  });
  socket.on("group_update", async ({ chatId, updatedChat, action, userId, userName, actionBy }) => {
    console.log("Group update:", { chatId, action, userId, userName, actionBy, updatedChat });

    const updatedChatWithUsers = await Chat.findById(chatId).populate("users").populate("latestMessage");
    
    if (action === "create_group") {
      // Notify all users in the group about the new group
      updatedChat.users.forEach((user) => {
        const userSocketId = user._id.toString() !== userId && onlineUsers.get(user._id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit("new_group_created", updatedChat);
        }
      });
    } else {
      // For other group updates
      io.to(chatId).emit("group_update", {
        chatId,
        updatedChat: updatedChatWithUsers,
        action,
        userId,
        userName,
      });
    }

    // Create notifications based on the action
    let notificationContent = '';
    let recipientsToNotify = [];

    switch (action) {
      case "create_group":
        notificationContent = `You have been added to the group ${updatedChat.chatName} by ${userName}`;
        recipientsToNotify = updatedChat.users.filter(user => user._id.toString() !== userId);
        break;

      case "add_user":
        // For users being added
        const addedUserIds = Array.isArray(userId) ? userId : [userId];
        const addedUsers = await User.find({ _id: { $in: addedUserIds } });
        
        for (const addedUser of addedUsers) {
          const addedUserNotification = new Notification({
            type: "group_update",
            sender: userId,
            recipient: addedUser._id,
            chat: chatId,
            content: `You have been added to the group ${updatedChatWithUsers.chatName} by ${userName}`,
          });
          await addedUserNotification.save();

          const addedUserSocketId = onlineUsers.get(addedUser._id.toString());
          if (addedUserSocketId) {
            io.to(addedUserSocketId).emit("new_notification", addedUserNotification);
            io.to(addedUserSocketId).emit("join_group", chatId);
          }
        }

        // For existing group members
        notificationContent = `${addedUsers.map(user => user.name).join(", ")} ${addedUsers.length > 1 ? "were" : "was"} added to the group ${updatedChatWithUsers.chatName} by ${userName}`;
        recipientsToNotify = updatedChatWithUsers.users.filter(user => !addedUserIds.includes(user._id.toString()) && user._id.toString() !== actionBy.toString());
        break;

      case "remove_user":
        // For the user being removed
        const removedUserNotification = new Notification({
          type: "group_update",
          sender: actionBy._id,
          recipient: userId,
          chat: chatId,
          content: `You have been removed from the group ${updatedChatWithUsers.chatName} by ${actionBy.name}`,
        });
        await removedUserNotification.save();

        const removedUserSocketId = onlineUsers.get(userId);
        if (removedUserSocketId) {
          io.to(removedUserSocketId).emit("new_notification", removedUserNotification);
          io.to(removedUserSocketId).emit("leave_group", chatId);
        }

        // For remaining group members
        notificationContent = `${userName} was removed from the group ${updatedChatWithUsers.chatName} by ${actionBy.name}`;
        recipientsToNotify = updatedChatWithUsers.users.filter(user => user._id.toString() !== actionBy._id.toString());
        break;

      case "rename":
        notificationContent = `${userName} renamed the group to ${updatedChatWithUsers.chatName}`;
        recipientsToNotify = updatedChatWithUsers.users.filter(user => user._id.toString() !== userId);
        break;

      case "leave_group":
        notificationContent = `${userName} left the group ${updatedChatWithUsers.chatName}`;
        recipientsToNotify = updatedChatWithUsers.users;
        break;
    }

    // Create and send notifications to recipients
    for (const recipient of recipientsToNotify) {
      const notification = new Notification({
        type: "group_update",
        sender: userId,
        recipient: recipient._id,
        chat: chatId,
        content: notificationContent,
      });
      await notification.save();
      
      const recipientSocketId = onlineUsers.get(recipient._id.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("new_notification", notification);
      }
    }
  });
   

  socket.on("read_notification", async (notificationId) => {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    socket.emit("notification_read", notificationId);
  });


  socket.on("disconnect", () => {
    let disconnectedUserId;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      //   io.emit("user_status_change", {
      //     userId: disconnectedUserId,
      //     status: "offline",
      //   });

      io.emit("online users", onlineUsers);

      console.log("User offline:", disconnectedUserId);
    }
    console.log("User disconnected:", socket.id);
  });
});

const getOnlineUsers = () => Array.from(onlineUsers.keys());
const emitNewMessageNotification = (recipientId, data) => {
  const recipientSocketId = onlineUsers.get(recipientId);
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("new_message_notification", data);
    console.log(
      "Emitted new_message_notification to:",
      recipientId,
      "with data:",
      data
    );
  } else {
    console.log("Recipient not online:", recipientId);
  }
};

module.exports = {
  io,
  app,
  server,
  getOnlineUsers,
  emitNewMessageNotification,
};
