import { create } from "zustand";
import Peer from "simple-peer";
import { playCallRingtone, stopCallRingtone, playCallEndSound } from "../utils/soundEffect";

const initialState = {
  isReceivingCall: false,
  isCalling: false,
  callAccepted: false,
  callEnded: false,
  caller: null,
  callerSignal: null,
  userStream: null,
  callType: null,
  peer: null,
  remotePeerStream: null,
  callStartTime: null,
  ringtone: null,
};

export const useCallStore = create((set, get) => ({
  ...initialState,

  setIsReceivingCall: (isReceivingCall) => set({ isReceivingCall }),
  setIsCalling: (isCalling) => set({ isCalling }),
  setCallAccepted: (callAccepted) => {
    if (callAccepted) {
      const ringtone = get().ringtone;
      if (ringtone) {
        stopCallRingtone(ringtone);
      }
      set({ callAccepted, callStartTime: Date.now(), ringtone: null });
    } else {
      set({ callAccepted });
    }
  },
  setCallEnded: (callEnded) => {
    if (callEnded) {
      const { ringtone, userStream, peer } = get();
      if (ringtone) {
        stopCallRingtone(ringtone);
      }
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
      playCallEndSound();
      set({ ...initialState });
    } else {
      set({ callEnded });
    }
  },
  setCaller: (caller) => set({ caller }),
  setCallerSignal: (callerSignal) => set({ callerSignal }),
  setUserStream: (userStream) => set({ userStream }),
  setCallType: (callType) => set({ callType }),
  setPeer: (peer) => set({ peer }),
  setRemotePeerStream: (remotePeerStream) => set({ remotePeerStream }),
  resetCallState: () => {
    const { userStream, peer } = get();
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    set(initialState);
  },

  startRingtone: () => {
    const ringtone = playCallRingtone();
    set({ ringtone });
  },

  stopRingtone: () => {
    const { ringtone } = get();
    if (ringtone) {
      stopCallRingtone(ringtone);
      set({ ringtone: null });
    }
  },

  callUser: async (userId, type, socket, currentUserId, currentUserName) => {
    if (!socket || !socket.connected) {
      console.error("Socket is not connected.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      set({ userStream: stream, isCalling: true, callType: type });

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("callUser", {
          userToCall: userId,
          signalData: signal,
          from: currentUserId,
          name: currentUserName,
          type,
        });
      });

      peer.on("stream", (remoteStream) => {
        set({ remotePeerStream: remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        get().endCall();
      });

      set({ peer });
      get().startRingtone();

      socket.on("callAccepted", (signal) => {
        peer.signal(signal);
        get().setCallAccepted(true);
      });

      return peer;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access media devices. Please enable microphone and camera.");
    }
  },

  answerCall: async (socket) => {
    const { callerSignal, callType } = get();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      set({ userStream: stream });

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: get().caller });
      });

      peer.on("stream", (remoteStream) => {
        set({ remotePeerStream: remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        get().endCall();
      });

      peer.signal(callerSignal);
      set({ peer });
      get().setCallAccepted(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access media devices. Please enable microphone and camera.");
    }
  },

  endCall: () => {
    get().setCallEnded(true);
    get().resetCallState();
  },
}));

