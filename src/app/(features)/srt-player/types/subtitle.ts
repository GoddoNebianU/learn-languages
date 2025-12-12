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
  position: 'top' | 'center' | 'bottom';
  fontFamily: string;
  opacity: number;
}

export interface SubtitleDisplayProps {
  subtitle: string;
  onWordClick?: (word: string) => void;
  settings?: SubtitleSettings;
  className?: string;
}

export interface SubtitleTextProps {
  text: string;
  onWordClick?: (word: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export interface SubtitleSettingsProps {
  settings: SubtitleSettings;
  onSettingsChange: (settings: SubtitleSettings) => void;
  className?: string;
}

export interface SubtitleControls {
  next: () => void;
  previous: () => void;
  goToIndex: (index: number) => void;
  toggleAutoPause: () => void;
}

export interface SubtitleSyncProps {
  subtitles: SubtitleEntry[];
  currentTime: number;
  isPlaying: boolean;
  autoPause: boolean;
  onSubtitleChange: (subtitle: SubtitleEntry | null) => void;
  onAutoPauseTrigger?: (subtitle: SubtitleEntry) => void;
}