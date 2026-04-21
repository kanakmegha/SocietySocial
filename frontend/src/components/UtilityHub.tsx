'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Bell, Info, ShieldAlert, Globe, ArrowRight, Diamond } from 'lucide-react';

export default function UtilityHub() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const setOnline = () => setIsOffline(false);
    const setOffline = () => setIsOffline(true);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    fetch('http://localhost:8000/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(() => console.log('Contacts loading from cache if available'));

    fetch('http://localhost:8000/notices')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => console.log('Notices loading from cache if available'));

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  return (
    <div className="p-8 space-y-16 pb-40 animate-in fade-in slide-in-from-bottom duration-700 max-w-5xl mx-auto">
      {isOffline && (
        <div className="bg-red-50/80 backdrop-blur-3xl border border-red-100 p-6 rounded-[2.5rem] flex items-center gap-5 text-red-600 shadow-xl">
          <ShieldAlert size={28} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Autonomous Mode</p>
            <p className="text-xs font-medium opacity-70 mt-1">Accessing secure offline community repository</p>
          </div>
        </div>
      )}

      {/* Emergency Concierge Contacts */}
      <section>
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
           <h2 className="text-3xl font-serif text-navy">Priority Access</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contacts.map((contact, idx) => (
            <div key={idx} className="premium-card flex items-center justify-between p-8 bg-white border border-gray-50 rounded-[2.5rem] hover:border-red-100 transition-all duration-700">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-serif text-2xl border border-red-50 shadow-inner">
                   {contact.role[0]}
                </div>
                <div>
                  <h4 className="text-xl font-serif text-navy leading-none mb-2">{contact.role}</h4>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] opacity-80">{contact.number}</p>
                </div>
              </div>
              <a 
                href={`tel:${contact.number}`} 
                className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/10 active:scale-95 transition-all hover:bg-red-600 hover:text-white"
              >
                <Phone size={22} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Official Aurea Notices */}
      <section>
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="w-1.5 h-1.5 bg-gold rounded-full" />
           <h2 className="text-3xl font-serif text-navy">Executive Notices</h2>
        </div>
        
        <div className="space-y-8">
          {notices.map((notice, idx) => (
            <div key={idx} className="premium-card p-12 bg-gray-50/50 backdrop-blur-xl border border-gray-100 rounded-[3.5rem] relative overflow-hidden group hover:border-gold/30 transition-all duration-1000">
              {/* Cinematic Watermark */}
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                 <Diamond size={180} className="text-navy" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[9px] font-black text-gold bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full uppercase tracking-widest leading-none">
                    {new Date(notice.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-200 group-hover:text-gold group-hover:border-gold transition-all duration-700">
                     <ArrowRight size={18} />
                  </div>
                </div>
                <h4 className="text-3xl font-serif text-navy leading-tight mb-5 max-w-xl">{notice.title}</h4>
                <p className="text-gray-500 text-lg leading-relaxed font-medium max-w-2xl opacity-80">{notice.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="p-12 bg-white border border-dashed border-gray-200 rounded-[3rem] text-center max-w-xl mx-auto opacity-60">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <Info size={24} className="text-gray-300" />
        </div>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.5em]">Sanctuary Registry End</p>
      </div>
    </div>
  );
}
