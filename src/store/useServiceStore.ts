import { create } from 'zustand';
import { ServiceEntry } from '@/vite-env';

interface ServiceState {
  services: ServiceEntry[];
  isLoading: boolean;
  searchQuery: string;
  processFilter: string;
  pinnedPorts: number[];
  fetchServices: () => Promise<void>;
  updateService: (id: string, updates: Partial<ServiceEntry>) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setProcessFilter: (process: string) => void;
  togglePin: (port: number) => Promise<void>;
  reorderPinned: (oldIndex: number, newIndex: number) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  searchQuery: '',
  processFilter: 'all',
  pinnedPorts: [],
  
  fetchServices: async () => {
    set({ isLoading: true });
    try {
      const activePorts = await window.electronAPI.scanPorts();
      const savedConfigRaw = await window.electronAPI.getStore('services');
      const savedConfig: ServiceEntry[] = Array.isArray(savedConfigRaw) ? (savedConfigRaw as ServiceEntry[]) : [];

      const savedPinnedPortsRaw = await window.electronAPI.getStore('pinnedPorts');
      const savedPinnedPorts: number[] = Array.isArray(savedPinnedPortsRaw)
        ? (savedPinnedPortsRaw.filter(p => typeof p === 'number') as number[])
        : [];
      
      const savedMap = new Map(savedConfig.map(s => [s.port, s]));
      
      const mergedServices: ServiceEntry[] = [];
      
      // Handle all active ports
      for (const active of activePorts) {
        const saved = savedMap.get(active.port);
        if (saved) {
          mergedServices.push({
            ...saved,
            ...active,
            status: 'online',
            isManual: saved.isManual || false,
            alias: saved.alias || '',
            note: saved.note || '',
            path: saved.path || '',
            isPinned: savedPinnedPorts.includes(active.port),
            type: saved.type || 'http'
          } as ServiceEntry);
          savedMap.delete(active.port);
        } else {
          mergedServices.push({
            ...active,
            status: 'online',
            alias: '',
            note: '',
            path: '',
            type: 'http',
            isManual: false,
            isPinned: savedPinnedPorts.includes(active.port),
            updatedAt: new Date().toISOString()
          } as ServiceEntry);
        }
      }
      
      set({ services: mergedServices, pinnedPorts: savedPinnedPorts, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      set({ isLoading: false });
    }
  },
  
  updateService: async (id, updates) => {
    const { services } = get();
    // Update the service by matching either id or port
    const newServices = services.map(s => {
      if (s.id === id || (updates.port && s.port === updates.port)) {
        return { ...s, ...updates, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    
    set({ services: newServices });
    
    const toSave = newServices.filter(s => s.alias || s.note || s.path || s.isPinned);
    try {
      await window.electronAPI.setStore('services', toSave);
    } catch (error) {
      console.error('Failed to persist services:', error);
    }
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setProcessFilter: (process) => set({ processFilter: process }),
  
  togglePin: async (port: number) => {
    const { pinnedPorts, services } = get();
    const newPinned = pinnedPorts.includes(port) 
      ? pinnedPorts.filter(p => p !== port)
      : [...pinnedPorts, port];
      
    const newServices = services.map(s => 
      s.port === port ? { ...s, isPinned: newPinned.includes(port) } : s
    );
      
    set({ pinnedPorts: newPinned, services: newServices });
    try {
      await window.electronAPI.setStore('pinnedPorts', newPinned);
    } catch (error) {
      console.error('Failed to persist pinned ports:', error);
    }
    
    // Ensure the service is saved in services store too if it was just pinned
    const toSave = newServices.filter(s => s.alias || s.note || s.path || newPinned.includes(s.port));
    try {
      await window.electronAPI.setStore('services', toSave);
    } catch (error) {
      console.error('Failed to persist services:', error);
    }
  },
  
  reorderPinned: async (oldIndex: number, newIndex: number) => {
    const { pinnedPorts } = get();
    const newPinned = Array.from(pinnedPorts);
    const [moved] = newPinned.splice(oldIndex, 1);
    newPinned.splice(newIndex, 0, moved);
    
    set({ pinnedPorts: newPinned });
    try {
      await window.electronAPI.setStore('pinnedPorts', newPinned);
    } catch (error) {
      console.error('Failed to persist pinned ports:', error);
    }
  }
}));
