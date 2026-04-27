import React, { useMemo } from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useServiceStore } from '@/store/useServiceStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolbarProps {
  onAddClick: () => void;
}

export function Toolbar({ onAddClick }: ToolbarProps) {
  const { 
    services, 
    isLoading, 
    searchQuery, 
    statusFilter, 
    processFilter,
    setSearchQuery, 
    setStatusFilter, 
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
      
      <div className="flex items-center space-x-2 bg-zinc-100 p-1 rounded-lg">
        {(['all', 'online', 'offline'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md capitalize font-medium transition-colors",
              statusFilter === filter ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {filter}
          </button>
        ))}
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

      <button
        onClick={onAddClick}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Service</span>
      </button>
    </div>
  );
}
