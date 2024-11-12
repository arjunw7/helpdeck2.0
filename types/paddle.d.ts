declare module '@paddle/paddle-js' {
  export interface PaddleCheckoutSettings {
    displayMode?: 'inline' | 'overlay';
    theme?: 'light' | 'dark';
    locale?: string;
    successUrl?: string;
    closeUrl?: string;
  }

  export interface PaddleCheckoutItem {
    priceId: string;
    quantity?: number;
  }

  export interface PaddleCheckoutProps {
    items: PaddleCheckoutItem[];
    settings?: PaddleCheckoutSettings;
    customData?: Record<string, any>;
  }

  export interface PaddleCheckout {
    open: (props: PaddleCheckoutProps) => Promise<void>;
  }

  export interface PaddleEventCallback {
    name: string;
    data?: any;
  }

  export interface PaddleInitializeOptions {
    environment?: 'sandbox' | 'production';
    token?: string;
    checkout?: {
      settings?: PaddleCheckoutSettings;
      eventCallback?: (data: PaddleEventCallback) => void;
    };
  }

  export interface Paddle {
    Checkout: PaddleCheckout;
    Environment: {
      sandbox: 'sandbox';
      production: 'production';
    };
  }

  export function initializePaddle(options: PaddleInitializeOptions): Promise<Paddle>;
}

// Extend the global Window interface
declare global {
  interface Window {
    Paddle?: Paddle;
  }
}