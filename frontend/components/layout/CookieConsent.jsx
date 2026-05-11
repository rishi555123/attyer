'use client';
import { useState, useEffect } from 'react';
import { setCookie, hasCookie } from 'cookies-next'; // We'll stub this or use simple localStorage for now

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Basic check using localStorage
    const consent = localStorage.getItem('attyer_cookie_consent');
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('attyer_cookie_consent', 'true');
    // Dispatch custom event to trigger analytics load
    window.dispatchEvent(new Event('cookie_consent_accepted'));
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('attyer_cookie_consent', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-kashish text-cream p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="text-sm font-body max-w-3xl">
        We use cookies to improve your shopping experience, analyze site traffic, and personalize content. 
        By clicking "Accept All", you consent to our use of cookies. Read our <a href="/privacy" className="underline hover:text-terracotta">Privacy Policy</a>.
      </div>
      <div className="flex gap-4 shrink-0">
        <button onClick={handleDecline} className="px-4 py-2 border border-sand/50 rounded-sm font-label text-sm hover:bg-white/10 transition-colors">
          Decline
        </button>
        <button onClick={handleAccept} className="px-6 py-2 bg-terracotta text-white rounded-sm font-label text-sm hover:bg-deepred transition-colors">
          Accept All
        </button>
      </div>
    </div>
  );
}
