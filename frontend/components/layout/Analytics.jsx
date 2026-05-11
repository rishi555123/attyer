'use client';
import { useState, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

export default function Analytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const consent = localStorage.getItem('attyer_cookie_consent');
    if (consent === 'true') {
      setHasConsent(true);
    }

    // Listen for consent changes without reload
    const handleConsent = () => setHasConsent(true);
    window.addEventListener('cookie_consent_accepted', handleConsent);
    
    return () => window.removeEventListener('cookie_consent_accepted', handleConsent);
  }, []);

  if (!hasConsent) return null;

  return (
    <>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'} />
      
      {/* Meta Pixel Stub */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || '1234567890'}');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  );
}
