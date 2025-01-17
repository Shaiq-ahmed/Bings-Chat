import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSocket } from "../SocketProvider";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import {
  formatMessageTime,
  formatMessageDate,
  shouldShowDateSeparator,
} from "../lib/date-pattern";
import RedirectWithToast from "./RedirectWithToast";

const ChatContainer = () => {
  const { chatId } = useParams();
  const {
    messages,
    isMessagesLoading,
    selectedChat,
    selectChat,
    subscribeToMessages,
    unsubscribeFromMessages,
    getMoreMessages,
    hasMoreMessages,
    error
  } = useChatStore();
  const { userProfile } = useAuthStore();
  const {
    socket,
    joinChat,
    leaveChat,
    // subscribeToGroupUpdates,
    // unsubscribeFromGroupUpdates,
  } = useSocket();
  const messageEndRef = useRef(null);
  const [offset, setOffset] = useState(20);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const handleSelectChat = useCallback(() => {
    if (chatId) {
      selectChat(chatId);
    }
  }, [chatId, selectChat]);


  useEffect(() => {
    handleSelectChat();
  }, [handleSelectChat]);

  useEffect(() => {
    if (chatId && socket) {
      joinChat(chatId);
      subscribeToMessages(chatId, socket);
      // subscribeToGroupUpdates(chatId, socket);
      setOffset(20);

      return () => {
        unsubscribeFromMessages(socket);
        // unsubscribeFromGroupUpdates(socket);
        leaveChat(chatId);
      };
    }
  }, [
    chatId,
    socket,
    joinChat,
    leaveChat,
    subscribeToMessages,
    unsubscribeFromMessages,
   
  ]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !isMessagesLoading) {
      const scrollHeightBeforeFetch = chatContainerRef.current.scrollHeight;
      const scrollTopBeforeFetch = chatContainerRef.current.scrollTop;

      getMoreMessages(chatId, offset).then(() => {
        const scrollHeightAfterFetch = chatContainerRef.current.scrollHeight;
        const scrollDiff = scrollHeightAfterFetch - scrollHeightBeforeFetch;
        chatContainerRef.current.scrollTop = scrollTopBeforeFetch + scrollDiff;
      });

      setOffset((prevOffset) => prevOffset + 20);
    }
  }, [hasMoreMessages, isMessagesLoading, getMoreMessages, chatId, offset]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop } = e.target;
      if (scrollTop === 0) {
        loadMoreMessages();
      }
    },
    [loadMoreMessages]
  );
  if (error) {
    return <RedirectWithToast path="/" message={error} />;
  }
  if (!selectedChat) {
    return <MessageSkeleton />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader onBack={() => navigate("/")} chatDetails={selectedChat} />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        ref={chatContainerRef}
      >
        {isMessagesLoading && messages.length === 0 ? (
          <MessageSkeleton />
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message._id}>
                {shouldShowDateSeparator(message, messages[index - 1]) && (
                  <div className="text-center my-4">
                    <span className="bg-base-200 text-base-content text-xs px-2 py-1 rounded-full">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`chat ${
                    message.senderId._id === userProfile._id
                      ? "chat-end"
                      : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 h-10 rounded-full border">
                      <img
                        src={message.senderId.avatar || "/avatar.png"}
                        alt="profile pic"
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    {
                      selectedChat.isGroupChat &&(
                        <span className="font-bold mr-2">
                        {message.senderId.name}
                      </span>
                      )
                    }
                   
                    <time className="text-xs opacity-50">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="chat-bubble flex flex-col">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </>
        )}
      </div>

      <MessageInput chatId={chatId} />
    </div>
  );
};

export default ChatContainer;
