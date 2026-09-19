(() => {
  const saved = localStorage.getItem("blogifyTheme");
  const theme = saved === "dark" || saved === "light"
    ? saved
    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.dataset.theme = theme;

  const syncButtons = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.textContent = dark ? "☀" : "☾";
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", dark ? "Switch to light theme" : "Switch to dark theme");
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    syncButtons();
    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("blogifyTheme", next);
        syncButtons();
      });
    });
  });
})();