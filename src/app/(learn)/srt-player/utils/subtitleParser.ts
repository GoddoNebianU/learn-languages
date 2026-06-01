import type { SubtitleEntry } from "../types";

function toSeconds(timeStr: string): number {
  const [h, m, s] = timeStr.replace(",", ".").split(":");
  return parseFloat((parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)).toFixed(3));
}

export function parseSrt(data: string): SubtitleEntry[] {
  const lines = data.split(/\r?\n/);
  const result: SubtitleEntry[] = [];
  const timeRe = /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/;
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    i++; // skip sequence number
    if (i >= lines.length) break;

    const timeMatch = lines[i].match(timeRe);
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

export async function loadSubtitle(url: string): Promise<SubtitleEntry[]> {
  const response = await fetch(url);
  const data = await response.text();
  return parseSrt(data);
}
