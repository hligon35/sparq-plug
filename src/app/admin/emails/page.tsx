"use client";

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminTopNav from '@/components/AdminTopNav';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { isEmailSetupEnabled } from '@/features/email_setup/feature';

// Lazy import heavy modules so loading Emails page is fast
const EmailSetupWizard = dynamic(()=>import('../../email-setup/page').then(m=>m.default), { ssr:false, loading: () => <div className="p-6 text-sm text-gray-600">Loading setup wizard…</div> });
const AccountsManager = dynamic(()=>import('../email/accounts/ui/AccountsManager').then(m=>m.default), { ssr:false, loading: () => <div className="p-6 text-sm text-gray-600">Loading accounts…</div> });

export default function EmailsCombinedPage(){
  const enabled = isEmailSetupEnabled();
  const [active, setActive] = useState<'setup'|'accounts'>('setup');
  const [roleAllowed, setRoleAllowed] = useState(false);

  useEffect(()=>{
    try {
      const cookieStr = document.cookie || '';
      const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(pair=>{ const i=pair.indexOf('='); const k=i===-1?pair:pair.slice(0,i); const v=i===-1?'':decodeURIComponent(pair.slice(i+1)); return [k,v]; }));
      const role = cookies['role'];
      setRoleAllowed(role==='admin' || role==='manager');
    } catch { setRoleAllowed(false); }
  },[]);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Emails" subtitle="Provision business email & manage accounts" />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {!enabled && (
            <div className="p-6 bg-white border rounded-xl text-sm text-gray-700">Email feature disabled. Enable NEXT_PUBLIC_FEATURE_EMAIL_SETUP to use this module.</div>
          )}
          {enabled && !roleAllowed && (
            <div className="p-6 bg-white border rounded-xl text-sm text-gray-700">You need an admin or manager role to configure email. Ask an administrator for access.</div>
          )}
          {enabled && roleAllowed && (
            <>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {(['setup','accounts'] as const).map(key => {
                  const label = key==='setup' ? 'Setup Wizard' : 'Accounts';
                  const activeTab = active===key;
                  return (
                    <button key={key} onClick={()=>setActive(key)} aria-current={activeTab? 'page': undefined}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${activeTab ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]'} `}>
                      <span className={`w-2 h-2 rounded-full ${activeTab ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-10">
                {active==='setup' && (
                  <div className="rounded-2xl">
                    <EmailSetupWizard />
                  </div>
                )}
                {active==='accounts' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <AccountsManager />
                  </div>
                )}
              </div>
            </>
          )}
          {enabled && !roleAllowed && (
            <div className="mt-6 text-xs text-gray-500">If you already have access you may need to set a role cookie: <code>document.cookie="role=admin"</code> (dev only)</div>
          )}
          <div className="mt-10 text-center text-xs text-gray-400">Email module (combined) – experimental</div>
        </div>
      </div>
    </div>
  );
}
