'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Zap } from 'lucide-react';

export default function GroupsAndEvents() {
  const [groups, setGroups] = useState<any[]>([]);
  const [rsvpEvent, setRsvpEvent] = useState<any>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [requestedGroups, setRequestedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('http://localhost:8000/groups')
      .then(res => res.json())
      .then(data => setGroups(data));

    // Connect to WebSocket for event_1
    const ws = new WebSocket('ws://localhost:8000/ws/events/evt_1');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRsvpEvent(data);
    };
    setSocket(ws);

    return () => ws.close();
  }, []);

  const handleRSVP = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send('rsvp');
    }
  };

  const handleJoin = (groupId: string) => {
    setRequestedGroups(prev => {
      const newSet = new Set(prev);
      newSet.add(groupId);
      return newSet;
    });
  };

  return (
    <div className="p-8 space-y-16 animate-in fade-in slide-in-from-bottom duration-700 max-w-5xl mx-auto">
      {/* Real-time Event Sanctuary Billboard */}
      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
           <div className="w-1.5 h-1.5 bg-gold rounded-full" />
           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Featured Sanctuary</h2>
        </div>
        
        {rsvpEvent ? (
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border border-white/5 bg-navy">
            {/* Cinematic Background Layer */}
            <img 
               src="/premium_hero_clean.png" 
               className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 group-hover:scale-100 transition-transform duration-1000" 
               alt="texture" 
            />
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-transparent" />
            
            <div className="relative z-10 p-12 md:p-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[9px] font-black text-gold uppercase tracking-widest">
                    <Zap size={12} className="fill-current" /> Live RSVP Active
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif text-white leading-tight">{rsvpEvent.title}</h3>
                  <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Calendar size={14} className="text-gold" /> {new Date(rsvpEvent.date).toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})}
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem]">
                   <p className="text-6xl font-serif text-gold leading-none">{rsvpEvent.total_spots - rsvpEvent.reserved_spots}</p>
                   <p className="text-[9px] uppercase font-black tracking-[0.3em] text-white/40">Exclusive Spots</p>
                   <button 
                    onClick={handleRSVP}
                    disabled={rsvpEvent.reserved_spots >= rsvpEvent.total_spots}
                    className="mt-4 px-10 py-4 bg-white text-navy font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-gold hover:text-navy disabled:opacity-30"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-6">
                 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div 
                    className="h-full bg-gradient-to-r from-gold to-amber-300 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,215,0,0.4)]" 
                    style={{ width: `${(rsvpEvent.reserved_spots / rsvpEvent.total_spots) * 100}%` }}
                   />
                 </div>
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                   {Math.round((rsvpEvent.reserved_spots / rsvpEvent.total_spots) * 100)}% Capacity reached
                 </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-50 animate-pulse rounded-[3rem] border border-gray-100" />
        )}
      </section>

      {/* Community Groups Section */}
      <section>
        <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <h2 className="text-3xl font-serif text-navy">Verified Circles</h2>
            <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-[0.4em]">Curated by Aurea Communities</p>
          </div>
          <button className="w-14 h-14 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:border-gold transition-all text-gray-300 hover:text-navy group">
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {groups.map((group, idx) => (
            <div 
              key={group.id} 
              className="premium-card group bg-white border border-gray-50 p-8 rounded-[2.5rem] flex flex-col justify-between h-auto hover:border-gold/30 hover:shadow-2xl transition-all duration-700 animate-in fade-in ease-out"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-8">
                 <div className="w-16 h-16 bg-gray-50 text-navy font-serif text-2xl rounded-2xl flex items-center justify-center border border-gray-50 group-hover:bg-gold/10 group-hover:border-gold/20 transition-all">
                    {group.tag[0].toUpperCase()}
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black text-gold bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-xl uppercase tracking-widest leading-none">
                       {group.tag}
                    </span>
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em] mt-3">{group.member_count} Members Participating</p>
                 </div>
              </div>

              <div>
                <h4 className="text-2xl font-serif text-navy mb-6 leading-tight">{group.name}</h4>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[8px] font-black text-gray-400">
                        +12
                     </div>
                  </div>
                  <button 
                    onClick={() => handleJoin(group.id)}
                    disabled={requestedGroups.has(group.id)}
                    className={`text-[9px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl transition-all ${
                      requestedGroups.has(group.id)
                        ? 'bg-gray-50 text-gray-300 border border-gray-100 shadow-inner'
                        : 'bg-navy text-white hover:bg-gold hover:text-navy shadow-xl shadow-navy/5'
                    }`}
                  >
                    {requestedGroups.has(group.id) ? 'Request Sent' : 'Enter Circle'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
