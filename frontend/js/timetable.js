requireLogin();
buildNavbar("timetable.html");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

async function loadTimetable() {
  const grid = document.getElementById("timetable-grid");
  grid.innerHTML = "";

  let slots = [];
  try {
    slots = await apiRequest("/timetable");
  } catch (err) {
    grid.textContent = "Could not load timetable.";
    return;
  }

  DAYS.forEach((day) => {
    const column = document.createElement("div");
    column.className = "timetable-day-column";

    const heading = document.createElement("h4");
    heading.textContent = day;
    column.appendChild(heading);

    const daySlots = slots
      .filter((s) => s.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (daySlots.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-muted";
      empty.style.fontSize = "12px";
      empty.textContent = "No classes";
      column.appendChild(empty);
    }

    daySlots.forEach((slot) => {
      const slotBox = document.createElement("div");
      slotBox.className = "timetable-slot";
      slotBox.innerHTML = `
        <span class="slot-time">${slot.start_time} - ${slot.end_time}</span>
        ${slot.subject}${slot.location ? " (" + slot.location + ")" : ""}
        <br>
        <a href="#" onclick="deleteSlot(${slot.id}); return false;">Remove</a>
      `;
      column.appendChild(slotBox);
    });

    grid.appendChild(column);
  });
}

document.getElementById("slot-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorBox = document.getElementById("slot-error");
  errorBox.textContent = "";

  const payload = {
    day: document.getElementById("slot-day").value,
    start_time: document.getElementById("slot-start").value,
    end_time: document.getElementById("slot-end").value,
    subject: document.getElementById("slot-subject").value,
    location: document.getElementById("slot-location").value,
  };

  try {
    await apiRequest("/timetable", "POST", payload);
    document.getElementById("slot-form").reset();
    loadTimetable();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

async function deleteSlot(id) {
  if (!confirm("Remove this class from your timetable?")) return;
  try {
    await apiRequest("/timetable/" + id, "DELETE");
    loadTimetable();
  } catch (err) {
    alert(err.message);
  }
}

loadTimetable();
