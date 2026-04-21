/*
   Arvind Rai — Blog UI Renderer
   Renders homepage cards, listing page, and single dynamic read page.
*/

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text)));
  return div.innerHTML;
}

function getBlogPostByIdSafe(id) {
  if (typeof getBlogPostById === 'function') {
    return getBlogPostById(id);
  }

  var numericId = Number(id);
  if (!Array.isArray(BLOG_POSTS)) return null;

  for (var i = 0; i < BLOG_POSTS.length; i++) {
    if (BLOG_POSTS[i].id === numericId) {
      return BLOG_POSTS[i];
    }
  }

  return null;
}

function getCurrentPathSlug() {
  var path = window.location.pathname.replace(/\/+$/, '');
  var parts = path.split('/').filter(Boolean);

  if (parts.length >= 2 && parts[0] === 'blog') {
    return decodeURIComponent(parts.slice(1).join('/'));
  }

  return '';
}

function getReadParams() {
  var search = new URLSearchParams(window.location.search);
  return {
    id: search.get('id') || '',
    slug: search.get('slug') || getCurrentPathSlug()
  };
}

function normalizeContent(content) {
  if (Array.isArray(content)) {
    return content.filter(Boolean);
  }

  if (typeof content !== 'string' || !content.trim()) {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map(function(paragraph) { return paragraph.trim(); })
    .filter(function(paragraph) { return paragraph.length > 0; });
}

function buildBlogCard(post) {
  return '' +
    '<article class="blog-card" data-blog-id="' + escapeHtml(post.id) + '" tabindex="0" role="button" aria-label="Read ' + escapeHtml(post.title) + '">' +
      '<div class="blog-thumb">' +
        '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" onerror="this.style.display=\'none\'">' +
        '<div class="blog-thumb-icon">✦</div>' +
        '<div class="blog-thumb-tag">' + escapeHtml(post.tag || 'Featured') + '</div>' +
      '</div>' +
      '<div class="blog-card-body">' +
        '<div class="blog-cat">' + escapeHtml(post.category || 'Blog') + '</div>' +
        '<div class="blog-title">' + escapeHtml(post.title) + '</div>' +
        '<div class="blog-meta">' +
          '<span>' + escapeHtml(post.date || '') + '</span>' +
          '<span>' + escapeHtml(post.readTime || '') + '</span>' +
        '</div>' +
        '<p class="blog-summary">' + escapeHtml(post.summary || post.description || '') + '</p>' +
      '</div>' +
    '</article>';
}

function navigateToBlogRead(postId) {
  window.location.href = '/blogread?id=' + encodeURIComponent(postId);
}

function attachCardNavigation(root) {
  if (!root) return;

  var cards = root.querySelectorAll('[data-blog-id]');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      navigateToBlogRead(card.getAttribute('data-blog-id'));
    });

    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateToBlogRead(card.getAttribute('data-blog-id'));
      }
    });
  });
}

function renderHomeBlogCards() {
  var grid = document.getElementById('blogHomeGrid');
  if (!grid || !Array.isArray(BLOG_POSTS)) return;

  var posts = BLOG_POSTS.slice(0, 4);

  if (!posts.length) {
    grid.innerHTML = '<div class="blog-card"><p class="blog-summary">Blog content is being updated. Please check back soon.</p></div>';
    return;
  }

  grid.innerHTML = posts.map(buildBlogCard).join('');
  attachCardNavigation(grid);
}

function renderBlogListingPage() {
  var grid = document.getElementById('blogListingGrid');
  if (!grid || !Array.isArray(BLOG_POSTS)) return;

  var cards = BLOG_POSTS.map(function(post) {
    return '' +
      '<article class="blog-listing-card">' +
        '<div class="blog-listing-thumb">' +
          '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" onerror="this.style.display=\'none\'">' +
        '</div>' +
        '<div class="blog-listing-content">' +
          '<p class="blog-cat">' + escapeHtml(post.category || 'Blog') + '</p>' +
          '<h2 class="blog-listing-title">' + escapeHtml(post.title) + '</h2>' +
          '<p class="blog-listing-desc">' + escapeHtml(post.summary || post.description || '') + '</p>' +
          '<p class="blog-listing-meta">' + escapeHtml(post.date || '') + ' · ' + escapeHtml(post.readTime || '') + '</p>' +
          '<a class="blog-read-link" href="/blogread?id=' + encodeURIComponent(post.id) + '"><button class="btn-saffron" type="button" style="font-size:11px; padding:10px 20px;">Read More</button></a>' +
        '</div>' +
      '</article>';
  }).join('');

  grid.innerHTML = cards;
}

function renderBlogReadPage() {
  var root = document.getElementById('blogReadPage') || document.getElementById('blogPostPage');
  if (!root) return;

  var params = getReadParams();
  var post = null;

  if (params.id) {
    post = getBlogPostByIdSafe(params.id);
  }

  if (!post && params.slug && typeof getBlogPostBySlug === 'function') {
    post = getBlogPostBySlug(params.slug);
  }

  if (!post) {
    root.innerHTML = '' +
      '<article class="page-card">' +
        '<p class="page-eyebrow">✦ Knowledge Base</p>' +
        '<h1 class="page-title">Article Not Found</h1>' +
        '<p class="s-body" style="margin-bottom:18px;">The requested blog article is unavailable. Please return to the blog listing.</p>' +
        '<a href="/blog"><button class="btn-saffron" type="button">← Back to Blog</button></a>' +
      '</article>';
    return;
  }

  var contentBlocks = normalizeContent(post.content).map(function(paragraph) {
    return '<p>' + escapeHtml(paragraph) + '</p>';
  }).join('');

  root.innerHTML = '' +
    '<article class="blog-post-wrap">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb">' +
        '<a href="/">Home</a> / <a href="/blog">Blog</a> / <span>' + escapeHtml(post.title) + '</span>' +
      '</nav>' +
      '<div class="blog-feature-image">' +
        '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<p class="blog-cat">' + escapeHtml(post.category || 'Blog') + '</p>' +
      '<h1 class="page-title" style="margin-bottom:14px;">' + escapeHtml(post.title) + '</h1>' +
      '<p class="page-meta">' + escapeHtml(post.date || '') + ' · ' + escapeHtml(post.readTime || '') + '</p>' +
      '<div class="blog-post-content">' + contentBlocks + '</div>' +
    '</article>';

  document.title = post.title + ' | Arvind Rai Blog';
}

document.addEventListener('DOMContentLoaded', function() {
  renderHomeBlogCards();
  renderBlogListingPage();
  renderBlogReadPage();
});
