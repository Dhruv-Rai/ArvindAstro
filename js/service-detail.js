/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Service Detail Renderer
   Loads one service from query/path and renders trust-first detail sections.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var DEFAULTS_BY_CATEGORY = {
    consultations: {
      includes: [
        'Detailed one-on-one consultation focused on your priority concerns.',
        'Planetary timing analysis for decision clarity.',
        'Practical remedies and lifestyle suggestions.',
        'Follow-up guidance summary after the session.'
      ],
      process: [
        { title: 'Submit Details', body: 'Share required birth details and focus areas for analysis.' },
        { title: 'Chart Analysis', body: 'Your chart is reviewed deeply before the consultation.' },
        { title: 'Live Session', body: 'You receive clear guidance with actionable recommendations.' },
        { title: 'Follow-Up', body: 'Key suggestions are shared for implementation support.' }
      ],
      benefits: [
        'Clarity for major life decisions with practical timing insights.',
        'Personalized recommendations instead of generic predictions.',
        'Trust-based guidance from years of traditional practice.'
      ]
    },
    kundli: {
      includes: [
        'Divisional chart based interpretation based on selected format.',
        'Core strengths, challenges, and timing cycles.',
        'Focused insights for career, relationship, and health patterns.',
        'Remedial guidance aligned with your chart.'
      ],
      process: [
        { title: 'Data Review', body: 'Birth details are validated before chart analysis.' },
        { title: 'Deep Interpretation', body: 'Relevant divisional charts are studied in sequence.' },
        { title: 'Insight Delivery', body: 'Findings are explained in simple practical language.' },
        { title: 'Remedies', body: 'You receive category-specific corrective suggestions.' }
      ],
      benefits: [
        'More precise insight across life domains using divisional charts.',
        'Better understanding of repeating life patterns and timing.',
        'Practical remedies to support balance and progress.'
      ]
    },
    reports: {
      includes: [
        'Structured written analysis focused on your selected report type.',
        'Easy-to-read sections with timelines and observations.',
        'Important periods highlighted for planning.',
        'Remedy recommendations where relevant.'
      ],
      process: [
        { title: 'Submit Inputs', body: 'Share required details and report objective.' },
        { title: 'Analytical Draft', body: 'A focused astrological review is prepared.' },
        { title: 'Report Delivery', body: 'Your report is delivered in clear PDF format.' },
        { title: 'Clarification', body: 'You can ask key clarification questions after delivery.' }
      ],
      benefits: [
        'Reference-friendly format for repeated use over time.',
        'Clear direction with practical planning windows.',
        'Useful for clients preferring structured written output.'
      ]
    },
    vastu: {
      includes: [
        'Zone-wise vastu assessment of property or floor plan.',
        'Direction and element balance review.',
        'Practical non-demolition corrective suggestions.',
        'Priority roadmap for phased implementation.'
      ],
      process: [
        { title: 'Requirement Intake', body: 'Property context and issues are documented first.' },
        { title: 'Site/Plan Review', body: 'Detailed vastu analysis is performed by zone.' },
        { title: 'Recommendation', body: 'Corrective layout and remedy recommendations are shared.' },
        { title: 'Implementation Support', body: 'You receive practical guidance for applying changes.' }
      ],
      benefits: [
        'Improves alignment of space usage with vastu principles.',
        'Actionable corrections without unnecessary structural change.',
        'Useful for both residential and business properties.'
      ]
    },
    'puja-remedies': {
      includes: [
        'Service-specific ritual guidance based on your need.',
        'Muhurta-based scheduling and sankalp planning.',
        'Traditional ritual process with clear instructions.',
        'Post-ritual guidance for continued practice.'
      ],
      process: [
        { title: 'Consult & Confirm', body: 'Need and chart suitability are validated.' },
        { title: 'Ritual Planning', body: 'Puja scope, samagri, and muhurta are finalized.' },
        { title: 'Puja Execution', body: 'Ritual is conducted with proper vidhi and sankalp.' },
        { title: 'Aftercare Guidance', body: 'You receive follow-up spiritual instructions.' }
      ],
      benefits: [
        'Structured spiritual support during difficult periods.',
        'Traditional process aligned with purpose and timing.',
        'Clear guidance before and after ritual completion.'
      ]
    }
  };

  var DEFAULT_FAQS = [
    {
      q: 'Do I need exact birth time for this service?',
      a: 'Exact birth time improves accuracy, but useful guidance can still be provided with the closest known details.'
    },
    {
      q: 'Can I book this service from outside India?',
      a: 'Yes. Most services are available online and can be scheduled across time zones.'
    },
    {
      q: 'Will my personal data remain private?',
      a: 'Yes. Your personal details and consultation information are treated as strictly confidential.'
    }
  ];

  var DEFAULT_TESTIMONIALS = [
    {
      name: 'Monika Tyagi',
      location: 'London',
      text: 'Guidance was practical, clear and deeply accurate. The recommendations were easy to apply.'
    },
    {
      name: 'Clara Alibert',
      location: 'France',
      text: 'Very insightful session. Explanations were detailed and easy to understand even for first-time clients.'
    },
    {
      name: 'Adv. Kappil Cchandna',
      location: 'India',
      text: 'Consistent and trustworthy advice with a structured approach that builds confidence.'
    }
  ];

  var DEFAULT_HIGHLIGHT_CARDS = [
    {
      title: 'Personalized Guidance',
      description: 'Every reading is tailored to your exact context, priorities, and life stage.',
      image: '/public/images/services/[slug]-highlight-1.jpg'
    },
    {
      title: 'Structured Process',
      description: 'You receive a clear step-by-step flow so there is no confusion about outcomes.',
      image: '/public/images/services/[slug]-highlight-2.jpg'
    },
    {
      title: 'Actionable Direction',
      description: 'Practical recommendations are shared in simple language for immediate application.',
      image: '/public/images/services/[slug]-highlight-3.jpg'
    }
  ];

  var SERVICE_IMAGE_BASE_PATH = '/public/images/services/';
  var SERVICE_HERO_IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'JPG', 'PNG', 'WEBP'];
  var SERVICE_HIGHLIGHT_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG', 'WEBP'];
  var SERVICE_HERO_IMAGE_SUFFIXES = {
    chakraImage: ['chakra', 'chakra-bg'],
    personImage: ['person', 'subject-foreground']
  };
  var DEFAULT_HERO_IMAGE_BASES = {
    chakraImage: [
      'default-chakra',
      'default-chakra-bg',
      'kundali-horoscope-analysis-chakra',
      'kundali-horoscope-analysis-chakra-bg'
    ],
    personImage: [
      'default-person',
      'default-subject-foreground',
      'kundali-horoscope-analysis-person',
      'kundali-horoscope-analysis-subject-foreground'
    ]
  };
  var DEFAULT_HIGHLIGHT_IMAGE_BASES = [
    'default-highlight-1',
    'default-highlight-2',
    'default-highlight-3'
  ];
  var serviceHeroAssetCache = {};
  var serviceHighlightAssetCache = {};
  var imageProbeCache = {};
  var serviceHeroVisualComponent = null;
  var PRODUCT_TYPE_CATEGORIES = {
    kundli: true,
    reports: true,
    'puja-remedies': true
  };
  var serviceImageLightbox = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeSlug(slug) {
    return String(slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function isAbsoluteImagePath(path) {
    return /^(https?:)?\/\//.test(path) || path.indexOf('/') === 0;
  }

  function toServiceImagePath(path) {
    if (!path) {
      return '';
    }

    var result = isAbsoluteImagePath(path) ? path : SERVICE_IMAGE_BASE_PATH + path;
    return ensureAbsoluteImagePath(result);
  }

  function hasExtension(path) {
    return /\.[a-z0-9]+$/i.test(path || '');
  }

  function pushUnique(items, value) {
    if (value && items.indexOf(value) === -1) {
      items.push(value);
    }
  }

  function buildCandidatePaths(baseNames, extensions) {
    var candidates = [];
    var i;
    var j;

    for (i = 0; i < baseNames.length; i++) {
      var baseName = String(baseNames[i] || '').trim();
      if (!baseName) {
        continue;
      }

      if (hasExtension(baseName)) {
        pushUnique(candidates, toServiceImagePath(baseName));
        continue;
      }

      for (j = 0; j < extensions.length; j++) {
        pushUnique(candidates, toServiceImagePath(baseName + '.' + extensions[j]));
      }
    }

    return candidates;
  }

  function buildCustomImageCandidatePaths(imageValue, slug, extensions) {
    var raw = String(imageValue || '').trim();

    if (!raw) {
      return [];
    }

    var templated = raw;
    var normalizedSlug = normalizeSlug(slug);

    if (normalizedSlug) {
      templated = templated.replace(/\[slug\]/gi, normalizedSlug);
    }

    return buildCandidatePaths([templated], extensions);
  }

  function buildHeroAssetCandidatePaths(slug, propName) {
    var normalizedSlug = normalizeSlug(slug);
    var suffixes = SERVICE_HERO_IMAGE_SUFFIXES[propName] || [];
    var bases = [];

    if (!normalizedSlug) {
      return [];
    }

    for (var i = 0; i < suffixes.length; i++) {
      bases.push(normalizedSlug + '-' + suffixes[i]);
    }

    return buildCandidatePaths(bases, SERVICE_HERO_IMAGE_EXTENSIONS);
  }

  function buildDefaultHeroCandidatePaths(propName) {
    return buildCandidatePaths(DEFAULT_HERO_IMAGE_BASES[propName] || [], SERVICE_HERO_IMAGE_EXTENSIONS);
  }

  function buildHighlightAssetCandidatePaths(slug, index) {
    var normalizedSlug = normalizeSlug(slug);

    if (!normalizedSlug) {
      return [];
    }

    return buildCandidatePaths([
      normalizedSlug + '-highlight-' + index,
      normalizedSlug + '-' + index
    ], SERVICE_HIGHLIGHT_IMAGE_EXTENSIONS);
  }

  function buildDefaultHighlightCandidatePaths(index) {
    return buildCandidatePaths([DEFAULT_HIGHLIGHT_IMAGE_BASES[index - 1] || ''], SERVICE_HIGHLIGHT_IMAGE_EXTENSIONS);
  }

  function probeImage(path) {
    if (!path) {
      return Promise.resolve(null);
    }

    if (imageProbeCache[path]) {
      return imageProbeCache[path];
    }

    imageProbeCache[path] = new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(path); };
      img.onerror = function () { resolve(null); };
      img.src = path;
    });

    return imageProbeCache[path];
  }

  function resolveFirstAvailable(paths, idx) {
    if (idx >= paths.length) {
      return Promise.resolve(null);
    }

    return probeImage(paths[idx]).then(function (foundPath) {
      if (foundPath) {
        return foundPath;
      }
      return resolveFirstAvailable(paths, idx + 1);
    });
  }

  function getServiceHeroAssets(service, overrides) {
    var serviceSlug = service && service.slug ? service.slug : '';
    var normalizedSlug = normalizeSlug(serviceSlug);
    var serviceImages = service && service.heroImages ? service.heroImages : {};

    var chakraImage = (overrides && overrides.chakraImage) || serviceImages.chakraImage || '';
    var personImage = (overrides && overrides.personImage) || serviceImages.personImage || '';

    var cacheKey = [normalizedSlug, chakraImage, personImage].join('::');

    if (serviceHeroAssetCache[cacheKey]) {
      return serviceHeroAssetCache[cacheKey];
    }

    var chakraCandidates = []
      .concat(buildCustomImageCandidatePaths(chakraImage, serviceSlug, SERVICE_HERO_IMAGE_EXTENSIONS))
      .concat(buildHeroAssetCandidatePaths(serviceSlug, 'chakraImage'))
      .concat(buildDefaultHeroCandidatePaths('chakraImage'));

    var personCandidates = []
      .concat(buildCustomImageCandidatePaths(personImage, serviceSlug, SERVICE_HERO_IMAGE_EXTENSIONS))
      .concat(buildHeroAssetCandidatePaths(serviceSlug, 'personImage'))
      .concat(buildDefaultHeroCandidatePaths('personImage'));

    serviceHeroAssetCache[cacheKey] = Promise.all([
      resolveFirstAvailable(chakraCandidates, 0),
      resolveFirstAvailable(personCandidates, 0)
    ]).then(function (resolved) {
      return {
        chakraImage: resolved[0],
        personImage: resolved[1]
      };
    });

    return serviceHeroAssetCache[cacheKey];
  }

  function getServiceHighlightImages(service, cards) {
    var serviceSlug = service && service.slug ? service.slug : '';
    var normalizedSlug = normalizeSlug(serviceSlug);
    var signature = [];

    for (var i = 0; i < 3; i++) {
      signature.push(cards[i] && cards[i].image ? cards[i].image : '');
    }

    var cacheKey = normalizedSlug + '::' + signature.join('|');

    if (serviceHighlightAssetCache[cacheKey]) {
      return serviceHighlightAssetCache[cacheKey];
    }

    var jobs = [];
    for (var cardIndex = 0; cardIndex < 3; cardIndex++) {
      var configuredImage = cards[cardIndex] && cards[cardIndex].image ? cards[cardIndex].image : '';
      var candidates = []
        .concat(buildCustomImageCandidatePaths(configuredImage, serviceSlug, SERVICE_HIGHLIGHT_IMAGE_EXTENSIONS))
        .concat(buildHighlightAssetCandidatePaths(serviceSlug, cardIndex + 1))
        .concat(buildDefaultHighlightCandidatePaths(cardIndex + 1));

      jobs.push(resolveFirstAvailable(candidates, 0));
    }

    serviceHighlightAssetCache[cacheKey] = Promise.all(jobs);
    return serviceHighlightAssetCache[cacheKey];
  }

  function ServiceHeroVisual(elements) {
    this.wrap = elements && elements.wrap;
    this.chakra = elements && elements.chakra;
    this.person = elements && elements.person;
    this.fallback = elements && elements.fallback;
  }

  ServiceHeroVisual.prototype.render = function (props) {
    if (!this.wrap || !this.chakra || !this.person || !this.fallback) {
      return;
    }

    var chakraImage = props && props.chakraImage ? props.chakraImage : '';
    var personImage = props && props.personImage ? props.personImage : '';
    var personAlt = props && props.personAlt ? props.personAlt : '';
    var fallbackIcon = props && props.fallbackIcon ? props.fallbackIcon : '🪐';
    var hasAny = false;

    if (chakraImage) {
      hasAny = true;
      this.chakra.src = chakraImage;
      this.chakra.classList.add('is-visible');
    } else {
      this.chakra.removeAttribute('src');
      this.chakra.classList.remove('is-visible');
    }

    if (personImage) {
      hasAny = true;
      this.person.src = personImage;
      this.person.alt = personAlt;
      this.person.classList.add('is-visible');
    } else {
      this.person.removeAttribute('src');
      this.person.alt = '';
      this.person.classList.remove('is-visible');
    }

    this.wrap.classList.toggle('has-media', hasAny);

    if (hasAny) {
      this.fallback.classList.remove('is-visible');
    } else {
      this.fallback.textContent = fallbackIcon;
      this.fallback.classList.add('is-visible');
    }
  };

  function getServiceHeroVisualComponent() {
    if (serviceHeroVisualComponent) {
      return serviceHeroVisualComponent;
    }

    var wrap = document.getElementById('serviceHeroVisual');
    var chakra = document.getElementById('serviceHeroBg');
    var person = document.getElementById('serviceHeroSubject');
    var fallback = document.getElementById('serviceHeroFallback');

    if (!wrap || !chakra || !person || !fallback) {
      return null;
    }

    serviceHeroVisualComponent = new ServiceHeroVisual({
      wrap: wrap,
      chakra: chakra,
      person: person,
      fallback: fallback
    });

    return serviceHeroVisualComponent;
  }

  function getServiceImageLightbox() {
    if (serviceImageLightbox) {
      return serviceImageLightbox;
    }

    var overlay = document.createElement('div');
    overlay.className = 'service-image-lightbox';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = '' +
      '<div class="service-image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Service highlight image">' +
        '<button class="service-image-lightbox-close" type="button" aria-label="Close image preview">×</button>' +
        '<img class="service-image-lightbox-img" alt="">' +
      '</div>';

    document.body.appendChild(overlay);

    var closeButton = overlay.querySelector('.service-image-lightbox-close');
    var image = overlay.querySelector('.service-image-lightbox-img');

    function closeLightbox() {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('service-image-lightbox-open');
      if (image) {
        image.removeAttribute('src');
      }
    }

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    if (closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && overlay.classList.contains('is-active')) {
        closeLightbox();
      }
    });

    serviceImageLightbox = {
      overlay: overlay,
      image: image,
      close: closeLightbox
    };

    return serviceImageLightbox;
  }

  function openServiceImageLightbox(src, alt) {
    var lightbox = getServiceImageLightbox();
    if (!lightbox || !lightbox.image || !src) {
      return;
    }

    lightbox.image.src = src;
    lightbox.image.alt = alt || 'Service highlight image';
    lightbox.overlay.classList.add('is-active');
    lightbox.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('service-image-lightbox-open');
  }

  function shouldRenderHighlights(service) {
    return !(service && PRODUCT_TYPE_CATEGORIES[service.category]);
  }

  function toggleHighlightsVisibility(service) {
    var section = document.querySelector('.service-highlights-section');
    var grid = document.getElementById('serviceHighlightsGrid');
    if (!section) {
      return false;
    }

    var isVisible = shouldRenderHighlights(service);
    section.style.display = isVisible ? '' : 'none';

    if (!isVisible && serviceImageLightbox) {
      serviceImageLightbox.close();
    }

    if (!isVisible && grid) {
      grid.innerHTML = '';
    }

    return isVisible;
  }

  function shouldRenderSupportSections(service) {
    return !(service && service.category === 'puja-remedies');
  }

  function toggleSupportSectionsVisibility(service) {
    var testimonialSection = document.querySelector('.service-testimonials-section');
    var testimonialGrid = document.getElementById('serviceTestimonialsGrid');
    var faqSection = document.querySelector('.service-faq-layout');
    var faqRoot = document.getElementById('serviceFaqList');
    var isVisible = shouldRenderSupportSections(service);

    if (testimonialSection) {
      testimonialSection.style.display = isVisible ? '' : 'none';
    }

    if (faqSection) {
      faqSection.style.display = isVisible ? '' : 'none';
    }

    if (!isVisible && testimonialGrid) {
      testimonialGrid.innerHTML = '';
    }

    if (!isVisible && faqRoot) {
      faqRoot.innerHTML = '';
    }

    return isVisible;
  }

  window.ServiceHeroVisual = window.ServiceHeroVisual || ServiceHeroVisual;

  function normalizeHighlights(service) {
    var configured;

    if (service && service.highlights && service.highlights.length) {
      configured = service.highlights;
    } else if (service && service.highlightCards && service.highlightCards.length) {
      configured = service.highlightCards;
    } else {
      configured = DEFAULT_HIGHLIGHT_CARDS;
    }

    var cards = [];
    for (var i = 0; i < 3; i++) {
      var fallbackCard = DEFAULT_HIGHLIGHT_CARDS[i];
      var sourceCard = configured[i] || fallbackCard;

      cards.push({
        title: sourceCard.title || fallbackCard.title,
        description: sourceCard.description || fallbackCard.description,
        image: sourceCard.image || fallbackCard.image
      });
    }

    return cards;
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value || '';
  }

  /* ── BULLETPROOF SLUG EXTRACTOR ───────────────────────────────────────────
   * Priority: (1) ?slug= query param  (2) /service/<slug> path segment
   * (3) normalized scan of all path segments against SERVICES_DATA
   * Returns '' if nothing found — never silently defaults to SERVICES_DATA[0].
   * ─────────────────────────────────────────────────────────────────────────── */
  function getSlugFromLocation() {
    // 1. Query param — highest priority, works at any URL depth
    var params = new URLSearchParams(window.location.search || '');
    var querySlug = params.get('slug');
    if (querySlug && querySlug.trim()) {
      console.debug('[Router] slug from ?slug= param:', querySlug.trim());
      return decodeURIComponent(querySlug.trim());
    }

    // 2. /service/<slug> path convention
    var pathname = window.location.pathname || '';
    var parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'service') {
      var pathSlug = decodeURIComponent(parts[1]);
      console.debug('[Router] slug from /service/<slug> path:', pathSlug);
      return pathSlug;
    }

    // 3. Scan ALL path segments for a known service slug (handles /home-vastu-analysis style URLs)
    if (window.getServiceBySlug) {
      for (var i = parts.length - 1; i >= 0; i--) {
        var candidate = decodeURIComponent(parts[i]);
        if (candidate && window.getServiceBySlug(candidate)) {
          console.debug('[Router] slug found by path-scan at segment', i, ':', candidate);
          return candidate;
        }
      }
    }

    console.debug('[Router] No slug found in URL:', pathname + window.location.search);
    return '';
  }

  /* ── STRICT SERVICE LOOKUP WITH CATEGORY GUARD ────────────────────────────────
   * Returns null on miss — NEVER falls back to SERVICES_DATA[0].
   * If the found service is in the wrong category, logs an error and returns null
   * to prevent Vastu→Kundali misrouting.
   * ─────────────────────────────────────────────────────────────────────────── */
  function lookupServiceBySlug(slug, expectedCategory) {
    if (!slug) return null;

    // Step 1: exact match (preserves slugs with spaces/capitals)
    var exact = window.getServiceBySlug ? window.getServiceBySlug(slug) : null;
    if (exact) {
      // Category guard: if caller knows the expected category, validate it
      if (expectedCategory && exact.category !== expectedCategory) {
        console.error(
          '[Router] ⚠ Category mismatch! Slug "' + slug + '" found in category "' + exact.category +
          '" but expected "' + expectedCategory + '". Returning null to prevent cross-category contamination.'
        );
        return null;
      }
      console.debug('[Router] exact match "' + slug + '" → category:', exact.category);
      return exact;
    }

    // Step 2: normalised hyphen-lower match
    var norm = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (norm !== slug) {
      var byNorm = window.getServiceBySlug ? window.getServiceBySlug(norm) : null;
      if (byNorm) {
        if (expectedCategory && byNorm.category !== expectedCategory) {
          console.error('[Router] ⚠ Category mismatch on norm match "' + norm + '" → ' + byNorm.category + ' (expected ' + expectedCategory + ')');
          return null;
        }
        console.debug('[Router] normalised match "' + norm + '" → category:', byNorm.category);
        return byNorm;
      }
    }

    // Step 3: scan all SERVICES_DATA with normalised comparison
    var all = window.SERVICES_DATA || [];
    for (var i = 0; i < all.length; i++) {
      var svc = all[i];
      var svcNorm = String(svc.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (svcNorm === norm) {
        if (expectedCategory && svc.category !== expectedCategory) {
          console.error('[Router] ⚠ Category mismatch on scan match "' + slug + '" → ' + svc.category + ' (expected ' + expectedCategory + '). Skipping.');
          continue;
        }
        console.debug('[Router] scan match "' + slug + '" → slug:', svc.slug, 'category:', svc.category);
        return svc;
      }
    }

    // Confirmed miss — explicit warning in DevTools
    console.warn(
      '[Router] No service found for slug "' + slug + '"' +
      (expectedCategory ? ' in category "' + expectedCategory + '"' : '') + '.\n' +
      'This slug will NOT fall back to Kundali.\n' +
      'Known slugs:', all.map(function (s) { return s.slug; }).join(', ')
    );
    return null;
  }

  /* ── ABSOLUTE IMAGE PATH GUARD ─────────────────────────────────────────────
   * Ensures every image src starts with / so /service/* nested routes don't
   * resolve images as relative (causing 404s for Prashna, Birth Time, etc.).
   * ─────────────────────────────────────────────────────────────────────────── */
  function ensureAbsoluteImagePath(path) {
    if (!path) return '';
    var s = String(path).trim();
    if (/^https?:\/\//i.test(s) || s.indexOf('//') === 0) return s;
    if (s.charAt(0) === '/') return s;
    return '/' + s;
  }

  function getCategoryLabel(category) {
    var categories = window.SERVICE_CATEGORIES || [];
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].key === category) return categories[i].label;
    }
    return category;
  }

  function getBookingPrice(service) {
    var rawPrice = String(service && service.priceText ? service.priceText : '');
    var digitsOnly = rawPrice.replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      return 0;
    }

    var numericPrice = Number(digitsOnly);
    return isNaN(numericPrice) ? 0 : numericPrice;
  }

  function getBookingUrl(service) {
    if (service.bookingService) {
      var params = new URLSearchParams();
      params.set('startBooking', '1');
      params.set('bookingService', service.bookingService);
      params.set('bookingLabel', service.title || service.bookingService);
      params.set('bookingType', service.type || 'consultation');

      if (service.slug) {
        params.set('bookingSlug', service.slug);
      }

      var bookingPrice = getBookingPrice(service);
      if (bookingPrice > 0) {
        params.set('bookingPrice', String(bookingPrice));
      }

      return '/?' + params.toString() + '#services-section';
    }
    return '/#services-section';
  }

  function getMergedContent(service) {
    var defaults = DEFAULTS_BY_CATEGORY[service.category] || DEFAULTS_BY_CATEGORY.consultations;
    var highlights = normalizeHighlights(service);

    return {
      includes: service.includes && service.includes.length ? service.includes : defaults.includes,
      process: service.process && service.process.length ? service.process : defaults.process,
      highlights: highlights,
      highlightCards: highlights,
      faqs: service.faqs && service.faqs.length ? service.faqs : DEFAULT_FAQS,
      testimonials: service.testimonials && service.testimonials.length ? service.testimonials : DEFAULT_TESTIMONIALS
    };
  }

  function renderIncludes(items) {
    var list = document.getElementById('serviceIncludesList');
    if (!list) return;

    list.innerHTML = items.map(function (item) {
      return '' +
        '<li class="service-include-item">' +
          '<span class="service-include-icon" aria-hidden="true">✦</span>' +
          '<span>' + escapeHtml(item) + '</span>' +
        '</li>';
    }).join('');
  }

  function renderProcess(steps) {
    var root = document.getElementById('serviceProcessGrid');
    if (!root) return;

    root.innerHTML = steps.map(function (step, index) {
      return '' +
        '<article class="service-process-step">' +
          '<div class="service-process-number">' + (index + 1) + '</div>' +
          '<h3 class="service-process-title">' + escapeHtml(step.title) + '</h3>' +
          '<p class="service-process-text">' + escapeHtml(step.body) + '</p>' +
        '</article>';
    }).join('');
  }

  function renderHeroMedia(service) {
    var heroVisual = getServiceHeroVisualComponent();
    if (!heroVisual) return;

    getServiceHeroAssets(service).then(function (assets) {
      heroVisual.render({
        chakraImage: assets.chakraImage,
        personImage: assets.personImage,
        personAlt: service.title + ' foreground visual',
        fallbackIcon: service.icon || '🪐'
      });
    });
  }

  function renderHighlights(service, cards) {
    var root = document.getElementById('serviceHighlightsGrid');
    if (!root) return;

    getServiceHighlightImages(service, cards).then(function (mediaSources) {

      root.innerHTML = cards.map(function (card, idx) {
        var source = mediaSources[idx] || '';
        var mediaHtml = source
          ? '' +
            '<button class="service-highlight-media-trigger" type="button" data-highlight-src="' + escapeHtml(source) + '" data-highlight-alt="' + escapeHtml(card.title) + '">' +
              '<img src="' + escapeHtml(source) + '" alt="' + escapeHtml(card.title) + '" loading="lazy" decoding="async">' +
            '</button>'
          : '<div class="service-highlight-media-fallback" aria-hidden="true">' + escapeHtml(service.icon || '🪐') + '</div>';

        return '' +
          '<article class="service-highlight-card">' +
            '<div class="service-highlight-media">' +
              mediaHtml +
              '<div class="service-highlight-overlay"></div>' +
            '</div>' +
            '<div class="service-highlight-content">' +
              '<h3 class="service-highlight-title">' + escapeHtml(card.title) + '</h3>' +
              '<p class="service-highlight-desc">' + escapeHtml(card.description) + '</p>' +
            '</div>' +
          '</article>';
      }).join('');

      root.querySelectorAll('.service-highlight-media-trigger').forEach(function (button) {
        button.addEventListener('click', function () {
          openServiceImageLightbox(
            button.getAttribute('data-highlight-src') || '',
            button.getAttribute('data-highlight-alt') || 'Service highlight image'
          );
        });
      });
    });
  }

  function renderTestimonials(items) {
    var root = document.getElementById('serviceTestimonialsGrid');
    if (!root) return;

    root.innerHTML = items.map(function (item) {
      return '' +
        '<article class="service-testimonial-card">' +
          '<div class="service-testimonial-stars">★★★★★</div>' +
          '<p class="service-testimonial-text">"' + escapeHtml(item.text) + '"</p>' +
          '<div class="service-testimonial-author">' + escapeHtml(item.name) + ', ' + escapeHtml(item.location) + '</div>' +
        '</article>';
    }).join('');
  }

  function renderFaq(items) {
    var root = document.getElementById('serviceFaqList');
    if (!root) return;

    root.innerHTML = items.map(function (item, index) {
      var openClass = index === 0 ? ' open' : '';
      var showClass = index === 0 ? ' show' : '';

      return '' +
        '<div class="service-faq-item">' +
          '<button class="service-faq-question' + openClass + '" type="button">' +
            '<span>' + escapeHtml(item.q) + '</span><span class="service-faq-arrow">▾</span>' +
          '</button>' +
          '<div class="service-faq-answer' + showClass + '">' + escapeHtml(item.a) + '</div>' +
        '</div>';
    }).join('');

    root.querySelectorAll('.service-faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isOpen = btn.classList.contains('open');

        root.querySelectorAll('.service-faq-question').forEach(function (node) {
          node.classList.remove('open');
        });
        root.querySelectorAll('.service-faq-answer').forEach(function (node) {
          node.classList.remove('show');
        });

        if (!isOpen) {
          btn.classList.add('open');
          var answer = btn.nextElementSibling;
          if (answer) answer.classList.add('show');
        }
      });
    });
  }

  function renderRelated(service) {
    var root = document.getElementById('serviceRelatedGrid');
    if (!root || !window.SERVICES_DATA) return;

    var sameCategory = window.SERVICES_DATA.filter(function (item) {
      return item.category === service.category && item.slug !== service.slug;
    });

    var fallback = window.SERVICES_DATA.filter(function (item) {
      return item.slug !== service.slug && item.category !== service.category;
    });

    var related = sameCategory.slice(0, 3);
    var i = 0;
    while (related.length < 3 && i < fallback.length) {
      related.push(fallback[i]);
      i += 1;
    }

    root.innerHTML = related.map(function (item) {
      return '' +
        '<a class="service-related-card" href="/service?slug=' + encodeURIComponent(item.slug) + '">' +
          '<div class="service-related-icon" aria-hidden="true">' + escapeHtml(item.icon) + '</div>' +
          '<h3 class="service-related-title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="service-related-desc">' + escapeHtml(item.cardDescription) + '</p>' +
          '<div class="service-related-price">' + escapeHtml(item.priceText) + '</div>' +
        '</a>';
    }).join('');
  }

  function renderService(service) {
    var merged = getMergedContent(service);
    var bookingUrl = getBookingUrl(service);
    var canShowHighlights = toggleHighlightsVisibility(service);
    var canShowSupportSections = toggleSupportSectionsVisibility(service);

    document.title = service.title + ' | Arvind Rai — Vedic Astrologer';

    setText('serviceHeroCategory', getCategoryLabel(service.category));
    setText('serviceBreadcrumbCurrent', service.title);
    setText('serviceTitle', service.title);
    setText('serviceHeroDescription', service.heroDescription || service.cardDescription);
    setText('serviceDurationValue', service.duration || 'Every Question Answered');
    setText('servicePriceValue', service.priceText || 'As per requirement');
    setText('serviceModeValue', service.mode || 'Online / In Person');

    setText('serviceBookingServiceName', service.title);
    setText('serviceBookingPrice', service.priceText || 'As per requirement');

    var heroCta = document.getElementById('serviceHeroPrimaryCta');
    if (heroCta) heroCta.setAttribute('href', bookingUrl);

    var finalCta = document.getElementById('serviceFinalCta');
    if (finalCta) finalCta.setAttribute('href', bookingUrl);

    var pageRoot = document.getElementById('serviceDetailPage');
    if (pageRoot) {
      pageRoot.classList.remove('category-theme-consultations', 'category-theme-kundli', 'category-theme-reports', 'category-theme-vastu', 'category-theme-puja-remedies');
      pageRoot.classList.add('category-theme-' + service.category);
    }

    renderIncludes(merged.includes);
    renderProcess(merged.process);
    renderHeroMedia(service);
    if (canShowHighlights) {
      renderHighlights(service, merged.highlights);
    }
    if (canShowSupportSections) {
      renderTestimonials(merged.testimonials);
      renderFaq(merged.faqs);
    }
    renderRelated(service);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.SERVICES_DATA || !window.SERVICES_DATA.length) {
      return;
    }

    // Only run on the service detail page (guard against this script loading elsewhere)
    if (!document.getElementById('serviceDetailPage')) {
      return;
    }

    var slug = getSlugFromLocation();
    var service = lookupServiceBySlug(slug);

    if (!service) {
      // Slug was present but not recognised — show a clear not-found state.
      // Do NOT silently load SERVICES_DATA[0]; that causes Vastu→Kundali misrouting.
      if (slug) {
        console.error('[Router] Service "' + slug + '" not found. Rendering not-found state.');
        var titleEl = document.getElementById('serviceTitle');
        if (titleEl) titleEl.textContent = 'Service Not Found';
        var descEl = document.getElementById('serviceHeroDescription');
        if (descEl) descEl.textContent = 'The requested service could not be loaded. Please return to Services and try again.';
        var heroCtaEl = document.getElementById('serviceHeroPrimaryCta');
        if (heroCtaEl) { heroCtaEl.setAttribute('href', '/services'); heroCtaEl.textContent = 'Browse Services'; }
        return;
      }
      // No slug at all — load first service as a reasonable default
      service = window.SERVICES_DATA[0];
    }

    renderService(service);
  });
})();
