function buildNavbar(activePage) {
  const links = [
    { href: "dashboard.html", label: "Dashboard" },
    { href: "timetable.html", label: "Timetable" },
    { href: "assignments.html", label: "Assignments" },
    { href: "timer.html", label: "Timer" },
    { href: "exams.html", label: "Exam Countdown" },
    { href: "gpa.html", label: "GPA / CGPA" },
    { href: "search.html", label: "Search" },
  ];

  const linksHtml = links
    .map(
      (link) =>
        `<a href="${link.href}" class="${link.href === activePage ? "active" : ""}">${link.label}</a>`
    )
    .join("");

  const user = getUser();
  const userName = user ? user.name : "";

  const navHtml = `
    <div class="navbar">
      <div class="brand">🎓 Student Portal</div>
      <div class="nav-links">${linksHtml}</div>
      <div class="nav-right">
        <select id="theme-selector" onchange="changeTheme(this.value)">
          <option value="theme-light">Light Theme</option>
          <option value="theme-dark">Dark Theme</option>
          <option value="theme-green">Green Theme</option>
          <option value="theme-purple">Purple Theme</option>
        </select>
        <span class="text-muted">Hi, ${userName}</span>
        <button class="secondary small" onclick="logout()">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("navbar-container").outerHTML = navHtml;
  applySavedTheme();
}
