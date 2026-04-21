'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Users, Bell, UserCircle, ChevronLeft, X, CheckCircle2, AlertTriangle, Info, Shield, Gem } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'alert', icon: AlertTriangle, title: 'Water Outage', body: 'Block B will have no water from 10–11 AM tomorrow.', time: '2m ago', read: false },
  { id: 2, type: 'group', icon: CheckCircle2, title: 'Group Request Approved', body: 'Your request to join Morning Yoga Seekers was accepted!', time: '1h ago', read: false },
  { id: 3, type: 'info', icon: Info, title: 'Event Reminder', body: 'Annual Diwali Gala starts in 3 days. You are confirmed!', time: '3h ago', read: true },
];

interface AppContextType {
  session: any;
  profile: any;
  triggerHaptic: () => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  handleAcknowledge: (id: number) => void;
}

export const AppContext = createContext<AppContextType>({
  session: null,
  profile: null,
  triggerHaptic: () => {},
  notifications: [],
  setNotifications: () => {},
  handleAcknowledge: () => {},
});

export const useAppContext = () => useContext(AppContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>(MOCK_NOTIFICATIONS);
  const [toastNotif, setToastNotif] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleAcknowledge = (id: number) => {
    triggerHaptic();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    // Sync with CriticalAlertOverlay's local storage
    const saved = localStorage.getItem('acknowledged_alerts');
    const acknowledgedIds = saved ? JSON.parse(saved) : [];
    if (!acknowledgedIds.includes(id)) {
      const updated = [...acknowledgedIds, id];
      localStorage.setItem('acknowledged_alerts', JSON.stringify(updated));
    }
    
    // If it's the current toast, hide it
    if (toastNotif?.id === id) setShowToast(false);

    // Navigate to notifications if not already there to see the detail (optional but concierge-like)
    // router.push('/notifications'); 
  };

  useEffect(() => {
    async function initAuth() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
        setProfile(profileData);
      }
    }
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Integrated Alert Polling
    const checkAlerts = () => {
      fetch('/api/alerts')
        .then(res => res.json())
        .then(data => {
          const savedAcknowledged = JSON.parse(localStorage.getItem('acknowledged_alerts') || '[]');
          
          data.forEach((alert: any) => {
             if (alert.type === 'Critical') {
                const isAcknowledged = savedAcknowledged.includes(alert.id);
                setNotifications(prev => {
                   const exists = prev.find(n => n.id === alert.id);
                   if (!exists) {
                      const newNotif = {
                        id: alert.id,
                        type: 'critical',
                        icon: AlertTriangle,
                        title: alert.title,
                        body: alert.content,
                        time: alert.timestamp || 'Just now',
                        read: isAcknowledged,
                        category: 'Intelligence'
                      };
                      
                      // Trigger Pulse for new, unacknowledged critical alerts
                      if (!isAcknowledged && pathname !== '/notifications') {
                         setToastNotif(newNotif);
                         setShowToast(true);
                         triggerHaptic();
                      }
                      
                      return [newNotif, ...prev];
                   }
                   return prev;
                });
             }
          });
        })
        .catch(err => console.error('Aurea Alert Hub Sync Error:', err));
    };

    checkAlerts();
    const alertInterval = setInterval(checkAlerts, 10000);

    // Demo Pulse (Concierge Notice) after 15s
    const demoTimer = setTimeout(() => {
      if (pathname !== '/notifications') {
        const demoNotif = {
           id: 9999,
           title: 'Concierge Notice',
           body: 'A private delivery has arrived at the Aurea Sanctuary lobby.',
           icon: Info,
           time: 'Just now',
           read: false,
           category: 'Concierge'
        };
        setNotifications(prev => [demoNotif, ...prev]);
        setToastNotif(demoNotif);
        setShowToast(true);
        triggerHaptic();
        setTimeout(() => setShowToast(false), 6000);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearInterval(alertInterval);
      clearTimeout(demoTimer);
    };
  }, [supabase, pathname]);

  const getPageTitle = () => {
    if (pathname.includes('/feed')) return 'Society Feed';
    if (pathname.includes('/groups')) return 'Social Groups';
    if (pathname.includes('/merit')) return 'Merit Ledger';
    if (pathname.includes('/hub')) return 'Utility Hub';
    if (pathname.includes('/profile')) return 'My Profile';
    if (pathname.includes('/notifications')) return 'Official Alerts';
    return 'Society Social';
  };

  const getPageSubtitle = () => {
    if (pathname.includes('/feed')) return 'Community Voices';
    if (pathname.includes('/groups')) return 'Join the Action';
    if (pathname.includes('/merit')) return 'High-Performance Staff';
    if (pathname.includes('/hub')) return 'Essential Services';
    if (pathname.includes('/profile')) return 'Your Activity & Memberships';
    if (pathname.includes('/notifications')) return 'Sanctuary Safety Registry';
    return '';
  };

  return (
    <AppContext.Provider value={{ session, profile, triggerHaptic, notifications, setNotifications, handleAcknowledge }}>
      <div className="flex flex-col h-screen bg-[#fafafa] overflow-hidden selection:bg-blue-100">
        <header className="flex-none glass border-b border-gray-100 sticky top-0 z-[60] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { triggerHaptic(); router.push('/'); }}
              className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow-sm hover:shadow-md hover:text-[#002661] active:scale-95 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-serif tracking-tight text-[#002661] leading-none">
                {profile ? `Hi, ${profile.full_name?.split(' ')[0]}` : getPageTitle()}
              </h1>
              <p className="text-[9px] font-black text-gray-400 mt-1.5 uppercase tracking-[0.3em] opacity-60">
                {profile ? `${profile.role} · ${profile.flat_no || 'Block A'}` : getPageSubtitle()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {session && (
              <button 
                onClick={async () => {
                  triggerHaptic();
                  await supabase.auth.signOut();
                }}
                className="px-4 py-2.5 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-xl hover:bg-gold/10 hover:text-gold transition-all border border-transparent hover:border-gold/20"
              >
                Logout
              </button>
            )}
            {/* Bell Link */}
            <Link
              href="/notifications"
              onClick={() => triggerHaptic()}
              className={`relative w-11 h-11 border rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all ${pathname.includes('/notifications') ? 'bg-[#002661] text-white border-[#002661]' : 'bg-white text-gray-500 border-gray-100'}`}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            {/* Profile */}
            <Link href="/profile" onClick={() => triggerHaptic()} className={`w-11 h-11 border rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all ${pathname.includes('/profile') ? 'bg-[#002661] text-white border-[#002661]' : 'bg-white text-[#002661] border-gray-100'}`}>
              <UserCircle size={19} />
            </Link>
          </div>
        </header>

        {/* ── Aurea Notification Pulse (Toast) ── */}
        {showToast && toastNotif && (
          <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-3rem)] max-w-sm">
            <div 
              className={`flex items-center gap-5 p-6 bg-white/90 backdrop-blur-2xl border ${toastNotif.type === 'critical' ? 'border-red-500' : 'border-gold/30'} rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] animate-in slide-in-from-top-10 duration-700 group hover:border-gold transition-all`}
            >
              <div 
                onClick={() => { setShowToast(false); triggerHaptic(); router.push('/notifications'); }}
                className={`w-12 h-12 ${toastNotif.type === 'critical' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gold/10 text-gold border-gold/10'} rounded-2xl flex items-center justify-center flex-shrink-0 border cursor-pointer`}
              >
                 <Bell size={20} className={toastNotif.type === 'critical' ? 'animate-pulse' : 'animate-bounce'} />
              </div>
              <div 
                onClick={() => { setShowToast(false); triggerHaptic(); router.push('/notifications'); }}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <p className={`text-[9px] font-black ${toastNotif.type === 'critical' ? 'text-red-500' : 'text-gold'} uppercase tracking-[0.3em] mb-1`}>
                  {toastNotif.type === 'critical' ? 'Priority Alert' : 'Recent Intelligence'}
                </p>
                <h4 className="text-lg font-serif text-navy leading-none mb-1.5 truncate">{toastNotif.title}</h4>
                <p className="text-xs text-gray-400 truncate opacity-80">{toastNotif.body}</p>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                {toastNotif.type === 'critical' && (
                   <button 
                    onClick={() => handleAcknowledge(toastNotif.id)}
                    className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center hover:bg-gold hover:text-navy transition-all"
                   >
                     <CheckCircle2 size={14} />
                   </button>
                )}
                <X 
                  size={16} 
                  className="text-gray-300 hover:text-navy transition-colors p-1" 
                  onClick={() => setShowToast(false)}
                />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto pb-40 relative">
          {children}
        </main>

        {/* Bottom nav — Extended for priority access */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] h-20 w-[calc(100%-2.5rem)] max-w-lg bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-between px-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 animate-in slide-in-from-bottom-8 duration-700">
          {[
            { id: 'feed', icon: <MessageSquare size={20} />, label: 'Feed', href: '/feed' },
            { id: 'groups', icon: <Users size={20} />, label: 'Groups', href: '/groups' },
            { id: 'hub', icon: <Shield size={20} />, label: 'Hub', href: '/hub' },
            { id: 'merit', icon: <Gem size={20} />, label: 'Merit', href: '/merit' },
            { id: 'notifications', icon: <Bell size={20} />, label: 'Alerts', href: '/notifications' },
          ].map((tab) => {
            const isActive = pathname.includes(tab.href);
            return (
              <Link key={tab.id} href={tab.href} onClick={() => triggerHaptic()} className="group relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-500">
                <div className={`p-3 rounded-2xl transition-all duration-500 z-10 ${isActive ? 'bg-[#002661] text-white shadow-xl shadow-blue-900/40 -translate-y-2' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-900'}`}>
                  {tab.icon}
                  {tab.id === 'notifications' && unreadCount > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="absolute bottom-1 text-[7px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1 text-[#002661]">
                    {tab.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </AppContext.Provider>
  );
}
