document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = qs('.header');
  const navMenu = qs('#nav-menu');
  const menuToggle = qs('#menu-toggle');
  const menuClose = qs('#menu-close');
  const languageToggle = qs('#language-toggle');
  const progressBar = qs('#progress-bar');

  let navBackdrop = qs('#nav-backdrop');
  if (!navBackdrop && navMenu) {
    navBackdrop = document.createElement('div');
    navBackdrop.id = 'nav-backdrop';
    navBackdrop.setAttribute('aria-hidden', 'true');
    Object.assign(navBackdrop.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(2, 6, 23, 0.56)',
      backdropFilter: 'blur(6px)',
      display: 'none',
      zIndex: '1090'
    });
    document.body.appendChild(navBackdrop);
  }


  const toast = qs('#site-toast') || (() => {
    const node = document.createElement('div');
    node.id = 'site-toast';
    node.className = 'site-toast';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    document.body.appendChild(node);
    return node;
  })();

  let toastTimer = null;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  };

  const isMobileDialerContext = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || '');

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (error) {
        // Fall through to the legacy copy path.
      }
    }

    try {
      const helper = document.createElement('input');
      helper.value = value;
      helper.setAttribute('readonly', 'true');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      helper.style.pointerEvents = 'none';
      document.body.appendChild(helper);
      helper.select();
      helper.setSelectionRange(0, helper.value.length);
      const copied = document.execCommand('copy');
      document.body.removeChild(helper);
      return copied;
    } catch (error) {
      return false;
    }
  };

  const formatPhoneDisplay = (value) => {
    const raw = String(value || '').trim();
    const digits = raw.replace(/[^\d+]/g, '');
    if (/^\+?91\d{10}$/.test(digits)) {
      const local = digits.replace(/^\+?91/, '');
      return `+91 ${local}`;
    }
    return raw;
  };

  const setupPhoneLinks = () => {
    qsa('a[href^="tel:"]').forEach((link) => {
      const phone = formatPhoneDisplay(link.dataset.phone || String(link.getAttribute('href') || '').replace(/^tel:/, ''));
      if (!phone) return;
      if (!link.getAttribute('title')) link.setAttribute('title', `Phone: ${phone}`);

      link.addEventListener('click', async (event) => {
        if (isMobileDialerContext()) return;

        event.preventDefault();
        const copied = await copyText(phone);
        showToast(copied ? `Phone number copied: ${phone}` : `Phone: ${phone}`);

        const contactSection = qs('#contact');
        if (contactSection && !link.closest('#contact')) {
          contactSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  };

  const setExternalLinkSafety = () => {
    qsa('a[target="_blank"]').forEach((link) => {
      const rel = new Set(String(link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });
  };

  const isMenuOpen = () => Boolean(navMenu && navMenu.classList.contains('active'));
  const getLightbox = () => qs('#lightbox');
  const isLightboxOpen = () => Boolean(getLightbox() && getLightbox().classList.contains('is-open'));

  const syncBodyLock = () => {
    body.style.overflow = isMenuOpen() || isLightboxOpen() ? 'hidden' : '';
  };

  const openMenu = () => {
    if (!navMenu) return;
    navMenu.classList.add('active');
    menuToggle?.setAttribute('aria-expanded', 'true');
    navBackdrop.style.display = 'block';
    navBackdrop.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    syncBodyLock();
  };

  const closeMenu = () => {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    navBackdrop.style.display = 'none';
    navBackdrop.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
    syncBodyLock();
  };

  menuToggle?.addEventListener('click', () => {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuClose?.addEventListener('click', closeMenu);
  navBackdrop?.addEventListener('click', closeMenu);

  qsa('#nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 920) closeMenu();
    });
  });

  languageToggle?.addEventListener('click', (event) => {
    const target = languageToggle.getAttribute('data-target') || languageToggle.getAttribute('href');
    if (!target) return;

    if (languageToggle.tagName !== 'A') {
      event.preventDefault();
      window.location.href = target;
    }
  });

  const scrollBtn = qs('#scrollTopBtn') || (() => {
    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);
    return btn;
  })();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  const handleHeaderState = () => {
    const scrolled = window.scrollY > 20;

    header?.classList.toggle('scrolled', scrolled);
    scrollBtn.classList.toggle('is-visible', window.scrollY > 440);

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
  };

  window.addEventListener('scroll', handleHeaderState, { passive: true });
  handleHeaderState();

  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = qs(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

      if (window.history && typeof window.history.pushState === 'function') {
        window.history.pushState(null, '', href);
      }
    });
  });

  const restoreHashTarget = () => {
    if (!window.location.hash) return;
    const target = qs(window.location.hash);
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  };

  const revealElements = qsa('.reveal, .section, .card, .feature-card, .program-card, .metric-card, .summary-card, .leader-card, .contact-panel, .elders-showcase');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('show'));
  }

  const sections = qsa('main section[id]');
  const navLinks = qsa('[data-nav-link]');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const activeId = visible.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('is-active', href === `#${activeId}` || href.endsWith(`#${activeId}`));
        });
      },
      { threshold: 0.35, rootMargin: '-20% 0px -55% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const slides = qsa('.hero-slider .slide');
  const dotsContainer = qs('.hero-dots');
  let sliderTimer = null;
  let currentSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));

  const renderDots = () => {
    if (!dotsContainer || !slides.length) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = index === currentSlide ? 'hero-dot active' : 'hero-dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => {
        setSlide(index);
        restartSlider();
      });
      dotsContainer.appendChild(dot);
    });
  };

  const setSlide = (index) => {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    renderDots();
  };

  const restartSlider = () => {
    if (sliderTimer) window.clearInterval(sliderTimer);
    if (slides.length > 1 && !reduceMotion) {
      sliderTimer = window.setInterval(() => setSlide(currentSlide + 1), 4800);
    }
  };

  if (slides.length) {
    setSlide(currentSlide);
    restartSlider();
  }

  document.addEventListener('visibilitychange', () => {
    if (!slides.length) return;
    if (document.hidden) {
      if (sliderTimer) window.clearInterval(sliderTimer);
    } else {
      restartSlider();
    }
  });

  const faqItems = qsa('.faq-item');

  const setFaqState = (item, open) => {
    const question = qs('.faq-question', item);
    const answer = qs('.faq-answer', item);
    if (!answer) return;

    item.classList.toggle('active', open);
    item.classList.toggle('is-open', open);
    question?.setAttribute('aria-expanded', String(open));
    answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0px';
  };

  const refreshFaqHeights = () => {
    faqItems.forEach((item) => {
      if (!item.classList.contains('active') && !item.classList.contains('is-open')) return;
      const answer = qs('.faq-answer', item);
      if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  };

  faqItems.forEach((item) => {
    const question = qs('.faq-question', item) || item;
    const answer = qs('.faq-answer', item);
    if (!answer) return;

    setFaqState(item, item.classList.contains('active') || item.classList.contains('is-open'));

    question.addEventListener('click', () => {
      const willOpen = !(item.classList.contains('active') || item.classList.contains('is-open'));
      faqItems.forEach((faq) => {
        if (faq !== item) setFaqState(faq, false);
      });
      setFaqState(item, willOpen);
    });
  });

  const buildImagePlaceholder = (label, variant = 'default') => {
    const text = String(label || 'Church image').replace(/[<>]/g, '').slice(0, 48);

    const buildScenicPlaceholder = (a, b, c) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${text}">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${a}"/>
            <stop offset="58%" stop-color="${b}"/>
            <stop offset="100%" stop-color="${c}"/>
          </linearGradient>
          <radialGradient id="r" cx="0.85" cy="0.2" r="0.55">
            <stop offset="0%" stop-color="rgba(255,255,255,0.24)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#g)"/>
        <rect width="1600" height="900" fill="url(#r)"/>
        <g fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2">
          <path d="M0 740 Q340 650 700 720 T1600 690"/>
          <path d="M0 790 Q420 690 840 770 T1600 740"/>
        </g>
        <g transform="translate(800 360)">
          <circle r="90" fill="rgba(255,255,255,0.1)"/>
          <path d="M0-52 V52 M-36-6 H36" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
        </g>
        <text x="800" y="585" text-anchor="middle" fill="#ffffff" font-size="52" font-family="Arial, sans-serif" font-weight="700">${text}</text>
        <text x="800" y="642" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-size="26" font-family="Arial, sans-serif">Church of Christ Anandapuram</text>
      </svg>
    `;

    const buildPortraitPlaceholder = () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" role="img" aria-label="${text}">
        <defs>
          <linearGradient id="portrait-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#081121"/>
            <stop offset="55%" stop-color="#1d4ed8"/>
            <stop offset="100%" stop-color="#8fabc7"/>
          </linearGradient>
          <radialGradient id="portrait-glow" cx="0.5" cy="0.18" r="0.7">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="1000" height="1300" fill="url(#portrait-bg)"/>
        <rect width="1000" height="1300" fill="url(#portrait-glow)"/>
        <circle cx="500" cy="420" r="135" fill="rgba(255,255,255,0.18)"/>
        <path d="M500 315c-73 0-132 59-132 132s59 132 132 132 132-59 132-132-59-132-132-132Zm0 398c-160 0-290 107-290 238h580c0-131-130-238-290-238Z" fill="#ffffff" opacity="0.96"/>
        <path d="M116 1105c114-76 243-114 384-114s270 38 384 114" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="28" stroke-linecap="round"/>
      </svg>
    `;

    const buildLeadershipPlaceholder = () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${text}">
        <defs>
          <linearGradient id="leadership-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#081121"/>
            <stop offset="52%" stop-color="#1947b7"/>
            <stop offset="100%" stop-color="#c79b4a"/>
          </linearGradient>
          <radialGradient id="leadership-glow" cx="0.5" cy="0.16" r="0.75">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#leadership-bg)"/>
        <rect width="1600" height="900" fill="url(#leadership-glow)"/>
        <g fill="rgba(255,255,255,0.94)">
          <circle cx="520" cy="330" r="82"/>
          <circle cx="800" cy="275" r="98"/>
          <circle cx="1080" cy="330" r="82"/>
          <path d="M360 690c0-120 95-216 212-216s212 96 212 216"/>
          <path d="M545 705c0-148 114-268 255-268s255 120 255 268"/>
          <path d="M812 690c0-120 95-216 212-216s212 96 212 216"/>
        </g>
        <path d="M180 760h1240" stroke="rgba(255,255,255,0.16)" stroke-width="22" stroke-linecap="round"/>
      </svg>
    `;

    let svg = '';
    if (variant === 'portrait') {
      svg = buildPortraitPlaceholder();
    } else if (variant === 'leadership') {
      svg = buildLeadershipPlaceholder();
    } else if (variant === 'hero') {
      svg = buildScenicPlaceholder('#07101f', '#123a8f', '#c79b4a');
    } else if (variant === 'gallery') {
      svg = buildScenicPlaceholder('#0f172a', '#2563eb', '#b98b3d');
    } else {
      svg = buildScenicPlaceholder('#0f172a', '#1d4ed8', '#94a3b8');
    }

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  qsa('img').forEach((img) => {
    const fallbackLabel = img.getAttribute('data-fallback-label') || img.getAttribute('alt') || 'Church image';
    const explicitVariant = img.getAttribute('data-fallback-variant');
    const variant = explicitVariant || (img.closest('.hero-slider')
      ? 'hero'
      : img.classList.contains('elders-img')
        ? 'leadership'
        : img.classList.contains('preacher-img')
          ? 'portrait'
          : img.closest('.gallery-card') || img.closest('.page-banner-media')
            ? 'gallery'
            : 'default');

    const applyFallback = () => {
      if (img.dataset.fallbackApplied === 'true') return;
      img.dataset.fallbackApplied = 'true';
      img.src = buildImagePlaceholder(fallbackLabel, variant);
      img.classList.add('is-placeholder');
    };

    img.addEventListener('error', applyFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) {
      applyFallback();
    }
  });

  const galleryCount = qs('[data-gallery-count]');
  if (galleryCount) galleryCount.textContent = String(qsa('.gallery-item').length);

  const lightbox = qs('#lightbox');
  const lightboxImage = qs('#lightbox-image') || qs('#lightbox-img');
  const lightboxTitle = qs('#lightbox-title');
  const lightboxCaption = qs('#lightbox-caption');
  const lightboxClose = qs('#lightbox-close') || qs('.lightbox-close') || qs('.lightbox .close');
  const lightboxPrev = qs('#lightbox-prev');
  const lightboxNext = qs('#lightbox-next');

  let lightboxItems = [];
  let activeLightboxItems = [];
  let lightboxIndex = 0;

  const normalizeGalleryItem = (node) => {
    const trigger = qs('[data-gallery-item]', node) || node;
    const image = qs('img', node) || (node.tagName === 'IMG' ? node : null);
    return {
      node,
      trigger,
      image,
      src: trigger.getAttribute('data-image') || image?.getAttribute('src') || '',
      title: trigger.getAttribute('data-title') || image?.getAttribute('alt') || 'Gallery image',
      caption: trigger.getAttribute('data-caption') || qs('p', node)?.textContent?.trim() || image?.getAttribute('alt') || ''
    };
  };

  const enhancedGalleryItems = qsa('.gallery-item');
  const basicGalleryImages = enhancedGalleryItems.length ? [] : qsa('.gallery-grid img');

  if (enhancedGalleryItems.length) {
    lightboxItems = enhancedGalleryItems.map(normalizeGalleryItem);
  } else if (basicGalleryImages.length) {
    lightboxItems = basicGalleryImages.map((img) => ({
      node: img,
      trigger: img,
      image: img,
      src: img.getAttribute('src') || '',
      title: img.getAttribute('alt') || 'Gallery image',
      caption: img.getAttribute('alt') || ''
    }));
  }

  const refreshActiveLightboxItems = () => {
    activeLightboxItems = lightboxItems.filter((item) => {
      if (!item.node) return false;
      if (item.node.classList.contains('is-hidden')) return false;
      return item.node.style.display !== 'none';
    });
  };

  const openLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    syncBodyLock();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImage) {
      lightboxImage.removeAttribute('src');
      lightboxImage.removeAttribute('alt');
    }
    syncBodyLock();
  };

  const showLightboxItem = (index) => {
    if (!lightbox || !activeLightboxItems.length) return;
    lightboxIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
    const item = activeLightboxItems[lightboxIndex];
    const fallbackVariant = item.image?.classList.contains('elders-img') ? 'leadership' : item.image?.classList.contains('preacher-img') ? 'portrait' : 'gallery';
    const resolvedSrc = item.image?.currentSrc || item.image?.src || item.src || buildImagePlaceholder(item.title, fallbackVariant);

    if (lightboxImage) {
      lightboxImage.src = resolvedSrc;
      lightboxImage.alt = item.title || item.caption || 'Gallery image';
      lightboxImage.onerror = () => {
        lightboxImage.src = buildImagePlaceholder(item.title || item.caption, 'gallery');
      };
    }

    if (lightboxTitle) lightboxTitle.textContent = item.title || 'Gallery image';
    if (lightboxCaption) lightboxCaption.textContent = item.caption || '';

    openLightbox();
  };

  const moveLightbox = (step) => {
    if (!lightbox || !activeLightboxItems.length) return;
    showLightboxItem(lightboxIndex + step);
  };

  lightboxItems.forEach((item) => {
    item.trigger.addEventListener('click', (event) => {
      if (item.trigger.tagName === 'A' || event.target.closest('a')) event.preventDefault();
      refreshActiveLightboxItems();
      const visibleIndex = activeLightboxItems.findIndex((entry) => entry.node === item.node);
      showLightboxItem(visibleIndex >= 0 ? visibleIndex : 0);
    });
  });

  const filterButtons = qsa('.filter-chip[data-filter]');
  const filterAliases = {
    all: ['all'],
    worship: ['worship'],
    fellowship: ['fellowship', 'community'],
    kids: ['kids', 'children', 'youth'],
    children: ['children', 'kids', 'youth'],
    leadership: ['leadership'],
    building: ['building', 'church'],
    community: ['community', 'fellowship', 'church']
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter') || 'all';
      const accepted = filterAliases[filter] || [filter];

      filterButtons.forEach((chip) => chip.classList.remove('active', 'is-active'));
      button.classList.add('active', 'is-active');

      lightboxItems.forEach((item) => {
        const categories = String(item.node.getAttribute('data-category') || '')
          .split(/\s+/)
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);

        const visible = filter === 'all' || accepted.some((value) => categories.includes(value));
        item.node.classList.toggle('is-hidden', !visible);
        item.node.style.display = visible ? '' : 'none';
      });

      refreshActiveLightboxItems();
    });
  });

  refreshActiveLightboxItems();

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => moveLightbox(-1));
  lightboxNext?.addEventListener('click', () => moveLightbox(1));

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLightbox();
      return;
    }

    if (!isLightboxOpen()) return;
    if (event.key === 'ArrowRight') moveLightbox(1);
    if (event.key === 'ArrowLeft') moveLightbox(-1);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeMenu();
    refreshFaqHeights();
  });

  qsa('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  setExternalLinkSafety();
  setupPhoneLinks();
  refreshFaqHeights();
  restoreHashTarget();
});
