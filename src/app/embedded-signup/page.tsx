'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function EmbeddedSignupPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const appId = process.env.FACEBOOK_APP_ID;
  const configId = process.env.FACEBOOK_LOGIN_BUSINESS_CONFIG_ID

  useEffect(() => {
    // Load Facebook SDK
    const loadSDK = () => {
      if (document.getElementById('facebook-jssdk')) return;
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    };

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v25.0'
      });
      setIsLoaded(true);
    };

    loadSDK();

    // Event listener for session logging
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('WhatsApp Embedded Signup Event:', data);
          // Handle specific events like success or abandonment here
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [appId]);

  const launchWhatsAppSignup = () => {
    if (!window.FB) return;

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('Onboarding Successful, Code:', code);
        // You can send this code to your backend to exchange for an access token
        alert('Onboarding Successful! Check console for code.');
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        featureType: 'whatsapp_business_app_onboarding',
        sessionInfoVersion: 3
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          WhatsApp Business Coexistence
        </h1>
        <p className="text-gray-600 mb-8">
          Hubungkan nomor WhatsApp Business Anda ke Cloud API tanpa kehilangan akses di aplikasi HP.
        </p>
        
        <button
          onClick={launchWhatsAppSignup}
          disabled={!isLoaded}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            isLoaded 
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoaded ? 'Hubungkan WhatsApp Sekarang' : 'Memuat SDK...'}
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Pastikan domain ini sudah terdaftar di <strong>Allowed Domains</strong> pada dashboard Meta App Anda.</p>
        </div>
      </div>
    </div>
  );
}
