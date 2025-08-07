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
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD'; // Replace 'sb' with your real client-id
      script.async = true;
      script.onload = () => renderButton();
      document.body.appendChild(script);
    } else {
      renderButton();
    }
    // eslint-disable-next-line
  }, [amount]);

  function renderButton() {
    if (window.paypal && paypalRef.current) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount } }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          onSuccess(details);
        },
        onError: (err: any) => {
          if (onError) onError(err);
        },
      }).render(paypalRef.current);
    }
  }

  return <div ref={paypalRef} />;
}
