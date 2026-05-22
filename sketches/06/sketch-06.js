const canvasSketch = require("canvas-sketch");
const tweakPane = require("tweakpane");
const TweakpaneSearchListPlugin = require("tweakpane-plugin-search-list");

const constellationsData = require("./constellations_v3.json");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

// ─── Theme ─────────────────────────────────────────────────────────────────
// Converts a theme {r, g, b} colour to a CSS rgb() string for canvas use.
const toRgb = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;

const themes = {
  blue: {
    background: { r: 25, g: 25, b: 112 }, // MidnightBlue
    grid: { r: 65, g: 105, b: 225 }, // RoyalBlue
    constellationLine: { r: 238, g: 232, b: 170 }, // PaleGoldenRod
    starStroke: { r: 238, g: 232, b: 170 }, // PaleGoldenRod
    starDimColor: { r: 135, g: 206, b: 250 }, // LightSkyBlue
    starBrightColor: { r: 224, g: 255, b: 255 },
    constellationLabel: { r: 135, g: 206, b: 250 }, // LightSkyBlue
    labelStroke: { r: 25, g: 25, b: 112 }, // MidnightBlue
    starLabel: { r: 255, g: 255, b: 255 }, // white
  },
  monochrome: {
    background: { r: 0, g: 0, b: 0 },
    grid: { r: 50, g: 50, b: 50 },
    constellationLine: { r: 112, g: 112, b: 112 },
    starStroke: { r: 255, g: 255, b: 255 },
    starDimColor: { r: 150, g: 150, b: 150 },
    starBrightColor: { r: 255, g: 255, b: 255 },
    constellationLabel: { r: 200, g: 200, b: 200 },
    labelStroke: { r: 0, g: 0, b: 0 },
    starLabel: { r: 255, g: 255, b: 255 },
  },
  nightmode: {
    background: { r: 0, g: 0, b: 0 },
    grid: { r: 100, g: 15, b: 15 },
    constellationLine: { r: 180, g: 35, b: 15 },
    starStroke: { r: 180, g: 35, b: 15 },
    starDimColor: { r: 140, g: 25, b: 10 },
    starBrightColor: { r: 255, g: 90, b: 30 },
    constellationLabel: { r: 200, g: 45, b: 20 },
    labelStroke: { r: 0, g: 0, b: 0 },
    starLabel: { r: 220, g: 60, b: 25 },
  },
  light: {
    background: { r: 255, g: 255, b: 255 },
    grid: { r: 180, g: 180, b: 200 },
    constellationLine: { r: 80, g: 100, b: 160 },
    starStroke: { r: 60, g: 60, b: 120 },
    starDimColor: { r: 120, g: 130, b: 180 },
    starBrightColor: { r: 30, g: 30, b: 80 },
    constellationLabel: { r: 60, g: 80, b: 160 },
    labelStroke: { r: 255, g: 255, b: 255 },
    starLabel: { r: 20, g: 20, b: 80 },
  },
  elegant: {
    background: { r: 10, g: 20, b: 40 }, // deep dark navy
    grid: { r: 38, g: 72, b: 110 }, // muted steel blue
    constellationLine: { r: 190, g: 155, b: 65 }, // antique gold
    starStroke: { r: 220, g: 200, b: 140 }, // warm gold
    starDimColor: { r: 160, g: 130, b: 60 }, // dim amber gold
    starBrightColor: { r: 248, g: 244, b: 228 }, // warm cream white
    constellationLabel: { r: 210, g: 175, b: 80 }, // golden yellow
    labelStroke: { r: 10, g: 20, b: 40 }, // deep navy (matches bg)
    starLabel: { r: 235, g: 225, b: 190 }, // soft warm white
  },
};

// Current applied theme
const theme = { ...themes.blue };

const getStarFillColor = (brightness) => {
  // brightness = 10^(-0.4*m); brightest stars ~1.0, dimmest ~0.01
  const t = Math.max(0, Math.min(brightness, 1.0));
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  return toRgb({
    r: lerp(theme.starDimColor.r, theme.starBrightColor.r),
    g: lerp(theme.starDimColor.g, theme.starBrightColor.g),
    b: lerp(theme.starDimColor.b, theme.starBrightColor.b),
  });
};

const getStarBlinkAmount = (time, x, y, brightness) => {
  const phaseOffset = x * 17 + y * 31 + brightness * 2;
  const pulse = (Math.sin(time * 2 + phaseOffset) + 1) / 2;

  return 0.45 + pulse * 0.55;
};

const raDecToXY = (ra, dec, rotationOffset) => {
  // RA: 0–24 horas
  // DEC: -90 a +90 grados

  const angle = (1 - ra / 24) * 2 * Math.PI + rotationOffset;

  // radius is normalized to the canvas half-size so DEC=0 lands on the rim
  const radius = ((90 - dec) / 90) * 0.45;

  const xPos = 0.5 + radius * Math.cos(angle);
  const yPos = 0.5 - radius * Math.sin(angle);

  return { xPos, yPos };
};

const drawTextOnArc = (
  context,
  text,
  arcCenterX,
  arcCenterY,
  radius,
  centerAngle,
) => {
  const spacing = 4;
  const characters = [...text].reverse();
  const characterAngles = characters.map(
    (character) => (context.measureText(character).width + spacing) / radius,
  );
  const totalAngle = characterAngles.reduce(
    (sum, characterAngle) => sum + characterAngle,
    0,
  );

  let currentAngle = centerAngle - totalAngle / 2;

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const characterAngle = characterAngles[i];

    currentAngle += characterAngle / 2;

    const x = arcCenterX + Math.cos(currentAngle) * radius;
    const y = arcCenterY + Math.sin(currentAngle) * radius;
    const tangentAngle = currentAngle - Math.PI / 2;

    context.save();
    context.translate(x, y);
    context.rotate(tangentAngle);
    context.strokeText(character, 0, 0);
    context.fillText(character, 0, 0);
    context.restore();

    currentAngle += characterAngle / 2;
  }
};

// Create a new secondary canvas to render the character / type
const planetariumCanvas = document.createElement("canvas");
const planetariumCanvasContext = planetariumCanvas.getContext("2d");
const constellations = constellationsData.constellations.flatMap((entry) =>
  Array.isArray(entry.constellations) ? entry.constellations : [entry],
);
// Convert a 1-based day-of-year to a short readable date string (e.g. "Mar 24").
// Uses a fixed non-leap year so day 1 = Jan 1 and day 365 = Dec 31.
const dayOfYearToDate = (day) =>
  new Date(2001, 0, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// Day 83 (March 24) → rotationOffset = π/2 (the original hardcoded value).
// BASE is back-calculated so that calibration stays when dayOfYear = 83.
const DAY_OFFSET_BASE = Math.PI / 2 - (83 / 365.25) * 2 * Math.PI;

// ─── Shared constants ──────────────────────────────────────────────────────
const MS_PER_DAY = 86400000;
const SEARCH_NONE = ""; // empty option key used by search-list fields

// ─── Helpers ───────────────────────────────────────────────────────────────

// Returns the current day of year (1-based). Extracted to avoid duplication
// between the initial params value and the "Go to Today" button handler.
const getTodayDayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / MS_PER_DAY);
};

// Wraps a fractional day value to an integer in [1, 365]. Needed because the
// search animation destination can cross year boundaries (e.g. searching for a
// winter constellation from early January yields a raw day around −8 → 357).
const wrapDay = (d) => ((Math.round(d) - 1 + 3650) % 365) + 1;

// ─── Tweakpane option objects ──────────────────────────────────────────────
// Built upfront so they can be referenced both in params and in pane inputs.

// "Show star names" dropdown: none | hover | per-constellation
const starNameOptions = { None: "none", "User action": "on_hover" };
for (const constellation of constellations) {
  starNameOptions[constellation.name] = constellation.name;
}

// Constellation search-list: empty entry + one entry per constellation
const searchConstellationOptions = { [SEARCH_NONE]: SEARCH_NONE };
for (const constellation of constellations) {
  searchConstellationOptions[constellation.name] = constellation.name;
}

// Star search-list: empty entry + all unique star names sorted A–Z.
// Also builds starRaByName for the rotation calculation (first occurrence wins).
const starRaByName = {};
for (const constellation of constellations) {
  for (const star of constellation.stars) {
    if (starRaByName[star.name] === undefined) {
      starRaByName[star.name] = star.ra;
    }
  }
}
const searchStarOptions = { [SEARCH_NONE]: SEARCH_NONE };
Object.keys(starRaByName)
  .sort()
  .forEach((name) => {
    searchStarOptions[name] = name;
  });

// ─── Params ────────────────────────────────────────────────────────────────
const _todayDay = getTodayDayOfYear();
const params = {
  // Display toggles
  showGrid: true,
  showConstellationName: true,
  showConstellationLines: true,
  showStarNames: "none",
  // Date / time
  dayOfYear: _todayDay,
  date: dayOfYearToDate(_todayDay),
  autoplay: false,
  // Search state
  searchConstellation: SEARCH_NONE,
  searchStar: SEARCH_NONE,
  // Theme
  theme: "blue",
};

// ─── Pane ──────────────────────────────────────────────────────────────────
const pane = new tweakPane.Pane({ title: "Planetarium" });
pane.registerPlugin(TweakpaneSearchListPlugin);

// Top-level display controls
pane.addInput(params, "showGrid", { label: "Show grid" });
pane.addInput(params, "showConstellationName", {
  label: "Show constellation name",
});
pane.addInput(params, "showConstellationLines", {
  label: "Show constellation lines",
});
pane.addInput(params, "showStarNames", {
  label: "Show star names",
  options: starNameOptions,
});

// ─── State: intervals and bindings ─────────────────────────────────────────
// Bindings are stored so we can call .refresh() after external param changes.
let autoplayInterval = null;
let todayAnimInterval = null;
let autoplayBinding = null;
let searchConstellationBinding = null;
let searchStarBinding = null;
// Prevents the .refresh() call inside resetXSearch() from re-triggering
// the other field's change handler and creating a cascade.
let suppressSearchChange = false;

// Stops autoplay if running and syncs the toggle UI.
function stopAutoplay() {
  if (!autoplayInterval) return;
  clearInterval(autoplayInterval);
  autoplayInterval = null;
  params.autoplay = false;
  if (autoplayBinding) autoplayBinding.refresh();
}

// Clears each search field independently (used for mutual exclusion).
// The search-list plugin keeps two separate values: `value` (the bound param)
// and `textValue` (what is displayed in the input). refresh() only updates
// `value`; we must also clear `textValue` so the input visually resets.
function clearSearchListDisplay(binding) {
  const pluginCtrl = binding.controller_.valueController;
  if (pluginCtrl && pluginCtrl.textValue) {
    pluginCtrl.textValue.rawValue = SEARCH_NONE;
  }
}
function resetConstellationSearch() {
  if (params.searchConstellation === SEARCH_NONE) return;
  params.searchConstellation = SEARCH_NONE;
  suppressSearchChange = true;
  if (searchConstellationBinding) {
    searchConstellationBinding.refresh();
    clearSearchListDisplay(searchConstellationBinding);
  }
  suppressSearchChange = false;
}
function resetStarSearch() {
  if (params.searchStar === SEARCH_NONE) return;
  params.searchStar = SEARCH_NONE;
  suppressSearchChange = true;
  if (searchStarBinding) {
    searchStarBinding.refresh();
    clearSearchListDisplay(searchStarBinding);
  }
  suppressSearchChange = false;
}
// Resets both search fields at once (called when the day changes).
function resetSearch() {
  resetConstellationSearch();
  resetStarSearch();
}

// ─── Search rotation helpers ───────────────────────────────────────────────
let searchAnimFrame = null;

// Smoothly animates params.dayOfYear toward `target` (cubic ease-out, 900 ms),
// updating the date display each frame so the slider and date stay in sync
// with the rotation. Because the rotation lives entirely in dayOfYear,
// "Go to Today" always works from wherever the view has landed.
function animateToDayOfYear(target) {
  if (searchAnimFrame) cancelAnimationFrame(searchAnimFrame);
  searchFolder.disabled = true; // block new searches until rotation finishes
  const startDay = params.dayOfYear;
  // Normalise to the shortest arc within ±182.625 days (half a year = half a revolution).
  let diff = target - startDay;
  while (diff > 182.625) diff -= 365.25;
  while (diff < -182.625) diff += 365.25;
  const destination = startDay + diff;
  const duration = 900;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
    params.dayOfYear = wrapDay(startDay + diff * ease);
    params.date = dayOfYearToDate(params.dayOfYear);
    suppressSearchChange = true;
    dayOfYearBinding.refresh();
    suppressSearchChange = false;
    if (t < 1) searchAnimFrame = requestAnimationFrame(step);
    else {
      searchAnimFrame = null;
      searchFolder.disabled = false;
    }
  }
  searchAnimFrame = requestAnimationFrame(step);
}

// Computes the day-of-year that places the given RA at the bottom-center of
// the chart (totalRotation = 3π/2) and starts the animation.
// Derived from: DAY_OFFSET_BASE + (targetDay/365.25)·2π = 3π/2 − (1−ra/24)·2π
function rotateToRa(ra) {
  const numerator =
    (3 * Math.PI) / 2 - (1 - ra / 24) * 2 * Math.PI - DAY_OFFSET_BASE;
  const targetDay = (numerator * 365.25) / (2 * Math.PI);
  animateToDayOfYear(targetDay);
}

// ─── Date folder ───────────────────────────────────────────────────────────
const dateFolder = pane.addFolder({ title: "Date" });

const dayOfYearBinding = dateFolder
  .addInput(params, "dayOfYear", {
    label: "Day of year",
    min: 1,
    max: 365,
    step: 1,
  })
  .on("change", () => {
    params.date = dayOfYearToDate(params.dayOfYear);
    if (!suppressSearchChange) resetSearch();
  });

dateFolder.addMonitor(params, "date", { label: "Date", interval: 50 });

autoplayBinding = dateFolder
  .addInput(params, "autoplay", { label: "Autoplay" })
  .on("change", () => {
    if (params.autoplay) {
      autoplayInterval = setInterval(() => {
        params.dayOfYear = params.dayOfYear >= 365 ? 1 : params.dayOfYear + 1;
        dayOfYearBinding.refresh(); // change handler updates date and resets search
      }, 50);
    } else {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  });

dateFolder.addSeparator();

dateFolder.addButton({ title: "Go to Today" }).on("click", () => {
  const targetDay = getTodayDayOfYear();
  stopAutoplay();
  clearInterval(todayAnimInterval);
  if (searchAnimFrame) {
    cancelAnimationFrame(searchAnimFrame);
    searchAnimFrame = null;
    searchFolder.disabled = false;
  }
  resetSearch();

  const dir = targetDay > params.dayOfYear ? 1 : -1;
  todayAnimInterval = setInterval(() => {
    const remaining = Math.abs(targetDay - params.dayOfYear);
    const step = dir * Math.min(3, remaining);
    params.dayOfYear += step;
    dayOfYearBinding.refresh(); // change handler updates date and resets search (no-op)
    if (params.dayOfYear === targetDay) {
      clearInterval(todayAnimInterval);
      todayAnimInterval = null;
    }
  }, 10);
});

// ─── Search folder ─────────────────────────────────────────────────────────
const searchFolder = pane.addFolder({ title: "Search" });

// Factory for the shared search-list field config (instant filtering).
const searchListConfig = (label, options) => ({
  label,
  view: "search-list",
  options,
  noDataText: "not found",
  debounceDelay: 0,
});

searchConstellationBinding = searchFolder
  .addInput(
    params,
    "searchConstellation",
    searchListConfig("Constellation", searchConstellationOptions),
  )
  .on("change", () => {
    if (suppressSearchChange) return;
    stopAutoplay();
    resetStarSearch(); // always clear star when constellation field is touched
    if (params.searchConstellation === SEARCH_NONE) return;
    // Rotate to the centroid RA of the selected constellation
    const found = constellations.find(
      (c) => c.name === params.searchConstellation,
    );
    if (!found) return;
    const avgRa =
      found.stars.reduce((sum, s) => sum + s.ra, 0) / found.stars.length;
    rotateToRa(avgRa);
  });

searchStarBinding = searchFolder
  .addInput(params, "searchStar", searchListConfig("Star", searchStarOptions))
  .on("change", () => {
    if (suppressSearchChange) return;
    stopAutoplay();
    resetConstellationSearch(); // always clear constellation when star field is touched
    if (params.searchStar === SEARCH_NONE) return;
    const starRa = starRaByName[params.searchStar];
    if (starRa === undefined) return;
    rotateToRa(starRa);
  });

// ─── Pane theming ───────────────────────────────────────────────────────
// Applies the current sketch theme to Tweakpane by writing --tp-* CSS
// custom properties directly onto pane.element (pure JS, no CSS file needed).
const applyPaneTheme = () => {
  const el = pane.element;
  const bg = theme.background;
  const label = theme.constellationLabel;
  const bright = theme.starBrightColor;
  const grid = theme.grid;
  const rgba = ({ r, g, b }, a = 1) => `rgba(${r},${g},${b},${a})`;

  el.style.setProperty("--tp-base-background-color", rgba(bg, 0.95));
  el.style.setProperty("--tp-base-shadow-color", rgba(bg, 0.6));
  el.style.setProperty("--tp-button-background-color", rgba(grid, 1));
  el.style.setProperty(
    "--tp-button-background-color-active",
    rgba(bright, 0.9),
  );
  el.style.setProperty("--tp-button-background-color-focus", rgba(grid, 0.9));
  el.style.setProperty("--tp-button-background-color-hover", rgba(grid, 0.8));
  el.style.setProperty("--tp-button-foreground-color", rgba(bg, 1));
  el.style.setProperty("--tp-container-background-color", rgba(bg, 0.5));
  el.style.setProperty("--tp-container-background-color-active", rgba(bg, 0.8));
  el.style.setProperty("--tp-container-background-color-focus", rgba(bg, 0.7));
  el.style.setProperty("--tp-container-background-color-hover", rgba(bg, 0.6));
  el.style.setProperty("--tp-container-foreground-color", rgba(label, 0.8));
  el.style.setProperty("--tp-groove-foreground-color", rgba(grid, 0.4));
  el.style.setProperty("--tp-input-background-color", rgba(bg, 0.4));
  el.style.setProperty("--tp-input-background-color-active", rgba(bg, 0.7));
  el.style.setProperty("--tp-input-background-color-focus", rgba(bg, 0.6));
  el.style.setProperty("--tp-input-background-color-hover", rgba(bg, 0.5));
  el.style.setProperty("--tp-input-foreground-color", rgba(bright, 0.9));
  el.style.setProperty("--tp-label-foreground-color", rgba(label, 0.9));
  el.style.setProperty("--tp-monitor-background-color", rgba(bg, 0.3));
  el.style.setProperty("--tp-monitor-foreground-color", rgba(bright, 0.5));

  // The search-list plugin renders its dropdown via Popper.js, appending it to
  // document.body — outside pane.element — so the scoped --tp-* vars above
  // can't reach it. We inject/update a <style> tag instead (still pure JS).
  let searchListStyle = document.getElementById("tp-search-list-theme");
  if (!searchListStyle) {
    searchListStyle = document.createElement("style");
    searchListStyle.id = "tp-search-list-theme";
    document.head.appendChild(searchListStyle);
  }
  searchListStyle.textContent = `
    .tp-search-listv_options {
      background-color: ${rgba(bg, 0.97)} !important;
      scrollbar-color: ${rgba(grid, 0.8)} ${rgba(bg, 0.4)};
      scrollbar-width: thin;
    }
    .tp-search-listv_options li {
      color: ${rgba(bright, 1)};
    }
    .tp-search-listv_options li:hover {
      background-color: ${rgba(grid, 0.85)} !important;
      color: ${rgba(bright, 1)};
    }
    .tp-search-listv_options .no-data {
      color: ${rgba(label, 0.7)} !important;
    }
    .tp-search-listv_options::-webkit-scrollbar {
      width: 5px;
    }
    .tp-search-listv_options::-webkit-scrollbar-track {
      background: ${rgba(bg, 0.4)};
      border-radius: 3px;
    }
    .tp-search-listv_options::-webkit-scrollbar-thumb {
      background-color: ${rgba(grid, 0.8)};
      border-radius: 3px;
    }
    .tp-search-listv_options::-webkit-scrollbar-thumb:hover {
      background-color: ${rgba(grid, 1)};
    }
  `;
};

// ─── Theme folder ────────────────────────────────────────────────────────
const themeFolder = pane.addFolder({ title: "Theme" });
const themePresetBinding = themeFolder.addInput(params, "theme", {
  label: "Preset",
  options: Object.fromEntries(
    [...Object.keys(themes), "custom"].map((k) => [k, k]),
  ),
});

themeFolder.addSeparator();
const themeColorBindings = [
  ["background", "Background"],
  ["grid", "Grid"],
  ["constellationLine", "Constellation line"],
  ["starStroke", "Star stroke"],
  ["starDimColor", "Star dim"],
  ["starBrightColor", "Star bright"],
  ["constellationLabel", "Constellation label"],
  ["labelStroke", "Label stroke"],
  ["starLabel", "Star label"],
].map(([key, label]) => {
  const b = themeFolder.addInput(theme, key, { label });
  b.disabled = true;
  return b;
});

themePresetBinding.on("change", () => {
  if (params.theme === "custom") {
    themeColorBindings.forEach((b) => {
      b.disabled = false;
    });
  } else {
    const preset = themes[params.theme];
    if (preset) Object.assign(theme, preset);
    themeColorBindings.forEach((b) => {
      b.disabled = true;
      b.refresh();
    });
  }
  applyPaneTheme();
});

// Apply the initial theme to the pane on load
applyPaneTheme();

// Mouse position in main canvas logical coordinates (initialised off-screen)
const mousePos = { x: -9999, y: -9999 };
let canvasListenerAttached = false;

const sketch = () => {
  return ({ context, width, height, time }) => {
    // Set secondary plantarium size at 1.9x to match drawImage scale (avoids upscale blur)
    planetariumCanvas.width = Math.round(width * 1.9);
    planetariumCanvas.height = Math.round(height * 1.9);
    planetariumCanvasContext.scale(1.9, 1.9);

    // Attach mouse/touch listeners once so we can track hover/touch position
    if (!canvasListenerAttached) {
      const canvasEl = context.canvas;

      const setFromClient = (clientX, clientY) => {
        const rect = canvasEl.getBoundingClientRect();
        mousePos.x = (clientX - rect.left) * (width / rect.width);
        mousePos.y = (clientY - rect.top) * (height / rect.height);
      };
      const clear = () => {
        mousePos.x = -9999;
        mousePos.y = -9999;
      };

      canvasEl.addEventListener("mousemove", (e) =>
        setFromClient(e.clientX, e.clientY),
      );
      canvasEl.addEventListener("mouseleave", clear);

      canvasEl.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          setFromClient(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: false },
      );
      canvasEl.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          setFromClient(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: false },
      );
      canvasEl.addEventListener("touchend", clear);
      canvasEl.addEventListener("touchcancel", clear);

      canvasListenerAttached = true;
    }

    // Radius for planetary Canvas
    // const radGradient = context.createRadialGradient(
    //   width / 2,
    //   height / 2,
    //   width / 2,
    //   width / 2,
    //   height / 2,
    //   width / 5,
    // );
    // radGradient.addColorStop(0, "MidnightBlue");
    // radGradient.addColorStop(0.9, "DarkBlue");
    // radGradient.addColorStop(1, "DarkBlue");
    // context.fillStyle = radGradient;

    planetariumCanvasContext.fillStyle = toRgb(theme.background);
    planetariumCanvasContext.fillRect(0, 0, width, height);

    // Planetarium grid
    // Create circles and lines for sky map
    if (params.showGrid) {
      const centerX = width / 2;
      const centerY = height / 2;
      const firstCircleRadius = width / 12.2;
      const lastCircleRadius = (width / 12.2) * 6;

      for (let i = 0; i < 6; i++) {
        planetariumCanvasContext.beginPath();
        planetariumCanvasContext.arc(
          centerX,
          centerY,
          (width / 12.2) * (i + 1),
          0,
          Math.PI * 2,
        );
        planetariumCanvasContext.strokeStyle = toRgb(theme.grid);
        planetariumCanvasContext.lineWidth = 1;
        planetariumCanvasContext.stroke();
      }

      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const startX = centerX + Math.cos(angle) * firstCircleRadius;
        const startY = centerY + Math.sin(angle) * firstCircleRadius;
        const endX = centerX + Math.cos(angle) * lastCircleRadius;
        const endY = centerY + Math.sin(angle) * lastCircleRadius;

        planetariumCanvasContext.beginPath();
        planetariumCanvasContext.moveTo(startX, startY);
        planetariumCanvasContext.lineTo(endX, endY);
        planetariumCanvasContext.strokeStyle = toRgb(theme.grid);
        planetariumCanvasContext.lineWidth = 1;
        planetariumCanvasContext.stroke();
      }
    }

    // Rotation offset derived from the selected day of year.
    // The sky at midnight makes one full rotation per year: +2π / 365.25 per day.
    const rotationOffset =
      DAY_OFFSET_BASE + (params.dayOfYear / 365.25) * 2 * Math.PI;

    // loop all constellations
    for (const constellation of constellations) {
      const starsByName = Object.fromEntries(
        constellation.stars.map((star) => [
          star.name,
          { ...star, ...raDecToXY(star.ra, star.dec, rotationOffset) },
        ]),
      );
      const bounds = Object.values(starsByName).reduce(
        (accumulator, star) => ({
          minX: Math.min(accumulator.minX, star.xPos),
          minY: Math.min(accumulator.minY, star.yPos),
          maxX: Math.max(accumulator.maxX, star.xPos),
          maxY: Math.max(accumulator.maxY, star.yPos),
        }),
        {
          minX: Number.POSITIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        },
      );

      // Paint Lines
      if (
        params.showConstellationLines ||
        constellation.name === params.searchConstellation
      ) {
        for (const path of constellation.paths) {
          for (let i = 0; i < path.length - 1; i++) {
            const startStar = starsByName[path[i]];
            const endStar = starsByName[path[i + 1]];

            if (!startStar || !endStar) continue;

            planetariumCanvasContext.beginPath();
            planetariumCanvasContext.moveTo(
              startStar.xPos * width,
              startStar.yPos * height,
            );
            planetariumCanvasContext.lineTo(
              endStar.xPos * width,
              endStar.yPos * height,
            );
            planetariumCanvasContext.lineWidth = 1;
            planetariumCanvasContext.strokeStyle = toRgb(
              theme.constellationLine,
            );
            planetariumCanvasContext.stroke();
          }
        }
      }

      // Paint stars
      for (const star of Object.values(starsByName)) {
        const { ra, dec, xPos, yPos, magnitude, brightness } = star;
        const blinkAmount = getStarBlinkAmount(time, xPos, yPos, brightness);
        planetariumCanvasContext.save();
        planetariumCanvasContext.globalAlpha = blinkAmount;
        planetariumCanvasContext.fillStyle = getStarFillColor(brightness);
        planetariumCanvasContext.beginPath();
        // magnitude = apparent magnitude (m); lower m = bigger/brighter star
        const pixelmagnitude = Math.max(0.5, (6.5 - magnitude) * 1.5);
        planetariumCanvasContext.arc(
          xPos * width,
          yPos * height,
          pixelmagnitude * (0.45 + blinkAmount * 0.25),
          0,
          Math.PI * 2,
        );
        planetariumCanvasContext.fill();
        planetariumCanvasContext.lineWidth = 1;
        planetariumCanvasContext.strokeStyle = toRgb(theme.starStroke);
        planetariumCanvasContext.stroke();
        planetariumCanvasContext.restore();
      }

      // Paint constellations' name
      if (
        params.showConstellationName ||
        constellation.name === params.searchConstellation
      ) {
        const centerX = ((bounds.minX + bounds.maxX) * width) / 2;
        const centerY = ((bounds.minY + bounds.maxY) * height) / 2;
        const textAngle = Math.atan2(centerY - height / 2, centerX - width / 2);
        const textRadius = Math.hypot(
          centerX - width / 2,
          centerY - height / 2,
        );

        const boundsSpan = Math.hypot(
          bounds.maxX - bounds.minX,
          bounds.maxY - bounds.minY,
        );
        const fontmagnitude = Math.round(
          10 + Math.min(boundsSpan / 0.5, 1) * 6,
        );

        planetariumCanvasContext.fillStyle = toRgb(theme.constellationLabel);
        planetariumCanvasContext.font = `${fontmagnitude}px sans-serif`;
        planetariumCanvasContext.textAlign = "center";
        planetariumCanvasContext.textBaseline = "middle";
        planetariumCanvasContext.strokeStyle = toRgb(theme.labelStroke);
        planetariumCanvasContext.lineWidth = 4;
        drawTextOnArc(
          planetariumCanvasContext,
          constellation.name.toUpperCase(),
          width / 2,
          height / 2,
          textRadius,
          textAngle,
        );
      }

      // Paint star names for the selected constellation
      if (params.showStarNames === constellation.name) {
        for (const star of Object.values(starsByName)) {
          planetariumCanvasContext.save();
          planetariumCanvasContext.font = "9px sans-serif";
          planetariumCanvasContext.textAlign = "left";
          planetariumCanvasContext.textBaseline = "middle";
          planetariumCanvasContext.strokeStyle = toRgb(theme.labelStroke);
          planetariumCanvasContext.lineWidth = 3;
          planetariumCanvasContext.fillStyle = toRgb(theme.starLabel);
          planetariumCanvasContext.strokeText(
            star.name,
            star.xPos * width + 7,
            star.yPos * height,
          );
          planetariumCanvasContext.fillText(
            star.name,
            star.xPos * width + 7,
            star.yPos * height,
          );
          planetariumCanvasContext.restore();
        }
      }

      // Paint star name on hover
      // drawImage places the secondary canvas at dx=-0.45*width, dy=-0.88*height at scale 1.9,
      // so the inverse mapping to secondary canvas logical coords is:
      if (params.showStarNames === "on_hover") {
        const logMouseX = (mousePos.x + 0.45 * width) / 1.9;
        const logMouseY = (mousePos.y + 0.88 * height) / 1.9;
        for (const star of Object.values(starsByName)) {
          const dist = Math.hypot(
            logMouseX - star.xPos * width,
            logMouseY - star.yPos * height,
          );
          if (dist < 12) {
            planetariumCanvasContext.save();
            planetariumCanvasContext.font = "bold 10px sans-serif";
            planetariumCanvasContext.textAlign = "left";
            planetariumCanvasContext.textBaseline = "middle";
            planetariumCanvasContext.strokeStyle = toRgb(theme.labelStroke);
            planetariumCanvasContext.lineWidth = 3;
            planetariumCanvasContext.fillStyle = toRgb(theme.starLabel);
            planetariumCanvasContext.strokeText(
              star.name,
              star.xPos * width + 7,
              star.yPos * height,
            );
            planetariumCanvasContext.fillText(
              star.name,
              star.xPos * width + 7,
              star.yPos * height,
            );
            planetariumCanvasContext.restore();
          }
        }
      }

      // Show name of the searched star
      if (params.searchStar !== SEARCH_NONE && starsByName[params.searchStar]) {
        const star = starsByName[params.searchStar];
        planetariumCanvasContext.save();
        planetariumCanvasContext.font = "bold 11px sans-serif";
        planetariumCanvasContext.textAlign = "left";
        planetariumCanvasContext.textBaseline = "middle";
        planetariumCanvasContext.strokeStyle = toRgb(theme.labelStroke);
        planetariumCanvasContext.lineWidth = 3;
        planetariumCanvasContext.fillStyle = toRgb(theme.starLabel);
        planetariumCanvasContext.strokeText(
          star.name,
          star.xPos * width + 7,
          star.yPos * height,
        );
        planetariumCanvasContext.fillText(
          star.name,
          star.xPos * width + 7,
          star.yPos * height,
        );
        planetariumCanvasContext.restore();
      }
    }

    // Paint the planetary canvas in the main canvas
    // Big scale
    context.drawImage(
      planetariumCanvas,
      (width - width * 1.85) / 2,
      -height * 0.85,
      width * 1.85,
      height * 1.85,
    );
    // Scale 1:1
    //context.drawImage(planetariumCanvas, 0, 0, width, height);
  };
};

canvasSketch(sketch, settings);

/* TODOs  
- Theming Tweakpane with the theme
- Allow changing scale between 1:1 and current visible sky
- Paint horizon ??? (need hours??)
- Default starting options
- Exporting to html
- Embedding into any webpage via JS
*/
