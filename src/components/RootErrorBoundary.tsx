"use client";
import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { clientLogger } from '@/core/clientLogger';

function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-6 break-all" role="alert">{error.message}</p>
        <button onClick={resetErrorBoundary} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Reload</button>
      </div>
    </div>
  );
}

export function RootErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        clientLogger.error('react.error_boundary', { message: error.message, componentStack: info.componentStack });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default RootErrorBoundary;
