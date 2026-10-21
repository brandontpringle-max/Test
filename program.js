// The training programme. Edit this file to change exercises or the running plan.

const UNIT = 'kg';

// Every day finishes with lower-back work.
const SUPERMAN = { id: 'superman', name: 'Superman hold', rx: '3 × 30–60 s hold', time: true };

// Monday–Friday push / pull / legs / push / pull. Main compound lift first.
const DAYS = {
  push1: {
    name: 'Push (chest)', weekday: 1,
    exercises: [
      { id: 'bench', name: 'Bench press', rx: '3 × 5–10', compound: true },
      { id: 'incline-db', name: 'Incline dumbbell press', rx: '3 × 8–10' },
      { id: 'chest-fly', name: 'Cable / machine chest fly', rx: '3 × 10' },
      { id: 'lateral-raise', name: 'Lateral raise', rx: '3 × 10' },
      { id: 'tricep-pushdown', name: 'Triceps pushdown', rx: '3 × 10' },
      SUPERMAN,
    ],
  },
  pull1: {
    name: 'Pull (back)', weekday: 2,
    exercises: [
      { id: 'lat-pulldown', name: 'Lat pulldown', rx: '3 × 8–10' },
      { id: 'cable-row', name: 'Seated cable row', rx: '3 × 8–10' },
      { id: 'face-pull', name: 'Face pull', rx: '3 × 10' },
      { id: 'bicep-curl', name: 'Biceps curl', rx: '3 × 10' },
      { id: 'reverse-hyper', name: 'Reverse hyperextension', rx: '3 × 10' },
      SUPERMAN,
    ],
  },
  legs: {
    name: 'Legs', weekday: 3,
    exercises: [
      { id: 'squat', name: 'Squat', rx: '3 × 5–10', compound: true },
      { id: 'bulgarian', name: 'Bulgarian split squat', rx: '3 × 8 each leg' },
      { id: 'ham-curl', name: 'Hamstring curl', rx: '3 × 10' },
      { id: 'leg-extension', name: 'Quad extension', rx: '3 × 10' },
      { id: 'calf-raise', name: 'Calf raise', rx: '3 × 10–15' },
      SUPERMAN,
    ],
  },
  push2: {
    name: 'Push (shoulders)', weekday: 4,
    exercises: [
      { id: 'ohp', name: 'Overhead press', rx: '3 × 5–10', compound: true },
      { id: 'incline-db', name: 'Incline dumbbell press', rx: '3 × 8–10' },
      { id: 'lateral-raise', name: 'Lateral raise', rx: '3 × 10–12' },
      { id: 'rear-delt-fly', name: 'Rear delt fly', rx: '3 × 10–12' },
      { id: 'tricep-overhead', name: 'Overhead triceps extension', rx: '3 × 10' },
      SUPERMAN,
    ],
  },
  pull2: {
    name: 'Pull (lower back)', weekday: 5,
    exercises: [
      { id: 'deadlift', name: 'Deadlift', rx: '3 × 5', compound: true },
      { id: 'reverse-hyper', name: 'Reverse hyperextension', rx: '3 × 10' },
      { id: 'db-row', name: 'One-arm dumbbell row', rx: '3 × 8–10' },
      { id: 'lat-pulldown', name: 'Lat pulldown', rx: '3 × 8–10' },
      { id: 'hammer-curl', name: 'Hammer curl', rx: '3 × 10' },
      SUPERMAN,
    ],
  },
};

// Couch to 5K (based on the NHS 9-week plan), done after the weights.
// r = run, w = walk, in seconds. A 5-minute warm-up and cool-down walk are added automatically.
const rep = (n, s) => Array(n).fill(s).join(' ');
const C25K = [
  [rep(7, 'r60 w90') + ' r60', rep(7, 'r60 w90') + ' r60', rep(7, 'r60 w90') + ' r60'],
  [rep(5, 'r90 w120') + ' r90', rep(5, 'r90 w120') + ' r90', rep(5, 'r90 w120') + ' r90'],
  [rep(2, 'r90 w90 r180 w180'), rep(2, 'r90 w90 r180 w180'), rep(2, 'r90 w90 r180 w180')],
  ['r180 w90 r300 w150 r180 w90 r300', 'r180 w90 r300 w150 r180 w90 r300', 'r180 w90 r300 w150 r180 w90 r300'],
  ['r300 w180 r300 w180 r300', 'r480 w300 r480', 'r1200'],
  ['r300 w180 r480 w180 r300', 'r600 w180 r600', 'r1500'],
  ['r1500', 'r1500', 'r1500'],
  ['r1680', 'r1680', 'r1680'],
  ['r1800', 'r1800', 'r1800'],
];
