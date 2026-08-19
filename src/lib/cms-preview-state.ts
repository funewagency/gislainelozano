'use client';

// Global preview state for live CMS editing
// The editor sends data via postMessage, this module stores it
// useCmsData reads from here first

import type { GlobalConfig } from '@/lib/cms-types';

let _previewData: GlobalConfig | null = null;
let _listeners: Set<(data: GlobalConfig) => void> = new Set();

export function setPreviewData(data: GlobalConfig) {
  _previewData = data;
  _listeners.forEach((fn) => fn(data));
}

export function getPreviewData(): GlobalConfig | null {
  return _previewData;
}

export function onPreviewDataChange(fn: (data: GlobalConfig) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
