/**
 * Kinematics Stagecrafter: Multi-Segment Motion Studio
 * The Thinking Experiment (PhysicsKit)
 * Design Palette: Teal (#0f7e9b), Amber (#d67b19), White (#ffffff), Text (#123140)
 * Light Mode Only.
 *
 * Scenario data holds only the physics inputs (initial state, and a plus either Δt or v_f per
 * stage). Every derived number, baton pass, worked solution, graph range and track scale is
 * computed from those inputs, so changing one number can never leave stale text behind.
 */

// ============================================================================
// 1. NUMBER + LATEX HELPERS
// ============================================================================
const clean = (n) => Math.round(n * 1e6) / 1e6;
/** Display number: always at least one decimal, trims float noise. */
function num(n) {
  const v = clean(n);
  if (Number.isInteger(v)) return v.toFixed(1);
  return String(parseFloat(v.toFixed(3)));
}
/** Number as it appears substituted into an equation (negatives in parentheses). */
const sub = (n) => (clean(n) < 0 ? `(${num(n)})` : num(n));
const isZero = (n) => Math.abs(n) < 1e-9;
/** Wrap a term in \cancel{} when the quantity that kills it is zero (course strike-out convention). */
const cancelIf = (zero, tex) => (zero ? `\\cancel{${tex}}` : tex);
const close = (user, correct) => Math.abs(user - correct) <= Math.max(0.05, 0.005 * Math.abs(correct));

// ============================================================================
// 2. SCENARIO DEFINITIONS (physics inputs only)
// ============================================================================
const STAGE_COLORS = ['#0f7e9b', '#d67b19', '#b33939'];

const SCENARIOS = {
  train: {
    id: 'train',
    title: '1. Commuter Train',
    difficulty: 'Foundations · 3 Stages',
    axis: 'x',
    vehicleType: 'train',
    x0: 0,
    v0: 0,
    narrative: `A regional commuter train departs from rest at Station North ($x_0 = 0\\text{ m}$).
    In <strong>Stage 1</strong>, it accelerates steadily at $+2.0\\text{ m/s}^2$ for $10.0\\text{ s}$.
    In <strong>Stage 2</strong>, it cruises at constant speed along open track for $30.0\\text{ s}$.
    In <strong>Stage 3</strong>, approaching Station South, the engineer brakes with steady acceleration $a = -4.0\\text{ m/s}^2$ until the train comes to a complete stop ($v_f = 0\\text{ m/s}$).`,
    targets: [
      'Find the velocity and position at the end of each stage.',
      'Pass both batons: each stage starts with the previous stage\'s final velocity <em>and</em> final position.',
      'Find the duration of Stage 3 ($\\Delta t_3$) and the position of Station South.'
    ],
    trapText: `Never plug the master-clock time into a stage's $\\Delta t$, and never assume a later stage starts from rest ($v_0 = 0$) or at the origin ($x_0 = 0$). Each stage starts wherever — and however fast — the previous one ended.`,
    stages: [
      { name: 'Stage 1: Speeding Up', subtitle: 'Departing Station', a: 2.0, dt: 10.0 },
      { name: 'Stage 2: Cruising', subtitle: 'Open Track', a: 0.0, dt: 30.0 },
      { name: 'Stage 3: Braking', subtitle: 'Station Approach', a: -4.0, vf: 0.0 }
    ]
  },

  rocket: {
    id: 'rocket',
    title: '2. Two-Stage Rocket',
    difficulty: 'Vertical Motion · 2 Stages',
    axis: 'y',
    vehicleType: 'rocket',
    x0: 0,
    v0: 0,
    narrative: `A model research rocket is fired straight up from the launchpad ($y_0 = 0\\text{ m}$), starting from rest.
    In <strong>Stage 1 (Powered Boost)</strong>, its motor burns for $3.0\\text{ s}$, giving a constant net upward acceleration of $+12.0\\text{ m/s}^2$.
    At burnout, <strong>Stage 2 (Coast to Apex)</strong> begins: the engine is off and the rocket coasts upward under gravity alone ($a = -10.0\\text{ m/s}^2$) until it momentarily stops at its highest point ($v_f = 0\\text{ m/s}$).`,
    targets: [
      'Find the rocket\'s velocity and altitude at burnout (end of Stage 1).',
      'Pass both batons: burnout velocity and burnout altitude start Stage 2.',
      'Find how long the rocket coasts and its maximum altitude ($y_{\\text{max}}$).'
    ],
    trapText: `Common trap: students think the rocket stops rising the instant the fuel runs out. At burnout it is still moving upward; the $-10\\text{ m/s}^2$ acceleration needs time to bring that velocity down to zero.`,
    stages: [
      { name: 'Stage 1: Powered Boost', subtitle: 'Engine Burn', a: 12.0, dt: 3.0 },
      { name: 'Stage 2: Coast to Apex', subtitle: 'Engine Off', a: -10.0, vf: 0.0 }
    ]
  },

  pursuit: {
    id: 'pursuit',
    title: '3. Highway Pursuit',
    difficulty: 'Two Bodies · 1 Interval',
    axis: 'x',
    vehicleType: 'police',
    x0: 0,
    v0: 0,
    other: { label: 'Speeder', x0: 0, v: 24.0 },
    narrative: `A speeding car passes a parked police cruiser at a constant $24.0\\text{ m/s}$ ($a = 0$).
    At that instant ($t = 0$), the cruiser starts from rest and accelerates at a steady $+3.0\\text{ m/s}^2$ to catch it.
    The cruiser's acceleration never changes, so its motion is <strong>one interval</strong> — no stages, no baton pass. Find when and where the cruiser catches the speeder.`,
    targets: [
      'Write a position equation for each car: $x_S(t)$ and $x_P(t) = \\tfrac{1}{2}at^2 + v_0t + x_0$.',
      'Decide what "catches" means physically, then solve for the catch time.',
      'Find the catch position and the cruiser\'s speed at the catch.'
    ],
    trapText: `Warning: the cruiser does NOT catch the speeder when their velocities are equal. Equal velocities is when the gap stops growing — the speeder is still ahead. Catching up requires equal <em>positions</em>.`,
    stages: [
      { name: 'Interval 1: Cruiser Accelerating', subtitle: 'Pursuit', a: 3.0, intercept: true }
    ]
  },

  incline: {
    id: 'incline',
    title: '4. Ramp Toss & Rollback',
    difficulty: 'Direction Reversal · 1 Interval',
    axis: 'x',
    vehicleType: 'cart',
    x0: 0,
    v0: 1.2,
    narrative: `A cart is launched up a smooth ramp from the $0\\text{ m}$ mark with an initial velocity of $+1.20\\text{ m/s}$ (up the ramp is positive).
    Gravity gives it a constant acceleration along the track of $a = -0.40\\text{ m/s}^2$ the whole time: going up, at the top, and coming back down.
    Because $a$ never changes, the entire trip is <strong>one interval</strong>, even though the cart stops and turns around. Analyze the first $6.0\\text{ s}$.`,
    targets: [
      'Find the cart\'s velocity and position at $t = 6.0\\text{ s}$.',
      'Find when the cart is at the top, and its velocity and acceleration there.',
      'Compare the displacement for the trip with the distance traveled.'
    ],
    trapText: `Key concept: at the top of the ramp the velocity is momentarily zero, but the acceleration is NOT zero. A turnaround is not a reason to split the motion into stages — only a change in $a$ is.`,
    stages: [
      { name: 'Interval 1: Up, Stop, Back Down', subtitle: 'Constant a', a: -0.4, dt: 6.0 }
    ]
  }
};

/** Derive every number from the physics inputs. Throws if the inputs are inconsistent. */
function buildScenario(sc) {
  let t = 0, x = sc.x0, v = sc.v0;
  sc.stages.forEach((st, i) => {
    st.index = i;
    st.n = i + 1;
    st.color = STAGE_COLORS[i % STAGE_COLORS.length];
    st.t0 = t; st.x0 = x; st.v0 = v;
    if (st.intercept) {
      // ½a t² + v0 t + x0 = xS0 + vS t   →   ½a t² + (v0 − vS) t + (x0 − xS0) = 0
      const o = sc.other;
      const A = 0.5 * st.a, B = st.v0 - o.v, C = st.x0 - o.x0;
      const disc = B * B - 4 * A * C;
      if (disc < 0) throw new Error(`${sc.id}: no intercept`);
      const roots = [(-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A)].filter(r => r > 1e-9);
      st.dt = Math.min(...roots);
      st.given = 'intercept';
      st.vf = st.v0 + st.a * st.dt;
    } else if (st.dt !== undefined) {
      st.given = 'dt';
      st.vf = st.v0 + st.a * st.dt;
    } else {
      st.given = 'vf';
      if (isZero(st.a)) throw new Error(`${sc.id} stage ${st.n}: need dt when a = 0`);
      st.dt = (st.vf - st.v0) / st.a;
    }
    if (!(st.dt > 0)) throw new Error(`${sc.id} stage ${st.n}: non-positive duration ${st.dt}`);
    st.dx = st.v0 * st.dt + 0.5 * st.a * st.dt * st.dt;
    st.xf = st.x0 + st.dx;
    st.t1 = st.t0 + st.dt;
    if (i > 0 && isZero(sc.stages[i - 1].a - st.a)) {
      console.error(`${sc.id}: stages ${i} and ${i + 1} have the same acceleration — merge them.`);
    }
    t = st.t1; x = st.xf; v = st.vf;
  });
  sc.totalTime = t;
  sc.totalDisplacement = x - sc.x0;
  // Distance = Σ|area|, splitting at any turnaround inside a stage
  sc.totalDistance = sc.stages.reduce((sum, st) => {
    const tTurn = isZero(st.a) ? -1 : -st.v0 / st.a;
    if (tTurn > 1e-9 && tTurn < st.dt - 1e-9) {
      const d1 = st.v0 * tTurn + 0.5 * st.a * tTurn * tTurn;
      return sum + Math.abs(d1) + Math.abs(st.dx - d1);
    }
    return sum + Math.abs(st.dx);
  }, 0);
  sc.multiStage = sc.stages.length > 1;
  return sc;
}
Object.values(SCENARIOS).forEach(buildScenario);

// ============================================================================
// 3. SYMBOLS, FIELDS, WORKED SOLUTIONS
// ============================================================================
function sym(sc, st) {
  const X = sc.axis;           // 'x' or 'y'
  const n = sc.multiStage ? st.n : null;
  const s = (base, extra) => {
    const parts = [extra, n].filter(p => p !== null && p !== undefined && p !== '');
    return parts.length ? `${base}_{${parts.join(',')}}` : base;
  };
  return {
    X,
    x0: s(X, '0'), v0: s('v', '0'), a: n ? `a_{${n}}` : 'a',
    dt: n ? `\\Delta t_{${n}}` : '\\Delta t',
    vf: s('v', 'f'), dx: n ? `\\Delta ${X}_{${n}}` : `\\Delta ${X}`,
    xf: s(X, 'f')
  };
}

const UNITS = { x0: 'm', v0: 'm/s', a: 'm/s²', dt: 's', vf: 'm/s', dx: 'm', xf: 'm' };

function fieldDefs(sc, st) {
  const S = sym(sc, st);
  const posWord = sc.axis === 'y' ? 'altitude' : 'position';
  const labels = {
    x0: `Start ${posWord} $${S.x0}$`,
    v0: `Start velocity $${S.v0}$`,
    a: `Acceleration $${S.a}$`,
    dt: st.given === 'intercept' ? `Catch time $t$` : `Duration $${S.dt}$`,
    vf: st.given === 'intercept' ? `Cruiser speed at catch $${S.vf}$` : `Final velocity $${S.vf}$`,
    dx: `Displacement $${S.dx}$`,
    xf: st.given === 'intercept' ? `Catch position $${S.xf}$` : `Final ${posWord} $${S.xf}$`
  };
  const givens = st.given === 'dt' ? ['x0', 'v0', 'a', 'dt']
    : st.given === 'vf' ? ['x0', 'v0', 'a', 'vf'] : ['x0', 'v0', 'a'];
  const unknowns = st.given === 'dt' ? ['vf', 'dx', 'xf']
    : st.given === 'vf' ? ['dt', 'dx', 'xf'] : ['dt', 'xf', 'vf'];
  const mk = (k, role) => ({
    key: k, role, label: labels[k], unit: UNITS[k], correct: st[k],
    inherited: role === 'given' && st.index > 0 && (k === 'x0' || k === 'v0')
  });
  return { givens: givens.map(k => mk(k, 'given')), unknowns: unknowns.map(k => mk(k, 'unknown')) };
}

function methodOptions(sc, st) {
  const X = sc.axis;
  if (st.given === 'intercept') {
    return {
      title: 'The catch happens when…',
      correct: ['pos'],
      options: [
        { value: 'vel', tex: `v_P = v_S`, text: 'the velocities are equal' },
        { value: 'pos', tex: `${X}_P = ${X}_S`, text: 'the positions are equal' }
      ]
    };
  }
  return {
    title: 'Equation I used for the displacement / position:',
    correct: isZero(st.a) ? ['quad', 'const', 'pos'] : ['quad', 'pos'],
    options: [
      { value: 'quad', tex: `\\Delta ${X} = v_0\\Delta t + \\tfrac{1}{2}a(\\Delta t)^2`, text: 'how far it moved this stage' },
      { value: 'const', tex: `\\Delta ${X} = v\\,\\Delta t`, text: 'only when a = 0' },
      { value: 'pos', tex: `${X} = \\tfrac{1}{2}at^2 + v_0t + ${X}_0`, text: 'where it is (t = time since the stage began)' }
    ]
  };
}

function workedSolution(sc, st) {
  const S = sym(sc, st);
  const X = S.X;
  const lines = [];
  if (st.given === 'intercept') {
    const o = sc.other;
    lines.push(['Position equations',
      `${X}_P = \\tfrac{1}{2}(${num(st.a)})t^2 + ${cancelIf(isZero(st.v0), `${sub(st.v0)}t`)} + ${cancelIf(isZero(st.x0), sub(st.x0))}, \\qquad ${X}_S = ${num(o.v)}\\,t ${isZero(o.x0) ? '' : `+ ${sub(o.x0)}`}`]);
    lines.push(['Catch: same position at the same time',
      `${X}_P = ${X}_S \\;\\Rightarrow\\; ${num(0.5 * st.a)}t^2 = ${num(o.v)}t \\;\\Rightarrow\\; t\\,(${num(0.5 * st.a)}t - ${num(o.v)}) = 0`]);
    lines.push(['Reject the root that is the start, not the catch',
      `\\cancel{t = 0} \\text{ (they start together)}, \\qquad t = ${num(st.dt)}\\text{ s}`]);
    lines.push(['Catch position', `${X}_P = \\tfrac{1}{2}(${num(st.a)})(${num(st.dt)})^2 = ${num(st.xf)}\\text{ m}`]);
    lines.push(['Cruiser speed at catch', `v_P = ${cancelIf(isZero(st.v0), sub(st.v0))} + (${num(st.a)})(${num(st.dt)}) = ${num(st.vf)}\\text{ m/s}`]);
    return lines;
  }
  if (st.given === 'dt') {
    lines.push(['Velocity', `${S.vf} = ${S.v0} + ${S.a}${S.dt} = ${cancelIf(isZero(st.v0), sub(st.v0))} + ${cancelIf(isZero(st.a), `${sub(st.a)}(${num(st.dt)})`)} = ${num(st.vf)}\\text{ m/s}`]);
  } else {
    lines.push(['Duration', `${S.vf} = ${S.v0} + ${S.a}${S.dt} \\;\\Rightarrow\\; ${S.dt} = \\dfrac{${S.vf} - ${S.v0}}{${S.a}} = \\dfrac{${sub(st.vf)} - ${sub(st.v0)}}{${sub(st.a)}} = ${num(st.dt)}\\text{ s}`]);
  }
  lines.push(['Displacement (how far it moved this stage)',
    `${S.dx} = ${S.v0}${S.dt} + \\tfrac{1}{2}${S.a}(${S.dt})^2 = ${cancelIf(isZero(st.v0), `${sub(st.v0)}(${num(st.dt)})`)} + ${cancelIf(isZero(st.a), `\\tfrac{1}{2}${sub(st.a)}(${num(st.dt)})^2`)} = ${num(st.dx)}\\text{ m}`]);
  lines.push([`Position (where it is — $t$ = time since this stage began = ${num(st.dt)} s)`,
    `${S.xf} = \\tfrac{1}{2}${S.a}t^2 + ${S.v0}t + ${S.x0} = ${cancelIf(isZero(st.a), `\\tfrac{1}{2}${sub(st.a)}(${num(st.dt)})^2`)} + ${cancelIf(isZero(st.v0), `${sub(st.v0)}(${num(st.dt)})`)} + ${cancelIf(isZero(st.x0), sub(st.x0))} = ${num(st.xf)}\\text{ m}`]);
  lines.push(['Check: the two answers are linked', `${S.xf} = ${S.x0} + ${S.dx} = ${num(st.x0)} + ${sub(st.dx)} = ${num(st.xf)}\\text{ m}`]);
  return lines;
}

// ============================================================================
// 4. SIMULATION CONTROLLER
// ============================================================================
class KinematicsStagecrafter {
  constructor() {
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1.0;
    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.activeGraphTab = 'vt';
    this.activeStageIndex = 0;
    this.progress = {}; // scenarioId -> [{ solved, revealed, values:{} }]

    const $ = (id) => document.getElementById(id);
    this.dom = {
      scenarioTabs: document.querySelectorAll('.scenario-tab'),
      scenarioDifficulty: $('scenarioDifficulty'),
      problemDescription: $('problemDescription'),
      questionTargets: $('questionTargets'),
      trapText: $('trapText'),
      hudClock: $('hudClock'), hudPosition: $('hudPosition'), hudPosLabel: $('hudPosLabel'),
      hudVelocity: $('hudVelocity'), hudAcceleration: $('hudAcceleration'), hudActiveStage: $('hudActiveStage'),
      btnPlay: $('btnPlay'), btnPause: $('btnPause'), btnStepBack: $('btnStepBack'),
      btnStepForward: $('btnStepForward'), btnReset: $('btnReset'),
      speedSelect: $('speedSelect'), timeScrubber: $('timeScrubber'),
      btnToggleHelp: $('btnToggleHelp'), btnCloseHelp: $('btnCloseHelp'), helpDrawer: $('helpDrawer'),
      trackCanvas: $('trackCanvas'), graphCanvas: $('graphCanvas'),
      tabVt: $('tabVt'), tabXt: $('tabXt'), tabBoth: $('tabBoth'), graphLegend: $('graphLegend'),
      batonTitle: $('batonTitle'), batonDesc: $('batonDesc'), batonVisual: $('batonVisual'),
      stageTabPills: $('stageTabPills'), tchartContent: $('tchartContent'),
      btnCheckStage: $('btnCheckStage'), btnRevealStage: $('btnRevealStage'), stageFeedback: $('stageFeedback'),
      synthesisTableBody: $('synthesisTableBody'), synthTotalDt: $('synthTotalDt'),
      synthClockRange: $('synthClockRange'), synthTotalDx: $('synthTotalDx'), synthTotalX: $('synthTotalX'),
      synthPosHead: $('synthPosHead'), synthDxHead: $('synthDxHead')
    };
    this.trackCtx = this.dom.trackCanvas.getContext('2d');
    this.graphCtx = this.dom.graphCanvas.getContext('2d');
    // Logical drawing sizes; the backing store is scaled by devicePixelRatio for crisp iPad rendering.
    this.graphSize = { w: 900, h: 260 };
    this.bindEvents();
    this.tex(document.body); // static header, help drawer, HUD and table labels
    this.loadScenario('train');
  }

  tex(el) {
    if (window.renderMathInElement && el) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  setupCanvas(canvas, ctx, w, h) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  stageProgress(i) { return this.progress[this.scenario.id][i]; }
  stageWord(st) { return this.scenario.multiStage ? `Stage ${st.n}` : 'The interval'; }

  bindEvents() {
    this.dom.scenarioTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.scenario;
        if (id && SCENARIOS[id]) {
          this.dom.scenarioTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.loadScenario(id);
        }
      });
    });
    this.dom.btnToggleHelp.addEventListener('click', () => {
      this.dom.helpDrawer.classList.toggle('hidden');
      this.dom.btnToggleHelp.setAttribute('aria-expanded', !this.dom.helpDrawer.classList.contains('hidden'));
    });
    this.dom.btnCloseHelp.addEventListener('click', () => {
      this.dom.helpDrawer.classList.add('hidden');
      this.dom.btnToggleHelp.setAttribute('aria-expanded', 'false');
    });
    this.dom.btnPlay.addEventListener('click', () => this.play());
    this.dom.btnPause.addEventListener('click', () => this.pause());
    this.dom.btnReset.addEventListener('click', () => this.reset());
    this.dom.btnStepBack.addEventListener('click', () => this.step(-0.2));
    this.dom.btnStepForward.addEventListener('click', () => this.step(0.2));
    this.dom.speedSelect.addEventListener('change', (e) => { this.playbackSpeed = parseFloat(e.target.value) || 1.0; });
    this.dom.timeScrubber.addEventListener('input', (e) => {
      this.pause();
      this.currentTime = parseFloat(e.target.value) || 0;
      this.updateHud();
      this.render();
    });
    const graphTabs = [
      { btn: this.dom.tabVt, mode: 'vt' }, { btn: this.dom.tabXt, mode: 'xt' }, { btn: this.dom.tabBoth, mode: 'both' }
    ];
    graphTabs.forEach(({ btn, mode }) => {
      btn.addEventListener('click', () => {
        graphTabs.forEach(g => g.btn.classList.remove('active'));
        btn.classList.add('active');
        this.activeGraphTab = mode;
        this.renderGraph();
      });
    });
    this.dom.btnCheckStage.addEventListener('click', () => this.checkActiveStage());
    this.dom.btnRevealStage.addEventListener('click', () => this.revealActiveStageSolution());
    window.addEventListener('resize', () => this.render());
  }

  loadScenario(id) {
    this.pause();
    this.scenario = SCENARIOS[id];
    const sc = this.scenario;
    if (!this.progress[id]) this.progress[id] = sc.stages.map(() => ({ solved: false, revealed: false, values: {} }));
    this.currentTime = 0;
    this.activeStageIndex = 0;
    this.trackSize = sc.axis === 'y' ? { w: 900, h: 300 } : { w: 900, h: 190 };

    this.dom.scenarioDifficulty.textContent = sc.difficulty;
    this.dom.problemDescription.innerHTML = sc.narrative;
    this.dom.trapText.innerHTML = sc.trapText;
    this.dom.questionTargets.innerHTML = sc.targets
      .map(t => `<div class="target-item"><span class="target-bullet">✦</span> <span>${t}</span></div>`).join('');
    this.dom.hudPosLabel.innerHTML = sc.axis === 'y' ? 'Altitude $y$:' : 'Position $x$:';
    this.dom.synthPosHead.innerHTML = sc.axis === 'y' ? 'End altitude $y_f$' : 'End position $x_f$';
    this.dom.synthDxHead.innerHTML = sc.axis === 'y' ? 'Segment $\\Delta y$' : 'Segment $\\Delta x$';

    this.dom.timeScrubber.min = 0;
    this.dom.timeScrubber.max = sc.totalTime;
    this.dom.timeScrubber.value = 0;

    this.renderLegend();
    this.renderBatonPassUI();
    this.renderStageTabs();
    this.renderTChart(this.activeStageIndex);
    this.renderSynthesisTable();

    [this.dom.problemDescription, this.dom.questionTargets, this.dom.trapText, this.dom.hudPosLabel,
      this.dom.synthPosHead, this.dom.synthDxHead].forEach(el => this.tex(el));
    this.updateHud();
    this.render();
  }

  // --------------------------------------------------------------------------
  // Physics state
  // --------------------------------------------------------------------------
  getKinematicStateAt(t) {
    const sc = this.scenario;
    const tc = Math.max(0, Math.min(t, sc.totalTime));
    let st = sc.stages[sc.stages.length - 1];
    for (const s of sc.stages) { if (tc <= s.t1 + 1e-9) { st = s; break; } }
    const dt = tc - st.t0;
    const x = st.x0 + st.v0 * dt + 0.5 * st.a * dt * dt;
    const v = st.v0 + st.a * dt;
    let otherX = null, otherV = null;
    if (sc.other) { otherV = sc.other.v; otherX = sc.other.x0 + sc.other.v * tc; }
    return { t: tc, dtLocal: dt, x, v, a: st.a, stage: st, stageIndex: st.index, otherX, otherV };
  }

  sampleRange(fn) {
    const sc = this.scenario;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 400; i++) {
      const s = this.getKinematicStateAt((i / 400) * sc.totalTime);
      fn(s).forEach(v => { if (v !== null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    }
    return [lo, hi];
  }

  // --------------------------------------------------------------------------
  // Playback
  // --------------------------------------------------------------------------
  play() {
    if (this.isPlaying) return;
    if (this.currentTime >= this.scenario.totalTime) this.currentTime = 0;
    this.isPlaying = true;
    this.dom.btnPlay.disabled = true;
    this.dom.btnPause.disabled = false;
    this.lastTimestamp = performance.now();
    this.animationLoop(this.lastTimestamp);
  }
  pause() {
    this.isPlaying = false;
    this.dom.btnPlay.disabled = false;
    this.dom.btnPause.disabled = true;
    if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
  }
  reset() { this.pause(); this.currentTime = 0; this.dom.timeScrubber.value = 0; this.updateHud(); this.render(); }
  step(delta) {
    this.pause();
    this.currentTime = clean(Math.max(0, Math.min(this.scenario.totalTime, this.currentTime + delta)));
    this.dom.timeScrubber.value = this.currentTime;
    this.updateHud();
    this.render();
  }
  animationLoop(timestamp) {
    if (!this.isPlaying) return;
    const deltaSec = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    this.currentTime += deltaSec * this.playbackSpeed;
    if (this.currentTime >= this.scenario.totalTime) {
      this.currentTime = this.scenario.totalTime;
      this.dom.timeScrubber.value = this.currentTime;
      this.updateHud(); this.render(); this.pause();
      return;
    }
    this.dom.timeScrubber.value = this.currentTime;
    this.updateHud();
    this.render();
    this.animationFrameId = requestAnimationFrame((t) => this.animationLoop(t));
  }

  updateHud() {
    const s = this.getKinematicStateAt(this.currentTime);
    const unitPos = 'm';
    this.dom.hudClock.textContent = `${s.t.toFixed(2)} s`;
    this.dom.hudPosition.textContent = `${clean(s.x).toFixed(Math.abs(s.x) < 10 ? 2 : 1)} ${unitPos}`;
    this.dom.hudVelocity.textContent = `${clean(s.v).toFixed(Math.abs(this.maxAbsV()) < 5 ? 2 : 1)} m/s`;
    this.dom.hudAcceleration.textContent = `${num(s.a)} m/s²`;
    this.dom.hudActiveStage.textContent = s.stage.name;
    this.dom.hudActiveStage.style.borderColor = s.stage.color;
    this.dom.hudActiveStage.style.color = s.stage.color;
    this.highlightBatonHandshake(s.t);
  }
  maxAbsV() { const [lo, hi] = this.sampleRange(s => [s.v]); return Math.max(Math.abs(lo), Math.abs(hi)); }

  // --------------------------------------------------------------------------
  // Track view
  // --------------------------------------------------------------------------
  renderTrack() {
    const { w, h } = this.trackSize;
    this.setupCanvas(this.dom.trackCanvas, this.trackCtx, w, h);
    const ctx = this.trackCtx;
    ctx.clearRect(0, 0, w, h);
    if (this.scenario.axis === 'y') this.renderTrackVertical(ctx, w, h);
    else this.renderTrackHorizontal(ctx, w, h);
  }

  vectorScales() {
    const sc = this.scenario;
    const vmax = Math.max(this.maxAbsV(), 1e-6);
    const amax = Math.max(...sc.stages.map(s => Math.abs(s.a)), 1e-6);
    return { v: (v) => (v / vmax) * 75, a: (a) => (a / amax) * 50 };
  }

  stageZone(st) {
    let lo = Math.min(st.x0, st.xf), hi = Math.max(st.x0, st.xf);
    const tTurn = isZero(st.a) ? -1 : -st.v0 / st.a;
    if (tTurn > 0 && tTurn < st.dt) {
      const xt = st.x0 + st.v0 * tTurn + 0.5 * st.a * tTurn * tTurn;
      lo = Math.min(lo, xt); hi = Math.max(hi, xt);
    }
    return [lo, hi];
  }

  renderTrackHorizontal(ctx, width, height) {
    const sc = this.scenario;
    const state = this.getKinematicStateAt(this.currentTime);
    const marginX = 60;
    const trackY = height - 42;
    const trackWidth = width - marginX * 2;
    let [minX, maxX] = this.sampleRange(s => [s.x, s.otherX]).map(clean);
    minX = Math.min(minX, 0);
    const pad = (maxX - minX) * 0.04 || 1;
    const axis = niceAxis(minX - (minX < 0 ? pad : 0), maxX + pad, 6);
    const scaleX = (x) => marginX + ((x - axis.min) / (axis.max - axis.min)) * trackWidth;

    const topBarY = 10, topBarH = 26;
    sc.stages.forEach((st, idx) => {
      const [zlo, zhi] = this.stageZone(st);
      const startPix = scaleX(zlo), endPix = scaleX(zhi);
      const zoneWidth = Math.max(4, endPix - startPix);
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(15, 126, 155, 0.04)' : 'rgba(214, 123, 25, 0.04)';
      ctx.fillRect(startPix, topBarY + topBarH, zoneWidth, trackY - (topBarY + topBarH));
      if (idx > 0) {
        ctx.strokeStyle = '#c8dbe3';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(scaleX(st.x0), topBarY); ctx.lineTo(scaleX(st.x0), trackY); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = idx % 2 === 0 ? '#eaf4f7' : '#fdf2e4';
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.2;
      const pillPad = 3;
      const pillW = Math.max(12, zoneWidth - pillPad * 2);
      ctx.beginPath(); ctx.roundRect(startPix + pillPad, topBarY, pillW, topBarH, 4); ctx.fill(); ctx.stroke();
      if (pillW > 45) {
        ctx.fillStyle = st.color;
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        const short = sc.multiStage ? `Stage ${idx + 1}` : 'One interval';
        ctx.fillText(pillW > 150 ? `${short}: ${st.subtitle}` : short, startPix + pillPad + 8, topBarY + 17);
      }
    });

    ctx.strokeStyle = '#c8dbe3';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(marginX - 20, trackY); ctx.lineTo(width - marginX + 20, trackY); ctx.stroke();

    ctx.fillStyle = '#718894';
    ctx.strokeStyle = '#97b8c7';
    ctx.lineWidth = 1.5;
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    axis.ticks.forEach(physX => {
      const pixX = scaleX(physX);
      ctx.beginPath(); ctx.moveTo(pixX, trackY - 6); ctx.lineTo(pixX, trackY + 6); ctx.stroke();
      ctx.fillText(`${axis.fmt(physX)} m`, pixX, trackY + 20);
    });

    if (sc.other && state.otherX !== null) {
      this.drawCar(ctx, scaleX(state.otherX), trackY, '#718894', `${sc.other.label} (${num(sc.other.v)} m/s)`);
    }
    const mainPixX = scaleX(state.x);
    if (sc.vehicleType === 'train') this.drawTrain(ctx, mainPixX, trackY, state.stage.color);
    else if (sc.vehicleType === 'police') this.drawPoliceCar(ctx, mainPixX, trackY, state.stage.color);
    else this.drawCart(ctx, mainPixX, trackY, state.stage.color);

    const k = this.vectorScales();
    const vehicleTopY = trackY - 28;
    if (Math.abs(state.v) > 1e-3) {
      this.drawVectorArrow(ctx, mainPixX, vehicleTopY - 14, k.v(state.v), '#0f7e9b', `v = ${num(state.v)} m/s`);
    } else {
      this.drawDotLabel(ctx, mainPixX, vehicleTopY - 14, '#0f7e9b', 'v = 0');
    }
    if (Math.abs(state.a) > 1e-9) {
      this.drawVectorArrow(ctx, mainPixX, vehicleTopY - 38, k.a(state.a), '#d67b19', `a = ${num(state.a)} m/s²`);
    } else {
      this.drawDotLabel(ctx, mainPixX, vehicleTopY - 38, '#d67b19', 'a = 0');
    }
  }

  renderTrackVertical(ctx, width, height) {
    const sc = this.scenario;
    const state = this.getKinematicStateAt(this.currentTime);
    const padT = 18, padB = 22;
    const axisX = 90;
    const [lo, hi] = this.sampleRange(s => [s.x]);
    const axis = niceAxis(Math.min(0, lo), hi * 1.05, 5);
    const scaleY = (y) => padT + (1 - (y - axis.min) / (axis.max - axis.min)) * (height - padT - padB);

    // Stage bands (horizontal) with labels
    sc.stages.forEach((st, idx) => {
      const [zlo, zhi] = this.stageZone(st);
      const yTop = scaleY(zhi), yBot = scaleY(zlo);
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(15, 126, 155, 0.06)' : 'rgba(214, 123, 25, 0.06)';
      ctx.fillRect(axisX, yTop, width - axisX - 20, yBot - yTop);
      if (idx > 0) {
        ctx.strokeStyle = '#c8dbe3';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(axisX, scaleY(st.x0)); ctx.lineTo(width - 20, scaleY(st.x0)); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = st.color;
      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Stage ${idx + 1}: ${st.subtitle}`, width - 30, (yTop + yBot) / 2 + 4);
    });

    // Altitude axis
    ctx.strokeStyle = '#97b8c7';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(axisX, scaleY(axis.max)); ctx.lineTo(axisX, scaleY(axis.min)); ctx.stroke();
    ctx.fillStyle = '#718894';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1.5;
    axis.ticks.forEach(yv => {
      const py = scaleY(yv);
      ctx.beginPath(); ctx.moveTo(axisX - 5, py); ctx.lineTo(axisX + 5, py); ctx.stroke();
      ctx.fillText(`${axis.fmt(yv)} m`, axisX - 9, py + 3);
    });
    ctx.save();
    ctx.translate(18, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillStyle = '#123140';
    ctx.fillText('Altitude y (m)', 0, 0);
    ctx.restore();

    // Launch pad
    ctx.strokeStyle = '#c8dbe3';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(axisX, scaleY(0)); ctx.lineTo(width - 20, scaleY(0)); ctx.stroke();

    const rx = axisX + 170;
    const ry = scaleY(state.x);
    this.drawRocket(ctx, rx, ry, state.stage.color, state.stageIndex === 0 && Math.abs(state.a) > 0 && state.t < sc.stages[0].t1);

    const k = this.vectorScales();
    if (Math.abs(state.v) > 1e-3) this.drawVectorArrowV(ctx, rx + 45, ry - 15, k.v(state.v), '#0f7e9b', `v = ${num(state.v)} m/s`);
    else this.drawDotLabel(ctx, rx + 45, ry - 15, '#0f7e9b', 'v = 0');
    this.drawVectorArrowV(ctx, rx + 150, ry - 15, k.a(state.a), '#d67b19', `a = ${num(state.a)} m/s²`);
  }

  drawTrain(ctx, x, y, color) {
    const w = 52, h = 24;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 4); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - w / 2 + 6, y - h + 5, 8, 8);
    ctx.fillRect(x - w / 2 + 18, y - h + 5, 8, 8);
    ctx.fillRect(x - w / 2 + 30, y - h + 5, 8, 8);
    ctx.fillStyle = '#123140';
    ctx.beginPath(); ctx.arc(x - 16, y, 4, 0, Math.PI * 2); ctx.arc(x + 16, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  drawCar(ctx, x, y, color, label) {
    const w = 44, h = 18;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 4); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y - h + 3, 16, 6);
    ctx.fillStyle = '#123140';
    ctx.beginPath(); ctx.arc(x - 14, y, 3.5, 0, Math.PI * 2); ctx.arc(x + 14, y, 3.5, 0, Math.PI * 2); ctx.fill();
    if (label) {
      ctx.fillStyle = color;
      ctx.font = '600 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 16);
    }
  }
  drawPoliceCar(ctx, x, y, color) {
    this.drawCar(ctx, x, y, color, 'Police Cruiser');
    ctx.fillStyle = '#d67b19';
    ctx.fillRect(x - 3, y - 22, 6, 4);
  }
  drawRocket(ctx, x, y, color, powered) {
    const w = 18, h = 34;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - h); ctx.lineTo(x + w / 2, y - h + 10); ctx.lineTo(x + w / 2, y - 4);
    ctx.lineTo(x - w / 2, y - 4); ctx.lineTo(x - w / 2, y - h + 10); ctx.closePath(); ctx.fill();
    if (powered) {
      ctx.fillStyle = '#ea8a24';
      ctx.beginPath(); ctx.moveTo(x - 5, y - 4); ctx.lineTo(x, y + 10); ctx.lineTo(x + 5, y - 4); ctx.closePath(); ctx.fill();
    }
  }
  drawCart(ctx, x, y, color) {
    const w = 36, h = 18;
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = '#123140';
    ctx.beginPath(); ctx.arc(x - 10, y, 3.5, 0, Math.PI * 2); ctx.arc(x + 10, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  drawVectorArrow(ctx, startX, startY, length, color, text) {
    const endX = startX + length, dir = Math.sign(length) || 1, headLen = 6;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, startY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, startY); ctx.lineTo(endX - headLen * dir, startY - 4);
    ctx.lineTo(endX - headLen * dir, startY + 4); ctx.closePath(); ctx.fill();
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, startX + length / 2, startY - 5);
  }
  drawVectorArrowV(ctx, x, startY, length, color, text) {
    const endY = startY - length, dir = Math.sign(length) || 1, headLen = 6;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, endY); ctx.lineTo(x - 4, endY + headLen * dir); ctx.lineTo(x + 4, endY + headLen * dir);
    ctx.closePath(); ctx.fill();
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 8, startY - length / 2 + 3);
  }
  drawDotLabel(ctx, x, y, color, text) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 7, y + 3);
  }

  // --------------------------------------------------------------------------
  // Graphs
  // --------------------------------------------------------------------------
  renderGraph() {
    const { w, h } = this.graphSize;
    this.setupCanvas(this.dom.graphCanvas, this.graphCtx, w, h);
    const ctx = this.graphCtx;
    ctx.clearRect(0, 0, w, h);
    if (this.activeGraphTab === 'vt') this.drawSingleGraph(ctx, 0, 0, w, h, 'v');
    else if (this.activeGraphTab === 'xt') this.drawSingleGraph(ctx, 0, 0, w, h, 'x');
    else { this.drawSingleGraph(ctx, 0, 0, w, h / 2, 'x'); this.drawSingleGraph(ctx, 0, h / 2, w, h / 2, 'v'); }
  }

  drawSingleGraph(ctx, gx, gy, gw, gh, type) {
    const sc = this.scenario;
    const padL = 55, padR = 25, padT = 20, padB = 30;
    const plotW = gw - padL - padR, plotH = gh - padT - padB;
    const tMax = sc.totalTime;
    const pick = (s) => (type === 'v' ? [s.v, s.otherV] : [s.x, s.otherX]);
    let [lo, hi] = this.sampleRange(pick).map(clean);
    lo = Math.min(lo, 0); hi = Math.max(hi, 0);
    const span = (hi - lo) || 1;
    const axis = niceAxis(lo < 0 ? lo - 0.05 * span : lo, hi + 0.08 * span, 4);
    const yMin = axis.min, yMax = axis.max;
    const scaleT = (t) => gx + padL + (t / tMax) * plotW;
    const scaleY = (y) => gy + padT + (1 - (y - yMin) / (yMax - yMin)) * plotH;
    const X = sc.axis;

    if (type === 'v') {
      sc.stages.forEach((st, idx) => {
        const xStart = scaleT(st.t0), xEnd = scaleT(st.t1), zeroY = scaleY(0);
        ctx.fillStyle = ['rgba(15, 126, 155, 0.12)', 'rgba(214, 123, 25, 0.12)', 'rgba(179, 57, 57, 0.12)'][idx % 3];
        ctx.beginPath(); ctx.moveTo(xStart, zeroY);
        for (let s = 0; s <= 40; s++) {
          const tS = st.t0 + (s / 40) * st.dt;
          ctx.lineTo(scaleT(tS), scaleY(st.v0 + st.a * (tS - st.t0)));
        }
        ctx.lineTo(xEnd, zeroY); ctx.closePath(); ctx.fill();
        if (idx > 0) {
          ctx.strokeStyle = '#c8dbe3';
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(xStart, gy + padT); ctx.lineTo(xStart, gy + gh - padB); ctx.stroke();
          ctx.setLineDash([]);
        }
        // Area label stays hidden until the student has solved (or revealed) this stage.
        const p = this.stageProgress(idx);
        const subN = sc.multiStage ? '₁₂₃'[idx] : '';
        ctx.fillStyle = st.color;
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Δ${X}${subN} = ${p.solved ? `${num(st.dx)} m` : '?'}`, scaleT((st.t0 + st.t1) / 2), gy + padT + 14);
      });
    }

    ctx.strokeStyle = '#e1edf2';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#718894';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    axis.ticks.forEach(yVal => {
      const yPix = scaleY(yVal);
      ctx.beginPath(); ctx.moveTo(gx + padL, yPix); ctx.lineTo(gx + gw - padR, yPix); ctx.stroke();
      ctx.fillText(axis.fmt(yVal), gx + padL - 8, yPix + 3);
    });
    const tAxis = niceAxis(0, tMax, 8);
    ctx.textAlign = 'center';
    tAxis.ticks.filter(t => t <= tMax + 1e-9).forEach(t => ctx.fillText(`${tAxis.fmt(t)} s`, scaleT(t), gy + gh - padB + 14));

    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = '#97b8c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx + padL, scaleY(0)); ctx.lineTo(gx + gw - padR, scaleY(0)); ctx.stroke();
    }

    ctx.fillStyle = '#123140';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(type === 'v' ? 'Velocity v(t) [m/s]' : `Position ${X}(t) [m]`, gx + padL, gy + 12);

    const steps = 300;
    const trace = (valFn) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const tS = (i / steps) * tMax;
        const px = scaleT(tS), py = scaleY(valFn(this.getKinematicStateAt(tS)));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    ctx.strokeStyle = type === 'v' ? '#0f7e9b' : '#d67b19';
    ctx.lineWidth = 2.5;
    trace(s => (type === 'v' ? s.v : s.x));
    if (sc.other) {
      ctx.strokeStyle = '#718894';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      trace(s => (type === 'v' ? s.otherV : s.otherX));
      ctx.setLineDash([]);
      ctx.fillStyle = '#718894';
      ctx.font = '600 10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`- - ${sc.other.label}`, gx + gw - padR, gy + 12);
    }

    const cur = this.getKinematicStateAt(this.currentTime);
    const phX = scaleT(this.currentTime), phY = scaleY(type === 'v' ? cur.v : cur.x);
    ctx.strokeStyle = '#123140';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(phX, gy + padT); ctx.lineTo(phX, gy + gh - padB); ctx.stroke();
    ctx.fillStyle = '#d67b19';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(phX, phY, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  renderLegend() {
    const sc = this.scenario;
    const chips = sc.stages.map((st, i) =>
      `<span class="legend-chip"><span class="chip-dot" style="background:${st.color}"></span> ${sc.multiStage ? `Stage ${i + 1}` : 'Interval'} area = Δ${sc.axis}</span>`);
    if (sc.other) chips.push(`<span class="legend-chip"><span class="chip-dot" style="background:#718894"></span> ${sc.other.label} (dashed)</span>`);
    chips.push('<span class="legend-chip playhead"><span class="chip-bar"></span> Current Playhead</span>');
    this.dom.graphLegend.innerHTML = chips.join('');
  }

  // --------------------------------------------------------------------------
  // Baton pass card
  // --------------------------------------------------------------------------
  renderBatonPassUI() {
    const sc = this.scenario;
    const c = this.dom.batonVisual;
    c.innerHTML = '';
    if (!sc.multiStage) {
      this.dom.batonTitle.textContent = 'No Baton Pass — One Interval';
      this.dom.batonDesc.innerHTML = 'The acceleration never changes, so there is nothing to hand off. One set of equations covers the whole motion.';
      const st = sc.stages[0];
      const solved = this.stageProgress(0).solved;
      const moments = [];
      if (sc.other) {
        const tEq = (sc.other.v - st.v0) / st.a;
        const gap = sc.other.x0 + sc.other.v * tEq - (st.x0 + st.v0 * tEq + 0.5 * st.a * tEq * tEq);
        moments.push(`<strong>Equal velocities</strong> at $t = ${num(tEq)}\\text{ s}$: the gap stops growing (${num(gap)} m) — not a catch.`);
        moments.push(`<strong>Equal positions</strong>: ${solved ? `$t = ${num(st.dt)}\\text{ s}$ at $${sc.axis} = ${num(st.xf)}\\text{ m}$` : 'solve the T-chart to reveal'}.`);
      } else {
        const tTurn = -st.v0 / st.a;
        if (tTurn > 0 && tTurn < st.dt) {
          const xTop = st.x0 + st.v0 * tTurn + 0.5 * st.a * tTurn * tTurn;
          moments.push(`<strong>Turnaround</strong>: ${solved ? `$t = ${num(tTurn)}\\text{ s}$, $${sc.axis} = ${num(xTop)}\\text{ m}$, $v = 0$, but $a = ${num(st.a)}\\text{ m/s}^2$` : 'solve the T-chart to reveal'}.`);
        }
        moments.push(`<strong>Displacement vs. distance</strong>: ${solved ? `$\\Delta ${sc.axis} = ${num(sc.totalDisplacement)}\\text{ m}$, distance traveled $= ${num(sc.totalDistance)}\\text{ m}$` : 'solve the T-chart to reveal'}.`);
      }
      moments.forEach(m => {
        const row = document.createElement('div');
        row.className = 'baton-pill-row';
        row.innerHTML = `<span class="baton-note">${m}</span>`;
        c.appendChild(row);
      });
      this.tex(c);
      return;
    }
    this.dom.batonTitle.textContent = 'The "Baton Pass" Boundary Connector';
    this.dom.batonDesc.innerHTML = 'Two things are handed from the end of one stage to the start of the next: the <strong>velocity</strong> and the <strong>position</strong>. Values appear once you solve the earlier stage.';
    sc.stages.slice(1).forEach((st, i) => {
      const prev = sc.stages[i];
      const Sp = sym(sc, prev), Sn = sym(sc, st);
      const solved = this.stageProgress(i).solved;
      const row = document.createElement('div');
      row.className = 'baton-pill-row';
      row.id = `batonRow_${i}`;
      row.innerHTML = `
        <span class="baton-source">Stage ${prev.n} end</span>
        <span class="baton-arrow">➔</span>
        <span class="baton-dest">Stage ${st.n} start</span>
        <span class="baton-tag">$${Sp.vf} = ${Sn.v0} = ${solved ? `${num(prev.vf)}\\text{ m/s}` : '\\;?'}$</span>
        <span class="baton-tag">$${Sp.xf} = ${Sn.x0} = ${solved ? `${num(prev.xf)}\\text{ m}` : '\\;?'}$</span>`;
      c.appendChild(row);
    });
    this.tex(c);
  }

  highlightBatonHandshake(t) {
    this.scenario.stages.forEach((st, idx) => {
      if (idx === 0) return;
      const row = document.getElementById(`batonRow_${idx - 1}`);
      if (!row) return;
      const near = Math.abs(t - st.t0) < 0.6;
      row.style.borderColor = near ? '#d67b19' : '#c8dbe3';
      row.style.boxShadow = near ? '0 0 10px rgba(214, 123, 25, 0.4)' : 'var(--shadow-sm)';
    });
  }

  // --------------------------------------------------------------------------
  // T-chart
  // --------------------------------------------------------------------------
  renderStageTabs() {
    const sc = this.scenario;
    const c = this.dom.stageTabPills;
    c.innerHTML = '';
    sc.stages.forEach((st, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `stage-pill-btn ${idx === this.activeStageIndex ? 'active' : ''}`;
      const p = this.stageProgress(idx);
      btn.textContent = `${sc.multiStage ? `Stage ${idx + 1}` : 'Interval'}${p.solved ? ' ✓' : ''}`;
      btn.addEventListener('click', () => {
        this.saveInputs();
        this.activeStageIndex = idx;
        this.renderStageTabs();
        this.renderTChart(idx);
      });
      c.appendChild(btn);
    });
  }

  saveInputs() {
    const p = this.stageProgress(this.activeStageIndex);
    this.dom.tchartContent.querySelectorAll('input[type=number]').forEach(el => { p.values[el.dataset.key] = el.value; });
    const m = this.dom.tchartContent.querySelector('input[name="stageEq"]:checked');
    p.values.__method = m ? m.value : '';
  }

  renderTChart(stageIdx) {
    const sc = this.scenario;
    const st = sc.stages[stageIdx];
    const p = this.stageProgress(stageIdx);
    const { givens, unknowns } = fieldDefs(sc, st);
    const method = methodOptions(sc, st);
    this.dom.stageFeedback.className = 'stage-feedback';
    this.dom.stageFeedback.innerHTML = '';

    const row = (f) => `
      <div class="tchart-row">
        <label for="input_${f.key}">${f.label}:</label>
        <div class="input-with-unit">
          <input type="number" id="input_${f.key}" data-key="${f.key}" step="any" placeholder="?" value="${p.values[f.key] ?? ''}">
          <span class="input-unit">${f.unit}</span>
          ${f.inherited ? `<span class="inherited-hint" id="hint_${f.key}" hidden>🤝 Baton pass from Stage ${st.n - 1}</span>` : ''}
        </div>
      </div>`;
    const opts = method.options.map(o => `
      <label class="eq-label">
        <input type="radio" name="stageEq" value="${o.value}" ${p.values.__method === o.value ? 'checked' : ''}>
        <span>$${o.tex}$ <span class="eq-note">— ${o.text}</span></span>
      </label>`).join('');

    const interval = sc.multiStage
      ? `Master clock: $t = ${num(st.t0)}\\text{ s}$ to $${num(st.t1)}\\text{ s}$`
      : 'Starts at master clock $t = 0$';
    this.dom.tchartContent.innerHTML = `
      <div class="stage-info-banner" style="margin-bottom: 0.8rem;">
        <strong style="color: ${st.color}; font-size: 0.95rem;">${st.name}</strong>
        <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: #4b6570;">${st.given === 'intercept' ? 'Solve for when the positions match.' : interval}</p>
      </div>
      <div class="tchart-section-label">Givens</div>
      <div class="tchart-inputs">${givens.map(row).join('')}</div>
      <div class="tchart-row" style="margin-top: 0.6rem;">
        <label>${method.title}</label>
        <div class="equation-options">${opts}</div>
      </div>
      <div class="tchart-section-label">Your results</div>
      <div class="tchart-inputs">${unknowns.map(row).join('')}</div>`;
    this.tex(this.dom.tchartContent);
  }

  /** Targeted, non-revealing feedback for a wrong value. */
  diagnose(sc, st, f, u) {
    const S = sym(sc, st);
    const prevN = st.n - 1;
    const posWord = sc.axis === 'y' ? 'altitude' : 'position';
    if (f.inherited) {
      if (isZero(u) && !isZero(f.correct)) {
        return f.key === 'v0'
          ? `The $v_0 = 0$ trap! Only the first stage starts from rest. Stage ${st.n} starts with whatever velocity Stage ${prevN} ended with.`
          : `Stage ${st.n} doesn't start at the origin — it starts where Stage ${prevN} ended. What was the ${posWord} at the end of Stage ${prevN}?`;
      }
      return `Baton pass: this value is handed over from the end of Stage ${prevN}. Check your Stage ${prevN} results.`;
    }
    switch (f.key) {
      case 'a':
        if (isZero(u) && !isZero(st.a)) return 'The engine may be off, but is anything still changing the velocity? Zero thrust is not zero acceleration.';
        if (close(-u, st.a)) return 'Check the sign of the acceleration. Which way does it point, and which way is positive?';
        return `Re-read the problem statement for $${S.a}$.`;
      case 'dt':
        if (st.given === 'intercept') {
          const tEq = (sc.other.v - st.v0) / st.a;
          if (close(u, tEq)) return 'At that time the velocities are equal — but the speeder is still ahead. The catch needs equal positions.';
          return 'Set the two position equations equal and solve for $t$. Which root is the catch?';
        }
        if (!isZero(st.t0) && close(u, st.t1)) return `That's the master-clock reading. The duration is how long <em>this stage</em> lasts.`;
        if (close(-u, st.dt)) return 'A duration can\'t be negative. Check the signs of $v_f$, $v_0$ and $a$.';
        return st.given === 'vf' ? `Solve $${S.vf} = ${S.v0} + ${S.a}${S.dt}$ for $${S.dt}$.` : `Re-read the problem statement for $${S.dt}$.`;
      case 'x0': return `Where does this ${sc.multiStage ? 'stage' : 'motion'} start? Re-read the problem.`;
      case 'v0': return 'Re-read the problem: how fast is it moving at the start?';
      case 'vf':
        if (st.given === 'intercept' && close(u, sc.other.v)) return "That's the speeder's speed. The cruiser has been speeding up the whole time.";
        if (close(-u, st.vf)) return 'Check your sign.';
        return `Use $${S.vf} = ${S.v0} + ${S.a}${S.dt}$ with this stage's values.`;
      case 'dx':
        if (!isZero(st.x0) && close(u, st.xf)) return `That's where it is at the end (${posWord}). Displacement is how far it moved <em>during this stage</em>.`;
        if (close(u, st.v0 * st.dt + st.a * st.dt * st.dt)) return 'Close — did you forget the $\\tfrac{1}{2}$ in $\\tfrac{1}{2}a(\\Delta t)^2$?';
        if (!isZero(st.a) && close(u, st.v0 * st.dt)) return 'You used $v\\Delta t$, but the velocity changes during this stage ($a \\neq 0$).';
        return 'Recheck the displacement calculation — watch signs and units.';
      case 'xf':
        if (!isZero(st.x0) && close(u, st.dx)) return `That's how far it moved during this stage. Where did the stage start? (Position = start ${posWord} + displacement.)`;
        if (close(u, st.v0 * st.dt + st.a * st.dt * st.dt + st.x0)) return 'Close — did you forget the $\\tfrac{1}{2}$?';
        return `Recheck the final ${posWord}. In $${sc.axis} = \\tfrac{1}{2}at^2 + v_0t + ${sc.axis}_0$, $t$ is the time since this stage began.`;
      default: return 'Recheck this value.';
    }
  }

  checkActiveStage() {
    const sc = this.scenario;
    const st = sc.stages[this.activeStageIndex];
    const p = this.stageProgress(this.activeStageIndex);
    const { givens, unknowns } = fieldDefs(sc, st);
    const method = methodOptions(sc, st);
    const fb = this.dom.stageFeedback;
    this.dom.tchartContent.querySelectorAll('.inherited-hint').forEach(h => { h.hidden = true; });
    this.dom.tchartContent.querySelectorAll('input.wrong').forEach(el => el.classList.remove('wrong'));

    const fail = (msg, key) => {
      if (key) {
        const el = document.getElementById(`input_${key}`);
        if (el) { el.classList.add('wrong'); el.focus(); }
        const hint = document.getElementById(`hint_${key}`);
        if (hint) hint.hidden = false;
      }
      fb.className = 'stage-feedback error';
      fb.innerHTML = `<strong>⚠️ Check your thinking:</strong> ${msg}`;
      this.tex(fb);
      this.saveInputs();
    };

    const read = (f) => {
      const el = document.getElementById(`input_${f.key}`);
      return el ? parseFloat(el.value) : NaN;
    };
    for (const f of givens) {
      const u = read(f);
      if (isNaN(u)) return fail(`Enter a value for ${f.label}.`, f.key);
      if (!close(u, f.correct)) return fail(this.diagnose(sc, st, f, u), f.key);
    }
    const chosen = this.dom.tchartContent.querySelector('input[name="stageEq"]:checked');
    if (!chosen) return fail(st.given === 'intercept' ? 'Decide what physically has to be true at the moment of the catch.' : 'Select the equation you used for the displacement or position.');
    if (!method.correct.includes(chosen.value)) {
      if (chosen.value === 'const') return fail(`$\\Delta ${sc.axis} = v\\,\\Delta t$ only works when $a = 0$. This stage has $a \\neq 0$, so the velocity changes during it.`);
      if (chosen.value === 'vel') return fail('Equal velocities means the gap has stopped growing, not that the cruiser has caught up. "Catch" means both cars are at the same place at the same time.');
    }
    for (const f of unknowns) {
      const u = read(f);
      if (isNaN(u)) return fail(`Enter your result for ${f.label}.`, f.key);
      if (!close(u, f.correct)) return fail(this.diagnose(sc, st, f, u), f.key);
    }

    p.solved = true;
    this.saveInputs();
    fb.className = 'stage-feedback success';
    fb.innerHTML = `<strong>✓ ${this.stageWord(st)} is correct.</strong>${this.solutionHtml(sc, st)}`;
    this.tex(fb);
    this.afterSolve();
  }

  solutionHtml(sc, st) {
    return `<ul class="solution-steps">${workedSolution(sc, st)
      .map(([label, eq]) => `<li><span class="step-label">${label}</span><br>$${eq}$</li>`).join('')}</ul>`;
  }

  revealActiveStageSolution() {
    const sc = this.scenario;
    const st = sc.stages[this.activeStageIndex];
    const p = this.stageProgress(this.activeStageIndex);
    const { givens, unknowns } = fieldDefs(sc, st);
    [...givens, ...unknowns].forEach(f => {
      const el = document.getElementById(`input_${f.key}`);
      if (el) el.value = num(f.correct);
    });
    const method = methodOptions(sc, st);
    const radio = this.dom.tchartContent.querySelector(`input[name="stageEq"][value="${method.correct[0]}"]`);
    if (radio) radio.checked = true;
    p.solved = true;
    p.revealed = true;
    this.saveInputs();
    const fb = this.dom.stageFeedback;
    fb.className = 'stage-feedback hint';
    fb.innerHTML = `<strong>Worked solution — ${this.stageWord(st)}:</strong>${this.solutionHtml(sc, st)}`;
    this.tex(fb);
    this.afterSolve();
  }

  afterSolve() {
    this.renderStageTabs();
    this.renderBatonPassUI();
    this.renderSynthesisTable();
    this.renderGraph();
  }

  // --------------------------------------------------------------------------
  // Synthesis table (fills in only as stages are solved)
  // --------------------------------------------------------------------------
  renderSynthesisTable() {
    const sc = this.scenario;
    const tbody = this.dom.synthesisTableBody;
    tbody.innerHTML = '';
    const q = '<span class="synth-unknown">?</span>';
    sc.stages.forEach((st, idx) => {
      const p = this.stageProgress(idx);
      const s = p.solved;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong style="color: ${st.color}">${sc.multiStage ? `Stage ${idx + 1}` : 'Interval'}</strong>${p.revealed ? ' <span class="synth-shown">(shown)</span>' : ''}</td>
        <td>${s ? `${num(st.dt)} s` : q}</td>
        <td>${s ? `${num(st.t0)} s → ${num(st.t1)} s` : `${num(st.t0)} s → ${q}`}</td>
        <td>${s ? `${st.dx >= 0 ? '+' : ''}${num(st.dx)} m` : q}</td>
        <td>${s ? `${num(st.xf)} m` : q}</td>`;
      tbody.appendChild(row);
    });
    const all = sc.stages.every((_, i) => this.stageProgress(i).solved);
    this.dom.synthTotalDt.innerHTML = `<strong>${all ? `${num(sc.totalTime)} s` : '?'}</strong>`;
    this.dom.synthClockRange.innerHTML = `<strong>0.0 s → ${all ? `${num(sc.totalTime)} s` : '?'}</strong>`;
    this.dom.synthTotalDx.innerHTML = `<strong>${all ? `${sc.totalDisplacement >= 0 ? '+' : ''}${num(sc.totalDisplacement)} m` : '?'}</strong>`;
    this.dom.synthTotalX.innerHTML = '<strong>—</strong>';
  }

  render() { this.renderTrack(); this.renderGraph(); }
}

// ============================================================================
// 5. AXIS HELPER
// ============================================================================
function niceAxis(lo, hi, targetTicks) {
  if (hi - lo < 1e-9) hi = lo + 1;
  const raw = (hi - lo) / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
  const min = Math.floor(lo / step + 1e-9) * step;
  const max = Math.ceil(hi / step - 1e-9) * step;
  const ticks = [];
  for (let v = min; v <= max + step * 1e-6; v += step) ticks.push(clean(v));
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9) + (step / mag === 2.5 ? 1 : 0));
  return { min, max, step, ticks, fmt: (v) => clean(v).toFixed(decimals) };
}

window.addEventListener('DOMContentLoaded', () => {
  window.stagecrafter = new KinematicsStagecrafter();
});
