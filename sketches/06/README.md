# Sketch 06 — Planetarium Star Map

An animated star map rendered on a 2160 × 1080 canvas using **canvas-sketch**. Stars and constellation lines rotate with the day of year, simulating the night sky's annual cycle. A **Tweakpane** panel exposes all controls at runtime; the same options can be pre-set in the `CONFIG` object at the top of `sketch-06.js` before launching.

## Running

```bash
npx canvas-sketch sketch-06.js --open
```

---

## Configuration (`CONFIG`)

Edit the `CONFIG` object in `sketch-06.js` to pre-configure the sketch before it opens. Every field maps 1-to-1 to a control in the Tweakpane panel.

### Sky display

| Field                    | Type      | Default  | Values                                                            |
| ------------------------ | --------- | -------- | ----------------------------------------------------------------- |
| `viewScale`              | `string`  | `"sky"`  | `"sky"` — cropped panoramic view · `"1:1"` — full square map      |
| `showGrid`               | `boolean` | `true`   | `true` / `false`                                                  |
| `showConstellationName`  | `boolean` | `true`   | `true` / `false`                                                  |
| `showConstellationLines` | `boolean` | `true`   | `true` / `false`                                                  |
| `showStarNames`          | `string`  | `"none"` | `"none"` · `"on_hover"` · any constellation name (e.g. `"Orion"`) |

`showStarNames` accepts any constellation name present in `constellations_v3.json` — those stars' names will always be visible.

---

### Date / time

| Field       | Type      | Default | Values                                                   |
| ----------- | --------- | ------- | -------------------------------------------------------- |
| `dayOfYear` | `integer` | today   | `1` (Jan 1) – `365` (Dec 31)                             |
| `autoplay`  | `boolean` | `false` | `true` — advances one day every 50 ms · `false` — static |

---

### Theme

| Field   | Type     | Default  | Values                                                                           |
| ------- | -------- | -------- | -------------------------------------------------------------------------------- |
| `theme` | `string` | `"blue"` | `"blue"` · `"monochrome"` · `"nightmode"` · `"light"` · `"elegant"` · `"custom"` |

Setting `theme: "custom"` unlocks the individual colour pickers in the panel. When any built-in preset is selected the colour pickers are read-only.

**Preset reference**

| Preset       | Look                                                     |
| ------------ | -------------------------------------------------------- |
| `blue`       | Deep midnight blue sky, pale gold lines, sky-blue stars  |
| `monochrome` | Pure black background, white/grey stars                  |
| `nightmode`  | Black background, deep red palette (dark-room safe)      |
| `light`      | White background, navy/indigo lines                      |
| `elegant`    | Dark navy, antique gold constellation lines, cream stars |

---

### Panel

| Field         | Type      | Default          | Values                                                            |
| ------------- | --------- | ---------------- | ----------------------------------------------------------------- |
| `panelCorner` | `string`  | `"bottom-right"` | `"top-left"` · `"top-right"` · `"bottom-left"` · `"bottom-right"` |
| `showPane`    | `boolean` | `true`           | `true` — panel visible on load · `false` — hidden                 |

---

### Search (initial selection)

These fields control which object the sky is centred on when the sketch first opens.

| Field                 | Type     | Default | Values                                                |
| --------------------- | -------- | ------- | ----------------------------------------------------- |
| `searchConstellation` | `string` | `""`    | Any constellation name, e.g. `"Orion"` · `""` to skip |
| `searchStar`          | `string` | `""`    | Any star name, e.g. `"Sirius"` · `""` to skip         |

#### Startup priority

When the sketch initialises it applies a strict hierarchy — only the highest-priority non-empty field takes effect:

```
1. searchStar          ← wins if non-empty; constellation field is cleared
2. searchConstellation ← wins if searchStar is empty
3. dayOfYear           ← used if both search fields are empty
```

The sky animates to the chosen object on load. After that, runtime behaviour is unchanged: moving the day slider clears both search fields, and selecting one search field clears the other.

**Examples**

```js
// Start centred on Sirius (star priority wins)
searchStar: "Sirius",
searchConstellation: "",   // ignored

// Start centred on Orion (no star set)
searchStar: "",
searchConstellation: "Orion",

// Start at a specific date, no search pre-selection
searchStar: "",
searchConstellation: "",
dayOfYear: 355,            // late December sky
```

---

## Data

Star and constellation data is loaded from `constellations_v3.json`. Each constellation entry contains:

- `name` — display name (used as the value for `searchConstellation` and `showStarNames`)
- `stars[]` — array of `{ name, ra, dec, magnitude }` objects
- `paths[]` — arrays of star name sequences that define the line art

`ra` is right ascension in hours (0 – 24). `dec` is declination in degrees (−90 – +90). `magnitude` is apparent magnitude; lower = brighter.
