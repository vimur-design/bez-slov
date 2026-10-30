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

// Reveal each text block once. Without observer support or with reduced
// motion, all content remains visible and the original artwork stays still.
function setupPageMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textBlocks = [...document.querySelectorAll('.page-section h1, .page-section h2, .page-section h3, .page-section p')];
  const characters = [...document.querySelectorAll('.character-art, .character-breathe')];
  let textObserver;
  let characterObserver;

  function configureMotion() {
    textObserver?.disconnect();
    characterObserver?.disconnect();
    textBlocks.forEach(element => element.classList.remove('is-pending'));
    characters.forEach(element => element.classList.remove('is-in-view'));
    if (preference.matches || !('IntersectionObserver' in window)) return;

    textObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        entry.target.dataset.revealed = 'true';
        textObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });

    textBlocks.forEach(element => {
      if (element.dataset.revealed) return;
      // Do not hide text above the current position when opening a deep link.
      const bounds = element.getBoundingClientRect();
      if (bounds.width && bounds.bottom < 0) {
        element.dataset.revealed = 'true';
        return;
      }
      element.classList.add('text-reveal', 'is-pending');
      element.style.setProperty('--reveal-delay', element.matches('h1, h2, h3') ? '0ms' : '80ms');
      textObserver.observe(element);
    });

    characterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    }, { threshold: .01, rootMargin: '40px 0px' });
    characters.forEach(element => characterObserver.observe(element));
  }

  function pauseWhenHidden() {
    document.documentElement.classList.toggle('motion-paused', document.hidden);
  }
  configureMotion();
  pauseWhenHidden();
  preference.addEventListener('change', configureMotion);
  document.addEventListener('visibilitychange', pauseWhenHidden);
}
setupPageMotion();
