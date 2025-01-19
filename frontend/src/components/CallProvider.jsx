import React, { createContext, useContext, useEffect } from "react";
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

  useEffect(() => {
    if (!socket) return;

    // Handle incoming call
    socket.on("callUser", ({ from, name, signal, type }) => {
      callStore.setIsReceivingCall(true);
      callStore.setCaller(from);
      callStore.setCallerSignal(signal);
      callStore.setCallType(type);
    });

    // Handle call acceptance
    socket.on("callAccepted", (signal) => {
      callStore.setCallAccepted(true);
      const peer = callStore.peer;
      if (peer) {
        peer.signal(signal);
      }
    });

    // Handle call end
    socket.on("callEnded", () => {
      callStore.endCall();
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callEnded");
      callStore.resetCallState();
    };
  }, [socket, callStore]);

  const contextValue = {
    ...callStore,
    callUser: (userId, type) =>
      callStore.callUser(userId, type, socket, userProfile._id, userProfile.name),
    answerCall: () => {
      callStore.answerCall(socket);
    },
    endCall: () => {
      callStore.endCall();
      socket.emit("endCall", { to: callStore.caller });
    },
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};









