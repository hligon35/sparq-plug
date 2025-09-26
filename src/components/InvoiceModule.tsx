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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* PayPal Payment Option */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-6 h-6" />
                  <span className="text-gray-700 font-medium">PayPal</span>
                </div>
                <PayPalButton
                  amount={invoices.find(inv => inv.status === 'Pending')?.amount.replace(/[^\d.]/g, '') || '0.00'}
                  onSuccess={(details) => alert('Payment successful! Transaction ID: ' + details.id)}
                  onError={(err) => alert('Payment error: ' + err)}
                />
              </div>

              {/* Stripe Payment Option */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <img src="https://cdn.worldvectorlogo.com/logos/stripe-3.svg" alt="Stripe" className="w-6 h-6 bg-white rounded" />
                  <span className="text-gray-700 font-medium">Credit Card</span>
                </div>
                <button
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow transition-colors"
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
                  Pay with Credit Card
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <span className="text-gray-500">No pending invoices to pay.</span>
            </div>
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
              <div>
                <label htmlFor="invoice-id" className="sr-only">Invoice Number</label>
                <input
                  id="invoice-id"
                  type="text"
                  placeholder="Invoice #"
                  aria-label="Invoice Number"
                  value={newInvoice.id || ''}
                  onChange={e => setNewInvoice({ ...newInvoice, id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="invoice-client" className="sr-only">Client</label>
                <input
                  id="invoice-client"
                  type="text"
                  placeholder="Client"
                  aria-label="Client"
                  value={newInvoice.client || ''}
                  onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="invoice-amount" className="sr-only">Amount</label>
                <input
                  id="invoice-amount"
                  type="text"
                  placeholder="Amount"
                  aria-label="Amount"
                  value={newInvoice.amount || ''}
                  onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="invoice-status" className="sr-only">Status</label>
                <select
                  id="invoice-status"
                  title="Invoice Status"
                  aria-label="Status"
                  value={newInvoice.status || 'Pending'}
                  onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value as 'Paid' | 'Pending' })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label htmlFor="invoice-date" className="sr-only">Date</label>
                <input
                  id="invoice-date"
                  type="date"
                  aria-label="Invoice Date"
                  value={newInvoice.date || ''}
                  onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
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
