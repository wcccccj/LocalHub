import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useServiceStore } from '@/store/useServiceStore';
import { ServiceItem } from './ServiceItem';
import { ServiceEntry } from '@/vite-env';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function ServiceList() {
  const { 
    services, 
    searchQuery, 
    processFilter, 
    pinnedPorts, 
    reorderPinned 
  } = useServiceStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = (s.alias || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (s.process || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.port.toString().includes(searchQuery);
      const matchesProcess = processFilter === 'all' || s.process === processFilter;
      return matchesSearch && matchesProcess;
    });
  }, [services, searchQuery, processFilter]);

  const { pinnedServices, unpinnedServices } = useMemo(() => {
    const pinnedMap = new Map(filteredServices.filter(s => s.isPinned).map(s => [s.port, s]));
    
    // Sort pinned services based on pinnedPorts array order
    const pinned = pinnedPorts.map(port => pinnedMap.get(port)).filter(Boolean) as ServiceEntry[];
    
    const unpinned = filteredServices.filter(s => !s.isPinned).sort((a, b) => a.port - b.port);
    
    return { pinnedServices: pinned, unpinnedServices: unpinned };
  }, [filteredServices, pinnedPorts]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pinnedPorts.indexOf(parseInt(active.id as string, 10));
      const newIndex = pinnedPorts.indexOf(parseInt(over.id as string, 10));
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPinned(oldIndex, newIndex);
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="space-y-6">
        {pinnedServices.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Pinned</h2>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={pinnedServices.map(s => s.port.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {pinnedServices.map(service => (
                    <ServiceItem key={service.id} service={service} isSortable={true} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {unpinnedServices.length > 0 && (
          <div className="space-y-3">
            {pinnedServices.length > 0 && (
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Others</h2>
            )}
            {unpinnedServices.map(service => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        )}
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">No services found</h3>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </main>
  );
}
