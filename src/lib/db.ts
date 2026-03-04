import { get, set } from 'idb-keyval';
import type { BatchItem } from '../pages/VideoConverter';
import type { BatchImageItem } from '../pages/ImageConverter';

const VIDEO_HISTORY_KEY = 'convertfiles_video_history';
const IMAGE_HISTORY_KEY = 'convertfiles_image_history';

// Video History
export async function saveVideoHistory(history: BatchItem[]) {
    try {
        await set(VIDEO_HISTORY_KEY, history);
    } catch (err) {
        console.error('Failed to save video history to IndexedDB:', err);
    }
}

export async function loadVideoHistory(): Promise<BatchItem[]> {
    try {
        const data = await get<BatchItem[]>(VIDEO_HISTORY_KEY);
        return data || [];
    } catch (err) {
        console.error('Failed to load video history from IndexedDB:', err);
        return [];
    }
}

// Image History
export async function saveImageHistory(history: BatchImageItem[]) {
    try {
        await set(IMAGE_HISTORY_KEY, history);
    } catch (err) {
        console.error('Failed to save image history to IndexedDB:', err);
    }
}

export async function loadImageHistory(): Promise<BatchImageItem[]> {
    try {
        const data = await get<BatchImageItem[]>(IMAGE_HISTORY_KEY);
        return data || [];
    } catch (err) {
        console.error('Failed to load image history from IndexedDB:', err);
        return [];
    }
}
