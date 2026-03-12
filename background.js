// -------------------------------------------------------
//  GHOST SEQUENCE — edit this to customize the prank!
//  delay = milliseconds to wait BEFORE this action runs
// -------------------------------------------------------
const GHOST_SEQUENCE = [
  { action: "open",   url: "https://www.google.com/search?q=how+to+make+a+ghost+appear", delay: 3000  },
  { action: "open",   url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",               delay: 8000  },
  { action: "open",   url: "https://www.google.com/search?q=am+i+being+watched",        delay: 6000  },
  { action: "switch", tabIndex: 0,                                                       delay: 5000  },
  { action: "open",   url: "https://www.google.com/search?q=ghost+in+the+machine",      delay: 7000  },
  { action: "close",  tabIndex: 1,                                                       delay: 4000  },
  { action: "open",   url: "https://en.wikipedia.org/wiki/Paranormal_activity",          delay: 9000  },
  { action: "switch", tabIndex: 0,                                                       delay: 3000  },
  { action: "open",   url: "https://www.google.com/search?q=is+someone+controlling+my+computer", delay: 5000 },
];

// Tracks open tab IDs in the order they were created by the ghost
let ghostTabIds = [];
let stepIndex    = 0;
let isRunning    = false;

// ── Alarm-based scheduler ────────────────────────────────────────────────────
// Service workers can sleep between events, so we persist state in storage
// and use chrome.alarms (which wake the SW) for reliable long delays.

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "ghost_step") return;
  await runNextStep();
});

async function runNextStep() {
  const state = await loadState();
  if (!state.isRunning) return;

  stepIndex    = state.stepIndex;
  ghostTabIds  = state.ghostTabIds;
  isRunning    = true;

  // If we somehow reached the end, wrap around to the beginning (loop mode)
  if (stepIndex >= GHOST_SEQUENCE.length) {
    stepIndex = 0;
  }

  const step = GHOST_SEQUENCE[stepIndex];

  try {
    if (step.action === "open") {
      const tab = await chrome.tabs.create({ url: step.url, active: true });
      ghostTabIds.push(tab.id);

    } else if (step.action === "switch") {
      const idx = step.tabIndex;
      if (idx < ghostTabIds.length) {
        await chrome.tabs.update(ghostTabIds[idx], { active: true });
      }

    } else if (step.action === "close") {
      const idx = step.tabIndex;
      if (idx < ghostTabIds.length) {
        const idToClose = ghostTabIds[idx];
        ghostTabIds.splice(idx, 1);
        await chrome.tabs.remove(idToClose);
      }
    }
  } catch (e) {
    console.warn("Ghost step failed:", e);
  }

  stepIndex++;
  // Wrap index if we reached the end so the sequence loops forever
  if (stepIndex >= GHOST_SEQUENCE.length) {
    stepIndex = 0;
  }

  await saveState({ isRunning: true, stepIndex, ghostTabIds });

  // Always schedule the next step using the *next* step's delay
  const nextDelay = GHOST_SEQUENCE[stepIndex].delay;
  chrome.alarms.create("ghost_step", { delayInMinutes: nextDelay / 60000 });
}

// ── Start / Stop ─────────────────────────────────────────────────────────────

async function startGhost() {
  ghostTabIds = [];
  stepIndex   = 0;
  await saveState({ isRunning: true, stepIndex: 0, ghostTabIds: [] });
  const firstDelay = GHOST_SEQUENCE[0].delay;
  chrome.alarms.create("ghost_step", { delayInMinutes: firstDelay / 60000 });
  console.log("👻 Ghost activated!");
}

async function stopGhost() {
  const idsToClose = [...ghostTabIds];

  await saveState({ isRunning: false, stepIndex: 0, ghostTabIds: [] });
  chrome.alarms.clear("ghost_step");

  // Best-effort cleanup of all tabs the ghost created
  if (idsToClose.length) {
    try {
      await chrome.tabs.remove(idsToClose);
    } catch (e) {
      // Some tabs may already be closed; ignore errors.
      console.warn("Ghost cleanup error:", e);
    }
  }

  ghostTabIds = [];
  stepIndex   = 0;
  isRunning   = false;
  console.log("👻 Ghost deactivated and tabs cleaned up.");
}

// ── Persistence helpers ───────────────────────────────────────────────────────

function saveState(state) {
  return chrome.storage.local.set({ ghostState: state });
}

async function loadState() {
  const result = await chrome.storage.local.get("ghostState");
  return result.ghostState || { isRunning: false, stepIndex: 0, ghostTabIds: [] };
}

// ── Message bridge (popup ↔ background) ──────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "START_GHOST") {
    startGhost().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "STOP_GHOST") {
    stopGhost().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "GET_STATUS") {
    loadState().then((s) => sendResponse({ isRunning: s.isRunning, step: s.stepIndex, total: GHOST_SEQUENCE.length }));
    return true;
  }
});
