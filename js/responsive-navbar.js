// Toggle navbar visibility on small screens
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const nav = btn.nextElementSibling;
      if (nav) {
        nav.classList.toggle('active');
      }
    });
  });
});
