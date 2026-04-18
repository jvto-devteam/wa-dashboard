'use client';

import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function EmbeddedSignupPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1487609042970236';
  const configId = process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_BUSINESS_CONFIG_ID || '1248176634152808';

  const initFacebookSDK = useCallback(() => {
    if (window.FB) {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v25.0'
      });
      console.log('Facebook SDK Initialized');
      setIsLoaded(true);
    }
  }, [appId]);

  useEffect(() => {
    // Define fbAsyncInit before loading the script
    window.fbAsyncInit = function() {
      initFacebookSDK();
    };

    // Load Facebook SDK
    const loadSDK = () => {
      if (document.getElementById('facebook-jssdk')) {
        // If script already exists, just init
        if (window.FB) initFacebookSDK();
        return;
      }
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    };

    loadSDK();

    // Event listener for session logging
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('WhatsApp Embedded Signup Event:', data);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [appId, initFacebookSDK]);

  const launchWhatsAppSignup = () => {
    if (!window.FB) {
      alert('Facebook SDK belum siap. Silakan tunggu sebentar atau refresh halaman.');
      return;
    }

    // Double check if initialized by calling a safe method or just proceed if isLoaded is true
    try {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log('Onboarding Successful, Code:', code);
          alert('Onboarding Berhasil! Silakan cek console log untuk mendapatkan kode.');
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
    } catch (error) {
      console.error('Error during FB.login:', error);
      alert('Terjadi kesalahan saat membuka popup. Pastikan FB SDK sudah terinisialisasi.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          WhatsApp Business Coexistence
        </h1>
        <p className="text-gray-600 mb-8">
          Hubungkan nomor WhatsApp Business Anda ke Cloud API tanpa kehilangan akses di aplikasi HP.
        </p>
        
        <button
          onClick={launchWhatsAppSignup}
          disabled={!isLoaded}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all ${
            isLoaded 
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoaded ? 'Hubungkan WhatsApp Sekarang' : 'Menyiapkan SDK...'}
        </button>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Petunjuk:</h3>
          <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
            <li>Pastikan domain ini sudah terdaftar di <strong>Allowed Domains</strong> pada dashboard Meta App.</li>
            <li>Gunakan browser yang sama dengan akun Facebook pengelola bisnis Anda.</li>
            <li>Pilih opsi <strong>"Connect your existing WhatsApp Business App"</strong> saat diminta.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
