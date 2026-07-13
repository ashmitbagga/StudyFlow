requireLogin();
buildNavbar("assignments.html");

function statusLabel(status) {
  return status.replace("_", " ");
}

async function loadAssignments() {
  const tbody = document.getElementById("assignment-rows");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  let assignments = [];
  try {
    assignments = await apiRequest("/assignments");
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Could not load assignments.</td></tr>";
    return;
  }

  if (assignments.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' class='text-muted'>No assignments yet.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  assignments.forEach((a) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.title}</td>
      <td>${a.subject || "-"}</td>
      <td>${a.due_date || "-"}</td>
      <td>
        <select onchange="updateStatus(${a.id}, this.value)">
          <option value="pending" ${a.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="in_progress" ${a.status === "in_progress" ? "selected" : ""}>In Progress</option>
          <option value="completed" ${a.status === "completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
      <td><button class="danger" onclick="deleteAssignment(${a.id})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById("assignment-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorBox = document.getElementById("assignment-error");
  errorBox.textContent = "";

  const payload = {
    title: document.getElementById("a-title").value,
    subject: document.getElementById("a-subject").value,
    due_date: document.getElementById("a-due").value || null,
    status: document.getElementById("a-status").value,
  };

  try {
    await apiRequest("/assignments", "POST", payload);
    document.getElementById("assignment-form").reset();
    loadAssignments();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

async function updateStatus(id, newStatus) {
  try {
    await apiRequest("/assignments/" + id, "PUT", { status: newStatus });
    loadAssignments();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteAssignment(id) {
  if (!confirm("Delete this assignment?")) return;
  try {
    await apiRequest("/assignments/" + id, "DELETE");
    loadAssignments();
  } catch (err) {
    alert(err.message);
  }
}

loadAssignments();
