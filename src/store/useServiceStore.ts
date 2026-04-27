import { create } from 'zustand';
import { ServiceEntry } from '@/vite-env';

interface ServiceState {
  services: ServiceEntry[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: 'all' | 'online' | 'offline';
  processFilter: string;
  pinnedPorts: number[];
  fetchServices: () => Promise<void>;
  updateService: (id: string, updates: Partial<ServiceEntry>) => Promise<void>;
  addManualService: (service: Omit<ServiceEntry, 'id' | 'status' | 'isManual' | 'updatedAt'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'all' | 'online' | 'offline') => void;
  setProcessFilter: (process: string) => void;
  togglePin: (port: number) => Promise<void>;
  reorderPinned: (oldIndex: number, newIndex: number) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  searchQuery: '',
  statusFilter: 'all',
  processFilter: 'all',
  pinnedPorts: [],
  
  fetchServices: async () => {
    set({ isLoading: true });
    try {
      const activePorts = await window.electronAPI.scanPorts();
      const savedConfig: ServiceEntry[] = await window.electronAPI.getStore('services') || [];
      const savedPinnedPorts: number[] = await window.electronAPI.getStore('pinnedPorts') || [];
      
      const activeMap = new Map(activePorts.map(s => [s.port, s]));
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
      
      // Handle saved but offline manual services or previously aliased services
      for (const [port, saved] of savedMap) {
        if (saved.isManual || saved.alias || saved.note || saved.path || savedPinnedPorts.includes(port)) {
          mergedServices.push({
            ...saved,
            status: 'offline',
            isPinned: savedPinnedPorts.includes(port),
            pid: null
          });
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
    
    // Save to electron-store (only save items with alias/note/path or manual)
    const toSave = newServices.filter(s => s.alias || s.note || s.path || s.isManual);
    await window.electronAPI.setStore('services', toSave);
  },
  
  addManualService: async (serviceData) => {
    const { services } = get();
    
    const newService: ServiceEntry = {
      ...serviceData,
      id: `manual-${serviceData.port}`,
      status: 'offline', 
      isManual: true,
      updatedAt: new Date().toISOString()
    };
    
    // Replace if port already exists
    const existingIndex = services.findIndex(s => s.port === newService.port);
    let newServices;
    if (existingIndex >= 0) {
      newServices = [...services];
      newServices[existingIndex] = { ...newServices[existingIndex], ...newService, isManual: true };
    } else {
      newServices = [...services, newService];
    }
    
    set({ services: newServices });
    const toSave = newServices.filter(s => s.alias || s.note || s.path || s.isManual);
    await window.electronAPI.setStore('services', toSave);
  },
  
  deleteService: async (id) => {
    const { services } = get();
    const newServices = services.filter(s => s.id !== id);
    set({ services: newServices });
    
    const toSave = newServices.filter(s => s.alias || s.note || s.path || s.isManual);
    await window.electronAPI.setStore('services', toSave);
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
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
    await window.electronAPI.setStore('pinnedPorts', newPinned);
    
    // Ensure the service is saved in services store too if it was just pinned
    const toSave = newServices.filter(s => s.alias || s.note || s.path || s.isManual || newPinned.includes(s.port));
    await window.electronAPI.setStore('services', toSave);
  },
  
  reorderPinned: async (oldIndex: number, newIndex: number) => {
    const { pinnedPorts } = get();
    const newPinned = Array.from(pinnedPorts);
    const [moved] = newPinned.splice(oldIndex, 1);
    newPinned.splice(newIndex, 0, moved);
    
    set({ pinnedPorts: newPinned });
    await window.electronAPI.setStore('pinnedPorts', newPinned);
  }
}));
