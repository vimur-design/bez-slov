// Preserve the desktop 1140px grid and use the separate 390px mobile artwork
// composition on small screens, scaling each illustration proportionally.
function fitLayout() {
  const viewportWidth = document.documentElement.clientWidth;
  const mobile = viewportWidth < 768;
  const designWidth = mobile ? 390 : 1200;
  const layoutWidth = mobile ? designWidth : Math.max(designWidth, viewportWidth);
  const style = document.documentElement.style;
  style.setProperty('--page-scale', mobile ? viewportWidth / designWidth : Math.min(1, viewportWidth / designWidth));
  style.setProperty('--layout-width', `${layoutWidth}px`);
  style.setProperty('--design-height', mobile ? '4160px' : '10347px');
  style.setProperty('--bleed-scale', layoutWidth / designWidth);
  style.setProperty('--side-space', `${(layoutWidth - designWidth) / 2}px`);
}
fitLayout();
window.addEventListener('resize', fitLayout, { passive: true });

// Headings and paragraphs appear independently. Photo crops use their own
// wrapper, so a card's text never inherits a second reveal transform.
function setupPageMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textBlocks = [...document.querySelectorAll('.page-section h1, .page-section h2, .page-section h3, .page-section p')];
  const photoIds = ['210:749', '210:758', '210:765', '210:782', '210:837', '210:906', '210:915', '210:922', '210:939', '210:992'];
  const photos = [...document.querySelectorAll(photoIds.map(id => `[data-node-id="${id}"]`).join(','))];
  // The closing illustration has a background and is cropped by its parent.
  document.querySelectorAll('img[src$="160ca.png"]').forEach(image => photos.push(image.parentElement));
  const revealBlocks = [...new Set([...textBlocks, ...photos])];
  const characters = [...document.querySelectorAll('img[data-animated-src][data-still-src]')];
  const characterVisibility = new WeakMap();
  let revealObserver;
  let resetObserver;
  let characterObserver;

  textBlocks.forEach(element => {
    element.classList.add('text-reveal');
    element.classList.toggle('reveal-heading', element.matches('h1, h2, h3'));
    element.style.setProperty('--reveal-delay', element.matches('h1, h2, h3') ? '0ms' : '100ms');
  });
  photos.forEach(element => element.classList.add('media-reveal'));

  function updateCharacters() {
    characters.forEach(image => {
      const animate = !preference.matches && !document.hidden && characterVisibility.get(image);
      const source = animate ? image.dataset.animatedSrc : image.dataset.stillSrc;
      if (image.getAttribute('src') !== source) image.setAttribute('src', source);
    });
  }

  function configureMotion() {
    revealObserver?.disconnect();
    resetObserver?.disconnect();
    characterObserver?.disconnect();
    revealBlocks.forEach(element => element.classList.remove('is-pending'));
    characters.forEach(image => characterVisibility.set(image, false));
    updateCharacters();
    if (preference.matches || !('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.remove('is-pending');
      });
    }, { threshold: .01, rootMargin: '0px 0px -24px 0px' });

    // The generous reset boundary prevents the entrance translation itself
    // from toggling the observer repeatedly near a viewport edge.
    resetObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) entry.target.classList.add('is-pending');
      });
    }, { threshold: 0, rootMargin: '180px 0px' });

    revealBlocks.forEach(element => {
      // Do not hide text above the current position when opening a deep link.
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || bounds.bottom >= 0) element.classList.add('is-pending');
      revealObserver.observe(element);
      resetObserver.observe(element);
    });

    characterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => characterVisibility.set(entry.target, entry.isIntersecting));
      updateCharacters();
    }, { threshold: .01 });
    characters.forEach(element => characterObserver.observe(element));
  }

  function pauseWhenHidden() {
    updateCharacters();
  }
  configureMotion();
  pauseWhenHidden();
  preference.addEventListener('change', configureMotion);
  document.addEventListener('visibilitychange', pauseWhenHidden);
}
setupPageMotion();
