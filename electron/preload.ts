import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  scanPorts: () => ipcRenderer.invoke('scan-ports'),
  getStore: (key: string) => ipcRenderer.invoke('get-store', key),
  setStore: (key: string, value: any) => ipcRenderer.invoke('set-store', key, value),
  deleteStore: (key: string) => ipcRenderer.invoke('delete-store', key),
  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),
});
