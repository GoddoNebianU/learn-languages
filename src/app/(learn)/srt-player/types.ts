// ==================== Video Types ====================

export interface VideoState {
  url: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

export interface VideoControls {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  restart: () => void;
}

// ==================== Subtitle Types ====================

export interface SubtitleEntry {
  start: number;
  end: number;
  text: string;
  index: number;
}

export interface SubtitleState {
  url: string | null;
  data: SubtitleEntry[];
  currentText: string;
  currentIndex: number | null;
  settings: SubtitleSettings;
}

export interface SubtitleSettings {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  position: "top" | "center" | "bottom";
  fontFamily: string;
  opacity: number;
}

export interface SubtitleControls {
  next: () => void;
  previous: () => void;
  goToIndex: (index: number) => void;
  toggleAutoPause: () => void;
}

// ==================== Controls Types ====================

export interface ControlState {
  autoPause: boolean;
  showShortcuts: boolean;
  showSettings: boolean;
}

export interface ControlActions {
  toggleAutoPause: () => void;
  toggleShortcuts: () => void;
  toggleSettings: () => void;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

// ==================== Store Types ====================

export interface SrtPlayerStore {
  // Video state
  video: VideoState;

  // Subtitle state
  subtitle: SubtitleState;

  // Controls state
  controls: ControlState;

  // Video actions
  setVideoUrl: (url: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  restart: () => void;

  // Subtitle actions
  setSubtitleUrl: (url: string | null) => void;
  setSubtitleData: (data: SubtitleEntry[]) => void;
  setCurrentSubtitle: (text: string, index: number | null) => void;
  updateSettings: (settings: Partial<SubtitleSettings>) => void;
  nextSubtitle: () => void;
  previousSubtitle: () => void;
  restartSubtitle: () => void;

  // Controls actions
  toggleAutoPause: () => void;
  toggleShortcuts: () => void;
  toggleSettings: () => void;
}

// ==================== Selectors ====================

export const selectors = {
  canPlay: (state: SrtPlayerStore) =>
    !!state.video.url && !!state.subtitle.url && state.subtitle.data.length > 0,

  currentSubtitle: (state: SrtPlayerStore) =>
    state.subtitle.currentIndex !== null ? state.subtitle.data[state.subtitle.currentIndex] : null,

  progress: (state: SrtPlayerStore) => ({
    current: state.subtitle.currentIndex ?? 0,
    total: state.subtitle.data.length,
  }),
};
