'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ClientTopNav from '@/components/ClientTopNav';

export default function BillingPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const currentPlan = {
    name: 'Professional',
    price: 49,
    features: [
      'Up to 10 social accounts',
      'Unlimited posts',
      'Advanced analytics',
      'Team collaboration',
      'Priority support'
    ],
    nextBilling: '2024-09-01'
  };

  const invoices = [
    { id: 'INV-001', date: '2024-08-01', amount: 49, status: 'paid', description: 'Professional Plan - August 2024' },
    { id: 'INV-002', date: '2024-07-01', amount: 49, status: 'paid', description: 'Professional Plan - July 2024' },
    { id: 'INV-003', date: '2024-06-01', amount: 49, status: 'paid', description: 'Professional Plan - June 2024' },
    { id: 'INV-004', date: '2024-05-01', amount: 49, status: 'paid', description: 'Professional Plan - May 2024' }
  ];

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2026, isDefault: true },
    { id: 2, type: 'card', last4: '0005', brand: 'Mastercard', expiryMonth: 8, expiryYear: 2025, isDefault: false }
  ]);

  const handleUpgradePlan = () => {
    alert('Plan upgrade functionality would redirect to payment processor.');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}. In production, this would generate and download a PDF.`);
  };

  const handleAddPaymentMethod = () => {
    alert('Payment method addition would integrate with Stripe/PayPal for secure card storage.');
    setShowPaymentModal(false);
  };

  const handleRemovePaymentMethod = (methodId: number) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
      alert('Payment method removed successfully.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCardIcon = (brand: string) => {
    switch(brand.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'american express': return '💳';
      default: return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Billing & Payments" subtitle="Manage your subscription and payment methods" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientTopNav />
        <div className="pb-8">
          {/* Current Plan */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name} Plan</h3>
                  <p className="text-blue-100 mt-1">Perfect for growing businesses</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${currentPlan.price}</span>
                    <span className="text-blue-100 ml-2">per month</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100">Next billing date</p>
                  <p className="text-xl font-semibold">{currentPlan.nextBilling}</p>
                  <button
                    onClick={handleUpgradePlan}
                    className="mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Plan Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-300">✓</span>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                </div>
              </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Payment Method
              </button>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getCardIcon(method.brand)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {method.brand} ending in {method.last4}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                        {method.isDefault && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => {
                            // Set this payment method as default and update others
                            setPaymentMethods(prev => prev.map(pm => ({
                              ...pm,
                              isDefault: pm.id === method.id
                            })));
                            alert(`${method.type} ending in ${method.last4} set as default payment method`);
                          }}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
                          title="Set as default"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                        disabled={method.isDefault}
                        title="Remove payment method"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Download All
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{invoice.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {invoice.date}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">${invoice.amount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" aria-label="Set as default payment method" title="Set as default payment method" />
                <label className="text-sm text-gray-600">Set as default payment method</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  title="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  title="Add card"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download All Invoices Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInvoiceModal(false)}
              aria-label="Close"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Download Invoices</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Start date"
                    title="Start date"
                  />
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="End date"
                    title="End date"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="invoice-format">Format</label>
                <select id="invoice-format" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Format" title="Format">
                  <option>PDF</option>
                  <option>CSV</option>
                  <option>Excel</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Downloading all invoices in the selected format and date range.');
                    setShowInvoiceModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
