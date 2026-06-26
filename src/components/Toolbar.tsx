import React, { useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useServiceStore } from '@/store/useServiceStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Toolbar() {
  const { 
    services, 
    isLoading, 
    searchQuery, 
    processFilter,
    setSearchQuery, 
    setProcessFilter, 
    fetchServices 
  } = useServiceStore();

  const uniqueProcesses = useMemo(() => {
    const procs = new Set(services.map(s => s.process).filter(Boolean));
    return Array.from(procs).sort();
  }, [services]);

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by alias, port, or process..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <select
        value={processFilter}
        onChange={(e) => setProcessFilter(e.target.value)}
        className="bg-zinc-100 border-none text-zinc-700 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium max-w-[140px] truncate"
      >
        <option value="all">All Processes</option>
        {uniqueProcesses.map(proc => (
          <option key={proc} value={proc}>{proc}</option>
        ))}
      </select>

      <button 
        onClick={fetchServices}
        className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
        title="Refresh"
      >
        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
      </button>
    </div>
  );
}
