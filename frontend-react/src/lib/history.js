const RECENT_KEY = "ef_recent_files";
const DOWNLOAD_KEY = "ef_download_history";
const MAX_ITEMS = 12;
const readList = (key) => {
    if (typeof window === "undefined")
        return [];
    const raw = localStorage.getItem(key);
    if (!raw)
        return [];
    try {
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
};
const writeList = (key, list) => {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_ITEMS)));
};
export const addRecentFile = (item) => {
    const list = readList(RECENT_KEY).filter((entry) => entry.id !== item.id);
    list.unshift(item);
    writeList(RECENT_KEY, list);
};
export const addDownloadHistory = (item) => {
    const list = readList(DOWNLOAD_KEY).filter((entry) => entry.id !== item.id);
    list.unshift(item);
    writeList(DOWNLOAD_KEY, list);
};
export const getRecentFiles = () => readList(RECENT_KEY);
export const getDownloadHistory = () => readList(DOWNLOAD_KEY);
