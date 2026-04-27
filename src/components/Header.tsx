import React from 'react';
import { Terminal } from 'lucide-react';
import { useServiceStore } from '@/store/useServiceStore';

export function Header() {
  const { services } = useServiceStore();
  
  const onlineCount = services.filter(s => s.status === 'online').length;
  const offlineCount = services.filter(s => s.status === 'offline').length;

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <Terminal className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">LocalHub</h1>
          <p className="text-xs text-zinc-500">Service Manager</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <div className="flex items-center space-x-1.5 text-sm bg-zinc-100 px-3 py-1.5 rounded-md">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
          <span className="font-medium text-zinc-700">{onlineCount} Online</span>
        </div>
        <div className="flex items-center space-x-1.5 text-sm bg-zinc-100 px-3 py-1.5 rounded-md">
          <div className="w-2 h-2 rounded-full bg-[#A32D2D]"></div>
          <span className="font-medium text-zinc-700">{offlineCount} Offline</span>
        </div>
      </div>
    </header>
  );
}
