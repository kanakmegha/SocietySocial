'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Zap, Target } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function CreatePostModal({ onClose, onPostCreated }: { onClose: () => void, onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState('General');
  const supabase = createClient();
  const queryClient = useQueryClient();

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session Check:', !!session);
      
      if (!session) {
        alert('Please sign in to post a thought.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Token being sent:', session.access_token.substring(0, 10));
      
      const newPost = {
        author_id: session.user.id,
        content: content.trim()
      };

      // Optimistic update
      queryClient.setQueryData(['feed'], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          const optimisticPost = { ...newPost, id: 'temp-' + Date.now(), created_at: new Date().toISOString(), likes: 0 };
          if (Array.isArray(newPages[0])) {
            newPages[0] = [optimisticPost, ...newPages[0]];
          } else {
            newPages[0].posts = [optimisticPost, ...newPages[0].posts];
          }
        }
        return { ...oldData, pages: newPages };
      });

      // Submit to backend (which handles Service Role insert)
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newPost),
      });
      
      if (res.ok) {
        setContent('');
        onPostCreated();
        onClose();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to create post');
      }
    } catch (err: any) {
      console.error('Submission Error:', err.message);
      alert('Submission Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-navy/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border border-white/20 animate-in zoom-in-95 duration-700 overflow-hidden">
        {/* Cinematic Backdrop Accent */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gold/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-3xl font-serif text-navy leading-none">Commence Dialogue</h3>
            <p className="text-[9px] font-black text-gray-400 mt-3 uppercase tracking-[0.4em]">Official Community Registry</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center hover:bg-gold hover:text-navy transition-all duration-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-10">
          <div className="relative">
            <textarea 
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Gracing the community square with a thought..."
              className="w-full px-8 py-8 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition-all text-navy text-lg font-medium min-h-[200px] resize-none placeholder:text-gray-300"
            />
            <div className="absolute bottom-6 right-6 text-[9px] font-black text-gray-200 uppercase tracking-widest">
               {content.length} / 500
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block px-1 flex items-center gap-3">
               <Target size={14} className="text-gold" /> Classification Tags
            </label>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Help, Sports, General"
              className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition-all text-sm font-black text-navy placeholder:text-gray-200"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-5 bg-white text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all duration-500"
            >
              Retract
            </button>
            <button 
              disabled={isSubmitting || !content.trim()}
              onClick={handlePost}
              className="flex-[2] py-5 bg-navy text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-gold hover:text-navy hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Recording...' : (
                <>Publish to Square <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
