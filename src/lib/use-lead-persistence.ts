'use client';

const STORAGE_KEY = 'gislaine_lead_data';
const EXPIRY_DAYS = 30;

interface LeadData {
  name: string;
  email: string;
  phone: string;
}

export function saveLeadData(data: LeadData) {
  try {
    const payload = {
      ...data,
      _expires: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable
  }
}

export function getLeadData(): Partial<LeadData> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const data = JSON.parse(raw);
    if (data._expires && Date.now() > data._expires) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }

    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
    };
  } catch {
    return {};
  }
}

export function clearLeadData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}
