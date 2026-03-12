const toggleBtn    = document.getElementById("toggleBtn");
const statusBadge  = document.getElementById("statusBadge");
const statusText   = document.getElementById("statusText");
const progressBar  = document.getElementById("progressBar");
const progressLabel= document.getElementById("progressLabel");

function setUI(isRunning, step, total) {
  const pct = total > 0 ? Math.round((step / total) * 100) : 0;

  progressBar.style.width  = pct + "%";
  progressLabel.textContent = `Step ${step} / ${total}`;

  if (isRunning) {
    statusBadge.classList.add("active");
    statusText.textContent    = "Haunting...";
    toggleBtn.textContent     = "Banish Ghost";
    toggleBtn.classList.add("stop-mode");
  } else {
    statusBadge.classList.remove("active");
    statusText.textContent    = "Dormant";
    toggleBtn.textContent     = "Unleash Ghost";
    toggleBtn.classList.remove("stop-mode");
  }
}

// Poll status when popup opens
chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
  if (res) setUI(res.isRunning, res.step, res.total);
});

toggleBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (!res) return;

    if (res.isRunning) {
      chrome.runtime.sendMessage({ type: "STOP_GHOST" }, () => {
        setUI(false, 0, res.total);
      });
    } else {
      chrome.runtime.sendMessage({ type: "START_GHOST" }, () => {
        setUI(true, 0, res.total);
      });
    }
  });
});
