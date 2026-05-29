import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialSettings = {
  quality: 82,
  outputFormat: "auto",
  compressionMode: "smart",
  engine: "browser-image-compression",
  removeMetadata: true,
  progressive: true,
  livePreview: false,
  resize: {
    enabled: false,
    width: 1600,
    height: 1600,
    keepAspect: true,
    percentage: 100,
  },
};

const buildHistoryState = (state) => ({
  settings: state.settings,
});

export const useCompressionStore = create(persist((set, get) => ({
  settings: initialSettings,
  items: [],
  queue: [],
  selectedId: null,
  history: { past: [], future: [] },
  setSettings: (patch) => {
    const state = get();
    const nextSettings = { ...state.settings, ...patch };
    set({
      settings: nextSettings,
      history: {
        past: [...state.history.past, buildHistoryState(state)].slice(-30),
        future: [],
      },
    });
  },
  updateResize: (patch) => {
    const state = get();
    const nextSettings = {
      ...state.settings,
      resize: { ...state.settings.resize, ...patch },
    };
    set({
      settings: nextSettings,
      history: {
        past: [...state.history.past, buildHistoryState(state)].slice(-30),
        future: [],
      },
    });
  },
  undo: () => {
    const state = get();
    if (!state.history.past.length) return;
    const previous = state.history.past[state.history.past.length - 1];
    set({
      settings: previous.settings,
      history: {
        past: state.history.past.slice(0, -1),
        future: [buildHistoryState(state), ...state.history.future],
      },
    });
  },
  redo: () => {
    const state = get();
    if (!state.history.future.length) return;
    const next = state.history.future[0];
    set({
      settings: next.settings,
      history: {
        past: [...state.history.past, buildHistoryState(state)],
        future: state.history.future.slice(1),
      },
    });
  },
  addItems: (items) => set((state) => ({
    items: [...items, ...state.items],
    queue: [...items.map((item) => item.id), ...state.queue],
    selectedId: items[0]?.id ?? state.selectedId,
  })),
  updateItem: (id, patch) => set((state) => ({
    items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
    queue: state.queue.filter((queued) => queued !== id),
    selectedId: state.selectedId === id ? state.items.find((item) => item.id !== id)?.id ?? null : state.selectedId,
  })),
  reorderItems: (fromIndex, toIndex) => set((state) => {
    const next = [...state.items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return { items: next };
  }),
  clearQueue: () => set({ queue: [] }),
  setQueue: (queue) => set({ queue }),
  setSelectedId: (id) => set({ selectedId: id }),
  resetSettings: () => set({ settings: initialSettings, history: { past: [], future: [] } }),
}), {
  name: "ef-compression-settings",
  partialize: (state) => ({ settings: state.settings, history: state.history }),
}));
