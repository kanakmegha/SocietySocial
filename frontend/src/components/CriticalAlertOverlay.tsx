'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, ArrowRight, Bell } from 'lucide-react';
import { useAppContext } from '../app/(app)/layout';

export default function CriticalAlertOverlay() {
  const { notifications, handleAcknowledge } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);

  // Find the first unread critical alert in the global sanctuary feed
  const activeAlert = notifications.find(n => n.type === 'critical' && !n.read);

  if (!activeAlert) return null;

  return (
    <>
      <div className="fixed inset-x-8 top-8 z-[200] animate-in slide-in-from-top-20 duration-1000 max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-3xl border border-gold/30 rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-gold transition-all duration-1000">
          {/* Cinematic Background Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none text-navy">
             <ShieldAlert size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 bg-gold/10 text-gold rounded-2xl flex items-center justify-center animate-pulse border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <ShieldAlert size={26} />
              </div>
              <div className="flex-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold leading-none">Aurea Security Protocol</h3>
                  <p className="text-[9px] font-black text-gray-300 mt-2 uppercase tracking-widest">{activeAlert.time} • Restricted Access Intelligence</p>
              </div>
              <button 
                onClick={() => handleAcknowledge(activeAlert.id)}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-300 hover:text-navy hover:bg-gold rounded-2xl transition-all duration-500"
              >
                  <X size={20} />
              </button>
            </div>

            <h2 className="text-4xl font-serif text-navy mb-4 leading-tight max-w-2xl">{activeAlert.title}</h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10 max-w-3xl opacity-80">{activeAlert.body}</p>

            <div className="flex flex-col md:flex-row gap-5">
              <button 
                onClick={() => handleAcknowledge(activeAlert.id)}
                className="flex-[2] py-5 bg-navy text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-3xl shadow-2xl hover:bg-gold hover:text-navy transition-all duration-500 flex items-center justify-center gap-3 group/btn hover:scale-[1.02] active:scale-95"
              >
                  Acknowledge Protocol <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => setShowDetails(true)}
                className="flex-1 py-5 bg-white border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-3xl hover:border-gold hover:text-navy transition-all duration-500 shadow-sm"
              >
                  Examine Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-8 bg-navy/40 backdrop-blur-2xl animate-in fade-in duration-700">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] relative border border-white/20 animate-in zoom-in-95 duration-700 overflow-hidden">
            {/* Modal Watermark */}
            <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none">
               <Bell size={300} className="text-navy" />
            </div>

            <div className="text-center mb-12 relative z-10">
               <div className="w-20 h-20 bg-gold/5 text-gold rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gold/10">
                  <ShieldAlert size={40} />
               </div>
               <h3 className="text-3xl font-serif text-navy mb-3">Sanctuary Dossier</h3>
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Executive Security Details</p>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100 shadow-inner">
                <p className="text-lg font-medium text-gray-600 leading-relaxed italic">
                  "{activeAlert.body}"
                  <br /><br />
                  <span className="text-[9px] font-black text-navy uppercase tracking-widest not-italic opacity-40">Directives & Countermeasures</span>
                  <br />
                  <span className="text-navy not-italic">Our onsite sanctuary management is fully engaged. Please remain within your residence and follow the digital concierge updates. Standard Resolution Protocol #AUREA-204 is in effect.</span>
                </p>
              </div>
              
              <button 
                onClick={() => setShowDetails(false)}
                className="w-full py-6 bg-navy text-white font-black text-[10px] uppercase tracking-[0.5em] rounded-[2rem] shadow-2xl hover:bg-gold hover:text-navy transition-all duration-500 active:scale-95"
              >
                Return to Sanctuary
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

