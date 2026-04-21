'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../layout';
import { createClient } from '@/utils/supabase/client';
import {
  Shield, MessageSquare, Users, Calendar,
  Heart, MessageCircle, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Star, X, MapPin, UserCircle
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────
const MOCK_GROUPS = [
  {
    id: 'g1', name: 'Morning Yoga Seekers', tag: 'fitness', member_count: 42, status: 'member',
    participants: [
      { name: 'Anjali Rao', role: 'Leader' },
      { name: 'Ravi Menon', role: 'Member' },
      { name: 'Priya Nair', role: 'Member' },
      { name: 'Suresh Kumar', role: 'Member' },
    ],
  },
  {
    id: 'g2', name: 'Weekend Chess Club', tag: 'hobby', member_count: 18, status: 'requested',
    participants: [
      { name: 'Deepak Joshi', role: 'Leader' },
      { name: 'Meena Pillai', role: 'Member' },
    ],
  },
];

const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'Annual Diwali Gala',
    date: '2026-11-05T19:00:00',
    total_spots: 200,
    reserved_spots: 146,
    status: 'confirmed',
    attendees: [
      { name: 'Anjali Rao' },
      { name: 'Ravi Menon' },
      { name: 'Priya Nair' },
      { name: 'Suresh Kumar' },
      { name: 'Deepak Joshi' },
    ],
  },
];

const MOCK_COMMENTS: Record<string, { author: string; text: string }[]> = {
  default: [
    { author: 'Anjali R.', text: 'Totally agree with this! 👏' },
    { author: 'Ravi M.', text: 'Thanks for sharing, very helpful.' },
    { author: 'Priya N.', text: 'Beautiful thought!' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────
function ParticipantDrawer({
  title,
  participants,
  onClose,
}: {
  title: string;
  participants: { name: string; role?: string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-xl animate-in fade-in duration-700" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-t-[4rem] md:rounded-[4rem] p-12 pb-16 animate-in slide-in-from-bottom-20 duration-700 shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-serif text-navy leading-none">{title}</h3>
          <button onClick={onClose} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-navy hover:bg-gold transition-all duration-500">
            <X size={22} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-gold/30 transition-all duration-500 shadow-sm hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-50 text-navy font-serif rounded-2xl flex items-center justify-center text-xl border border-gray-50">
                {p.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-serif text-navy text-lg leading-tight">{p.name}</p>
                {p.role && <p className="text-[9px] font-black text-gold uppercase tracking-[0.3em] mt-2">{p.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const [expanded, setExpanded] = useState(false);
  const comments = MOCK_COMMENTS[post.id] || MOCK_COMMENTS.default;
  const likes = post.likes || Math.floor(Math.random() * 20) + 1;

  return (
    <div className="premium-card bg-white border border-gray-50 rounded-[2.5rem] overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:border-gold/30">
      <div className="p-8">
        <p className="text-gray-600 font-medium leading-relaxed text-lg mb-6">{post.content}</p>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
           Recorded {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
        </p>

        {/* Likes / Comments row */}
        <div className="flex items-center gap-8 mt-8 pt-8 border-t border-gray-50">
          <div className="flex items-center gap-3 text-gold">
            <div className="p-2.5 bg-gold/5 rounded-xl border border-gold/10">
               <Heart size={16} className="fill-current" />
            </div>
            <span className="text-[10px] font-black tracking-widest">{likes} Appreciations</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 text-gray-400 hover:text-navy transition-all group/btn"
          >
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover/btn:bg-gold/10 transition-all">
               <MessageCircle size={16} />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">{comments.length} Responses</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Comments expansion */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/30 px-8 py-8 space-y-6 animate-in slide-in-from-top-4 duration-700">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-navy font-serif text-sm">
                {c.author[0]}
              </div>
              <div className="bg-white rounded-[1.5rem] p-5 flex-1 border border-gray-50 shadow-sm">
                <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">{c.author}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ProfilePage() {
  const { session, triggerHaptic } = useAppContext();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'events'>('posts');
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<{ title: string; participants: { name: string; role?: string }[] } | null>(null);

  useEffect(() => {
    async function load() {
      if (!session?.user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);

      const { data: postsData } = await supabase
        .from('posts').select('*').eq('author_id', session.user.id)
        .order('created_at', { ascending: false }).limit(20);
      setPosts(postsData || []);
      setLoading(false);
    }
    load();
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-40 px-10 text-center">
        <div className="w-24 h-24 bg-gray-50 text-navy rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-gray-100">
          <Shield size={48} />
        </div>
        <h3 className="text-4xl font-serif text-navy mb-4">Authentication Required</h3>
        <p className="text-gray-400 font-medium max-w-sm mx-auto">Please identify yourself at the community square to access your personal ledger.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-40 space-y-8 animate-pulse text-navy">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Synchronizing Dossier</p>
      </div>
    );
  }

  const displayName = profile?.full_name || session.user.email?.split('@')[0] || 'Resident';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-1000 pb-40">

      {/* ── Aurea Hero Section ── */}
      <div className="relative bg-navy overflow-hidden">
        {/* Cinematic Backdrop */}
        <img src="/premium_hero_clean.png" className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110" alt="backdrop" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy to-white" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-8 pt-20 pb-32">
          <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border-2 border-white/20 flex items-center justify-center text-white text-5xl font-serif shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] mb-8 animate-in zoom-in-75 duration-1000">
            {initials}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight mb-4">{displayName}</h2>
          <div className="flex items-center gap-4">
            {profile?.role && (
              <span className="px-5 py-2 bg-gold/20 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-full backdrop-blur-md">
                {profile.role}
              </span>
            )}
            {profile?.flat_no && (
              <span className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
                <MapPin size={12} className="text-gold" /> {profile.flat_no}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Premium Stats Grid ── */}
      <div className="max-w-4xl mx-auto px-8 -mt-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-8 grid grid-cols-3 divide-x divide-gray-50">
          {[
            { label: 'Dialogues', value: posts.length, icon: <MessageSquare size={20} className="text-navy" /> },
            { label: 'Circles', value: MOCK_GROUPS.filter(g => g.status === 'member').length, icon: <Users size={20} className="text-gold" /> },
            { label: 'Sanctuaries', value: MOCK_EVENTS.length, icon: <Calendar size={20} className="text-navy" /> },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-3 px-4 group">
              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gold/10 transition-all duration-500">
                {stat.icon}
              </div>
              <p className="text-4xl font-serif text-navy leading-none">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Karma Ledger ── */}
      {profile?.karma_points !== undefined && (
        <div className="max-w-4xl mx-auto px-8 mt-8">
          <div className="flex items-center gap-6 p-8 bg-gold/5 border border-gold/10 rounded-[2.5rem] group hover:bg-gold/10 transition-all duration-700">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-gold/10 group-hover:scale-110 transition-transform">
              <Star size={28} className="text-gold fill-gold/20" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-2">Merit Accumulation</p>
              <p className="text-3xl font-serif text-navy">{profile.karma_points} Certified Points</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Elegant Tabs ── */}
      <div className="max-w-4xl mx-auto px-8 mt-12 flex gap-4">
        {(['posts', 'groups', 'events'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); triggerHaptic(); }}
            className={`flex-1 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 border ${
              activeTab === tab 
              ? 'bg-navy text-white border-navy shadow-2xl shadow-navy/20' 
              : 'bg-white text-gray-300 border-gray-100 hover:border-gold hover:text-navy shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-4xl mx-auto px-8 mt-10 space-y-10">

        {/* Posts */}
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border border-gray-100 border-dashed">
              <MessageSquare size={32} className="text-gray-200 mx-auto mb-6" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">No Dialogue History</p>
            </div>
          ) : posts.map(post => <PostCard key={post.id} post={post} />)
        )}

        {/* Groups */}
        {activeTab === 'groups' && (
          MOCK_GROUPS.length === 0 ? (
            <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border border-gray-100 border-dashed">
              <Users size={32} className="text-gray-200 mx-auto mb-6" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">No Circle Affiliations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => { triggerHaptic(); setDrawer({ title: group.name, participants: group.participants }); }}
                  className="premium-card group bg-white border border-gray-50 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-start text-left hover:border-gold/30 hover:shadow-2xl transition-all duration-700 h-full"
                >
                  <div className="flex justify-between w-full mb-8">
                    <div className="w-16 h-16 bg-gray-50 text-navy font-serif text-3xl rounded-3xl flex items-center justify-center border border-gray-50 group-hover:bg-gold/10 transition-all">
                      {group.tag[0].toUpperCase()}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-2xl h-fit ${
                      group.status === 'member' ? 'bg-gold/10 text-gold border border-gold/10' : 'bg-gray-50 text-gray-300 border border-gray-50'
                    }`}>
                      {group.status === 'member' ? 'Certified' : 'Evaluating'}
                    </span>
                  </div>
                  <h4 className="text-2xl font-serif text-navy mb-4 leading-tight group-hover:text-gold transition-colors">{group.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-auto flex items-center gap-2">
                     <Users size={14} className="text-gold" /> {group.member_count} Contributors
                  </p>
                </button>
              ))}
            </div>
          )
        )}

        {/* Events */}
        {activeTab === 'events' && (
          MOCK_EVENTS.length === 0 ? (
            <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border border-gray-100 border-dashed">
              <Calendar size={32} className="text-gray-200 mx-auto mb-6" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">No Sanctuary Bookings</p>
            </div>
          ) : (
            <div className="space-y-8">
              {MOCK_EVENTS.map(event => (
                <button
                  key={event.id}
                  onClick={() => { triggerHaptic(); setDrawer({ title: event.title, participants: event.attendees }); }}
                  className="w-full relative overflow-hidden group rounded-[3.5rem] p-12 text-left transition-all duration-1000 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] bg-navy"
                >
                  <img src="/premium_hero_clean.png" className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 group-hover:scale-100 transition-transform duration-1000" alt="card-bg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="space-y-4">
                      <h4 className="text-4xl font-serif text-white leading-tight">{event.title}</h4>
                      <div className="flex items-center gap-4 text-gold text-[10px] font-black uppercase tracking-[0.3em]">
                        <Calendar size={14} className="fill-current" />
                        {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-6">
                      <span className="flex items-center gap-2 bg-gold/20 text-gold text-[9px] font-black uppercase tracking-[0.4em] px-5 py-2.5 rounded-full border border-gold/30 backdrop-blur-xl">
                        <CheckCircle2 size={14} /> Sanctuary Guaranteed
                      </span>
                      <div className="flex -space-x-3">
                        {event.attendees.slice(0, 4).map((a, i) => (
                          <div key={i} className="w-10 h-10 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-[10px] font-serif text-white backdrop-blur-md">
                            {a.name[0]}
                          </div>
                        ))}
                        {event.attendees.length > 4 && (
                          <div className="w-10 h-10 rounded-2xl bg-gold text-navy border-2 border-white/50 flex items-center justify-center text-[10px] font-black">
                            +{event.attendees.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-12 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${(event.reserved_spots / event.total_spots) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Aurea Participants Drawer ── */}
      {drawer && (
        <ParticipantDrawer
          title={drawer.title}
          participants={drawer.participants}
          onClose={() => { setDrawer(null); triggerHaptic(); }}
        />
      )}
    </div>
  );
}
