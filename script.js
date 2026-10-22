// Preserve the supplied desktop composition at smaller browser widths.
// Sections and native anchor links remain in normal document flow.
const designWidth = 1200;
function fitDesktop() {
  const scale = Math.min(1, document.documentElement.clientWidth / designWidth);
  document.documentElement.style.setProperty('--page-scale', scale);
}
fitDesktop();
window.addEventListener('resize', fitDesktop, { passive: true });
