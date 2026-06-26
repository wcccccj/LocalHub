/// <reference types="vite/client" />

export interface ServiceEntry {
  id: string;
  port: number;
  process: string;
  pid: number | null;
  alias: string;
  note: string;
  path?: string;
  isPinned?: boolean;
  type: 'http' | 'https' | 'tcp' | 'proxy' | 'db' | 'other';
  status: 'online' | 'offline';
  isManual: boolean;
  group: string | null;
  updatedAt: string;
}

export interface ElectronAPI {
  scanPorts: () => Promise<Partial<ServiceEntry>[]>;
  getStore: (key: string) => Promise<unknown>;
  setStore: (key: string, value: unknown) => Promise<boolean>;
  deleteStore: (key: string) => Promise<boolean>;
  openUrl: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
