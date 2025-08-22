// app.js
// Tiny SPA Blog with hash routing + localStorage persistence
(() => {
  'use strict';

  /* ---------------------------
   * Utilities
   * --------------------------- */
  const LS_KEYS = {
    posts: 'blog.posts',
    comments: 'blog.comments',
    userLikes: 'blog.userLikes'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const navigate = (hash) => { location.hash = hash; };

  const formatDate = (iso) => {
    const d = new Date(iso);
    // e.g., "05 Aug 2025"
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const truncate = (text, n) => {
    const s = text ?? '';
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  };

  // Simple announce for aria-live region
  const announce = (msg) => {
    const live = $('#liveRegion');
    if (!live) return;
    live.textContent = msg;
  };

  // Read/Write JSON state from localStorage safely
  const getState = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const setState = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* ---------------------------
   * Seed Data
   * --------------------------- */
  const ensureSeed = () => {
    if (!getState(LS_KEYS.posts, null)) {
      const now = new Date();
      const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString();

      const posts = [
        {
          id: 'nebula-notes',
          title: 'Nebula Notes: Why Starry Nights Inspire Builders',
          author: 'A. Patel',
          summary: 'From backyard tinkering to breakthrough products, stargazing habits sneak into how we structure ideas, explore uncertainty, and ship with wonder.',
          content: `
            <h2>Notes from a Cold, Clear Night</h2>
            <p>Ever noticed how ideas arrive like constellations: scattered dots, then suddenly a pattern? We can design for that.</p>
            <ul>
              <li>Capture sparks fast.</li>
              <li>Connect them later.</li>
              <li>Share early, iterate often.</li>
            </ul>
            <pre><code>// "Ship small, shine often"
function sketch(){ return ["dot","dot","line"]; }</code></pre>
            <p><img src="https://picsum.photos/seed/nebula-notes/640/360" alt="Starry placeholder image"></p>
          `,
          thumbnail: 'https://picsum.photos/seed/nebula-notes/640/360',
          createdAt: daysAgo(24),
          updatedAt: daysAgo(21),
          views: 132,
          likes: 18
        },
        {
          id: 'biogas-101',
          title: 'Biogas 101: Turning Waste Into Watts',
          author: 'RenewaTech',
          summary: 'Biogas closes the loop between waste and energy. Here’s how feedstock, digester design, and policy make or break real projects in India.',
          content: `
            <h2>From Dung to Data</h2>
            <p>Biogas is a system, not a silo: feedstock logistics, digester geometry, gas clean-up, and end-use demand.</p>
            <p><strong>Pro tip:</strong> Design for variability; feedstock isn't a constant.</p>
            <ul>
              <li>Feedstock mix matters.</li>
              <li>Instrumentation reduces downtime.</li>
              <li>Policy unlocks scale.</li>
            </ul>
            <p><img src="https://picsum.photos/seed/biogas-101/640/360" alt="Biogas placeholder image"></p>
          `,
          thumbnail: 'https://picsum.photos/seed/biogas-101/640/360',
          createdAt: daysAgo(30),
          updatedAt: daysAgo(11),
          views: 420,
          likes: 56
        },
        {
          id: 'angular-forms',
          title: 'Tiny Patterns for Better Forms',
          author: 'DevStruggleSaga',
          summary: 'Micro-interactions reduce friction: inline validation, keyboard-first flows, and resilient UI states for offline and slow networks.',
          content: `
            <h2>Form Finesse</h2>
            <p>Start with the "happy path", then make it bulletproof: latency, loss, and user error.</p>
            <pre><code>const valid = (v) => !!v?.trim();
if(!valid(name)) show("Name required");</code></pre>
            <p><img src="https://picsum.photos/seed/angular-forms/640/360" alt="UI form placeholder"></p>
          `,
          thumbnail: 'https://picsum.photos/seed/angular-forms/640/360',
          createdAt: daysAgo(18),
          updatedAt: daysAgo(9),
          views: 201,
          likes: 33
        },
        {
          id: 'solar-dusk',
          title: 'At Dusk with Solar: Lessons After Sunset',
          author: 'SustainaPower',
          summary: 'Storage sizing, demand shifting, and O&M discipline decide whether solar keeps promises beyond the golden hour.',
          content: `
            <h2>When the Sun Goes Home</h2>
            <p>Storage is not a logo; it’s math. Start with load profiles, not marketing PDFs.</p>
            <ul>
              <li>Audit real loads.</li>
              <li>Plan for seasonality.</li>
              <li>Monitor, then optimize.</li>
            </ul>
            <p><img src="https://picsum.photos/seed/solar-dusk/640/360" alt="Solar at dusk placeholder"></p>
          `,
          thumbnail: 'https://picsum.photos/seed/solar-dusk/640/360',
          createdAt: daysAgo(15),
          updatedAt: daysAgo(7),
          views: 158,
          likes: 22
        },
        {
          id: 'clean-apis',
          title: 'Clean APIs in Messy Reality',
          author: 'Raviesha Tech',
          summary: 'Boundaries are kindness. Learn to say "no" with types, timeouts, and tests when every integration is a little chaotic.',
          content: `
            <h2>Interfaces as Promises</h2>
            <p>APIs should degrade gracefully. Timeouts are features. Idempotency saves weekends.</p>
            <pre><code>POST /v1/orders (idempotency-key: 123)
200 OK {orderId:"..."} // safe to retry</code></pre>
          `,
          thumbnail: 'https://picsum.photos/seed/clean-apis/640/360',
          createdAt: daysAgo(10),
          updatedAt: daysAgo(5),
          views: 305,
          likes: 47
        },
        {
          id: 'ship-small',
          title: 'Ship Small, Learn Fast',
          author: 'Abhijeet Patil',
          summary: 'Reduce batch size to increase truth. Shorter cycles surface what users value and what you should delete.',
          content: `
            <h2>Speed is a Teacher</h2>
            <p>Small releases are honest. They reveal rough edges while stakes are low.</p>
            <p><img src="https://picsum.photos/seed/ship-small/640/360" alt="Minimalist placeholder image"></p>
          `,
          thumbnail: 'https://picsum.photos/seed/ship-small/640/360',
          createdAt: daysAgo(6),
          updatedAt: daysAgo(2),
          views: 96,
          likes: 14
        }
      ];

      setState(LS_KEYS.posts, posts);
    }

    if (!getState(LS_KEYS.comments, null)) {
      const comments = {
        'biogas-101': [
          { id:'c1', name:'Priya', text:'Super practical overview!', createdAt: new Date().toISOString() }
        ],
        'clean-apis': [
          { id:'c2', name:'Kunal', text:'That idempotency example saved me once.', createdAt: new Date().toISOString() }
        ]
      };
      setState(LS_KEYS.comments, comments);
    }
    if (!getState(LS_KEYS.userLikes, null)) {
      setState(LS_KEYS.userLikes, {}); // { [postId]: boolean }
    }
  };

  /* ---------------------------
   * Global (UI) State kept in URL params to preserve Back/Forward
   * --------------------------- */
  let currentMode = 'latest';   // 'latest' | 'trending'
  let currentSearch = '';       // search query

  const readParams = (hash) => {
    const query = hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    return Object.fromEntries(params.entries());
  };

  const writeListHash = () => {
    const p = new URLSearchParams();
    p.set('mode', currentMode);
    if (currentSearch) p.set('search', currentSearch);
    return `#/?${p.toString()}`;
  };

  /* ---------------------------
   * Data Accessors
   * --------------------------- */
  const getPosts = () => getState(LS_KEYS.posts, []);
  const setPosts = (arr) => setState(LS_KEYS.posts, arr);

  const getCommentsMap = () => getState(LS_KEYS.comments, {});
  const setCommentsMap = (map) => setState(LS_KEYS.comments, map);

  const getUserLikes = () => getState(LS_KEYS.userLikes, {});
  const setUserLikes = (map) => setState(LS_KEYS.userLikes, map);

  const getCommentCount = (postId) => {
    const map = getCommentsMap();
    return (map[postId] || []).length;
  };

  /* ---------------------------
   * Sorting / Filtering
   * --------------------------- */
  const sortTrending = (a, b) => {
    // likes desc, then views desc, then updatedAt desc
    if (b.likes !== a.likes) return b.likes - a.likes;
    if (b.views !== a.views) return b.views - a.views;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  };
  const sortLatest = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

  const applySearchFilter = (posts, q) => {
    if (!q) return posts;
    const needle = q.trim().toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(needle) || p.author.toLowerCase().includes(needle));
  };

  /* ---------------------------
   * Rendering - List
   * --------------------------- */
  const renderList = () => {
    const app = $('#app');
    const all = getPosts();
    const filtered = applySearchFilter(all, currentSearch);
    const sorted = [...filtered].sort(currentMode === 'trending' ? sortTrending : sortLatest);

    app.innerHTML = `
      <section aria-label="Blog list">
        ${sorted.length === 0 ? `
          <div class="empty">No posts match your search.</div>
        ` : `
          <div class="grid">
            ${sorted.map(p => `
              <article class="card" tabindex="0" role="button" aria-label="Open post ${p.title}" data-id="${p.id}">
                <div class="card-thumb">
                  <img src="${p.thumbnail}" alt="Thumbnail for ${p.title}">
                </div>
                <div class="card-body">
                  <h3 class="card-title">${p.title}</h3>
                  <p class="card-summary">${truncate(p.summary, 120)}</p>
                  <div class="card-meta">
                    <span class="badge"><span class="i">👤</span> ${p.author}</span>
                    <span class="badge"><span class="i">🗓️</span> Updated ${formatDate(p.updatedAt)}</span>
                    <span class="badge" title="Likes"><span class="i">❤️</span> ${p.likes}</span>
                    <span class="badge" title="Comments"><span class="i">💬</span> ${getCommentCount(p.id)}</span>
                    <span class="badge" title="Views"><span class="i">👁️</span> ${p.views}</span>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        `}
      </section>
    `;

    // Card interactions: click or Enter key
    $$('.card', app).forEach(card => {
      const id = card.getAttribute('data-id');
      const params = new URLSearchParams();
      params.set('mode', currentMode);
      if (currentSearch) params.set('search', currentSearch);
      const detailHash = `#/post/${encodeURIComponent(id)}?${params.toString()}`;

      const open = () => navigate(detailHash);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });

    // Ensure header controls reflect state
    updateHeaderControls();
  };

  const updateHeaderControls = () => {
    // Toggle buttons pressed state
    const latestBtn = $('#btn-latest');
    const trendingBtn = $('#btn-trending');
    if (latestBtn && trendingBtn) {
      latestBtn.setAttribute('aria-pressed', String(currentMode === 'latest'));
      trendingBtn.setAttribute('aria-pressed', String(currentMode === 'trending'));
    }
    // Search input value
    const searchInput = $('#searchInput');
    if (searchInput && searchInput.value !== currentSearch) {
      searchInput.value = currentSearch;
    }
  };

  /* ---------------------------
   * Rendering - Detail
   * --------------------------- */
  const renderDetail = (postId, sourceParams) => {
    const app = $('#app');
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) {
      app.innerHTML = `<div class="empty">Post not found. <a href="#/">Go back</a></div>`;
      return;
    }

    // Increment views when opened
    post.views += 1;
    setPosts(posts);

    const userLikes = getUserLikes();
    const isLiked = !!userLikes[post.id];

    // Render detail
    app.innerHTML = `
      <article class="detail" aria-label="Blog post detail">
        <div class="detail-header">
          <h1 class="detail-title">${post.title}</h1>
          <div class="detail-meta">
            <span><span class="i">👤</span> ${post.author}</span>
            <span><span class="i">🗓️</span> Created ${formatDate(post.createdAt)}</span>
            <span><span class="i">🔁</span> Updated ${formatDate(post.updatedAt)}</span>
            <span title="Views"><span class="i">👁️</span> ${post.views}</span>
            <span title="Likes"><span class="i">❤️</span> <span id="likeCount" class="like-count">${post.likes}</span></span>
          </div>
          <div class="detail-actions">
            <button id="backBtn" class="btn" type="button">← Back</button>
            <button id="likeBtn" class="btn like-btn" type="button" aria-pressed="${isLiked}" aria-label="Toggle like">
              ${isLiked ? '❤️ Liked' : '🤍 Like'}
            </button>
          </div>
        </div>

        <div class="post-content">${post.content}</div>

        <section class="comments" aria-label="Comments">
          <h2>Comments (${getCommentCount(post.id)})</h2>
          <div id="commentList">
            ${renderCommentsHTML(post.id)}
          </div>

          <form id="commentForm" class="comment-form" novalidate>
            <div class="field">
              <label for="nameInput">Name <span aria-hidden="true">*</span></label>
              <input id="nameInput" name="name" type="text" required autocomplete="name" />
            </div>
            <div class="field">
              <label for="textInput">Comment <span aria-hidden="true">*</span></label>
              <textarea id="textInput" name="text" required></textarea>
            </div>
            <div>
              <button class="btn primary" type="submit">Submit Comment</button>
            </div>
          </form>
        </section>
      </article>
    `;

    // Back button returns to list with same sort/search
    $('#backBtn')?.addEventListener('click', () => {
      // Prefer params from the link if present; else use current globals
      const mode = sourceParams?.mode || currentMode;
      const search = sourceParams?.search || currentSearch;
      currentMode = mode;
      currentSearch = search || '';
      navigate(`#/?${new URLSearchParams({ mode, ...(search ? { search } : {}) }).toString()}`);
    });

    // Like logic
    const likeBtn = $('#likeBtn');
    likeBtn?.addEventListener('click', () => {
      const postsNow = getPosts();
      const p = postsNow.find(pp => pp.id === post.id);
      const likesMap = getUserLikes();
      const liked = !!likesMap[post.id];
      // Toggle
      likesMap[post.id] = !liked;
      p.likes += liked ? -1 : 1;
      setUserLikes(likesMap);
      setPosts(postsNow);
      // Update UI instantly
      $('#likeCount').textContent = String(p.likes);
      likeBtn.setAttribute('aria-pressed', String(!liked));
      likeBtn.textContent = !liked ? '❤️ Liked' : '🤍 Like';
      announce(`Likes ${!liked ? 'increased' : 'decreased'} to ${p.likes}`);
    });

    // Comment form handling
    $('#commentForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#nameInput').value.trim();
      const text = $('#textInput').value.trim();
      if (!name || !text) {
        announce('Please enter your name and a comment.');
        // Basic invalid styling using native validity if needed
        if (!name) $('#nameInput').focus();
        else if (!text) $('#textInput').focus();
        return;
      }
      const map = getCommentsMap();
      const arr = map[post.id] || [];
      const newComment = {
        id: 'c_' + Math.random().toString(36).slice(2, 9),
        name,
        text,
        createdAt: new Date().toISOString()
      };
      arr.unshift(newComment);
      map[post.id] = arr;
      setCommentsMap(map);

      // Clear form and re-render comments
      $('#nameInput').value = '';
      $('#textInput').value = '';
      $('#commentList').innerHTML = renderCommentsHTML(post.id);

      // Update header count next to title
      const h2 = $('section.comments h2');
      if (h2) h2.textContent = `Comments (${arr.length})`;

      announce('Comment added.');
    });
  };

  const renderCommentsHTML = (postId) => {
    const map = getCommentsMap();
    const list = (map[postId] || []);
    if (list.length === 0) {
      return `<div class="empty">Be the first to comment.</div>`;
    }
    return list.map(c => `
      <article class="comment">
        <div class="who">${c.name}</div>
        <div class="when">${formatDate(c.createdAt)}</div>
        <p>${escapeHTML(c.text)}</p>
      </article>
    `).join('');
  };

  // Minimal HTML escape for user-submitted comments
  const escapeHTML = (s) => s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  /* ---------------------------
   * Router
   * --------------------------- */
  const parseHash = () => {
    const hash = location.hash || '#/';
    const [path, query] = hash.split('?');
    const params = new URLSearchParams(query || '');
    const route = path.replace(/^#/, '');
    const segments = route.split('/').filter(Boolean); // e.g., ['post','id'] or []
    return { path, segments, params };
  };

  const syncHeaderVisibility = () => {
    // On detail view we keep controls visible (requirement says header includes them),
    // but they only affect list rendering. We still allow typing a search, which will
    // be preserved and used when user goes back.
  };

  const router = () => {
    const { segments, params } = parseHash();

    // Update global state from params (so deep-links preserve mode/search)
    const modeParam = params.get('mode');
    const searchParam = params.get('search') || '';
    if (modeParam === 'trending' || modeParam === 'latest') currentMode = modeParam;
    if (typeof searchParam === 'string') currentSearch = searchParam;

    // Keep header controls in sync regardless of view
    updateHeaderControls();
    syncHeaderVisibility();

    if (segments.length === 0) {
      // "#/" or "#"
      renderList();
    } else if (segments[0] === '' || segments[0] === '/') {
      renderList();
    } else if (segments[0] === 'post' && segments[1]) {
      renderDetail(decodeURIComponent(segments[1]), Object.fromEntries(params.entries()));
    } else {
      // Fallback
      navigate(writeListHash());
    }
  };

  /* ---------------------------
   * Header control events
   * --------------------------- */
  const bindHeaderControls = () => {
    $('#btn-latest')?.addEventListener('click', () => {
      currentMode = 'latest';
      // Update URL to preserve state
      navigate(writeListHash());
      renderList();
      announce('Sorted by latest.');
    });
    $('#btn-trending')?.addEventListener('click', () => {
      currentMode = 'trending';
      navigate(writeListHash());
      renderList();
      announce('Sorted by trending.');
    });
    $('#searchInput')?.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      // Keep hash synced as user types (so Back preserves it)
      navigate(writeListHash());
      // Re-render if on list, otherwise do nothing until back
      if ((location.hash || '#/').startsWith('#/')) {
        const { segments } = parseHash();
        if (segments.length === 0 || segments[0] === '' || segments[0] === '/') {
          renderList();
        }
      }
    });
  };

  /* ---------------------------
   * Init
   * --------------------------- */
  const init = () => {
    ensureSeed();
    bindHeaderControls();
    window.addEventListener('hashchange', router);
    router();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
