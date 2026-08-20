'use client';

import { useEffect, useRef } from 'react';

export interface MarketingAttribution {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
}

const STORAGE_KEY = 'gislaine_marketing_attribution';

function parseUtmParams(): MarketingAttribution {
  if (typeof window === 'undefined') {
    return { source: null, medium: null, campaign: null, term: null, content: null };
  }

  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  const term = params.get('utm_term');
  const content = params.get('utm_content');

  return { source, medium, campaign, term, content };
}

function getReferrerSource(): string | null {
  if (typeof document === 'undefined') return null;
  const referrer = document.referrer;
  if (!referrer || typeof referrer !== 'string' || referrer.trim() === '') return 'direct';

  try {
    const url = new URL(referrer, 'https://gislainelozano.com.br');
    const hostname = url.hostname;

    if (hostname.includes('google')) return 'google';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('tiktok')) return 'tiktok';
    if (hostname.includes('youtube')) return 'youtube';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';

    return referrer;
  } catch {
    return 'unknown';
  }
}

export function getMarketingAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') {
    return { source: null, medium: null, campaign: null, term: null, content: null };
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }

  const utm = parseUtmParams();

  const attribution: MarketingAttribution = {
    source: utm.source || getReferrerSource(),
    medium: utm.medium || null,
    campaign: utm.campaign || null,
    term: utm.term || null,
    content: utm.content || null,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // storage unavailable
  }

  return attribution;
}

export function useMarketingAttribution(): MarketingAttribution {
  const attribution = useRef<MarketingAttribution>({ source: null, medium: null, campaign: null, term: null, content: null });

  useEffect(() => {
    attribution.current = getMarketingAttribution();
  }, []);

  return attribution.current;
}
