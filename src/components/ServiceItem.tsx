import React, { useState } from 'react';
import { ServiceEntry } from '@/vite-env';
import { useServiceStore } from '@/store/useServiceStore';
import { Edit, ExternalLink, Pin, GripVertical } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function TypeBadge({ type }: { type: ServiceEntry['type'] }) {
  const colors = {
    http: 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20',
    https: 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20',
    tcp: 'bg-[#534AB7]/10 text-[#534AB7] border-[#534AB7]/20',
    proxy: 'bg-[#854F0B]/10 text-[#854F0B] border-[#854F0B]/20',
    db: 'bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/20',
    other: 'bg-zinc-100 text-zinc-600 border-zinc-200'
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border uppercase', colors[type] || colors.other)}>
      {type}
    </span>
  );
}

function StatusIndicator({ status }: { status: ServiceEntry['status'] }) {
  return (
    <div className="flex items-center justify-center w-6 h-6">
      <div 
        className={cn(
          "w-2.5 h-2.5 rounded-full",
          status === 'online' ? "bg-[#1D9E75] shadow-[0_0_8px_rgba(29,158,117,0.5)]" : "bg-[#A32D2D]"
        )} 
      />
    </div>
  );
}

interface ServiceItemProps {
  service: ServiceEntry;
  isSortable?: boolean;
}

export function ServiceItem({ service, isSortable }: ServiceItemProps) {
  const { updateService, togglePin } = useServiceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ alias: '', note: '', path: '', type: 'http' as ServiceEntry['type'] });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.port.toString(), disabled: !isSortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
  };

  const handleOpen = () => {
    if (['http', 'https', 'proxy'].includes(service.type)) {
      const base = `${service.type === 'https' ? 'https' : 'http'}://localhost:${service.port}`;
      const path = service.path ? (service.path.startsWith('/') ? service.path : `/${service.path}`) : '';
      window.electronAPI.openUrl(base + path);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditForm({ alias: service.alias || '', note: service.note || '', path: service.path || '', type: service.type });
  };

  const saveEdit = async () => {
    try {
      await updateService(service.id, { ...editForm });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border rounded-xl p-4 flex items-center justify-between transition-all",
        service.status === 'online' ? "border-zinc-200 shadow-sm" : "border-zinc-200/60 opacity-75",
        isDragging && "shadow-lg opacity-90 border-blue-500 ring-2 ring-blue-500/20"
      )}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {isSortable && (
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab hover:text-zinc-900 text-zinc-400 p-1 -ml-2"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        
        <StatusIndicator status={service.status} />
        
        <div className="w-24 shrink-0">
          <span className="font-mono text-lg font-semibold text-zinc-900">
            :{service.port}
          </span>
        </div>

        {isEditing ? (
          <form 
            className="flex-1 flex items-center space-x-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit();
            }}
          >
            <input 
              autoFocus
              className="border border-zinc-300 rounded px-2 py-1 text-sm w-32"
              value={editForm.alias}
              onChange={e => setEditForm({...editForm, alias: e.target.value})}
              placeholder="Alias"
            />
            <input 
              className="border border-zinc-300 rounded px-2 py-1 text-sm w-28"
              value={editForm.path}
              onChange={e => setEditForm({...editForm, path: e.target.value})}
              placeholder="Path (e.g. /api)"
            />
            <input 
              className="border border-zinc-300 rounded px-2 py-1 text-sm flex-1"
              value={editForm.note}
              onChange={e => setEditForm({...editForm, note: e.target.value})}
              placeholder="Note"
            />
            <select 
              className="border border-zinc-300 rounded px-2 py-1 text-sm"
              value={editForm.type}
              onChange={e => setEditForm({...editForm, type: e.target.value as ServiceEntry['type']})}
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="tcp">TCP</option>
              <option value="proxy">PROXY</option>
              <option value="db">DB</option>
              <option value="other">OTHER</option>
            </select>
            <button type="submit" className="text-blue-600 text-sm font-medium hover:underline">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-zinc-500 text-sm font-medium hover:underline">Cancel</button>
          </form>
        ) : (
          <div className="flex-1 min-w-0 flex items-center space-x-4">
            <div className="w-40 shrink-0 flex flex-col">
              {service.alias ? (
                <Tooltip content={service.alias}>
                  <div className="font-medium text-zinc-900 truncate" title={service.alias}>{service.alias}</div>
                </Tooltip>
              ) : (
                <div className="text-zinc-400 italic text-sm">No alias</div>
              )}
              {service.path && (
                <div className="text-xs text-zinc-500 truncate font-mono mt-0.5" title={service.path}>{service.path}</div>
              )}
            </div>
            
            <div className="w-28 shrink-0 flex items-center space-x-2">
              <Tooltip content={service.process}>
                <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded truncate" title={service.process}>
                  {service.process}
                </span>
              </Tooltip>
            </div>

            <div className="w-20 shrink-0">
              <TypeBadge type={service.type} />
            </div>

            {service.note ? (
              <Tooltip content={service.note}>
                <div className="flex-1 min-w-0 truncate text-sm text-zinc-500" title={service.note}>
                  {service.note}
                </div>
              </Tooltip>
            ) : (
              <div className="flex-1 min-w-0 truncate text-sm text-zinc-500">-</div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center space-x-2 ml-4 shrink-0">
          <button 
            onClick={() => togglePin(service.port)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              service.isPinned ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            )}
            title={service.isPinned ? "Unpin" : "Pin to top"}
          >
            <Pin className="w-4 h-4" />
          </button>

          {['http', 'https', 'proxy'].includes(service.type) && (
            <button 
              onClick={handleOpen}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
            </button>
          )}
          
          <div className="w-px h-6 bg-zinc-200 mx-2"></div>
          
          <button 
            onClick={startEditing}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
