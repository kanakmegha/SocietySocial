'use client';

import React, { useState } from 'react';
import { useAppContext } from '../layout';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Trash2, 
  ShieldAlert,
  Gem,
  ArrowRight
} from 'lucide-react';

export default function NotificationsPage() {
  const { triggerHaptic, notifications, setNotifications, handleAcknowledge } = useAppContext();

  const markAllRead = () => {
    triggerHaptic();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    triggerHaptic();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleRead = (id: number) => {
    triggerHaptic();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="p-8 space-y-12 pb-40 animate-in fade-in slide-in-from-bottom duration-1000 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_gold]" />
             <h2 className="text-3xl font-serif text-navy">Safety Registry</h2>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] opacity-60">Official Aurea Notices & Circle Alerts</p>
        </div>
        
        <button 
          onClick={markAllRead}
          className="px-6 py-3 bg-white border border-gray-100 text-[9px] font-black text-navy uppercase tracking-widest rounded-2xl hover:bg-gold hover:border-gold transition-all duration-500 shadow-sm"
        >
          Acknowledge All
        </button>
      </section>

      {/* Notifications List */}
      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div className="py-40 text-center animate-in fade-in duration-1000">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100">
                <Bell size={32} className="text-gray-200" />
             </div>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">The Sanctuary is Quiet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = n.icon || Bell;
            const isCritical = n.type === 'critical';
            return (
              <div 
                key={n.id} 
                className={`premium-card group relative p-10 border rounded-[3rem] transition-all duration-700 overflow-hidden ${
                  !n.read 
                  ? (isCritical ? 'bg-red-50/10 border-red-200 shadow-2xl shadow-red-500/5' : 'bg-white border-gold/20 shadow-2xl shadow-gold/5')
                  : 'bg-gray-50/50 border-gray-100 opacity-80'
                }`}
              >
                {/* Cinematic Background Decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-5 transition-opacity pointer-events-none text-navy">
                   <Icon size={180} />
                </div>

                <div className="relative z-10 flex items-start gap-8">
                  {/* Status Indicator */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border transition-colors ${
                    n.type === 'critical' ? 'bg-red-50 text-red-500 border-red-100' :
                    n.type === 'success' ? 'bg-green-50 text-green-500 border-green-100' : 
                    'bg-white text-gold border-gold/10'
                  }`}>
                    <Icon size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border transition-colors ${
                          !n.read ? (isCritical ? 'bg-red-500 text-white border-red-500' : 'bg-gold/10 text-gold border-gold/20') : 'bg-white text-gray-300 border-gray-100'
                        }`}>
                          {n.category || 'Notification'}
                        </span>
                        {!n.read && (
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} />
                        )}
                      </div>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{n.time}</span>
                    </div>

                    <h4 className={`text-2xl font-serif leading-tight mb-4 group-hover:text-gold transition-colors duration-500 ${isCritical ? 'text-red-600' : 'text-navy'}`}>{n.title}</h4>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium max-w-3xl mb-8">{n.body}</p>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                       <div className="flex items-center gap-6">
                         {isCritical && !n.read ? (
                            <button 
                              onClick={() => handleAcknowledge(n.id)}
                              className="px-8 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 hover:bg-navy transition-all"
                            >
                              Acknowledge Protocol
                            </button>
                         ) : (
                           <button 
                            onClick={() => toggleRead(n.id)}
                            className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-navy transition-all"
                           >
                             {n.read ? 'Return to Unread' : 'Mark as Read'}
                           </button>
                         )}
                       </div>

                       <button 
                        onClick={() => deleteNotification(n.id)}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-200 hover:bg-red-50 hover:text-red-500 transition-all duration-500"
                        title="Dismiss Permanently"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-12 bg-white border border-dashed border-gray-200 rounded-[3rem] text-center max-w-xl mx-auto opacity-60">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <ShieldAlert size={24} className="text-gray-300" />
        </div>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.5em]">Safety Registry End</p>
      </div>
    </div>
  );
}
