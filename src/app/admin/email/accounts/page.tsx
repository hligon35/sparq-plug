import React from 'react';
import AccountsManager from './ui/AccountsManager';

export const metadata = { title: 'Email Accounts' };

export default function EmailAccountsPage(){
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Email Accounts</h1>
      <p className="text-sm text-gray-600 mb-6">Create and manage client email inbox accounts. This is a provisional UI; real provisioning & secure credential handling will be integrated later.</p>
      <AccountsManager />
    </div>
  );
}
