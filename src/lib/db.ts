import { get, set } from 'idb-keyval';
import type { BatchItem } from '../pages/VideoConverter';
import type { BatchImageItem } from '../pages/ImageConverter';
import type { BatchDataItem } from '../pages/DataConverter';

const VIDEO_HISTORY_KEY = 'convertfiles_video_history';
const IMAGE_HISTORY_KEY = 'convertfiles_image_history';
const DATA_HISTORY_KEY = 'convertfiles_data_history';

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

// Data History
export async function saveDataHistory(history: BatchDataItem[]) {
    try {
        await set(DATA_HISTORY_KEY, history);
    } catch (err) {
        console.error('Failed to save data history to IndexedDB:', err);
    }
}

export async function loadDataHistory(): Promise<BatchDataItem[]> {
    try {
        const data = await get<BatchDataItem[]>(DATA_HISTORY_KEY);
        return data || [];
    } catch (err) {
        console.error('Failed to load data history from IndexedDB:', err);
        return [];
    }
}

// Document History
export interface DocumentHistoryItem {
    id: string;
    file: File;
    files: File[];
    mode: string;
    status: 'pending' | 'converting' | 'done' | 'error';
    result: any | null;
    error: string | null;
    timestamp: number;
}

const DOCUMENT_HISTORY_KEY = 'convertfiles_document_history';

export async function saveDocumentHistory(history: DocumentHistoryItem[]) {
    try {
        await set(DOCUMENT_HISTORY_KEY, history);
    } catch (err) {
        console.error('Failed to save document history to IndexedDB:', err);
    }
}

export async function loadDocumentHistory(): Promise<DocumentHistoryItem[]> {
    try {
        const data = await get<DocumentHistoryItem[]>(DOCUMENT_HISTORY_KEY);
        return data || [];
    } catch (err) {
        console.error('Failed to load document history from IndexedDB:', err);
        return [];
    }
}
