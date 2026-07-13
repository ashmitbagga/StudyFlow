requireLogin();
buildNavbar("exams.html");

function daysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(dateString);
  const diffMs = examDate - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

async function loadExams() {
  const list = document.getElementById("exam-list");
  list.innerHTML = "Loading...";

  let exams = [];
  try {
    exams = await apiRequest("/exams");
  } catch (err) {
    list.textContent = "Could not load exams.";
    return;
  }

  if (exams.length === 0) {
    list.innerHTML = "<p class='text-muted'>No exams added yet.</p>";
    return;
  }

  list.innerHTML = "";
  exams.forEach((exam) => {
    const days = daysUntil(exam.exam_date);
    const daysText = days < 0 ? "Past" : days === 0 ? "Today" : `${days} day(s) left`;

    const card = document.createElement("div");
    card.className = "countdown-card";
    card.innerHTML = `
      <div>
        <strong>${exam.subject}</strong><br>
        <span class="text-muted">${exam.exam_date}</span>
        &nbsp; <span class="badge ${exam.priority}">${exam.priority}</span>
      </div>
      <div style="text-align:right;">
        <div class="countdown-days">${daysText}</div>
        <button class="danger" onclick="deleteExam(${exam.id})">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

document.getElementById("exam-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorBox = document.getElementById("exam-error");
  errorBox.textContent = "";

  const payload = {
    subject: document.getElementById("exam-subject").value,
    exam_date: document.getElementById("exam-date").value,
    priority: document.getElementById("exam-priority").value,
  };

  try {
    await apiRequest("/exams", "POST", payload);
    document.getElementById("exam-form").reset();
    loadExams();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

async function deleteExam(id) {
  if (!confirm("Delete this exam?")) return;
  try {
    await apiRequest("/exams/" + id, "DELETE");
    loadExams();
  } catch (err) {
    alert(err.message);
  }
}

loadExams();
