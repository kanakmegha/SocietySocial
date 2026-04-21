'use client';

import React, { useState, useEffect } from 'react';
import TrustScoreRing from './TrustScoreRing';
import { Star, Trophy, Award, CheckCircle2, Zap, Shield, ArrowRight } from 'lucide-react';

export default function MeritLeaderboard() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [jobId, setJobId] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const fetchStaff = () => {
    fetch('http://localhost:8000/staff')
      .then(res => res.json())
      .then(data => setStaff(data));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRate = async () => {
    const res = await fetch('http://localhost:8000/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_id: selectedStaff.id,
        resident_id: 'res_1',
        job_id: jobId,
        rating: rating,
      }),
    });
    const data = await res.json();
    if (data.status === 'success') {
      setMessage('Rating submitted successfully!');
      fetchStaff();
      setTimeout(() => {
        setShowRateModal(false);
        setMessage('');
        setJobId('');
      }, 1500);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="p-8 space-y-12 pb-32 animate-in fade-in slide-in-from-bottom duration-700 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10 px-2">
        <div>
          <h2 className="text-3xl font-serif text-navy">Distinguished Ledger</h2>
          <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-[0.4em]">Elite Performance Registry</p>
        </div>
        <div className="px-6 py-2.5 bg-gold/10 border border-gold/20 text-gold rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 backdrop-blur-md">
          <Award size={16} className="fill-current" /> Peer Certified
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {staff.map((member, idx) => (
          <div key={member.id} className="premium-card group bg-white border border-gray-50 p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-700 hover:border-gold/30">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center font-serif text-navy text-3xl border border-gray-50 group-hover:bg-gold/10 group-hover:border-gold/20 transition-all">
                  {member.name[0]}
                </div>
                {member.rating > 4.7 && (
                   <div className="absolute -top-2 -right-2 bg-gold text-navy p-1.5 rounded-xl shadow-xl border-4 border-white">
                      <Shield size={16} className="fill-current" />
                   </div>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-serif text-navy mb-2 leading-none">{member.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                   <span>{member.role}</span>
                   <div className="w-1 h-1 bg-gold rounded-full" />
                   <span className="text-gold">Class A Security</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-10 mt-8 md:mt-0 w-full md:w-auto justify-between md:justify-end">
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Trust Quotient</p>
                  <p className="text-sm font-black text-navy">{member.review_count} Verified Logs</p>
               </div>
               <div className="relative flex items-center justify-center">
                  <TrustScoreRing score={member.rating} size={70} />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <p className="text-xs font-serif font-black text-navy">{member.rating}</p>
                  </div>
               </div>
               <button 
                onClick={() => { setSelectedStaff(member); setShowRateModal(true); }}
                className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-navy hover:bg-gold transition-all shadow-sm"
              >
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Aurea Rating Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-navy/40 backdrop-blur-xl animate-in fade-in duration-500 text-navy">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-md shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative border border-white/20 animate-in zoom-in-95 duration-700">
            <div className="text-center mb-12">
               <div className="w-24 h-24 bg-gray-50 text-navy rounded-3xl flex items-center justify-center mx-auto mb-6 font-serif text-4xl border border-gray-100 shadow-inner">
                  {selectedStaff?.name[0]}
               </div>
               <h3 className="text-3xl font-serif text-navy mb-2">Evaluate Quality</h3>
               <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">Resident Verification Required</p>
            </div>

            <div className="space-y-8">
              {/* Performance History Block */}
              <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100/50">
                <h4 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-6">Internal Service Logs</h4>
                <div className="space-y-6">
                  {[
                    { status: 'Exceeded', date: '2d ago', label: 'Security Check' },
                    { status: 'Achieved', date: '1w ago', label: 'Duty Escort' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 z-10 shadow-[0_0_8px] ${item.status === 'Exceeded' ? 'bg-gold shadow-gold/40' : 'bg-navy shadow-navy/40'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-navy">{item.label}</span>
                           <span className="text-gray-300">{item.date}</span>
                        </div>
                        <p className="text-[8px] font-black text-gold uppercase mt-1 tracking-widest">{item.status} Benchmark</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block px-1">Job ID Identification</label>
                <input 
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="ID: AUREA-XXXX"
                  className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-gold/30 transition-all text-sm font-bold text-navy"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block px-1">Assign Trust Rating</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button 
                      key={r} 
                      onClick={() => setRating(r)}
                      className={`w-14 h-14 rounded-2xl font-serif text-xl border transition-all duration-500 ${rating === r ? 'bg-navy text-white border-navy shadow-2xl scale-110' : 'bg-white text-gray-300 border-gray-100 hover:border-gold'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {message && <p className={`text-[10px] font-black text-center uppercase tracking-widest ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
              
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setShowRateModal(false)}
                  className="flex-1 py-5 bg-white text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={handleRate}
                  className="flex-1 py-5 bg-navy text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-gold hover:text-navy transition-all"
                >
                  Verify Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
