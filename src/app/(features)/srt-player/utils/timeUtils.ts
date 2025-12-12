export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  
  if (parts.length === 3) {
    // HH:MM:SS format
    const [h, m, s] = parts;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
  } else if (parts.length === 2) {
    // MM:SS format
    const [m, s] = parts;
    return parseInt(m) * 60 + parseFloat(s);
  }
  
  return 0;
}

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function clampTime(time: number, min: number = 0, max: number = Infinity): number {
  return Math.min(Math.max(time, min), max);
}

export function getPlaybackRateOptions(): number[] {
  return [0.5, 0.7, 1.0, 1.2, 1.5, 2.0];
}

export function getPlaybackRateLabel(rate: number): string {
  return `${rate}x`;
}