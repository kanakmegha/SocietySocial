'use client';

import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Heart, MessageCircle, Share2, Zap, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import CriticalAlertOverlay from '@/components/CriticalAlertOverlay';
import CreatePostModal from '@/components/CreatePostModal';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseRealtime } from '@/hooks/useSupabase';
import { useAppContext } from '../layout';

const fetchFeed = async ({ pageParam = 1 }) => {
  const res = await fetch(`http://localhost:8000/feed?page=${pageParam}&page_size=10`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function FeedPage() {
  const { session, profile, triggerHaptic } = useAppContext();
  const supabase = createClient();
  const { ref, inView } = useInView();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: !!session,
  });

  useSupabaseRealtime('posts', () => {
    refetch();
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const handleSignIn = async () => {
    if (!emailInput.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSigningIn(true);
    triggerHaptic();
    
    try {
      if (isPasswordMode || passwordInput.trim()) {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput.trim(),
          password: passwordInput.trim(),
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: emailInput.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/feed` : 'http://localhost:3000/feed',
          },
        });
        if (error) {
          if (error.message.includes('rate limit')) {
            setIsPasswordMode(true);
            throw new Error('Email rate limit exceeded. Please use your Password instead.');
          }
          throw error;
        }
        alert(`OTP sent to ${emailInput}! Please check your email inbox.`);
      }
    } catch (err: any) {
      alert('Auth Error: ' + err.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom duration-700 max-w-4xl mx-auto">
      <CriticalAlertOverlay />
      
      {/* Premium Post Composer Hint */}
      <div 
        onClick={() => { setIsCreateModalOpen(true); triggerHaptic(); }}
        className="premium-card bg-white/70 backdrop-blur-xl border border-gray-100 p-8 cursor-pointer group transition-all duration-700 hover:shadow-2xl hover:border-gold/30"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-navy group-hover:bg-gold/10 transition-all duration-500">
            <Zap size={22} />
          </div>
          <div className="flex-1">
            <p className="text-gray-400 font-serif text-xl tracking-tight">Compose a thought for your community...</p>
          </div>
          <div className="px-6 py-2.5 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            Share
          </div>
        </div>
      </div>

      {/* Feed List */}
      {!session ? (
        <div className="text-center py-32 px-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 relative overflow-hidden">
           <div className="w-24 h-24 bg-white text-navy rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-gray-100">
              <ShieldAlert size={48} />
           </div>
           <h3 className="text-3xl font-serif text-navy mb-4">Resident Access Only</h3>
           <p className="text-gray-400 font-medium max-w-sm mx-auto mb-12">Authenticity is our priority. Please identify yourself as a verified resident to join the conversation.</p>
           
           <div className="max-w-sm mx-auto mb-10 space-y-6">
             <div className="text-left">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3 px-1">Identity Verification</label>
                <input 
                  type="email"
                  placeholder="resident@aurea.res"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-8 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all text-sm font-bold text-navy placeholder:text-gray-300 shadow-sm"
                />
             </div>

             {(isPasswordMode || passwordInput) && (
               <div className="animate-in slide-in-from-top-4 duration-500 text-left">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3 px-1">Access Key</label>
                 <input 
                   type="password"
                   placeholder="••••••••"
                   value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}
                   className="w-full px-8 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all text-sm font-bold text-navy placeholder:text-gray-300 shadow-sm"
                 />
               </div>
             )}

             {!isPasswordMode && (
               <button 
                 onClick={() => { setIsPasswordMode(true); triggerHaptic(); }}
                 className="text-[9px] font-black text-gold uppercase tracking-[0.3em] hover:text-navy transition-colors block w-full text-center"
               >
                 Verify via Password?
               </button>
             )}
           </div>

           <button 
            disabled={isSigningIn || !emailInput.trim()}
            onClick={handleSignIn}
            className="px-16 py-6 bg-navy text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:bg-gold hover:text-navy active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 mx-auto"
           >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (isPasswordMode || passwordInput ? 'Sign In' : 'Request Access Code')}
           </button>
        </div>
      ) : status === 'pending' ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] animate-pulse">Synchronizing Feed</p>
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-32 px-10">
           <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ShieldAlert size={48} />
           </div>
           <h3 className="text-2xl font-serif text-navy mb-3">Sync Interrupted</h3>
           <p className="text-gray-400 font-medium">Our neural hub at :8000 is currently unreachable.</p>
        </div>
      ) : (!data?.pages[0] || (Array.isArray(data.pages[0]) ? data.pages[0].length === 0 : data.pages[0].posts?.length === 0)) ? (
        <div className="text-center py-32 px-10">
           <div className="w-28 h-28 bg-gray-50 text-gray-200 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
              <MessageSquare size={48} />
           </div>
           <h3 className="text-3xl font-serif text-navy mb-4">A Quiet Sanctuary</h3>
           <p className="text-gray-400 font-medium max-w-xs mx-auto mb-12">The community is observing silence. Be the first to grace the square with your presence.</p>
           <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-14 py-6 bg-white border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] rounded-full hover:border-gold hover:text-navy transition-all shadow-sm hover:shadow-xl"
          >
            Commence Conversation
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-10">
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {(Array.isArray(page) ? page : page.posts)?.map((post: any) => (
                  <PostCard key={post.id} post={post} onLike={triggerHaptic} />
                ))}
              </React.Fragment>
            ))}
          </div>
          
          <div ref={ref} className="py-20 flex flex-col items-center gap-6">
            {isFetchingNextPage ? (
              <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
            ) : hasNextPage ? (
              <p className="text-[9px] font-black text-gray-200 uppercase tracking-[0.5em]">Explore more updates</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-1.5 h-1.5 bg-gold/30 rounded-full" />
                <p className="text-[9px] font-black text-gray-200 uppercase tracking-[0.5em]">Sanctuary End</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onPostCreated={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function PostCard({ post, onLike }: { post: any, onLike: () => void }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <article className="premium-card bg-white border border-gray-50 p-8 group transition-all duration-700 shadow-sm hover:shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gray-50 text-navy font-serif rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm text-2xl">
              {post.author_id?.[0] || 'R'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gold border-2 border-white rounded-full flex items-center justify-center">
               <ShieldAlert size={8} className="text-white fill-current" />
            </div>
          </div>
          <div>
            <h4 className="font-serif text-navy text-xl leading-none">Resident Representative</h4>
            <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-[0.3em] leading-none flex items-center gap-2">
               {new Date(post.created_at || post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Verified Sanctuary
            </p>
          </div>
        </div>
        <button className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-300 hover:text-navy hover:bg-gold/10 transition-all flex items-center justify-center">
          <Share2 size={19} />
        </button>
      </div>

      <p className="text-gray-600 text-lg font-medium leading-[1.7] mb-8 pr-4">
        {post.content}
      </p>

      <div className="flex flex-wrap gap-3 mb-10">
        {post.tags?.map((tag: string) => (
          <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded-xl uppercase tracking-widest border border-gray-50 group-hover:border-gold/20 transition-colors">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
        <div className="flex items-center gap-10">
          <button 
            onClick={() => { setIsLiked(!isLiked); onLike(); }}
            className={`flex items-center gap-3 transition-all ${isLiked ? 'text-gold' : 'text-gray-400 hover:text-gold'}`}
          >
            <div className={`p-3 rounded-2xl transition-all ${isLiked ? 'bg-gold/10 shadow-lg shadow-gold/10' : 'bg-gray-50 group-hover:bg-gold/5'}`}>
              <Heart size={20} className={isLiked ? "fill-current" : ""} />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
          </button>
          
          <button className="flex items-center gap-3 text-gray-400 hover:text-navy transition-all group/btn">
             <div className="p-3 bg-gray-50 rounded-2xl group-hover/btn:bg-gold/5">
               <MessageCircle size={20} />
             </div>
             <span className="text-[10px] font-black tracking-widest uppercase">Response</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-gray-200 group-hover:text-gold transition-all duration-500">
           <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">View Full Thread</span>
           <ArrowRight size={18} />
        </div>
      </div>
    </article>
  );
}
