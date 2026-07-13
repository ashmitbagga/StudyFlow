requireLogin();
buildNavbar("timer.html");

let secondsLeft = 25 * 60;
let mode = "work"; // "work" or "break"
let intervalId = null;
let running = false;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay() {
  document.getElementById("timer-display").textContent = formatTime(secondsLeft);
  document.getElementById("timer-mode-label").textContent =
    mode === "work" ? "Work Session" : "Break Session";
}

function getWorkMinutes() {
  return parseInt(document.getElementById("work-minutes").value, 10) || 25;
}

function getBreakMinutes() {
  return parseInt(document.getElementById("break-minutes").value, 10) || 5;
}

function startTimer() {
  if (running) return;
  running = true;

  intervalId = setInterval(async () => {
    secondsLeft -= 1;

    if (secondsLeft <= 0) {
      // Session finished: save it, then switch mode
      const finishedMinutes = mode === "work" ? getWorkMinutes() : getBreakMinutes();
      try {
        await apiRequest("/timer-sessions", "POST", {
          session_type: mode,
          duration_minutes: finishedMinutes,
        });
      } catch (err) {
        console.error(err);
      }

      mode = mode === "work" ? "break" : "work";
      secondsLeft = (mode === "work" ? getWorkMinutes() : getBreakMinutes()) * 60;
      loadSessions();
      alert((mode === "work" ? "Break" : "Work") + " session finished! Starting " + mode + " now.");
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  running = false;
  clearInterval(intervalId);
}

function resetTimer() {
  pauseTimer();
  mode = "work";
  secondsLeft = getWorkMinutes() * 60;
  updateDisplay();
}

document.getElementById("work-minutes").addEventListener("change", () => {
  if (!running && mode === "work") {
    secondsLeft = getWorkMinutes() * 60;
    updateDisplay();
  }
});

document.getElementById("break-minutes").addEventListener("change", () => {
  if (!running && mode === "break") {
    secondsLeft = getBreakMinutes() * 60;
    updateDisplay();
  }
});

async function loadSessions() {
  const tbody = document.getElementById("session-rows");
  tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  let sessions = [];
  try {
    sessions = await apiRequest("/timer-sessions");
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='3'>Could not load sessions.</td></tr>";
    return;
  }

  if (sessions.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3' class='text-muted'>No sessions completed yet.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  sessions.forEach((s) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.session_type === "work" ? "Work" : "Break"}</td>
      <td>${s.duration_minutes}</td>
      <td>${new Date(s.completed_at).toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

updateDisplay();
loadSessions();
