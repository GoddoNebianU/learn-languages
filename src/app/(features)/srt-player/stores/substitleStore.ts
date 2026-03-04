import { create } from "zustand/react";
import { SubtitleEntry } from "../types";
import { devtools } from "zustand/middleware";

interface SubstitleStore {
    sub: SubtitleEntry[];
    index: number;
    setSub: (sub: SubtitleEntry[]) => void;
    setIndex: (index: number) => void;
}

export const useSubtitleStore = create<SubstitleStore>()(
    devtools((set) => ({
        sub: [],
        index: 0,
        setSub: (sub) => set({ sub, index: 0 }),
        setIndex: (index) => set({ index }),
    }))
);
