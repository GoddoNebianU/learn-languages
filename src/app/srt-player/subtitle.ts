export function parseSrt(data: string) {
    const lines = data.split(/\r?\n/);
    const result = [];
    const re = new RegExp('(\\d{2}:\\d{2}:\\d{2},\\d{3})\\s*-->\\s*(\\d{2}:\\d{2}:\\d{2},\\d{3})');
    let i = 0;
    while (i < lines.length) {
        if (!lines[i].trim()) { i++; continue; }
        i++;
        if (i >= lines.length) break;
        const timeMatch = lines[i].match(re);
        if (!timeMatch) { i++; continue; }
        const start = toSeconds(timeMatch[1]);
        const end = toSeconds(timeMatch[2]);
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim()) {
            text += lines[i] + '\n';
            i++;
        }
        result.push({ start, end, text: text.trim() });
        i++;
    }
    return result;
}

export function getNearistIndex(srt: { start: number; end: number; text: string; }[], ct: number) {
    for (let i = 0; i < srt.length; i++) {
        const s = srt[i];
        const l = ct - s.start >= 0;
        const r = ct - s.end >= 0;
        if (!(l || r)) return i - 1;
        if (l && (!r)) return i;
    }
}

export function getIndex(srt: { start: number; end: number; text: string; }[], ct: number) {
    for (let i = 0; i < srt.length; i++) {
        if (ct >= srt[i].start && ct <= srt[i].end) {
            return i;
        }
    }
    return null;
}

export function getSubtitle(srt: { start: number; end: number; text: string; }[], currentTime: number) {
    return srt.find(sub => currentTime >= sub.start && currentTime <= sub.end) || null;
}

function toSeconds(timeStr: string): number {
    const [h, m, s] = timeStr.replace(',', '.').split(':');
    return parseFloat((parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)).toFixed(3));
}
