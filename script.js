// Keep the 1140px content grid centered. Only background artwork expands
// into the side margins; desktop typography and content images stay at 1:1.
const designWidth = 1200;
function fitDesktop() {
  const viewportWidth = document.documentElement.clientWidth;
  const layoutWidth = Math.max(designWidth, viewportWidth);
  const style = document.documentElement.style;
  style.setProperty('--page-scale', Math.min(1, viewportWidth / designWidth));
  style.setProperty('--layout-width', `${layoutWidth}px`);
  style.setProperty('--bleed-scale', layoutWidth / designWidth);
  style.setProperty('--side-space', `${(layoutWidth - designWidth) / 2}px`);
}
fitDesktop();
window.addEventListener('resize', fitDesktop, { passive: true });
