(() => {
  'use strict';
  // Preserve links to sections and papers from the previous single-page site.
  if (location.pathname === '/' || location.pathname === '/index.html') {
    const anchor = location.hash.slice(1);
    let movedTo = '';
    if (['publications', 'selected-work'].includes(anchor)) movedTo = '/research/';
    else if (anchor.startsWith('pub-') && !document.getElementById(anchor)) movedTo = '/research/';
    else if (['experience', 'service', 'talks', 'contact'].includes(anchor)) movedTo = '/about/';
    if (movedTo) {
      const destination = new URL(movedTo, location.origin);
      destination.search = location.search;
      if (!['publications', 'selected-work'].includes(anchor)) destination.hash = location.hash;
      location.replace(destination.href);
      return;
    }
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reducedMotion;
  const videos = [...document.querySelectorAll('video[data-src]')];
  function pauseVideo(video) { video.pause(); video.classList.remove('is-playing'); }
  function playVideo(video) {
    if (paused || document.hidden || video.closest('[hidden]')) return;
    if (!video.src) video.src = video.dataset.src;
    video.muted = true;
    video.play().then(() => video.classList.add('is-playing')).catch(() => {});
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      target.dataset.visible = isIntersecting ? 'true' : 'false';
      isIntersecting ? playVideo(target) : pauseVideo(target);
    });
  }, { threshold: 0.2 });
  videos.forEach(video => observer.observe(video));
  const motionButtons = document.querySelectorAll('[data-motion-toggle]');
  function reflectMotionState() {
    motionButtons.forEach(button => {
      button.textContent = paused ? 'Play previews' : 'Pause previews';
      button.setAttribute('aria-pressed', String(paused));
    });
  }
  reflectMotionState();
  motionButtons.forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    reflectMotionState();
    videos.forEach(video => paused ? pauseVideo(video) : video.dataset.visible === 'true' && playVideo(video));
  }));
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => document.hidden ? pauseVideo(video) : video.dataset.visible === 'true' && playVideo(video));
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  const papers = [...document.querySelectorAll('.pub')];
  const lifeFocus = document.querySelector('.life-focus');
  function filterPapers(filter, updateUrl = false) {
    const allowed = filters.map(button => button.dataset.filter);
    if (!allowed.includes(filter)) filter = 'highlights';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    papers.forEach(paper => {
      paper.hidden = !(filter === 'all' || filter === 'highlights' && paper.dataset.hl === '1' || paper.dataset.domain === filter);
      if (paper.hidden) paper.querySelectorAll('video').forEach(pauseVideo);
      else paper.querySelectorAll('video').forEach(video => { if (video.dataset.visible === 'true') playVideo(video); });
    });
    if (lifeFocus) lifeFocus.hidden = filter !== 'life';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('topic', filter);
      url.hash = '';
      history.replaceState(null, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => filterPapers(button.dataset.filter, true)));
  if (filters.length) {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    const topic = new URLSearchParams(location.search).get('topic');
    filterPapers(topic || (target?.classList.contains('pub') ? 'all' : 'highlights'));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
  document.querySelectorAll('.summary-toggle').forEach(button => button.addEventListener('click', () => {
    const text = document.getElementById(button.getAttribute('aria-controls'));
    if (!text) return;
    text.hidden = !text.hidden;
    button.setAttribute('aria-expanded', String(!text.hidden));
  }));
  const dialog = document.querySelector('.lightbox');
  if (dialog) {
    document.querySelectorAll('.figure-open').forEach(button => button.addEventListener('click', () => {
      dialog.querySelector('h2').textContent = button.dataset.title || 'Research figure';
      const image = dialog.querySelector('img');
      image.src = button.dataset.full || button.querySelector('img').src;
      image.alt = button.dataset.title || 'Research figure';
      dialog.querySelector('.caption').textContent = button.dataset.caption || '';
      [['source', button.dataset.source], ['paper', button.dataset.paper]].forEach(([name, url]) => {
        const link = dialog.querySelector('[data-image-' + name + ']');
        link.hidden = !url;
        if (url) link.href = url;
      });
      dialog.showModal();
    }));
    dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  }
  document.querySelectorAll('[data-copy-link]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      button.textContent = 'Link copied';
      setTimeout(() => { button.textContent = 'Copy link'; }, 2400);
    } catch {
      button.textContent = 'Copy the address from your browser';
    }
  }));
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length) {
    const headings = tocLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const headingObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) tocLinks.forEach(link => link.classList.toggle('is-active', link.hash === '#' + visible.target.id));
    }, { rootMargin: '-100px 0px -65% 0px' });
    headings.forEach(heading => headingObserver.observe(heading));
    const progress = document.querySelector('.article-progress');
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = Math.max(0, Math.min(100, scrollY / Math.max(1, height) * 100)) + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
})();
