requireLogin();
buildNavbar("gpa.html");

async function loadCourses() {
  const tbody = document.getElementById("course-rows");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  let courses = [];
  try {
    courses = await apiRequest("/courses");
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Could not load courses.</td></tr>";
    return;
  }

  if (courses.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' class='text-muted'>No courses added yet.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  courses.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.semester}</td>
      <td>${c.course_name}</td>
      <td>${c.credit_hours}</td>
      <td>${c.grade_point}</td>
      <td><button class="danger" onclick="deleteCourse(${c.id})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function loadGpa() {
  const semesterTbody = document.getElementById("semester-rows");
  semesterTbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  let result;
  try {
    result = await apiRequest("/gpa");
  } catch (err) {
    semesterTbody.innerHTML = "<tr><td colspan='3'>Could not calculate GPA.</td></tr>";
    return;
  }

  document.getElementById("cgpa-value").textContent = result.cgpa;
  document.getElementById("total-credits-text").textContent =
    `Based on ${result.total_credit_hours} total credit hour(s)`;

  if (result.semesters.length === 0) {
    semesterTbody.innerHTML = "<tr><td colspan='3' class='text-muted'>Add courses to see semester GPA.</td></tr>";
    return;
  }

  semesterTbody.innerHTML = "";
  result.semesters.forEach((s) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.semester}</td>
      <td>${s.credit_hours}</td>
      <td>${s.gpa}</td>
    `;
    semesterTbody.appendChild(row);
  });
}

document.getElementById("course-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorBox = document.getElementById("course-error");
  errorBox.textContent = "";

  const payload = {
    semester: document.getElementById("c-semester").value,
    course_name: document.getElementById("c-name").value,
    credit_hours: parseFloat(document.getElementById("c-credits").value),
    grade_point: parseFloat(document.getElementById("c-grade").value),
  };

  try {
    await apiRequest("/courses", "POST", payload);
    document.getElementById("course-form").reset();
    loadCourses();
    loadGpa();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

async function deleteCourse(id) {
  if (!confirm("Delete this course?")) return;
  try {
    await apiRequest("/courses/" + id, "DELETE");
    loadCourses();
    loadGpa();
  } catch (err) {
    alert(err.message);
  }
}

loadCourses();
loadGpa();
