import React, { useEffect } from 'react';
import { useServiceStore } from './store/useServiceStore';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ServiceList } from './components/ServiceList';

export default function App() {
  const { fetchServices } = useServiceStore();

  useEffect(() => {
    fetchServices();
    
    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      fetchServices();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 text-zinc-900 font-sans">
      <Header />
      <Toolbar />
      <ServiceList />
    </div>
  );
}
