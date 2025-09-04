/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

// Minimal PayPal SDK types to avoid using `any`
type PayPalOrderActions = {
  order: {
    create: (params: { purchase_units: Array<{ amount: { value: string } }> }) => Promise<string> | string;
    capture: () => Promise<unknown>;
  };
};

type PayPalButtonsOptions = {
  createOrder: (data: Record<string, unknown>, actions: PayPalOrderActions) => Promise<string> | string;
  onApprove: (data: Record<string, unknown>, actions: PayPalOrderActions) => Promise<void> | void;
  onError?: (err: unknown) => void;
};

type PayPalNamespace = {
  Buttons: (options: PayPalButtonsOptions) => { render: (container: HTMLElement) => Promise<void> | void };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: unknown) => void;
  onError?: (error: unknown) => void;
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const sdkSelector = 'script[src*="paypal.com/sdk/js"]';
    const existing = document.querySelector<HTMLScriptElement>(sdkSelector);

  const renderButtonSafe = () => {
      try {
        if (!window.paypal || !paypalRef.current) return;
        window.paypal
          .Buttons({
            createOrder: (_data, actions) => {
              return actions.order.create({ purchase_units: [{ amount: { value: amount } }] });
            },
            onApprove: async (_data, actions) => {
              try {
                const details = await actions.order.capture();
                onSuccess(details);
              } catch (err) {
                if (onError) onError(err);
                // eslint-disable-next-line no-console
                console.error('PayPal capture error', err);
              }
            },
            onError: (err) => {
              if (onError) onError(err);
              // eslint-disable-next-line no-console
              console.error('PayPal buttons error', err);
            },
          })
          .render(paypalRef.current);
      } catch (err) {
        if (onError) onError(err);
        // eslint-disable-next-line no-console
        console.error('PayPal render exception', err);
      }
    };

    if (existing) {
      if (window.paypal) {
        renderButtonSafe();
      } else {
        existing.addEventListener('load', renderButtonSafe as EventListener);
        existing.addEventListener('error', (e: Event) => {
          if (onError) onError(e);
          // eslint-disable-next-line no-console
          console.error('PayPal SDK script failed to load', e);
        });
      }
      return;
    }

  const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD'; // TODO: Replace 'sb' with real client-id
    script.async = true;
  const onLoadHandler: EventListener = () => renderButtonSafe();
  const onErrorHandler: EventListener = (e: Event) => {
      if (onError) onError(e);
      // eslint-disable-next-line no-console
      console.error('PayPal SDK failed to load', e);
  };
  script.addEventListener('load', onLoadHandler);
  script.addEventListener('error', onErrorHandler);
    document.body.appendChild(script);

    return () => {
      try {
    script.removeEventListener('load', onLoadHandler);
    script.removeEventListener('error', onErrorHandler);
      } catch {
        /* ignore cleanup errors */
      }
    };
  }, [amount, onError, onSuccess]);

  return <div ref={paypalRef} />;
}
