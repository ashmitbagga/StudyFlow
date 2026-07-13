const THEME_CLASSES = ["theme-light", "theme-dark", "theme-green", "theme-purple"];

function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "theme-light";
  document.body.classList.remove(...THEME_CLASSES);
  if (saved !== "theme-light") {
    document.body.classList.add(saved);
  }

  const selector = document.getElementById("theme-selector");
  if (selector) {
    selector.value = saved;
  }
}

function changeTheme(themeName) {
  document.body.classList.remove(...THEME_CLASSES);
  if (themeName !== "theme-light") {
    document.body.classList.add(themeName);
  }
  localStorage.setItem("theme", themeName);
}

document.addEventListener("DOMContentLoaded", applySavedTheme);
