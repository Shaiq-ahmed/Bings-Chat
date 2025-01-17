import { useState } from 'react';
import { ArrowLeft, X, Phone, Video, Info } from 'lucide-react';
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCall } from "./CallProvider";
import GroupInfoModal from './GroupInfoModal';

const ChatHeader = ({ onBack, chatDetails }) => {
  const { selectedChat } = useChatStore();
  const { onlineUsers, userProfile } = useAuthStore();
  const { callUser } = useCall();
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const isGroupChat = chatDetails.isGroupChat;
  const chatImage = isGroupChat ? chatDetails.img : chatDetails.users.find(user => user._id !== userProfile._id)?.avatar;
  const chatName = isGroupChat ? chatDetails.chatName : chatDetails.users.find(user => user._id !== userProfile._id)?.name;
  const otherUser = isGroupChat ? null : chatDetails.users.find(user => user._id !== userProfile._id);

  const handleAudioCall = () => {
    if (otherUser) {
      console.log("Initiating audio call with:", otherUser._id);
      callUser(otherUser._id, 'audio');
    } else {
      console.error("Cannot initiate call: otherUser is undefined");
    }
  };

  const handleVideoCall = () => {
    if (otherUser) {
      console.log("Initiating video call with:", otherUser._id);
      callUser(otherUser._id, 'video');
    } else {
      console.error("Cannot initiate call: otherUser is undefined");
    }
  };

  return (
    <>
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden btn btn-ghost btn-square">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full relative">
                <img src={chatImage || "/avatar.png"} alt={chatName || "User"} />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{chatName || "Unknown User"}</h3>
              {!isGroupChat && (
                <p className="text-sm text-base-content/70">
                  {onlineUsers.includes(otherUser?._id) ? "Online" : "Offline"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isGroupChat && (
              <>
                <button
                  onClick={handleAudioCall}
                  className="btn btn-ghost btn-square"
                  aria-label="Audio Call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="btn btn-ghost btn-square"
                  aria-label="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
              </>
            )}
            {isGroupChat && (
              <button
                onClick={() => setIsGroupInfoModalOpen(true)}
                className="btn btn-ghost btn-square"
                aria-label="Group Info"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            <button onClick={onBack} className="btn btn-ghost btn-square hidden lg:flex">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {isGroupChat && (
        <GroupInfoModal
          isOpen={isGroupInfoModalOpen}
          onClose={() => setIsGroupInfoModalOpen(false)}
          chatDetails={chatDetails}
        />
      )}
    </>
  );
};

export default ChatHeader;

