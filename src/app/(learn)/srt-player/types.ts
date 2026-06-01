export interface SubtitleEntry {
  start: number;
  end: number;
  text: string;
  index: number;
}

export interface SrtPlayerStore {
  video: {
    url: string | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
  };

  subtitle: {
    url: string | null;
    data: SubtitleEntry[];
    currentText: string;
    currentIndex: number | null;
  };

  controls: {
    autoPause: boolean;
  };

  setVideoUrl: (url: string | null) => void;
  setSubtitleUrl: (url: string | null) => void;
  setSubtitleData: (data: SubtitleEntry[]) => void;
  setCurrentSubtitle: (text: string, index: number | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;

  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;

  nextSubtitle: () => void;
  previousSubtitle: () => void;
  restartSubtitle: () => void;

  toggleAutoPause: () => void;
}
