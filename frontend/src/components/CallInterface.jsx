import React, { useEffect, useRef, useState } from "react";
import { useCall } from "./CallProvider";
import { PhoneOff, Video, VideoOff, Mic, MicOff, Timer } from 'lucide-react';

const CallInterface = () => {
  const {
    isReceivingCall,
    isCalling,
    callAccepted,
    callEnded,
    caller,
    callType,
    remotePeerStream,
    userStream,
    answerCall,
    endCall,
  } = useCall();

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const userVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callAccepted && !callEnded) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0)
    }

    return () => clearInterval(timerRef.current);
  }, [callAccepted, callEnded]);

  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
    }
    if (remoteVideoRef.current && remotePeerStream) {
      remoteVideoRef.current.srcObject = remotePeerStream;
    }
    if (remoteAudioRef.current && remotePeerStream) {
      remoteAudioRef.current.srcObject = remotePeerStream;
    }
  }, [userStream, remotePeerStream]);

  const toggleAudio = () => {
    if (userStream) {
      const audioTrack = userStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
        setIsAudioMuted(!isAudioMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (userStream && callType === "video") {
      const videoTrack = userStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if ((!isReceivingCall && !isCalling && !callAccepted) || callEnded) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-3xl text-white">
        {(isReceivingCall || isCalling) && !callAccepted && (
          <div className="text-center animate-pulse">
            <h2 className="text-2xl font-bold mb-4">
              {isReceivingCall ? `${caller} is calling...` : 'Calling...'}
            </h2>
            <div className="flex justify-center space-x-4">
              {isReceivingCall && (
                <button className="btn btn-success text-white px-6 py-2 rounded-full transition-transform hover:scale-105" onClick={answerCall}>
                  Answer
                </button>
              )}
              <button className="btn btn-error text-white px-6 py-2 rounded-full transition-transform hover:scale-105" onClick={endCall}>
                {isReceivingCall ? 'Decline' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
        {callAccepted && !callEnded && (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <Timer className="w-6 h-6 inline-block mr-2" />
              <span>{formatTime(callDuration)}</span>
            </div>
            {callType === "video" && (
              <div className="relative w-full flex justify-center mb-4">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-lg rounded-lg shadow-md"
                />
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-4 right-4 w-1/4 rounded-lg shadow-md"
                />
              </div>
            )}
            {callType === "audio" && (
              <audio ref={remoteAudioRef} autoPlay />
            )}
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={toggleAudio}
                className={`btn ${isAudioMuted ? "btn-error" : "btn-primary"}`}
              >
                {isAudioMuted ? <MicOff /> : <Mic />}
              </button>
              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`btn ${isVideoOff ? "btn-error" : "btn-primary"}`}
                >
                  {isVideoOff ? <VideoOff /> : <Video />}
                </button>
              )}
              <button className="btn btn-error" onClick={endCall}>
                <PhoneOff />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallInterface;

