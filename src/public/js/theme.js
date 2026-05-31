const html = document.documentElement;

function applyTheme(theme) {
  html.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  });
});
