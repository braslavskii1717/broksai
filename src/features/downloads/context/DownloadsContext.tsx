'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { DownloadRec } from '@/domain/app';

type DownloadsContextValue = {
  downloads: DownloadRec[];
  addDownload: (download: DownloadRec) => void;
};

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadRec[]>([]);

  const addDownload = useCallback((download: DownloadRec) => {
    setDownloads((prev) => [download, ...prev]);
  }, []);

  return <DownloadsContext.Provider value={{ downloads, addDownload }}>{children}</DownloadsContext.Provider>;
}

export function useDownloads() {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads must be used within DownloadsProvider');
  }
  return context;
}
