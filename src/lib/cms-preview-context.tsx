'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GlobalConfig } from '@/lib/cms-types';
import { DEFAULT_CMS_DATA } from '@/lib/cms-defaults';

interface CmsPreviewContextValue {
  previewData: GlobalConfig | null;
  setPreviewData: (data: GlobalConfig) => void;
  clearPreviewData: () => void;
}

const CmsPreviewContext = createContext<CmsPreviewContextValue>({
  previewData: null,
  setPreviewData: () => {},
  clearPreviewData: () => {},
});

export function CmsPreviewProvider({ children }: { children: ReactNode }) {
  const [previewData, setPreviewDataState] = useState<GlobalConfig | null>(null);

  const setPreviewData = useCallback((data: GlobalConfig) => {
    setPreviewDataState(data);
  }, []);

  const clearPreviewData = useCallback(() => {
    setPreviewDataState(null);
  }, []);

  return (
    <CmsPreviewContext.Provider value={{ previewData, setPreviewData, clearPreviewData }}>
      {children}
    </CmsPreviewContext.Provider>
  );
}

export function useCmsPreview() {
  return useContext(CmsPreviewContext);
}
