import Link from 'next/link';
import { Users, ShieldCheck, MessageSquare, Bell, ArrowRight, Star, Gem, Search, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 bg-white selection:bg-gold/20 selection:text-navy">
      {/* Immersive Hero Section */}
      <section className="relative h-screen flex flex-col pt-12 overflow-hidden bg-gray-50">
        {/* Background Clean Image */}
        <div className="absolute inset-x-0 top-0 h-[85%] z-0">
          <img 
            src="/premium_hero_clean.png" 
            alt="Aurea Luxury Residences" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/20 to-transparent" />
        </div>

        {/* Spacious Navigation Header */}
        <header className="relative z-50 px-12 py-8 flex items-center justify-between max-w-[1600px] mx-auto w-full">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center shadow-lg">
                 <Gem size={22} className="text-gold" />
              </div>
              <span className="text-2xl font-serif tracking-tight text-white drop-shadow-sm uppercase">Aurea</span>
           </div>
           
           <nav className="hidden lg:flex items-center gap-10">
              {['Social Feed', 'Private Groups', 'Worker Ledger', 'Emergencies'].map(item => (
                <Link key={item} href="/feed" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 hover:text-white transition-all">
                   {item}
                </Link>
              ))}
           </nav>

           <div className="flex items-center gap-6">
              <Link href="/feed" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white/90 hover:text-white">
                 Help Center
              </Link>
              <Link href="/feed" className="px-8 py-3 bg-white text-navy text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-gold hover:scale-105 transition-all">
                 Resident Portal
              </Link>
           </div>
        </header>

        {/* Hero Content — Centered and Breathable */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-32 px-6 max-w-5xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                 <Star size={12} className="fill-gold text-gold" /> The Standard of Excellence
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-navy leading-tight tracking-tight">
                 Elevate Your <span className="italic text-gold">Lifestyle.</span>
              </h1>

              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
                 A seamless digital ecosystem designed specifically for the prestigious gated community living experience.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 w-full">
              <Link href="/feed" className="group relative w-full sm:w-auto px-16 py-6 bg-navy text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2.5rem] shadow-2xl hover:bg-gold hover:text-navy transition-all duration-500 active:scale-95">
                 Enter the Square
              </Link>
              <button className="flex items-center gap-4 text-navy font-black text-xs uppercase tracking-[0.2em] group">
                 Take the Tour <div className="w-10 h-10 border border-navy/10 rounded-full flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold transition-all"><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></div>
              </button>
           </div>
        </div>
      </section>

      {/* Spacious Concierge Services */}
      <section className="px-8 py-40 max-w-[1400px] mx-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Society Feed', icon: <MessageSquare size={24} />, desc: 'Real-time verified communication with neighbors.', href: '/feed' },
            { label: 'Private Groups', icon: <Users size={24} />, desc: 'Exclusive circles for shared interests and events.', href: '/groups' },
            { label: 'Worker Ledger', icon: <ShieldCheck size={24} />, desc: 'Transparent staff accountability and performance.', href: '/merit' },
            { label: 'Emergency Hub', icon: <Bell size={24} />, desc: 'Direct connection to critical community utilities.', href: '/hub' },
          ].map((item, idx) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="group flex flex-col p-10 bg-gray-50/40 rounded-[3rem] border border-transparent hover:border-gold/30 hover:bg-white hover:shadow-2xl transition-all duration-700 animate-in fade-in"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy mb-10 group-hover:bg-navy group-hover:text-white transition-all shadow-sm">
                {item.icon}
              </div>
              <h4 className="text-2xl font-serif text-navy mb-4">{item.label}</h4>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Exclusivity Statement */}
      <section className="px-8 py-20">
        <div className="max-w-[1400px] mx-auto bg-navy rounded-[4rem] p-16 lg:p-32 flex flex-col lg:flex-row items-center gap-24 relative overflow-hidden">
           <img src="/premium_hero_clean.png" className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale" alt="texture" />
           <div className="relative z-10 flex-1 space-y-10">
              <div className="w-20 h-1 bg-gold rounded-full" />
              <h2 className="text-5xl md:text-7xl font-serif text-white leading-[1.1]">
                 Transparency <br /> <span className="italic">as Standard.</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                 Our unified Worker Merit Ledger defines the future of luxury estate management—rewarding excellence and ensuring verified accountability.
              </p>
              <Link href="/merit" className="inline-flex items-center gap-4 text-gold font-black text-xs uppercase tracking-[0.3em] group">
                 Open Leaderboard <ArrowRight size={20} className="group-hover:translate-x-4 transition-transform" />
              </Link>
           </div>
           
           <div className="flex-1 w-full max-w-md relative">
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 space-y-10 shadow-2xl">
                 {[
                   { name: 'Rajesh K.', role: 'Head Security', score: '4.9' },
                   { name: 'Amit S.', role: 'Estate Mgr', score: '4.8' },
                   { name: 'Sunita V.', role: 'Head Cleaning', score: '4.5' }
                 ].map((staff, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-serif text-white">
                             {staff.name[0]}
                          </div>
                          <div>
                             <p className="font-bold text-white text-base">{staff.name}</p>
                             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{staff.role}</p>
                          </div>
                       </div>
                       <p className="text-gold font-serif text-2xl">{staff.score}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="px-12 py-24 border-t border-gray-100 bg-white">
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4">
               <Gem size={24} className="text-gold" />
               <span className="text-2xl font-serif text-navy tracking-tight uppercase">Aurea</span>
            </div>
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.5em]">© 2026 Society Social Hub. Elite Digital Management.</p>
            <div className="flex gap-12">
               {['Residents', 'Governance', 'Security'].map(link => (
                 <button key={link} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-navy transition-colors">
                   {link}
                 </button>
               ))}
            </div>
         </div>
      </footer>
    </main>
  );
}
