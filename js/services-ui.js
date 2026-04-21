/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Services UI
   Renders homepage service tabs and services listing page from data.
   ═══════════════════════════════════════════════════════════ */

(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCategoryLabel(categoryKey) {
    var categories = window.SERVICE_CATEGORIES || [];
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].key === categoryKey) {
        return categories[i].label;
      }
    }
    return categoryKey;
  }

  function isPujaCategory(categoryKey) {
    return categoryKey === 'puja-remedies';
  }

  function getPujaCategories() {
    var categories = window.PUJA_CATEGORIES_DATA || [];
    return categories.slice();
  }

  function getPujaCategoryBySlug(slug) {
    if (typeof window.getPujaCategoryBySlug === 'function') {
      return window.getPujaCategoryBySlug(slug);
    }

    var categories = getPujaCategories();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].slug === slug) {
        return categories[i];
      }
    }

    return null;
  }

  function buildServiceCard(service) {
    var badgeHtml = service.badge
      ? '<span class="service-funnel-badge">' + escapeHtml(service.badge) + '</span>'
      : '';

    return '' +
      '<a class="service-funnel-card" data-category="' + escapeHtml(service.category) + '" href="/service?slug=' + encodeURIComponent(service.slug) + '">' +
        badgeHtml +
        '<div class="service-funnel-icon" aria-hidden="true">' + escapeHtml(service.icon) + '</div>' +
        '<h3 class="service-funnel-title">' + escapeHtml(service.title) + '</h3>' +
        '<p class="service-funnel-desc">' + escapeHtml(service.cardDescription) + '</p>' +
        '<div class="service-funnel-footer">' +
          '<span class="service-funnel-price">' + escapeHtml(service.priceText) + '</span>' +
          '<span class="service-funnel-arrow">View Details →</span>' +
        '</div>' +
      '</a>';
  }

  function buildPujaCategoryCard(category) {
    var pujaCountText = String(category.count || 0) + ' Pujas';

    return '' +
      '<a class="service-funnel-card puja-category-card" data-category="puja-remedies" href="/services/puja/' + encodeURIComponent(category.slug) + '">' +
        '<span class="service-funnel-badge">' + escapeHtml(pujaCountText) + '</span>' +
        '<div class="service-funnel-icon" aria-hidden="true">' + escapeHtml(category.icon || '🪔') + '</div>' +
        '<h3 class="service-funnel-title">' + escapeHtml(category.title) + '</h3>' +
        '<p class="service-funnel-desc">' + escapeHtml(category.description || '') + '</p>' +
        '<div class="service-funnel-footer">' +
          '<span class="service-funnel-price">' + escapeHtml(pujaCountText) + '</span>' +
          '<span class="service-funnel-arrow">Explore Pujas →</span>' +
        '</div>' +
      '</a>';
  }

  function getHomeAllPreviewServices() {
    var items = [];
    var previewSlugs = window.SERVICE_HOME_ALL_PREVIEW || [];

    for (var i = 0; i < previewSlugs.length; i++) {
      var previewToken = String(previewSlugs[i] || '');

      if (previewToken.indexOf('puja-category:') === 0) {
        var categorySlug = previewToken.slice('puja-category:'.length);
        var pujaCategory = getPujaCategoryBySlug(categorySlug);
        if (pujaCategory) {
          items.push({
            previewType: 'puja-category',
            data: pujaCategory
          });
        }
        continue;
      }

      var service = window.getServiceBySlug(previewToken);
      if (service) {
        items.push(service);
      }
    }

    return items;
  }

  function getHomeCategoryServices(category) {
    if (category === 'all') {
      return getHomeAllPreviewServices();
    }

    var limitMap = window.SERVICE_HOME_CATEGORY_LIMITS || {};
    var limit = limitMap[category] || 4;
    var services = window.getServicesByCategory(category);
    return services.slice(0, limit);
  }

  function initHomeServicesSection() {
    var tabsRoot = document.getElementById('homeServicesTabs');
    var grid = document.getElementById('homeServicesGrid');
    if (!tabsRoot || !grid || !window.SERVICES_DATA || !window.SERVICES_DATA.length) {
      return;
    }

    var countNode = document.getElementById('homeServicesCount');

    function render(category) {
      var cards = [];
      var noun = 'services';

      if (isPujaCategory(category)) {
        cards = getPujaCategories();
        noun = 'puja categories';
        grid.innerHTML = cards.map(buildPujaCategoryCard).join('');
      } else {
        cards = getHomeCategoryServices(category);
        noun = category === 'all' ? 'cards' : 'services';

        grid.innerHTML = cards.map(function (card) {
          if (card && card.previewType === 'puja-category' && card.data) {
            return buildPujaCategoryCard(card.data);
          }
          return buildServiceCard(card);
        }).join('');
      }

      if (countNode) {
        countNode.textContent = 'Showing ' + cards.length + ' ' + noun;
      }
    }

    tabsRoot.querySelectorAll('[data-service-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-service-tab') || 'all';
        tabsRoot.querySelectorAll('[data-service-tab]').forEach(function (tab) {
          tab.classList.remove('active');
        });
        btn.classList.add('active');
        render(category);
      });
    });

    render('all');
  }

  function buildListingGroup(categoryKey, items, cardBuilder) {
    if (!items.length) {
      return '';
    }

    var builder = cardBuilder || buildServiceCard;

    return '' +
      '<section class="services-list-group" data-group="' + escapeHtml(categoryKey) + '">' +
        '<h2 class="services-list-group-title">' + escapeHtml(getCategoryLabel(categoryKey)) + '</h2>' +
        '<div class="services-list-grid">' + items.map(builder).join('') + '</div>' +
      '</section>';
  }

  function initServicesListingPage() {
    var tabsRoot = document.getElementById('servicesListingTabs');
    var contentRoot = document.getElementById('servicesListingContent');
    if (!tabsRoot || !contentRoot || !window.SERVICES_DATA || !window.SERVICES_DATA.length) {
      return;
    }

    var countNode = document.getElementById('servicesListingCount');

    function renderAllGroups() {
      var groups = ['consultations', 'vastu', 'puja-remedies', 'kundli', 'reports'];
      var html = '';
      var total = 0;

      for (var i = 0; i < groups.length; i++) {
        var category = groups[i];

        if (isPujaCategory(category)) {
          var pujaCategories = getPujaCategories();
          total += pujaCategories.length;
          html += buildListingGroup(category, pujaCategories, buildPujaCategoryCard);
          continue;
        }

        var services = window.getServicesByCategory(category);
        total += services.length;
        html += buildListingGroup(category, services, buildServiceCard);
      }

      contentRoot.innerHTML = html;
      if (countNode) {
        countNode.textContent = total + ' entries available';
      }
    }

    function renderSingleGroup(category) {
      if (isPujaCategory(category)) {
        var pujaCategories = getPujaCategories();
        contentRoot.innerHTML = buildListingGroup(category, pujaCategories, buildPujaCategoryCard);

        if (countNode) {
          countNode.textContent = pujaCategories.length + ' puja categories in ' + getCategoryLabel(category);
        }
        return;
      }

      var services = window.getServicesByCategory(category);
      contentRoot.innerHTML = buildListingGroup(category, services, buildServiceCard);

      if (countNode) {
        countNode.textContent = services.length + ' services in ' + getCategoryLabel(category);
      }
    }

    function render(category) {
      if (category === 'all') {
        renderAllGroups();
        return;
      }
      renderSingleGroup(category);
    }

    tabsRoot.querySelectorAll('[data-list-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-list-tab') || 'all';

        tabsRoot.querySelectorAll('[data-list-tab]').forEach(function (tab) {
          tab.classList.remove('active');
        });
        btn.classList.add('active');

        render(category);
      });
    });

    var defaultCategory = 'all';
    var path = window.location.pathname || '';
    var hash = window.location.hash || '';
    
    if (path.indexOf('/services/puja') > -1 || path.indexOf('puja-remedies') > -1 || hash.indexOf('puja') > -1) {
      defaultCategory = 'puja-remedies';
    } else if (path.indexOf('/services/') > -1) {
      var possibleTab = path.split('/services/')[1].split('/')[0];
      if (['consultations', 'vastu', 'kundli', 'reports'].indexOf(possibleTab) > -1) {
         defaultCategory = possibleTab;
      }
    }

    var targetBtn = tabsRoot.querySelector('[data-list-tab="' + defaultCategory + '"]');
    if (targetBtn) {
      tabsRoot.querySelectorAll('[data-list-tab]').forEach(function (tab) {
        tab.classList.remove('active');
      });
      targetBtn.classList.add('active');
    }

    render(defaultCategory);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHomeServicesSection();
    initServicesListingPage();
  });
})();
