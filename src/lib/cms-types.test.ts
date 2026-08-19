import { describe, it, expect } from 'vitest';
import {
  globalConfigSchema,
  navbarConfigSchema,
  heroConfigSchema,
  painPointsConfigSchema,
  bioConfigSchema,
  positioningConfigSchema,
  servicesConfigSchema,
  testimonialsConfigSchema,
  faqConfigSchema,
  contactConfigSchema,
  footerConfigSchema,
  themeConfigSchema,
  whatsappModalConfigSchema,
} from './cms-types';

function validNavbar() {
  return {
    logoUrl: '/logo.png',
    brandName: 'Gislaine',
    whatsappUrl: 'https://wa.me/5511999999999',
    links: [{ id: '1', label: 'Sobre', sectionId: 'sobre' }],
  };
}

function validHero() {
  return {
    titleHtml: '<h1>Hero Title</h1>',
    description: 'A description',
    ctaText: 'Clique aqui',
    scrollLabel: 'Role para baixo',
    mobileImageUrl: '/mobile.jpg',
    desktopImageUrl: '/desktop.jpg',
  };
}

function validPainPoints() {
  return {
    eyebrow: 'Para quem é',
    bullets: ['Item 1', 'Item 2'],
    calloutText: 'Callout text',
    calloutEmphasis: 'Emphasis',
  };
}

function validBio() {
  return {
    eyebrow: 'Sobre',
    titleHtml: '<h2>Sobre Mim</h2>',
    paragraphs: ['Paragraph 1'],
    portraitImageUrl: '/portrait.jpg',
    careerPath: ['Step 1', 'Step 2'],
    overlayName: 'Gislaine',
    overlayRole: 'Mentora',
  };
}

function validPositioning() {
  return {
    eyebrow: 'Posicionamento',
    titleHtml: '<h2>Title</h2>',
    paragraph1: 'Paragraph 1',
    emphasisText: 'Emphasis text',
    paragraph2: 'Paragraph 2',
  };
}

function validServices() {
  return {
    eyebrow: 'Serviços',
    titleHtml: '<h2>Serviços</h2>',
    items: [
      { id: '1', number: '01', title: 'Mentoria', subtitle: null, description: 'Description', ctaText: 'Saiba mais', includes: null },
    ],
  };
}

function validTestimonials() {
  return {
    eyebrow: 'Feedbacks',
    titleHtml: '<h2>Testimonials</h2>',
    description: 'Description',
    items: [
      {
        id: '1',
        name: 'Maria',
        role: 'Cliente',
        paragraphs: [{ id: 'p1', text: 'Great service' }],
      },
    ],
  };
}

function validFaq() {
  return {
    eyebrow: 'FAQ',
    titleHtml: '<h2>FAQ</h2>',
    items: [{ id: '1', question: 'What is this?', answer: 'This is that' }],
    footerCtaQuestion: 'Still have questions?',
    footerCtaButtonText: 'Contact us',
  };
}

function validContact() {
  return {
    eyebrow: 'Contato',
    titleHtml: '<h2>Contact</h2>',
    description: 'Get in touch',
    features: ['Fast reply', 'Free'],
    guaranteeTitle: 'Garantia',
    guaranteeDescription: '100% satisfaction',
    submitButtonText: 'Enviar',
  };
}

function validFooter() {
  return {
    brandName: 'Gislaine',
    logoUrl: '/logo.png',
    copyrightText: '© 2024',
    links: [{ id: '1', label: 'Home', sectionId: 'home' }],
  };
}

function validTheme() {
  return {
    primaryColor: '#19396C',
    accentColor: '#DF823C',
    backgroundColor: '#FAF6EF',
    surfaceColor: '#FFFFFF',
    textColor: '#1A1A1A',
    mutedColor: '#6B7280',
    headingFont: 'Outfit, sans-serif',
    bodyFont: 'Inter, sans-serif',
    baseFontSize: 16,
    sectionPadding: 80,
    cardBorderRadius: 8,
    buttonBorderRadius: 4,
    headingLetterSpacing: -1,
    bodyLineHeight: 1.6,
  };
}

function validWhatsappModal() {
  return {
    title: 'Fale conosco',
    message: 'Olá! Gostaria de saber mais',
    buttonText: 'Abrir WhatsApp',
    phoneNumber: '5511999999999',
    triggerDelay: 5000,
    showOnExitIntent: true,
  };
}

function validGlobal() {
  return {
    meta: { lastSaved: '2024-01-01', lastSavedBy: 'Admin', version: 1 },
    sectionOrder: [{ id: 'hero', label: 'Hero', enabled: true }],
    theme: validTheme(),
    navbar: validNavbar(),
    hero: validHero(),
    painPoints: validPainPoints(),
    bio: validBio(),
    positioning: validPositioning(),
    services: validServices(),
    testimonials: validTestimonials(),
    faq: validFaq(),
    contact: validContact(),
    footer: validFooter(),
    whatsappModal: validWhatsappModal(),
  };
}

describe('navbarConfigSchema', () => {
  it('accepts valid navbar config', () => {
    expect(navbarConfigSchema.safeParse(validNavbar()).success).toBe(true);
  });

  it('rejects missing logoUrl', () => {
    const { success, error } = navbarConfigSchema.safeParse({ ...validNavbar(), logoUrl: '' });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.path.includes('logoUrl'))).toBe(true);
  });

  it('rejects empty links array', () => {
    const { success } = navbarConfigSchema.safeParse({ ...validNavbar(), links: [] });
    expect(success).toBe(false);
  });

  it('rejects too many links', () => {
    const links = Array.from({ length: 11 }, (_, i) => ({ id: String(i), label: 'Link', sectionId: 'x' }));
    const { success } = navbarConfigSchema.safeParse({ ...validNavbar(), links });
    expect(success).toBe(false);
  });

  it('rejects non-url whatsappUrl', () => {
    const { success } = navbarConfigSchema.safeParse({ ...validNavbar(), whatsappUrl: 'not-a-url' });
    expect(success).toBe(false);
  });

  it('accepts relative path whatsappUrl', () => {
    const { success } = navbarConfigSchema.safeParse({ ...validNavbar(), whatsappUrl: '/wa' });
    expect(success).toBe(true);
  });
});

describe('heroConfigSchema', () => {
  it('accepts valid hero config', () => {
    expect(heroConfigSchema.safeParse(validHero()).success).toBe(true);
  });

  it('rejects empty titleHtml', () => {
    const { success } = heroConfigSchema.safeParse({ ...validHero(), titleHtml: '' });
    expect(success).toBe(false);
  });
});

describe('painPointsConfigSchema', () => {
  it('accepts valid pain points config', () => {
    expect(painPointsConfigSchema.safeParse(validPainPoints()).success).toBe(true);
  });

  it('rejects empty bullets', () => {
    const { success } = painPointsConfigSchema.safeParse({ ...validPainPoints(), bullets: [] });
    expect(success).toBe(false);
  });

  it('rejects too many bullets', () => {
    const { success } = painPointsConfigSchema.safeParse({ ...validPainPoints(), bullets: Array.from({ length: 9 }, () => 'x') });
    expect(success).toBe(false);
  });
});

describe('bioConfigSchema', () => {
  it('accepts valid bio', () => {
    expect(bioConfigSchema.safeParse(validBio()).success).toBe(true);
  });

  it('rejects missing overlayName', () => {
    const { success } = bioConfigSchema.safeParse({ ...validBio(), overlayName: '' });
    expect(success).toBe(false);
  });
});

describe('positioningConfigSchema', () => {
  it('accepts valid positioning', () => {
    expect(positioningConfigSchema.safeParse(validPositioning()).success).toBe(true);
  });
});

describe('servicesConfigSchema', () => {
  it('accepts valid services', () => {
    expect(servicesConfigSchema.safeParse(validServices()).success).toBe(true);
  });

  it('rejects empty items', () => {
    const { success } = servicesConfigSchema.safeParse({ ...validServices(), items: [] });
    expect(success).toBe(false);
  });

  it('rejects too many items', () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ id: String(i), number: String(i), title: 'Service', subtitle: null, description: 'Desc', ctaText: 'Click', includes: null }));
    const { success } = servicesConfigSchema.safeParse({ ...validServices(), items });
    expect(success).toBe(false);
  });
});

describe('testimonialsConfigSchema', () => {
  it('accepts valid testimonials', () => {
    expect(testimonialsConfigSchema.safeParse(validTestimonials()).success).toBe(true);
  });

  it('rejects missing paragraphs in items', () => {
    const items = [{ id: '1', name: 'Maria', role: null, paragraphs: [] }];
    const { success } = testimonialsConfigSchema.safeParse({ ...validTestimonials(), items });
    expect(success).toBe(false);
  });
});

describe('faqConfigSchema', () => {
  it('accepts valid FAQ', () => {
    expect(faqConfigSchema.safeParse(validFaq()).success).toBe(true);
  });

  it('rejects missing footerCtaButtonText', () => {
    const { success } = faqConfigSchema.safeParse({ ...validFaq(), footerCtaButtonText: '' });
    expect(success).toBe(false);
  });
});

describe('contactConfigSchema', () => {
  it('accepts valid contact', () => {
    expect(contactConfigSchema.safeParse(validContact()).success).toBe(true);
  });
});

describe('footerConfigSchema', () => {
  it('accepts valid footer', () => {
    expect(footerConfigSchema.safeParse(validFooter()).success).toBe(true);
  });
});

describe('themeConfigSchema', () => {
  it('accepts valid theme', () => {
    expect(themeConfigSchema.safeParse(validTheme()).success).toBe(true);
  });

  it('rejects invalid hex color', () => {
    const { success } = themeConfigSchema.safeParse({ ...validTheme(), primaryColor: 'not-a-color' });
    expect(success).toBe(false);
  });

  it('accepts empty hex color', () => {
    const { success } = themeConfigSchema.safeParse({ ...validTheme(), primaryColor: '' });
    expect(success).toBe(true);
  });

  it('rejects out-of-range baseFontSize', () => {
    const { success } = themeConfigSchema.safeParse({ ...validTheme(), baseFontSize: 10 });
    expect(success).toBe(false);
  });
});

describe('whatsappModalConfigSchema', () => {
  it('accepts valid config', () => {
    expect(whatsappModalConfigSchema.safeParse(validWhatsappModal()).success).toBe(true);
  });

  it('rejects negative triggerDelay', () => {
    const { success } = whatsappModalConfigSchema.safeParse({ ...validWhatsappModal(), triggerDelay: -1 });
    expect(success).toBe(false);
  });

  it('rejects triggerDelay over 60000', () => {
    const { success } = whatsappModalConfigSchema.safeParse({ ...validWhatsappModal(), triggerDelay: 60001 });
    expect(success).toBe(false);
  });

  it('rejects empty title', () => {
    const { success } = whatsappModalConfigSchema.safeParse({ ...validWhatsappModal(), title: '' });
    expect(success).toBe(false);
  });
});

describe('globalConfigSchema', () => {
  it('accepts a complete valid config', () => {
    expect(globalConfigSchema.safeParse(validGlobal()).success).toBe(true);
  });

  it('rejects when a required section is missing', () => {
    const { meta, sectionOrder, theme, navbar } = validGlobal();
    const partial = { meta, sectionOrder, theme, navbar } as any;
    const { success } = globalConfigSchema.safeParse(partial);
    expect(success).toBe(false);
  });

  it('rejects invalid sectionOrder', () => {
    const { success } = globalConfigSchema.safeParse({ ...validGlobal(), sectionOrder: [] });
    expect(success).toBe(false);
  });

  it('rejects sectionOrder with too many items', () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ id: String(i), label: 'Sec', enabled: true }));
    const { success } = globalConfigSchema.safeParse({ ...validGlobal(), sectionOrder: items });
    expect(success).toBe(false);
  });
});
