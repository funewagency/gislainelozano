'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CMS_DATA } from '@/lib/cms-defaults';
import type { GlobalConfig } from '@/lib/cms-types';
import { getPreviewData, onPreviewDataChange } from '@/lib/cms-preview-state';

export function useCmsData(): { data: GlobalConfig; loading: boolean } {
  // Check for preview data first (live editing)
  const previewData = getPreviewData();
  const [data, setData] = useState<GlobalConfig>(previewData ?? DEFAULT_CMS_DATA);
  const [loading, setLoading] = useState(true);

  // Listen for preview data changes
  useEffect(() => {
    return onPreviewDataChange((newData) => {
      setData(newData);
      setLoading(false);
    });
  }, []);

  // Fetch from API if no preview data
  useEffect(() => {
    if (previewData) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch('/api/admin/cms', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.data) {
          setData(json.data as GlobalConfig);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [previewData]);

  return { data, loading };
}
