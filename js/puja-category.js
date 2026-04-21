/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Puja Category Page Renderer
   Renders one puja category page with adaptive puja grid.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var HERO_IMAGE_BASE_PATH = '/public/images/services/';
  var HERO_IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'JPG', 'PNG', 'WEBP'];
  var HIGHLIGHT_IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'JPG', 'PNG', 'WEBP'];
  var DEFAULT_HIGHLIGHT_IMAGE_BASES = [
    'default-highlight-1',
    'default-highlight-2',
    'default-highlight-3'
  ];
  var imageProbeCache = {};

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeSlug(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getPathCategorySlug() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 3 && parts[0] === 'services' && parts[1] === 'puja') {
      return normalizeSlug(decodeURIComponent(parts[2] || ''));
    }

    var query = new URLSearchParams(window.location.search || '');
    return normalizeSlug(query.get('category') || '');
  }

  function findPujaCategory(categorySlug) {
    if (typeof window.getPujaCategoryBySlug === 'function') {
      return window.getPujaCategoryBySlug(categorySlug);
    }

    var categories = window.PUJA_CATEGORIES_DATA || [];
    var normalized = normalizeSlug(categorySlug);

    for (var i = 0; i < categories.length; i++) {
      if (normalizeSlug(categories[i].slug) === normalized) {
        return categories[i];
      }
    }

    return null;
  }

  function findPujasByCategory(categorySlug) {
    if (typeof window.getPujasByCategory === 'function') {
      return window.getPujasByCategory(categorySlug);
    }

    var pujas = window.PUJA_ITEMS_DATA || [];
    var normalized = normalizeSlug(categorySlug);
    var result = [];

    for (var i = 0; i < pujas.length; i++) {
      if (normalizeSlug(pujas[i].category) === normalized) {
        result.push(pujas[i]);
      }
    }

    return result;
  }

  function setText(id, text) {
    var node = document.getElementById(id);
    if (node) {
      node.textContent = text || '';
    }
  }

  function buildCandidatePaths(baseNames, extensions) {
    var paths = [];
    for (var i = 0; i < baseNames.length; i++) {
      var baseName = String(baseNames[i] || '').trim();
      if (!baseName) {
        continue;
      }

      for (var extIndex = 0; extIndex < extensions.length; extIndex++) {
        paths.push(ensureAbsoluteImagePath(HERO_IMAGE_BASE_PATH + baseName + '.' + extensions[extIndex]));
      }
    }
    return paths;
  }

  function buildCustomImageCandidatePaths(configuredPath) {
    var rawPath = String(configuredPath || '').trim();
    if (!rawPath) {
      return [];
    }

    if (/^https?:\/\//i.test(rawPath) || rawPath.indexOf('/') === 0) {
      return [ensureAbsoluteImagePath(rawPath)];
    }

    if (rawPath.indexOf('.') > -1) {
      return [ensureAbsoluteImagePath(HERO_IMAGE_BASE_PATH + rawPath)];
    }

    return buildCandidatePaths([rawPath], HERO_IMAGE_EXTENSIONS);
  }

  function ensureAbsoluteImagePath(path) {
    if (!path) return '';
    var s = String(path).trim();
    if (/^https?:\/\//i.test(s) || s.indexOf('//') === 0) return s;
    if (s.charAt(0) === '/') return s;
    return '/' + s;
  }

  function buildHeroAssetCandidatePaths(categorySlug, typeKey) {
    var normalized = normalizeSlug(categorySlug);
    if (!normalized) {
      return [];
    }

    if (typeKey === 'chakra') {
      return buildCandidatePaths([
        normalized + '-chakra-bg',
        normalized + '-chakra'
      ], HERO_IMAGE_EXTENSIONS);
    }

    return buildCandidatePaths([
      normalized + '-person',
      normalized + '-subject-foreground'
    ], HERO_IMAGE_EXTENSIONS);
  }

  function buildDefaultHeroCandidatePaths(typeKey) {
    if (typeKey === 'chakra') {
      return buildCandidatePaths([
        'puja-remedies-chakra-bg',
        'kundali-horoscope-analysis-chakra-bg',
        'kundali-horoscope-analysis-chakra'
      ], HERO_IMAGE_EXTENSIONS);
    }

    return buildCandidatePaths([
      'puja-remedies-person',
      'kundali-horoscope-analysis-person',
      'kundali-horoscope-analysis-subject-foreground'
    ], HERO_IMAGE_EXTENSIONS);
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
      img.onload = function () {
        resolve(path);
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = path;
    });

    return imageProbeCache[path];
  }

  function resolveFirstAvailable(paths, idx) {
    if (idx >= paths.length) {
      return Promise.resolve(null);
    }

    return probeImage(paths[idx]).then(function (resolvedPath) {
      if (resolvedPath) {
        return resolvedPath;
      }
      return resolveFirstAvailable(paths, idx + 1);
    });
  }

  function getCategoryHeroAssets(category) {
    var heroImages = category && category.heroImages ? category.heroImages : {};
    var chakraCandidates = []
      .concat(buildCustomImageCandidatePaths(heroImages.chakraImage))
      .concat(buildHeroAssetCandidatePaths(category.slug, 'chakra'))
      .concat(buildDefaultHeroCandidatePaths('chakra'));

    var personCandidates = []
      .concat(buildCustomImageCandidatePaths(heroImages.personImage))
      .concat(buildHeroAssetCandidatePaths(category.slug, 'person'))
      .concat(buildDefaultHeroCandidatePaths('person'));

    return Promise.all([
      resolveFirstAvailable(chakraCandidates, 0),
      resolveFirstAvailable(personCandidates, 0)
    ]).then(function (resolved) {
      return {
        chakraImage: resolved[0],
        personImage: resolved[1]
      };
    });
  }

  function buildCategoryHighlightAssetCandidatePaths(categorySlug, index) {
    var normalized = normalizeSlug(categorySlug);
    if (!normalized) {
      return [];
    }

    return buildCandidatePaths([
      normalized + '-highlight-' + index,
      normalized + '-' + index
    ], HIGHLIGHT_IMAGE_EXTENSIONS);
  }

  function buildDefaultHighlightCandidatePaths(index) {
    return buildCandidatePaths([
      DEFAULT_HIGHLIGHT_IMAGE_BASES[index - 1] || ''
    ], HIGHLIGHT_IMAGE_EXTENSIONS);
  }

  function getCategoryHighlightImages(category, cards) {
    var jobs = [];

    for (var i = 0; i < 3; i++) {
      var configuredImage = cards[i] && cards[i].image ? cards[i].image : '';
      var candidates = []
        .concat(buildCustomImageCandidatePaths(configuredImage))
        .concat(buildCategoryHighlightAssetCandidatePaths(category.slug, i + 1))
        .concat(buildDefaultHighlightCandidatePaths(i + 1));

      jobs.push(resolveFirstAvailable(candidates, 0));
    }

    return Promise.all(jobs);
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
    var fallbackIcon = props && props.fallbackIcon ? props.fallbackIcon : '🪔';
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

  function getHeroVisual() {
    var wrap = document.getElementById('serviceHeroVisual');
    var chakra = document.getElementById('serviceHeroBg');
    var person = document.getElementById('serviceHeroSubject');
    var fallback = document.getElementById('serviceHeroFallback');

    if (!wrap || !chakra || !person || !fallback) {
      return null;
    }

    return new ServiceHeroVisual({
      wrap: wrap,
      chakra: chakra,
      person: person,
      fallback: fallback
    });
  }

  function renderHeroVisual(category) {
    var heroVisual = getHeroVisual();
    if (!heroVisual) {
      return;
    }

    heroVisual.render({
      chakraImage: '',
      personImage: '',
      personAlt: category.title,
      fallbackIcon: category.icon || '🪔'
    });

    getCategoryHeroAssets(category).then(function (assets) {
      heroVisual.render({
        chakraImage: assets.chakraImage,
        personImage: assets.personImage,
        personAlt: category.title,
        fallbackIcon: category.icon || '🪔'
      });
    });
  }

  function formatPrice(price) {
    if (price === null || price === undefined || price === '') {
      return 'As per requirement';
    }

    var numeric = Number(price);
    if (isNaN(numeric)) {
      return String(price);
    }

    return '₹ ' + numeric.toLocaleString('en-IN');
  }

  function buildPujaCard(puja) {
    return '' +
      '<a class="service-funnel-card puja-item-card" data-category="puja-remedies" href="/service?slug=' + encodeURIComponent(puja.slug) + '">' +
        '<span class="service-funnel-badge">Puja</span>' +
        '<div class="service-funnel-icon" aria-hidden="true">🪔</div>' +
        '<h3 class="service-funnel-title">' + escapeHtml(puja.name) + '</h3>' +
        '<p class="service-funnel-desc">' + escapeHtml(puja.description || '') + '</p>' +
        '<div class="service-funnel-footer">' +
          '<span class="service-funnel-price">' + escapeHtml(formatPrice(puja.price)) + '</span>' +
          '<span class="service-funnel-arrow">View Details →</span>' +
        '</div>' +
      '</a>';
  }

  function getCategoryHighlightCards(category) {
    var configured = category && category.highlights && category.highlights.length
      ? category.highlights
      : null;
    var cards = [];

    if (configured) {
      for (var idx = 0; idx < 3; idx++) {
        var cfgCard = configured[idx] || configured[0] || {};
        cards.push({
          title: cfgCard.title || 'Service Highlight',
          description: cfgCard.description || category.description || '',
          image: cfgCard.image || ''
        });
      }
      return cards;
    }

    var intro = category && category.intro ? category.intro : {};
    var solves = intro.solves || [];

    cards.push({
      title: 'Purpose Alignment',
      description: solves[0] || category.description || '',
      image: ''
    });
    cards.push({
      title: 'Guided Ritual Flow',
      description: solves[1] || intro.when || category.description || '',
      image: ''
    });
    cards.push({
      title: 'Actionable Direction',
      description: solves[2] || intro.who || category.description || '',
      image: ''
    });

    return cards;
  }

  function renderCategoryHighlights(category) {
    var root = document.getElementById('pujaCategoryHighlightsGrid');
    if (!root) {
      return;
    }

    var cards = getCategoryHighlightCards(category);
    getCategoryHighlightImages(category, cards).then(function (mediaSources) {
      root.innerHTML = cards.map(function (card, idx) {
        var source = mediaSources[idx] || '';
        var mediaHtml = source
          ? '<img src="' + escapeHtml(source) + '" alt="' + escapeHtml(card.title) + '" loading="lazy" decoding="async">'
          : '<div class="service-highlight-media-fallback" aria-hidden="true">' + escapeHtml(category.icon || '🪔') + '</div>';

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
    });
  }

  function applyGridLayout(grid, count) {
    grid.classList.remove('is-medium', 'is-compact-2', 'is-compact-3');

    if (count >= 4 && count <= 5) {
      grid.classList.add('is-medium');
      return;
    }

    if (count === 2) {
      grid.classList.add('is-compact-2');
      return;
    }

    if (count === 3) {
      grid.classList.add('is-compact-3');
    }
  }

  function renderSolveList(items) {
    var listNode = document.getElementById('pujaCategorySolveList');
    if (!listNode) {
      return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '' +
        '<li class="service-include-item">' +
          '<span class="service-include-icon">✦</span>' +
          '<span>' + escapeHtml(items[i]) + '</span>' +
        '</li>';
    }
    listNode.innerHTML = html;
  }

  function renderCategoryPage(category, categoryPujas) {
    setText('pujaCategoryEyebrow', 'Puja & Remedies');
    setText('pujaCategoryBreadcrumbCurrent', category.title);
    setText('pujaCategoryTitle', category.title);
    setText('pujaCategoryHeroDescription', category.heroDescription || category.description || '');
    setText('pujaCategoryMetaTitle', category.title);
    setText('pujaCategoryCount', String(categoryPujas.length));
    setText('pujaCategoryIntroLead', category.description || '');
    setText('pujaCategoryWhenToChoose', (category.intro && category.intro.when) || '');
    setText('pujaCategoryWhoShouldChoose', (category.intro && category.intro.who) || '');
    setText('pujaCategoryGridSubtitle', 'Showing ' + categoryPujas.length + ' puja options in this category.');
    setText('pujaBookingCategoryName', category.title);
    setText('pujaBookingCategoryCount', categoryPujas.length + ' Pujas Available');

    if (document.title) {
      document.title = category.title + ' Pujas | Arvind Rai — Vedic Astrologer & Vastu Shastri';
    }

    renderSolveList((category.intro && category.intro.solves) || []);
    renderHeroVisual(category);
    renderCategoryHighlights(category);

    var grid = document.getElementById('pujaCategoryGrid');
    if (grid) {
      applyGridLayout(grid, categoryPujas.length);
      grid.innerHTML = categoryPujas.map(buildPujaCard).join('');
    }
  }

  function initPujaCategoryPage() {
    var categories = window.PUJA_CATEGORIES_DATA || [];
    if (!categories.length) {
      return;
    }

    var slug = getPathCategorySlug();
    var category = findPujaCategory(slug) || categories[0];
    var categoryPujas = findPujasByCategory(category.slug);

    renderCategoryPage(category, categoryPujas);
  }

  document.addEventListener('DOMContentLoaded', initPujaCategoryPage);
})();
