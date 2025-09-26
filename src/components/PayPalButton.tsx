// TypeScript declaration for PayPal JS SDK
declare global {
  interface Window {
    paypal?: any;
  }
}
import { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const sdkSelector = 'script[src*="paypal.com/sdk/js"]';
    const existing = document.querySelector<HTMLScriptElement>(sdkSelector);

    const renderButtonSafe = () => {
      try {
        if (!window.paypal || !paypalRef.current) return;
        
        // Clear any existing PayPal buttons in this container to prevent duplicates
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }
        
        // Wrap PayPal render in try/catch to prevent unhandled exceptions
        window.paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({ purchase_units: [{ amount: { value: amount } }] });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                onSuccess(details);
              } catch (err) {
                if (onError) onError(err);
                console.error('PayPal capture error', err);
              }
            },
            onError: (err: any) => {
              if (onError) onError(err);
              console.error('PayPal buttons error', err);
            },
          })
          .render(paypalRef.current);
      } catch (err) {
        if (onError) onError(err);
        console.error('PayPal render exception', err);
      }
    };

    if (existing) {
      // If the SDK script is already present, try to render (it might still be loading)
      if ((window as any).paypal) {
        renderButtonSafe();
      } else {
        // Wait for existing script to load
        existing.addEventListener('load', renderButtonSafe);
        existing.addEventListener('error', (e) => {
          if (onError) onError(e);
          console.error('PayPal SDK script failed to load', e);
        });
      }
      return;
    }

    // Create script if not present
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD'; // Replace 'sb' with real client-id
    script.async = true;
    script.addEventListener('load', renderButtonSafe);
    script.addEventListener('error', (e) => {
      if (onError) onError(e);
      console.error('PayPal SDK failed to load', e);
    });
    document.body.appendChild(script);

    // Cleanup listeners on unmount
    return () => {
      try {
        script.removeEventListener('load', renderButtonSafe);
        script.removeEventListener('error', () => {});
      } catch (e) {
        /* ignore cleanup errors */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  return <div ref={paypalRef} />;
}
