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
