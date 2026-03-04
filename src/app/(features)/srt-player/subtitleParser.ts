import { SubtitleEntry } from "./types";

export function parseSrt(data: string): SubtitleEntry[] {
  const lines = data.split(/\r?\n/);
  const result: SubtitleEntry[] = [];
  const re = new RegExp(
    "(\\d{2}:\\d{2}:\\d{2},\\d{3})\\s*-->\\s*(\\d{2}:\\d{2}:\\d{2},\\d{3})",
  );
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }
    i++;
    if (i >= lines.length) break;

    const timeMatch = lines[i].match(re);
    if (!timeMatch) {
      i++;
      continue;
    }

    const start = toSeconds(timeMatch[1]);
    const end = toSeconds(timeMatch[2]);
    i++;

    let text = "";
    while (i < lines.length && lines[i].trim()) {
      text += lines[i] + "\n";
      i++;
    }

    result.push({
      start,
      end,
      text: text.trim(),
      index: result.length,
    });
    i++;
  }

  return result;
}

export function getNearestIndex(
  subtitles: SubtitleEntry[],
  currentTime: number,
): number | null {
  for (let i = 0; i < subtitles.length; i++) {
    const subtitle = subtitles[i];
    const isBefore = currentTime - subtitle.start >= 0;
    const isAfter = currentTime - subtitle.end >= 0;

    if (!isBefore || !isAfter) return i - 1;
    if (isBefore && !isAfter) return i;
  }
  return null;
}

export function getCurrentIndex(
  subtitles: SubtitleEntry[],
  currentTime: number,
): number {
  for (let index = 0; index < subtitles.length; index++) {
    if (subtitles[index].start <= currentTime && subtitles[index].end >= currentTime) {
      return index;
    }
  }
  return -1;
}

function toSeconds(timeStr: string): number {
  const [h, m, s] = timeStr.replace(",", ".").split(":");
  return parseFloat(
    (parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)).toFixed(3),
  );
}

export function loadSubtitle(url: string): Promise<SubtitleEntry[]> {
  return fetch(url)
    .then(response => response.text())
    .then(data => parseSrt(data))
    .catch(error => {
      console.error('加载字幕失败', error);
      return [];
    });
}