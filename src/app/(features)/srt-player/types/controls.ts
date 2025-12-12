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

export interface ControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  autoPause: boolean;
  onAutoPauseToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export interface NavigationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AutoPauseToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface ShortcutHintProps {
  shortcuts: KeyboardShortcut[];
  visible: boolean;
  onClose: () => void;
  className?: string;
}

export interface FileUploadProps {
  onVideoUpload: (url: string) => void;
  onSubtitleUpload: (url: string) => void;
  className?: string;
}

export interface FileInputProps {
  accept: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}