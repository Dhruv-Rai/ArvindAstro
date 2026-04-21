/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Main JavaScript
   Navigation, FAQ, Media tabs, Scroll spy, EmailJS, Toasts
   ═══════════════════════════════════════════════════════════ */

// ── CONFIGURATION ──
// ENV: Set these values from your emailjs.com dashboard
const EMAILJS_SERVICE_ID  = 'service_gfnhize';
const EMAILJS_TEMPLATE_ID = 'template_l6y98hi';
const EMAILJS_PUBLIC_KEY  = 'Y7KM7ylznEmma8C66';

// ENV: Replace with Arvind Rai's WhatsApp number (digits only, no +)
const WHATSAPP_NUMBER = '917709240111';

// ENV: Google Maps API Key (optional — embed works without key for basic use)
const GOOGLE_MAPS_API_KEY = '';

// Backend API URL (change when deploying)
const API_BASE_URL = (window.location && window.location.origin && window.location.origin !== 'null')
  ? (window.location.origin + '/api')
  : '/api';

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  initEmailJS();
  initMobileNav();
  initScrollSpy();
  initGoogleMap();
  handleLegacyBookingQuery();
});

// ══════════════ EMAILJS INIT ══════════════
function initEmailJS() {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
}

// ══════════════ TOAST NOTIFICATIONS ══════════════
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);
  // Trigger animation
  setTimeout(function() { toast.classList.add('show'); }, 50);
  // Auto remove
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// ══════════════ SMOOTH SCROLL NAVIGATION ══════════════
function go(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Close mobile nav if open
  var navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('open');
}

// ══════════════ MOBILE NAV ══════════════
function initMobileNav() {
  var hamburger = document.getElementById('navHamburger');
  var navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        navLinks.classList.remove('open');
      });
    });
  }
}

// ══════════════ SCROLL SPY (dot nav + active link) ══════════════
function initScrollSpy() {
  var sections = ['hero','about','services','book','calc','media','gallery','blog','testi','contact'];
  var dots = document.querySelectorAll('.dot');

  window.addEventListener('scroll', function() {
    var cur = 0;
    sections.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 200) {
        cur = i;
      }
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === cur);
    });
  });
}

// ══════════════ VIDEO LIGHTBOX ══════════════
function openVideoLightbox(videoId, el) {
  var lightbox = document.getElementById('videoLightbox');
  var iframe = document.getElementById('videoIframe');
  if (lightbox && iframe) {
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&modestbranding=1';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // ← ADD: locks background scroll
  }
}

function closeVideoLightbox(e) {
  var lightbox = document.getElementById('videoLightbox');
  var iframe = document.getElementById('videoIframe');

  // ← CHANGED: only close if clicking backdrop or close button
  if (e && e.target !== lightbox && !e.target.classList.contains('video-lightbox-close')) return;

  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // ← ADD: unlocks background scroll
    if (iframe) iframe.src = ''; // ← keeps this — stops flickering & audio
  }
}

// Close video lightbox on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeVideoLightbox(null); // ← pass null so the target check is bypassed
    closeGalleryLightbox();
  }
});

// ══════════════ GALLERY TOGGLE & LIGHTBOX ══════════════
var galleryExpanded = false;

function toggleGallery() {
  var grid = document.getElementById('galleryGrid');
  var btn = document.getElementById('galleryToggleBtn');
  if (!grid || !btn) return;
  galleryExpanded = !galleryExpanded;
  if (galleryExpanded) {
    grid.classList.add('show-all');
    btn.textContent = '← Show Less';
  } else {
    grid.classList.remove('show-all');
    btn.textContent = 'View All Photos →';
  }
}

var galleryImages = [
  '/images/gallery-1.jpg', '/images/gallery-2.jpg', '/images/gallery-3.jpg',
  '/images/gallery-4.jpg', '/images/gallery-5.jpg', '/images/gallery-6.JPG',
  '/images/gallery-7.JPG', '/images/gallery-8.jpg', '/images/gallery-9.jpg',
  '/images/gallery-10.jpg', '/images/gallery-11.jpg', '/images/gallery-12.JPG'
];
var currentGalleryIndex = 0;

function openGalleryLightbox(index) {
  currentGalleryIndex = index;
  var lightbox = document.getElementById('galleryLightbox');
  var img = document.getElementById('galleryLbImg');
  if (lightbox && img) {
    img.src = galleryImages[index];
    lightbox.classList.add('active');
  }
}

function closeGalleryLightbox() {
  var lightbox = document.getElementById('galleryLightbox');
  if (lightbox) lightbox.classList.remove('active');
}

function galleryLightboxNav(dir) {
  currentGalleryIndex += dir;
  var total = galleryExpanded ? galleryImages.length : 6;
  if (currentGalleryIndex < 0) currentGalleryIndex = total - 1;
  if (currentGalleryIndex >= total) currentGalleryIndex = 0;
  var img = document.getElementById('galleryLbImg');
  if (img) img.src = galleryImages[currentGalleryIndex];
}

// ══════════════ FAQ ACCORDION ══════════════
function toggleFaq(el) {
  var ans = el.nextElementSibling;
  var isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(function(q) {
    q.classList.remove('open');
    q.nextElementSibling.classList.remove('show');
  });
  if (!isOpen) {
    el.classList.add('open');
    ans.classList.add('show');
  }
}

// ══════════════ CONTACT FORM (EmailJS) ══════════════
function submitContactForm(event) {
  event.preventDefault();
  var form = document.getElementById('contactForm');
  var btn = document.getElementById('contactSubmitBtn');
  var msgEl = document.getElementById('contactFormMsg');

  // Get form data
  var formData = new FormData(form);
  var data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message')
  };

  // Validate
  if (!data.name || !data.email || !data.subject || !data.message) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';

  // Check if EmailJS is configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    // Fallback: try sending to backend
    sendContactToBackend(data, form, btn, msgEl);
    return;
  }

  // Send via EmailJS
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name: data.name,
    from_email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message
  }).then(function() {
    showToast('Message sent successfully! We will get back to you soon.', 'success');
    msgEl.style.display = 'block';
    msgEl.style.color = '#2d7738';
    msgEl.textContent = '✓ Your message has been sent. We will reply within 24 hours.';
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Send Message ✦';
    // Also send to backend for logging
    sendContactToBackend(data, null, null, null);
  }, function(error) {
    showToast('Failed to send message. Please try again or contact via WhatsApp.', 'error');
    msgEl.style.display = 'block';
    msgEl.style.color = 'var(--red)';
    msgEl.textContent = '✗ Something went wrong. Please try WhatsApp instead.';
    btn.disabled = false;
    btn.textContent = 'Send Message ✦';
    console.error('EmailJS error:', error);
  });
}

function sendContactToBackend(data, form, btn, msgEl) {
  fetch(API_BASE_URL + '/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function(res) { return res.json(); })
  .then(function(result) {
    if (form) {
      showToast('Message sent successfully!', 'success');
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#2d7738';
        msgEl.textContent = '✓ Your message has been sent. We will reply within 24 hours.';
      }
      form.reset();
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Send Message ✦';
    }
  }).catch(function(err) {
    if (btn) {
      // If backend also fails, show graceful fallback
      showToast('Message could not be sent. Please contact via WhatsApp.', 'error');
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.color = 'var(--red)';
        msgEl.textContent = '✗ Server not available. Please try WhatsApp instead.';
      }
      btn.disabled = false;
      btn.textContent = 'Send Message ✦';
    }
  });
}

// ══════════════ GOOGLE MAP CONFIG ══════════════
function initGoogleMap() {
  if (GOOGLE_MAPS_API_KEY) {
    var iframe = document.getElementById('googleMapIframe');
    if (iframe) {
      // Use Maps Embed API with API key for Solan, Himachal Pradesh
      iframe.src = 'https://www.google.com/maps/embed/v1/place?key=' +
        encodeURIComponent(GOOGLE_MAPS_API_KEY) +
        '&q=Varanasi,Uttar+Pradesh,India&zoom=13';
    }
  }
  // If no API key, the default embed URL in HTML will be used (works without a key)
}

// ══════════════ LEGACY BOOKING QUERY HANDLER ══════════════
// Old links using ?service=...&focus=book are redirected to Services-first flow.
function handleLegacyBookingQuery() {
  var select = document.getElementById('bookService');
  if (!select || typeof URLSearchParams === 'undefined') return;

  var params = new URLSearchParams(window.location.search || '');
  var serviceFromQuery = params.get('service');
  var shouldFocusBook = params.get('focus') === 'book';

  if (serviceFromQuery) {
    var matched = false;

    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === serviceFromQuery) {
        select.value = serviceFromQuery;
        matched = true;
        break;
      }
    }

    if (matched) {
      // Dispatch after other DOMContentLoaded listeners bind select handlers.
      window.setTimeout(function () {
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, 0);
    }
  }

  if (serviceFromQuery || shouldFocusBook) {
    window.setTimeout(function () {
      var servicesSection = document.getElementById('services-section') || document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}
