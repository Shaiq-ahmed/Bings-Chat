import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useCallStore } from "../store/useCallStore";
import { useSocket } from "../SocketProvider";
import { useAuthStore } from "../store/useAuthStore";

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { userProfile } = useAuthStore();
  const callStore = useCallStore();

  // Memoize the cleanup function
  const cleanup = useCallback(() => {
    if (socket) {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callEnded");
    }
    // Don't call resetCallState here, as it might cause infinite updates
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleCallEnd = () => {
      callStore.endCall();
    };

    socket.on("callUser", ({ from, name, signal, type }) => {
      callStore.setIsReceivingCall(true);
      callStore.setCaller(from);
      callStore.setCallerSignal(signal);
      callStore.setCallType(type);
    });

    socket.on("callAccepted", (signal) => {
      callStore.setCallAccepted(true);
      const peer = callStore.peer;
      if (peer) {
        peer.signal(signal);
      }
    });

    socket.on("callEnded", handleCallEnd);

    // Return cleanup function
    return cleanup;
  }, [socket, callStore, cleanup]);

  const contextValue = {
    ...callStore,
    callUser: (userId, type) =>
      callStore.callUser(
        userId,
        type,
        socket,
        userProfile._id,
        userProfile.name
      ),
    answerCall: () => {
      callStore.answerCall(socket);
    },
    endCall: () => {
      callStore.endCall();
      if (socket && callStore.caller) {
        socket.emit("endCall", { to: callStore.caller });
      }
    },
  };

  return (
    <CallContext.Provider value={contextValue}>{children}</CallContext.Provider>
  );
};
