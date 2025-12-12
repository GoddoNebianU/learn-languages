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

export interface VideoElementProps {
  src?: string;
  onTimeUpdate?: (time: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

export interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export interface SeekBarProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export interface SpeedControlProps {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  disabled?: boolean;
  className?: string;
}

export interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
  className?: string;
}