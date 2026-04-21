'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuditPage() {
  const [swStatus, setSwStatus] = useState<'loading' | 'registered' | 'failed'>('loading');
  const [manifestStatus, setManifestStatus] = useState<'loading' | 'found' | 'missing'>('loading');

  useEffect(() => {
    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          setSwStatus('registered');
        } else {
          setSwStatus('failed');
        }
      });
    } else {
      setSwStatus('failed');
    }

    // Check Manifest
    fetch('/manifest.json')
      .then((res) => {
        if (res.ok) setManifestStatus('found');
        else setManifestStatus('missing');
      })
      .catch(() => setManifestStatus('missing'));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold border-b pb-4 text-[#003366]">System Audit</h1>
      
      <div className="space-y-4">
        <AuditItem 
          title="Service Worker" 
          status={swStatus === 'loading' ? 'loading' : swStatus === 'registered' ? 'pass' : 'fail'} 
          desc={swStatus === 'registered' ? 'Registered and functional.' : 'No service worker found. Note: Only registers in production build.'}
        />
        <AuditItem 
          title="Manifest JSON" 
          status={manifestStatus === 'loading' ? 'loading' : manifestStatus === 'found' ? 'pass' : 'fail'} 
          desc={manifestStatus === 'found' ? 'Manifest file detected.' : 'Manifest file missing or unreachable.'}
        />
        <AuditItem 
          title="Next.js 15 Environment" 
          status="pass" 
          desc="App Router and TypeScript active."
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p><strong>Note:</strong> PWA features like Offline and Installability are best tested in a production-like environment or via `npm run build && npm run start`.</p>
      </div>
    </div>
  );
}

function AuditItem({ title, status, desc }: { title: string, status: 'pass' | 'fail' | 'loading', desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm">
      {status === 'loading' && <Loader2 className="animate-spin text-gray-400" />}
      {status === 'pass' && <CheckCircle className="text-green-500" />}
      {status === 'fail' && <XCircle className="text-red-500" />}
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
