import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useServiceStore } from '@/store/useServiceStore';
import { ServiceEntry } from '@/vite-env';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddServiceModal({ isOpen, onClose }: AddServiceModalProps) {
  const { addManualService } = useServiceStore();
  const [addForm, setAddForm] = useState({ 
    port: '', 
    process: '', 
    alias: '', 
    note: '', 
    path: '', 
    type: 'http' as ServiceEntry['type'] 
  });

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const port = parseInt(addForm.port, 10);
    if (!port || isNaN(port)) return;
    
    await addManualService({
      port,
      process: addForm.process || 'manual',
      pid: null,
      alias: addForm.alias,
      note: addForm.note,
      path: addForm.path,
      type: addForm.type,
      group: null
    });
    
    onClose();
    setAddForm({ port: '', process: '', alias: '', note: '', path: '', type: 'http' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Add Manual Service</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        
        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Port Number *</label>
              <input 
                type="number" required min="1" max="65535"
                value={addForm.port} onChange={e => setAddForm({...addForm, port: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                placeholder="e.g. 8080"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Process Name</label>
              <input 
                type="text"
                value={addForm.process} onChange={e => setAddForm({...addForm, process: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. node"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Alias</label>
              <input 
                type="text"
                value={addForm.alias} onChange={e => setAddForm({...addForm, alias: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. project.dev"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Path</label>
              <input 
                type="text"
                value={addForm.path} onChange={e => setAddForm({...addForm, path: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. /management.html"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Type</label>
              <select 
                value={addForm.type} onChange={e => setAddForm({...addForm, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="tcp">TCP</option>
                <option value="proxy">PROXY</option>
                <option value="db">DB</option>
                <option value="other">OTHER</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Note</label>
              <input 
                type="text"
                value={addForm.note} onChange={e => setAddForm({...addForm, note: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="Brief description"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
