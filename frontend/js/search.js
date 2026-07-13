requireLogin();
buildNavbar("search.html");

document.getElementById("search-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  const assignmentsBox = document.getElementById("results-assignments");
  const timetableBox = document.getElementById("results-timetable");
  const examsBox = document.getElementById("results-exams");

  assignmentsBox.textContent = "Searching...";
  timetableBox.textContent = "Searching...";
  examsBox.textContent = "Searching...";

  let results;
  try {
    results = await apiRequest("/search?q=" + encodeURIComponent(query));
  } catch (err) {
    assignmentsBox.textContent = "Search failed.";
    timetableBox.textContent = "";
    examsBox.textContent = "";
    return;
  }

  // Assignments
  if (results.assignments.length === 0) {
    assignmentsBox.innerHTML = "<p class='text-muted'>No matching assignments.</p>";
  } else {
    assignmentsBox.innerHTML = results.assignments
      .map(
        (a) =>
          `<div class="countdown-card"><div><strong>${a.title}</strong> - ${a.subject || "-"}<br>
           <span class="text-muted">Due: ${a.due_date || "-"}</span></div>
           <span class="badge ${a.status}">${a.status}</span></div>`
      )
      .join("");
  }

  // Timetable
  if (results.timetable_slots.length === 0) {
    timetableBox.innerHTML = "<p class='text-muted'>No matching classes.</p>";
  } else {
    timetableBox.innerHTML = results.timetable_slots
      .map(
        (t) =>
          `<div class="countdown-card"><div><strong>${t.subject}</strong><br>
           <span class="text-muted">${t.day}, ${t.start_time} - ${t.end_time}</span></div></div>`
      )
      .join("");
  }

  // Exams
  if (results.exams.length === 0) {
    examsBox.innerHTML = "<p class='text-muted'>No matching exams.</p>";
  } else {
    examsBox.innerHTML = results.exams
      .map(
        (ex) =>
          `<div class="countdown-card"><div><strong>${ex.subject}</strong><br>
           <span class="text-muted">${ex.exam_date}</span></div></div>`
      )
      .join("");
  }
});
