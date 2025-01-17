const callRingtoneSrc = '/sounds/call-ringtone.mp3';
const callEndSrc = '/sounds/call-end.mp3';

export const playCallRingtone = () => {
  const audio = new Audio(callRingtoneSrc);
  audio.loop = true;
  audio.play();
  return audio;
};

export const stopCallRingtone = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

export const playCallEndSound = () => {
  const audio = new Audio(callEndSrc);
  audio.play();
};

