import React, { useState } from 'react';
// ...existing code...
import PayPalButton from './PayPalButton';

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
}

const initialInvoices: Invoice[] = [
  { id: 'INV-1001', client: 'TechCorp', amount: '$1,200.00', status: 'Paid', date: '2025-08-01' },
  { id: 'INV-1002', client: 'FashionBrand', amount: '$850.00', status: 'Pending', date: '2025-08-03' },
];

export default function InvoiceModule() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({});

  const handleCreateInvoice = () => {
    if (newInvoice.id && newInvoice.client && newInvoice.amount && newInvoice.status && newInvoice.date) {
      setInvoices([...invoices, newInvoice as Invoice]);
      setShowModal(false);
      setNewInvoice({});
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-700">Invoices</h4>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow"
        >
          Create Invoice
        </button>
      </div>
      <table className="min-w-full bg-white border rounded-xl overflow-hidden mb-8">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="py-2 px-4">Invoice #</th>
            <th className="py-2 px-4">Client</th>
            <th className="py-2 px-4">Amount</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="py-2 px-4">{inv.id}</td>
              <td className="py-2 px-4">{inv.client}</td>
              <td className="py-2 px-4">{inv.amount}</td>
              <td className="py-2 px-4">
                <span className={
                  inv.status === 'Paid'
                    ? 'bg-green-100 text-green-700 px-2 py-1 rounded'
                    : 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded'
                }>{inv.status}</span>
              </td>
              <td className="py-2 px-4">{inv.date}</td>
              <td className="py-2 px-4">
                <button className="text-blue-600 hover:underline mr-2">View</button>
                <button className="text-gray-600 hover:underline">Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Payment Integrations */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Pay an Invoice</h4>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Show PayPal and Stripe buttons for the first pending invoice as a demo */}
          {invoices.filter(inv => inv.status === 'Pending').length > 0 ? (
            <>
            <div className="relative z-0">
              <PayPalButton
                amount={invoices.find(inv => inv.status === 'Pending')?.amount.replace(/[^\d.]/g, '') || '0.00'}
                onSuccess={(details) => alert('Payment successful! Transaction ID: ' + details.id)}
                onError={(err) => alert('Payment error: ' + err)}
              />
              <div className="flex items-center gap-2 mt-2">
                <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-6 h-6" />
                <span className="text-gray-700 text-sm">Pay with PayPal</span>
              </div>
            </div>
              <div>
                <button
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow"
                  onClick={async () => {
                    const pending = invoices.find(inv => inv.status === 'Pending');
                    if (!pending) return;
                    const res = await fetch('/api/create-stripe-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: pending.amount.replace(/[^\d.]/g, ''), invoiceId: pending.id }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Stripe error: ' + (data.error || 'Unknown error'));
                    }
                  }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#635BFF"/><path d="M23.5 17.5C23.5 15.57 22.13 14.97 20.13 14.5L19.5 14.36C18.5 14.13 18 13.93 18 13.5C18 13.13 18.38 12.88 19.13 12.88C20.02 12.88 20.5 13.13 20.5 13.13L20.75 11.5C20.75 11.5 20.13 11 18.88 11C16.88 11 15.5 12.13 15.5 13.5C15.5 15.36 17.13 15.77 18.88 16.13L19.5 16.25C20.5 16.45 21 16.67 21 17.13C21 17.63 20.38 17.88 19.63 17.88C18.63 17.88 18 17.5 18 17.5L17.75 19.13C17.75 19.13 18.38 19.5 19.63 19.5C21.63 19.5 23.5 18.63 23.5 17.5Z" fill="#fff"/></svg>
                  Pay with Stripe
                </button>
                <div className="flex items-center gap-2 mt-2">
                  <img src="https://cdn.worldvectorlogo.com/logos/stripe-3.svg" alt="Stripe" className="w-6 h-6 bg-white rounded" />
                  <span className="text-gray-700 text-sm">Pay with Stripe</span>
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">No pending invoices to pay.</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">* PayPal (sandbox) and Stripe (test) integrations are live. Replace keys for production.</p>
      </div>
      {/* Export */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Export & History</h4>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium mr-2">Export as PDF</button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium">Export as CSV</button>
      </div>
      {/* Modal for creating invoice */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Create Invoice</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Invoice #"
                value={newInvoice.id || ''}
                onChange={e => setNewInvoice({ ...newInvoice, id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Client"
                value={newInvoice.client || ''}
                onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Amount"
                value={newInvoice.amount || ''}
                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newInvoice.status || 'Pending'}
                onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value as 'Paid' | 'Pending' })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
              <input
                type="date"
                value={newInvoice.date || ''}
                onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
