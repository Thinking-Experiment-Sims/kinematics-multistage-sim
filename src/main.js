/**
 * Kinematics Stagecrafter: Multi-Segment Motion Studio
 * The Thinking Experiment (PhysicsKit)
 * Design Palette: Teal (#0f7e9b), Amber (#d67b19), White (#ffffff), Text (#123140)
 * Light Mode Only.
 */

// ============================================================================
// 1. DATA MODELS: 4 Pedagogical Inquiry Scenarios (PER Aligned)
// ============================================================================
const SCENARIOS = {
  train: {
    id: 'train',
    title: '1. Commuter Train',
    difficulty: 'Foundations · 3 Stages',
    narrative: `A regional commuter train departs from rest at Station North ($x_0 = 0\\text{ m}$). 
    In <strong>Stage 1</strong>, it accelerates steadily at $+2.0\\text{ m/s}^2$ for $10.0\\text{ s}$. 
    In <strong>Stage 2</strong>, it coasts at constant speed along open track for $30.0\\text{ s}$. 
    In <strong>Stage 3</strong>, approaching Station South, engineer brakes with steady acceleration $a = -4.0\\text{ m/s}^2$ until coming to a complete stop ($v_f = 0\\text{ m/s}$).`,
    targets: [
      'Find the velocity at the end of Stage 1 ($v_{f,1}$).',
      'Pass the baton: identify the starting velocity of Stage 2 ($v_{0,2}$) and Stage 3 ($v_{0,3}$).',
      'Calculate the duration of Stage 3 (\\(\\Delta t_3\\)) and total track displacement (\\(\\Delta x_{\\text{total}}\\)).'
    ],
    trapText: `Never plug the total trip time (45 s) into Stage 1's formula or assume Stage 2 starts from rest ($v_0 = 0$). Stage 2 starts at whatever speed Stage 1 reached ($20\\text{ m/s}$)!`,
    stages: [
      {
        name: 'Stage 1: Speeding Up',
        subtitle: 'Departing Station',
        color: '#0f7e9b',
        dt: 10.0,
        t0: 0,
        t1: 10.0,
        x0: 0,
        v0: 0,
        a: 2.0,
        calc: {
          vf: 20.0,
          dx: 100.0,
          xf: 100.0,
          formulaV: 'v_f = v_0 + a \\Delta t = 0 + (2.0)(10.0) = 20.0\\text{ m/s}',
          formulaX: '\\Delta x_1 = v_0 \\Delta t + \\frac{1}{2}a (\\Delta t)^2 = 0 + \\frac{1}{2}(2.0)(10^2) = 100.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Initial Velocity (v₀,₁)', correct: 0, unit: 'm/s' },
          a:  { label: 'Acceleration (a₁)', correct: 2.0, unit: 'm/s²' },
          dt: { label: 'Time Interval (Δt₁)', correct: 10.0, unit: 's' }
        },
        equationKey: 'eq1'
      },
      {
        name: 'Stage 2: Cruising',
        subtitle: 'Open Track Coast',
        color: '#d67b19',
        dt: 30.0,
        t0: 10.0,
        t1: 40.0,
        x0: 100.0,
        v0: 20.0, // Baton pass from stage 1 vf
        a: 0.0,
        calc: {
          vf: 20.0,
          dx: 600.0,
          xf: 700.0,
          formulaV: 'v_f = v_0 = 20.0\\text{ m/s} \\quad (a = 0)',
          formulaX: '\\Delta x_2 = v \\cdot \\Delta t = (20.0\\text{ m/s})(30.0\\text{ s}) = 600.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Initial Velocity (v₀,₂)', correct: 20.0, unit: 'm/s', inheritedFrom: 'Stage 1 v_f' },
          a:  { label: 'Acceleration (a₂)', correct: 0.0, unit: 'm/s²' },
          dt: { label: 'Time Interval (Δt₂)', correct: 30.0, unit: 's' }
        },
        equationKey: 'eq_const'
      },
      {
        name: 'Stage 3: Braking',
        subtitle: 'Station Approach',
        color: '#b33939',
        dt: 5.0,
        t0: 40.0,
        t1: 45.0,
        x0: 700.0,
        v0: 20.0, // Baton pass from stage 2 vf
        a: -4.0,
        calc: {
          vf: 0.0,
          dx: 50.0,
          xf: 750.0,
          formulaV: '\\Delta t_3 = \\frac{v_f - v_0}{a} = \\frac{0 - 20.0}{-4.0} = 5.0\\text{ s}',
          formulaX: '\\Delta x_3 = v_0 \\Delta t_3 + \\frac{1}{2}a_3 (\\Delta t_3)^2 = (20.0)(5.0) + \\frac{1}{2}(-4.0)(5.0^2) = 100.0 - 50.0 = 50.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Initial Velocity (v₀,₃)', correct: 20.0, unit: 'm/s', inheritedFrom: 'Stage 2 v_f' },
          vf: { label: 'Final Velocity (v_f,₃)', correct: 0.0, unit: 'm/s' },
          a:  { label: 'Acceleration (a₃)', correct: -4.0, unit: 'm/s²' }
        },
        equationKey: 'eq2'
      }
    ],
    batonPasses: [
      { from: 'Stage 1 End', to: 'Stage 2 Start', variable: 'v_{f,1} = v_{0,2} = 20.0\\text{ m/s}' },
      { from: 'Stage 2 End', to: 'Stage 3 Start', variable: 'v_{f,2} = v_{0,3} = 20.0\\text{ m/s}' }
    ],
    totalTime: 45.0,
    totalDistance: 750.0,
    vehicleType: 'train'
  },

  rocket: {
    id: 'rocket',
    title: '2. Two-Stage Rocket',
    difficulty: 'Vertical Motion · 2 Stages',
    narrative: `A model research rocket is fired vertically from the launchpad ($y_0 = 0\\text{ m}$) from rest. 
    In <strong>Stage 1 (Powered Boost)</strong>, its solid rocket motor burns for $3.0\\text{ s}$, creating a constant upward acceleration of $+12.0\\text{ m/s}^2$. 
    At $t = 3.0\\text{ s}$, burnout occurs. In <strong>Stage 2 (Coast to Apex)</strong>, the engine is off, and the rocket coasts upward under gravity alone ($a = -10.0\\text{ m/s}^2$) until it momentarily stops at maximum height (apex, $v_f = 0\\text{ m/s}$).`,
    targets: [
      'Find rocket altitude and upward velocity at motor burnout (Stage 1).',
      'Pass the baton: use burnout velocity as the starting launch speed for Stage 2 free-fall.',
      'Determine how much higher it coasts and the apex height ($y_{\\text{max}}$).'
    ],
    trapText: `Common trap: Students often think the rocket stops rising the instant the fuel runs out! It is still rocketing upward at 36 m/s, so inertia carries it high into Stage 2.`,
    stages: [
      {
        name: 'Stage 1: Powered Boost',
        subtitle: 'Engine Burn',
        color: '#0f7e9b',
        dt: 3.0,
        t0: 0,
        t1: 3.0,
        x0: 0,
        v0: 0,
        a: 12.0,
        calc: {
          vf: 36.0,
          dx: 54.0,
          xf: 54.0,
          formulaV: 'v_{f,1} = v_0 + a_1 \\Delta t_1 = 0 + (12.0)(3.0) = 36.0\\text{ m/s}',
          formulaX: '\\Delta y_1 = \\frac{1}{2}a_1 (\\Delta t_1)^2 = \\frac{1}{2}(12.0)(3.0^2) = 54.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Initial Velocity (v₀,₁)', correct: 0, unit: 'm/s' },
          a:  { label: 'Boost Accel (a₁)', correct: 12.0, unit: 'm/s²' },
          dt: { label: 'Burn Time (Δt₁)', correct: 3.0, unit: 's' }
        },
        equationKey: 'eq1'
      },
      {
        name: 'Stage 2: Free Fall to Apex',
        subtitle: 'Coast Under Gravity',
        color: '#d67b19',
        dt: 3.6,
        t0: 3.0,
        t1: 6.6,
        x0: 54.0,
        v0: 36.0, // Baton pass
        a: -10.0,
        calc: {
          vf: 0.0,
          dx: 64.8,
          xf: 118.8,
          formulaV: '\\Delta t_2 = \\frac{v_f - v_0}{a_2} = \\frac{0 - 36.0}{-10.0} = 3.6\\text{ s}',
          formulaX: '\\Delta y_2 = v_0 \\Delta t_2 + \\frac{1}{2}a_2 (\\Delta t_2)^2 = (36.0)(3.6) + \\frac{1}{2}(-10.0)(3.6^2) = 129.6 - 64.8 = 64.8\\text{ m} \\implies y_{\\text{max}} = 54.0 + 64.8 = 118.8\\text{ m}'
        },
        inputs: {
          v0: { label: 'Burnout Velocity (v₀,₂)', correct: 36.0, unit: 'm/s', inheritedFrom: 'Burnout v_{f,1}' },
          vf: { label: 'Apex Velocity (v_f,₂)', correct: 0.0, unit: 'm/s' },
          a:  { label: 'Free-fall Accel (g)', correct: -10.0, unit: 'm/s²' }
        },
        equationKey: 'eq2'
      }
    ],
    batonPasses: [
      { from: 'Burnout (Stage 1 End)', to: 'Coast Start (Stage 2)', variable: 'v_{f,1} = v_{0,2} = 36.0\\text{ m/s}' }
    ],
    totalTime: 6.6,
    totalDistance: 118.8,
    vehicleType: 'rocket'
  },

  pursuit: {
    id: 'pursuit',
    title: '3. Highway Pursuit',
    difficulty: 'Two-Body Catchup · 2 Bodies',
    narrative: `A speeding car speeds past a stationary police cruiser at a constant $v = 24.0\\text{ m/s}$ ($a = 0$). 
    At that exact moment ($t = 0$), the patrol car starts from rest ($v_0 = 0$) and accelerates at a steady $+3.0\\text{ m/s}^2$ to catch the speeder. 
    Analyze the dual equations of motion to find when and where the police car intercepts the speeder.`,
    targets: [
      'Write the position equation for the Speeder: \\(x_S(t) = 24.0 t\\).',
      'Write the position equation for the Police: \\(x_P(t) = \\frac{1}{2}(3.0)t^2\\).',
      'Equate positions to find the catch-up time (\\(t = 16.0\\text{ s}\\)) and distance (\\(384.0\\text{ m}\\)).'
    ],
    trapText: `Warning: The police car does NOT catch the speeder when their velocities are equal! At t = 8s both go 24 m/s, but the speeder is far ahead. Catch-up requires equal positions!`,
    stages: [
      {
        name: 'Stage 1: Speed Match Phase (0 - 8s)',
        subtitle: 'Cruiser Gaining Speed',
        color: '#0f7e9b',
        dt: 8.0,
        t0: 0,
        t1: 8.0,
        x0: 0,
        v0: 0,
        a: 3.0,
        calc: {
          vf: 24.0,
          dx: 96.0,
          xf: 96.0,
          formulaV: 'v_P(8) = (3.0)(8.0) = 24.0\\text{ m/s} \\quad [x_S = 192\\text{m}, x_P = 96\\text{m}]',
          formulaX: 'Gap is maximum at equal velocities: \\Delta x_{\\text{gap}} = 192 - 96 = 96.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Police v₀', correct: 0, unit: 'm/s' },
          a:  { label: 'Police Accel', correct: 3.0, unit: 'm/s²' },
          dt: { label: 'Time to match 24 m/s', correct: 8.0, unit: 's' }
        },
        equationKey: 'eq1'
      },
      {
        name: 'Stage 2: Overtake Phase (8 - 16s)',
        subtitle: 'Closing the Gap',
        color: '#d67b19',
        dt: 8.0,
        t0: 8.0,
        t1: 16.0,
        x0: 96.0,
        v0: 24.0,
        a: 3.0,
        calc: {
          vf: 48.0,
          dx: 288.0,
          xf: 384.0,
          formulaV: 'v_P(16) = 24.0 + (3.0)(8.0) = 48.0\\text{ m/s}',
          formulaX: 'x(16) = 24(16) = \\frac{1}{2}(3.0)(16)^2 = 384.0\\text{ m}'
        },
        inputs: {
          v0: { label: 'Police v(8s)', correct: 24.0, unit: 'm/s', inheritedFrom: 'Stage 1 v_f' },
          a:  { label: 'Police Accel', correct: 3.0, unit: 'm/s²' },
          dt: { label: 'Catchup duration', correct: 8.0, unit: 's' }
        },
        equationKey: 'eq2'
      }
    ],
    batonPasses: [
      { from: 'Speed Match (t = 8s)', to: 'Overtake Sprint', variable: 'v_{P}(8s) = 24.0\\text{ m/s} \\to \\text{Cruiser now faster than speeder!}' }
    ],
    totalTime: 16.0,
    totalDistance: 384.0,
    vehicleType: 'police'
  },

  incline: {
    id: 'incline',
    title: '4. Ramp Toss & Rollback',
    difficulty: 'Direction Reversal · 2 Stages',
    narrative: `A metal cart is launched up a smooth ramp with an initial velocity of $+1.20\\text{ m/s}$. 
    Gravity causes a steady downward acceleration along the track of $a = -0.40\\text{ m/s}^2$. 
    In <strong>Stage 1 (Ascent)</strong>, the cart rolls upward, slowing down until stopping momentarily at the apex ($v_f = 0\\text{ m/s}$). 
    In <strong>Stage 2 (Descent)</strong>, starting from rest at the apex ($v_0 = 0\\text{ m/s}$), it rolls back down with the same acceleration ($a = -0.40\\text{ m/s}^2$) for $3.0\\text{ s}$.`,
    targets: [
      'Find the time to reach the apex (\\(\\Delta t_1 = 3.0\\text{ s}\\)) and apex distance (\\(\\Delta x = +1.80\\text{ m}\\)).',
      'Identify the velocity at apex: \\(v = 0\\text{ m/s}\\), but acceleration is STILL \\(-0.40\\text{ m/s}^2\\)!',
      'Verify symmetry: total return time is 6.0 s, returning to starting mark at \\(v = -1.20\\text{ m/s}\\).'
    ],
    trapText: `Key Concept: At the highest point (apex), the velocity is momentarily ZERO, but acceleration is NOT zero! The gravitational pull down the ramp never turns off.`,
    stages: [
      {
        name: 'Stage 1: Rolling Up to Apex',
        subtitle: 'Decelerating Ascent',
        color: '#0f7e9b',
        dt: 3.0,
        t0: 0,
        t1: 3.0,
        x0: 0,
        v0: 1.2,
        a: -0.4,
        calc: {
          vf: 0.0,
          dx: 1.8,
          xf: 1.8,
          formulaV: '\\Delta t_1 = \\frac{0 - 1.2}{-0.4} = 3.0\\text{ s}',
          formulaX: '\\Delta x_1 = v_0 \\Delta t_1 + \\frac{1}{2}a (\\Delta t_1)^2 = (1.2)(3.0) + \\frac{1}{2}(-0.4)(3.0^2) = 3.6 - 1.8 = +1.80\\text{ m}'
        },
        inputs: {
          v0: { label: 'Launch Speed (v₀,₁)', correct: 1.2, unit: 'm/s' },
          vf: { label: 'Apex Velocity (v_f,₁)', correct: 0.0, unit: 'm/s' },
          a:  { label: 'Ramp Accel (a)', correct: -0.4, unit: 'm/s²' }
        },
        equationKey: 'eq2'
      },
      {
        name: 'Stage 2: Rolling Back Down',
        subtitle: 'Accelerating Descent',
        color: '#d67b19',
        dt: 3.0,
        t0: 3.0,
        t1: 6.0,
        x0: 1.8,
        v0: 0.0, // Baton pass from apex
        a: -0.4,
        calc: {
          vf: -1.2,
          dx: -1.8,
          xf: 0.0,
          formulaV: 'v_f = 0 + (-0.4)(3.0) = -1.20\\text{ m/s}',
          formulaX: '\\Delta x_2 = \\frac{1}{2}(-0.4)(3.0^2) = -1.80\\text{ m}'
        },
        inputs: {
          v0: { label: 'Apex Start Speed (v₀,₂)', correct: 0.0, unit: 'm/s', inheritedFrom: 'Apex v_{f,1}' },
          a:  { label: 'Ramp Accel (a)', correct: -0.4, unit: 'm/s²' },
          dt: { label: 'Rollback Time (Δt₂)', correct: 3.0, unit: 's' }
        },
        equationKey: 'eq2'
      }
    ],
    batonPasses: [
      { from: 'Apex Finish (Stage 1)', to: 'Apex Start (Stage 2)', variable: 'v_{f,1} = v_{0,2} = 0.0\\text{ m/s} \\quad [x = +1.80\\text{ m}]' }
    ],
    totalTime: 6.0,
    totalDistance: 0.0, // returns to start
    vehicleType: 'cart'
  }
};

// ============================================================================
// 2. SIMULATION CONTROLLER & STATE MANAGEMENT
// ============================================================================
class KinematicsStagecrafter {
  constructor() {
    this.currentScenarioId = 'train';
    this.scenario = SCENARIOS.train;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1.0;
    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.activeGraphTab = 'vt'; // 'vt', 'xt', 'both'
    this.activeStageIndex = 0;

    // DOM Elements Cache
    this.dom = {
      // Scenarios
      scenarioTabs: document.querySelectorAll('.scenario-tab'),
      scenarioDifficulty: document.getElementById('scenarioDifficulty'),
      problemDescription: document.getElementById('problemDescription'),
      questionTargets: document.getElementById('questionTargets'),
      trapText: document.getElementById('trapText'),

      // HUD
      hudClock: document.getElementById('hudClock'),
      hudPosition: document.getElementById('hudPosition'),
      hudVelocity: document.getElementById('hudVelocity'),
      hudAcceleration: document.getElementById('hudAcceleration'),
      hudActiveStage: document.getElementById('hudActiveStage'),

      // Controls
      btnPlay: document.getElementById('btnPlay'),
      btnPause: document.getElementById('btnPause'),
      btnStepBack: document.getElementById('btnStepBack'),
      btnStepForward: document.getElementById('btnStepForward'),
      btnReset: document.getElementById('btnReset'),
      speedSelect: document.getElementById('speedSelect'),
      timeScrubber: document.getElementById('timeScrubber'),

      // Help
      btnToggleHelp: document.getElementById('btnToggleHelp'),
      btnCloseHelp: document.getElementById('btnCloseHelp'),
      helpDrawer: document.getElementById('helpDrawer'),

      // Canvases
      trackCanvas: document.getElementById('trackCanvas'),
      graphCanvas: document.getElementById('graphCanvas'),
      tabVt: document.getElementById('tabVt'),
      tabXt: document.getElementById('tabXt'),
      tabBoth: document.getElementById('tabBoth'),

      // Baton & T-Chart
      batonVisual: document.getElementById('batonVisual'),
      stageTabPills: document.getElementById('stageTabPills'),
      tchartContent: document.getElementById('tchartContent'),
      btnCheckStage: document.getElementById('btnCheckStage'),
      btnRevealStage: document.getElementById('btnRevealStage'),
      stageFeedback: document.getElementById('stageFeedback'),

      // Synthesis
      synthesisTableBody: document.getElementById('synthesisTableBody'),
      synthTotalDt: document.getElementById('synthTotalDt'),
      synthClockRange: document.getElementById('synthClockRange'),
      synthTotalDx: document.getElementById('synthTotalDx')
    };

    this.trackCtx = this.dom.trackCanvas.getContext('2d');
    this.graphCtx = this.dom.graphCanvas.getContext('2d');

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadScenario('train');
    this.render();
  }

  bindEvents() {
    // Scenario tabs
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

    // Help Drawer
    this.dom.btnToggleHelp.addEventListener('click', () => {
      this.dom.helpDrawer.classList.toggle('hidden');
      const expanded = !this.dom.helpDrawer.classList.contains('hidden');
      this.dom.btnToggleHelp.setAttribute('aria-expanded', expanded);
    });
    this.dom.btnCloseHelp.addEventListener('click', () => {
      this.dom.helpDrawer.classList.add('hidden');
      this.dom.btnToggleHelp.setAttribute('aria-expanded', 'false');
    });

    // Playback buttons
    this.dom.btnPlay.addEventListener('click', () => this.play());
    this.dom.btnPause.addEventListener('click', () => this.pause());
    this.dom.btnReset.addEventListener('click', () => this.reset());
    this.dom.btnStepBack.addEventListener('click', () => this.step(-0.2));
    this.dom.btnStepForward.addEventListener('click', () => this.step(0.2));

    this.dom.speedSelect.addEventListener('change', (e) => {
      this.playbackSpeed = parseFloat(e.target.value) || 1.0;
    });

    this.dom.timeScrubber.addEventListener('input', (e) => {
      this.pause();
      this.currentTime = parseFloat(e.target.value) || 0;
      this.updateHud();
      this.render();
    });

    // Graph tabs
    const graphTabs = [
      { btn: this.dom.tabVt, mode: 'vt' },
      { btn: this.dom.tabXt, mode: 'xt' },
      { btn: this.dom.tabBoth, mode: 'both' }
    ];
    graphTabs.forEach(({ btn, mode }) => {
      btn.addEventListener('click', () => {
        graphTabs.forEach(g => g.btn.classList.remove('active'));
        btn.classList.add('active');
        this.activeGraphTab = mode;
        this.renderGraph();
      });
    });

    // T-Chart actions
    this.dom.btnCheckStage.addEventListener('click', () => this.checkActiveStage());
    this.dom.btnRevealStage.addEventListener('click', () => this.revealActiveStageSolution());

    // Window resize handler for crisp canvas
    window.addEventListener('resize', () => {
      this.render();
    });
  }

  loadScenario(id) {
    this.pause();
    this.currentScenarioId = id;
    this.scenario = SCENARIOS[id];
    this.currentTime = 0;
    this.activeStageIndex = 0;

    // Narrative & Targets
    this.dom.scenarioDifficulty.textContent = this.scenario.difficulty;
    this.dom.problemDescription.innerHTML = this.scenario.narrative;
    this.dom.trapText.innerHTML = this.scenario.trapText;

    this.dom.questionTargets.innerHTML = this.scenario.targets
      .map(t => `<div class="target-item"><span class="target-bullet">✦</span> <span>${t}</span></div>`)
      .join('');

    // Scrubber range
    this.dom.timeScrubber.min = 0;
    this.dom.timeScrubber.max = this.scenario.totalTime;
    this.dom.timeScrubber.value = 0;

    // Render Baton UI
    this.renderBatonPassUI();

    // Render Stage Tabs & Active T-Chart
    this.renderStageTabs();
    this.renderTChart(this.activeStageIndex);

    // Synthesis Table
    this.renderSynthesisTable();

    // Update KaTeX formulas if available
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }

    this.updateHud();
    this.render();
  }

  // ==========================================================================
  // 3. PHYSICAL EQUATIONS & STAGE EVALUATOR
  // ==========================================================================
  getKinematicStateAt(t) {
    const sc = this.scenario;
    const stages = sc.stages;

    // Clamp time
    const tClamped = Math.max(0, Math.min(t, sc.totalTime));

    // Find active stage
    let activeStage = stages[0];
    let activeStageIdx = 0;
    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      if (tClamped >= st.t0 && (tClamped <= st.t1 || i === stages.length - 1)) {
        activeStage = st;
        activeStageIdx = i;
        break;
      }
    }

    // Interval time Delta t within active stage
    const dt = tClamped - activeStage.t0;

    // Analytical motion within stage
    // x(dt) = x0 + v0*dt + 0.5*a*dt^2
    // v(dt) = v0 + a*dt
    const x = activeStage.x0 + (activeStage.v0 * dt) + (0.5 * activeStage.a * dt * dt);
    const v = activeStage.v0 + (activeStage.a * dt);
    const a = activeStage.a;

    // For Highway Pursuit scenario, also calculate the speeder's position
    let speederX = null;
    let speederV = null;
    if (sc.id === 'pursuit') {
      speederV = 24.0;
      speederX = speederV * tClamped;
    }

    return {
      t: tClamped,
      dtLocal: dt,
      x: x,
      v: v,
      a: a,
      stage: activeStage,
      stageIndex: activeStageIdx,
      speederX,
      speederV
    };
  }

  // ==========================================================================
  // 4. ANIMATION LOOP & PLAYBACK
  // ==========================================================================
  play() {
    if (this.isPlaying) return;
    if (this.currentTime >= this.scenario.totalTime) {
      this.currentTime = 0;
    }
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
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  reset() {
    this.pause();
    this.currentTime = 0;
    this.dom.timeScrubber.value = 0;
    this.updateHud();
    this.render();
  }

  step(delta) {
    this.pause();
    this.currentTime = Math.max(0, Math.min(this.scenario.totalTime, this.currentTime + delta));
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
      this.updateHud();
      this.render();
      this.pause();
      return;
    }

    this.dom.timeScrubber.value = this.currentTime;
    this.updateHud();
    this.render();

    this.animationFrameId = requestAnimationFrame((t) => this.animationLoop(t));
  }

  updateHud() {
    const state = this.getKinematicStateAt(this.currentTime);
    this.dom.hudClock.textContent = `${state.t.toFixed(2)} s`;
    this.dom.hudPosition.textContent = `${state.x.toFixed(1)} m`;
    this.dom.hudVelocity.textContent = `${state.v.toFixed(1)} m/s`;
    this.dom.hudAcceleration.textContent = `${state.a.toFixed(1)} m/s²`;
    this.dom.hudActiveStage.textContent = `${state.stage.name}`;
    this.dom.hudActiveStage.style.borderColor = state.stage.color;
    this.dom.hudActiveStage.style.color = state.stage.color;

    // Highlight baton pill if close to transition boundary
    this.highlightBatonHandshake(state.t);
  }

  // ==========================================================================
  // 5. CANVAS RENDERING: PHYSICAL TRACK VIEW
  // ==========================================================================
  renderTrack() {
    const canvas = this.dom.trackCanvas;
    const ctx = this.trackCtx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const state = this.getKinematicStateAt(this.currentTime);
    const sc = this.scenario;

    // Track layout coordinates
    const marginX = 60;
    const trackY = height - 42; // Track rail near bottom (leaving room for ticks)
    const trackWidth = width - marginX * 2;

    // Map physical displacement x -> pixel X
    let minX = 0;
    let maxX = sc.totalDistance > 0 ? sc.totalDistance : 2.0;
    if (sc.id === 'incline') {
      minX = -0.2;
      maxX = 2.0;
    }

    const scaleX = (x) => marginX + ((x - minX) / (maxX - minX)) * trackWidth;

    // 1. Draw top Stage Zone Header Bar (Clean segmented pills across the top)
    const topBarY = 10;
    const topBarH = 26;

    sc.stages.forEach((st, idx) => {
      const startPix = scaleX(st.x0);
      const endPix = scaleX(st.calc.xf);
      const zoneWidth = Math.max(4, endPix - startPix);

      // Light background column down to track
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(15, 126, 155, 0.04)' : 'rgba(214, 123, 25, 0.04)';
      ctx.fillRect(startPix, topBarY + topBarH, zoneWidth, trackY - (topBarY + topBarH));

      // Dashed vertical boundary line between stages
      if (idx > 0) {
        ctx.strokeStyle = '#c8dbe3';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(startPix, topBarY);
        ctx.lineTo(startPix, trackY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Top Stage Badge Pill
      ctx.fillStyle = idx % 2 === 0 ? '#eaf4f7' : '#fdf2e4';
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Draw rounded rectangle for stage badge header
      const pillPad = 3;
      const pillW = Math.max(12, zoneWidth - pillPad * 2);
      ctx.roundRect(startPix + pillPad, topBarY, pillW, topBarH, 4);
      ctx.fill();
      ctx.stroke();

      // Label text inside top badge pill (only if enough width)
      if (pillW > 45) {
        ctx.fillStyle = st.color;
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        const shortStage = `Stage ${idx + 1}`;
        const fullTitle = pillW > 140 ? `${shortStage}: ${st.subtitle}` : shortStage;
        ctx.fillText(fullTitle, startPix + pillPad + 8, topBarY + 17);
      }
    });

    // 2. Draw Ground / Track line
    ctx.strokeStyle = '#c8dbe3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(marginX - 20, trackY);
    ctx.lineTo(width - marginX + 20, trackY);
    ctx.stroke();

    // Track distance tick marks & numeric scale
    ctx.fillStyle = '#718894';
    ctx.strokeStyle = '#97b8c7';
    ctx.lineWidth = 1.5;
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'center';

    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const physX = minX + (i / numTicks) * (maxX - minX);
      const pixX = scaleX(physX);

      ctx.beginPath();
      ctx.moveTo(pixX, trackY - 6);
      ctx.lineTo(pixX, trackY + 6);
      ctx.stroke();

      ctx.fillText(`${physX.toFixed(1)}m`, pixX, trackY + 20);
    }

    // 3. In Pursuit mode: draw Speeder car
    if (sc.id === 'pursuit' && state.speederX !== null) {
      const speederPixX = scaleX(state.speederX);
      this.drawCar(ctx, speederPixX, trackY, '#718894', 'Speeder (24 m/s const)');
    }

    // 4. Draw primary object / vehicle
    const mainPixX = scaleX(state.x);
    if (sc.vehicleType === 'train') {
      this.drawTrain(ctx, mainPixX, trackY, state.stage.color);
    } else if (sc.vehicleType === 'rocket') {
      this.drawRocket(ctx, mainPixX, trackY, state.stage.color);
    } else if (sc.vehicleType === 'police') {
      this.drawPoliceCar(ctx, mainPixX, trackY, state.stage.color);
    } else {
      this.drawCart(ctx, mainPixX, trackY, state.stage.color);
    }

    // 5. Velocity Vector Arrow (Teal) - positioned safely between vehicle and top banners
    const vehicleTopY = trackY - 28;
    if (Math.abs(state.v) > 0.05) {
      const arrowLength = Math.max(-80, Math.min(80, state.v * 3));
      this.drawVectorArrow(ctx, mainPixX, vehicleTopY - 14, arrowLength, '#0f7e9b', `v = ${state.v.toFixed(1)} m/s`);
    }

    // 6. Acceleration Vector Arrow (Amber) - positioned with clear vertical clearance
    if (Math.abs(state.a) > 0.05) {
      const arrowLength = Math.max(-60, Math.min(60, state.a * 15));
      this.drawVectorArrow(ctx, mainPixX, vehicleTopY - 38, arrowLength, '#d67b19', `a = ${state.a.toFixed(1)} m/s²`);
    }
  }

  drawTrain(ctx, x, y, color) {
    const w = 52;
    const h = 24;
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 4);
    ctx.fill();

    // Cabin windows
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - w / 2 + 6, y - h + 5, 8, 8);
    ctx.fillRect(x - w / 2 + 18, y - h + 5, 8, 8);
    ctx.fillRect(x - w / 2 + 30, y - h + 5, 8, 8);

    // Wheels
    ctx.fillStyle = '#123140';
    ctx.beginPath();
    ctx.arc(x - 16, y, 4, 0, Math.PI * 2);
    ctx.arc(x + 16, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCar(ctx, x, y, color, label) {
    const w = 44;
    const h = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y - h + 3, 16, 6);

    ctx.fillStyle = '#123140';
    ctx.beginPath();
    ctx.arc(x - 14, y, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 14, y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (label) {
      ctx.fillStyle = color;
      ctx.font = '600 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - h - 6);
    }
  }

  drawPoliceCar(ctx, x, y, color) {
    this.drawCar(ctx, x, y, color, 'Police Cruiser');
    // Siren
    ctx.fillStyle = '#d67b19';
    ctx.fillRect(x - 3, y - 22, 6, 4);
  }

  drawRocket(ctx, x, y, color) {
    const w = 18;
    const h = 34;
    ctx.fillStyle = color;
    // Fuselage
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + w / 2, y - h + 10);
    ctx.lineTo(x + w / 2, y - 4);
    ctx.lineTo(x - w / 2, y - 4);
    ctx.lineTo(x - w / 2, y - h + 10);
    ctx.closePath();
    ctx.fill();

    // Exhaust flame if powered
    if (this.currentTime <= 3.0 && this.scenario.id === 'rocket') {
      ctx.fillStyle = '#ea8a24';
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 4);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x + 5, y - 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawCart(ctx, x, y, color) {
    const w = 36;
    const h = 18;
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = '#123140';
    ctx.beginPath();
    ctx.arc(x - 10, y, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 10, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawVectorArrow(ctx, startX, startY, length, color, text) {
    const endX = startX + length;
    const headLen = 6;
    const dir = Math.sign(length);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, startY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, startY);
    ctx.lineTo(endX - headLen * dir, startY - 4);
    ctx.lineTo(endX - headLen * dir, startY + 4);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, startX + length / 2, startY - 5);
  }

  // ==========================================================================
  // 6. CANVAS RENDERING: KINEMATIC CURVES (v-t & x-t)
  // ==========================================================================
  renderGraph() {
    const canvas = this.dom.graphCanvas;
    const ctx = this.graphCtx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (this.activeGraphTab === 'vt') {
      this.drawSingleGraph(ctx, 0, 0, width, height, 'v');
    } else if (this.activeGraphTab === 'xt') {
      this.drawSingleGraph(ctx, 0, 0, width, height, 'x');
    } else {
      // Stacked
      const halfH = height / 2;
      this.drawSingleGraph(ctx, 0, 0, width, halfH, 'x', true);
      this.drawSingleGraph(ctx, 0, halfH, width, halfH, 'v', false);
    }
  }

  drawSingleGraph(ctx, gx, gy, gw, gh, type, isStackedTop = false) {
    const sc = this.scenario;
    const padL = 55;
    const padR = 25;
    const padT = 20;
    const padB = 30;

    const plotW = gw - padL - padR;
    const plotH = gh - padT - padB;

    const tMax = sc.totalTime;

    // Determine Y range
    let yMin = 0;
    let yMax = 25;

    if (type === 'v') {
      if (sc.id === 'train') { yMin = 0; yMax = 25; }
      else if (sc.id === 'rocket') { yMin = 0; yMax = 40; }
      else if (sc.id === 'pursuit') { yMin = 0; yMax = 55; }
      else if (sc.id === 'incline') { yMin = -1.5; yMax = 1.5; }
    } else {
      // x
      if (sc.id === 'train') { yMin = 0; yMax = 800; }
      else if (sc.id === 'rocket') { yMin = 0; yMax = 140; }
      else if (sc.id === 'pursuit') { yMin = 0; yMax = 420; }
      else if (sc.id === 'incline') { yMin = 0; yMax = 2.2; }
    }

    const scaleT = (t) => gx + padL + (t / tMax) * plotW;
    const scaleY = (y) => gy + padT + (1 - (y - yMin) / (yMax - yMin)) * plotH;

    // Draw background shaded stage areas under v-t graph to highlight Area = Displacement
    if (type === 'v') {
      sc.stages.forEach((st, idx) => {
        const xStart = scaleT(st.t0);
        const xEnd = scaleT(st.t1);
        const zeroY = scaleY(0);

        ctx.fillStyle = idx === 0 ? 'rgba(15, 126, 155, 0.12)' : (idx === 1 ? 'rgba(214, 123, 25, 0.12)' : 'rgba(179, 57, 57, 0.12)');
        
        ctx.beginPath();
        ctx.moveTo(xStart, zeroY);
        // sample points along stage
        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const tSample = st.t0 + (s / steps) * st.dt;
          const vSample = this.getKinematicStateAt(tSample).v;
          ctx.lineTo(scaleT(tSample), scaleY(vSample));
        }
        ctx.lineTo(xEnd, zeroY);
        ctx.closePath();
        ctx.fill();

        // Stage boundary dashed lines
        ctx.strokeStyle = '#c8dbe3';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xStart, gy + padT);
        ctx.lineTo(xStart, gy + gh - padB);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label geometric area in stage
        const midT = (st.t0 + st.t1) / 2;
        ctx.fillStyle = st.color;
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Δx_${idx+1} = ${st.calc.dx.toFixed(1)}m`, scaleT(midT), gy + padT + 14);
      });
    }

    // Grid lines & Axis ticks
    ctx.strokeStyle = '#e1edf2';
    ctx.lineWidth = 1;

    // Horizontal Y grid
    const numYGrid = 4;
    ctx.fillStyle = '#718894';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= numYGrid; i++) {
      const yVal = yMin + (i / numYGrid) * (yMax - yMin);
      const yPix = scaleY(yVal);

      ctx.beginPath();
      ctx.moveTo(gx + padL, yPix);
      ctx.lineTo(gx + gw - padR, yPix);
      ctx.stroke();

      ctx.fillText(yVal.toFixed(1), gx + padL - 8, yPix + 3);
    }

    // Zero line if crossing 0
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = '#97b8c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx + padL, scaleY(0));
      ctx.lineTo(gx + gw - padR, scaleY(0));
      ctx.stroke();
    }

    // Graph Title / Axis label
    ctx.fillStyle = '#123140';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    const axisTitle = type === 'v' ? 'Velocity v(t) [m/s]' : 'Position x(t) [m]';
    ctx.fillText(axisTitle, gx + padL, gy + 14);

    // Plot Analytical Curve
    ctx.strokeStyle = type === 'v' ? '#0f7e9b' : '#d67b19';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const sampleSteps = 200;
    for (let i = 0; i <= sampleSteps; i++) {
      const tSample = (i / sampleSteps) * tMax;
      const stateSample = this.getKinematicStateAt(tSample);
      const val = type === 'v' ? stateSample.v : stateSample.x;
      const px = scaleT(tSample);
      const py = scaleY(val);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // If pursuit, also plot police vs speeder
    if (sc.id === 'pursuit') {
      ctx.strokeStyle = '#718894';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let i = 0; i <= sampleSteps; i++) {
        const tSample = (i / sampleSteps) * tMax;
        const stateSample = this.getKinematicStateAt(tSample);
        const val = type === 'v' ? stateSample.speederV : stateSample.speederX;
        const px = scaleT(tSample);
        const py = scaleY(val);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current Playhead Marker
    const curState = this.getKinematicStateAt(this.currentTime);
    const curVal = type === 'v' ? curState.v : curState.x;
    const playheadX = scaleT(this.currentTime);
    const playheadY = scaleY(curVal);

    // Playhead vertical needle
    ctx.strokeStyle = '#123140';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, gy + padT);
    ctx.lineTo(playheadX, gy + gh - padB);
    ctx.stroke();

    // Playhead dot
    ctx.fillStyle = '#d67b19';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playheadX, playheadY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // ==========================================================================
  // 7. BATON PASS BRIDGE UI
  // ==========================================================================
  renderBatonPassUI() {
    const sc = this.scenario;
    const container = this.dom.batonVisual;
    container.innerHTML = '';

    sc.batonPasses.forEach((bp, idx) => {
      const row = document.createElement('div');
      row.className = 'baton-pill-row';
      row.id = `batonRow_${idx}`;
      row.innerHTML = `
        <span class="baton-source">${bp.from}</span>
        <span class="baton-arrow">➔</span>
        <span class="baton-dest">${bp.to}</span>
        <span class="baton-tag">$${bp.variable}$</span>
      `;
      container.appendChild(row);
    });

    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  }

  highlightBatonHandshake(t) {
    const sc = this.scenario;
    sc.stages.forEach((st, idx) => {
      if (idx > 0) {
        const transitionTime = st.t0;
        const diff = Math.abs(t - transitionTime);
        const batonRow = document.getElementById(`batonRow_${idx - 1}`);
        if (batonRow) {
          if (diff < 0.6) {
            batonRow.style.borderColor = '#d67b19';
            batonRow.style.boxShadow = '0 0 10px rgba(214, 123, 25, 0.4)';
          } else {
            batonRow.style.borderColor = '#c8dbe3';
            batonRow.style.boxShadow = 'var(--shadow-sm)';
          }
        }
      }
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE T-CHART & SCAFFOLDED SOLVER
  // ==========================================================================
  renderStageTabs() {
    const sc = this.scenario;
    const container = this.dom.stageTabPills;
    container.innerHTML = '';

    sc.stages.forEach((st, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `stage-pill-btn ${idx === this.activeStageIndex ? 'active' : ''}`;
      btn.textContent = `Stage ${idx + 1}`;
      btn.addEventListener('click', () => {
        this.activeStageIndex = idx;
        document.querySelectorAll('.stage-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderTChart(idx);
      });
      container.appendChild(btn);
    });
  }

  renderTChart(stageIdx) {
    const st = this.scenario.stages[stageIdx];
    const container = this.dom.tchartContent;
    this.dom.stageFeedback.style.display = 'none';

    let inputsHtml = '';
    for (const [key, field] of Object.entries(st.inputs)) {
      const inheritedBadge = field.inheritedFrom 
        ? `<span class="inherited-hint">🤝 Inherited from ${field.inheritedFrom}!</span>` 
        : '';

      inputsHtml += `
        <div class="tchart-row">
          <label for="input_${key}">${field.label}:</label>
          <div class="input-with-unit">
            <input type="number" id="input_${key}" step="any" placeholder="?">
            <span class="input-unit">${field.unit}</span>
            ${inheritedBadge}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="stage-info-banner" style="margin-bottom: 0.8rem;">
        <strong style="color: ${st.color}; font-size: 0.95rem;">${st.name}</strong>
        <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: #4b6570;">
          Interval: $t = ${st.t0.toFixed(1)}\\text{ s}$ to $${st.t1.toFixed(1)}\\text{ s}$ (Duration $\\Delta t = ${st.dt.toFixed(1)}\\text{ s}$)
        </p>
      </div>

      <div class="tchart-inputs">
        ${inputsHtml}
      </div>

      <div class="tchart-row" style="margin-top: 0.8rem;">
        <label>Selected Equation:</label>
        <div class="equation-options">
          <label class="eq-label">
            <input type="radio" name="stageEq" value="eq1">
            <span>$v_f = v_0 + a \\Delta t$</span>
          </label>
          <label class="eq-label">
            <input type="radio" name="stageEq" value="eq2">
            <span>$\\Delta x = v_0 \\Delta t + \\frac{1}{2}a (\\Delta t)^2$</span>
          </label>
          <label class="eq-label">
            <input type="radio" name="stageEq" value="eq_const">
            <span>$\\Delta x = v \\cdot \\Delta t \\quad (a = 0)$</span>
          </label>
        </div>
      </div>
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  }

  checkActiveStage() {
    const st = this.scenario.stages[this.activeStageIndex];
    const feedback = this.dom.stageFeedback;
    let allCorrect = true;
    let errorMsg = '';

    // Check numerical inputs
    for (const [key, field] of Object.entries(st.inputs)) {
      const inputEl = document.getElementById(`input_${key}`);
      if (!inputEl) continue;
      const userVal = parseFloat(inputEl.value);

      if (isNaN(userVal)) {
        allCorrect = false;
        errorMsg = `Please enter a value for <strong>${field.label}</strong>.`;
        break;
      }

      if (Math.abs(userVal - field.correct) > 0.05) {
        allCorrect = false;
        if (field.inheritedFrom) {
          errorMsg = `Remember the <strong>Baton Pass</strong>! ${field.label} is handed off from the end of the previous segment: it should be <strong>${field.correct} ${field.unit}</strong>.`;
        } else {
          errorMsg = `Check your given value for <strong>${field.label}</strong>. Found: ${userVal}, expected: ${field.correct}.`;
        }
        break;
      }
    }

    // Check equation choice
    const selectedEq = document.querySelector('input[name="stageEq"]:checked');
    if (allCorrect && !selectedEq) {
      allCorrect = false;
      errorMsg = 'Select the appropriate kinematic equation for this stage.';
    }

    if (allCorrect) {
      feedback.className = 'stage-feedback success';
      feedback.innerHTML = `
        <strong>✓ Excellent Modeling!</strong> Stage ${this.activeStageIndex + 1} givens are completely accurate.<br>
        • Step 1: ${st.calc.formulaV}<br>
        • Step 2: ${st.calc.formulaX}
      `;
    } else {
      feedback.className = 'stage-feedback error';
      feedback.innerHTML = `<strong>⚠️ Check Your Thinking:</strong> ${errorMsg}`;
    }

    if (window.renderMathInElement) {
      window.renderMathInElement(feedback, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  }

  revealActiveStageSolution() {
    const st = this.scenario.stages[this.activeStageIndex];
    // Populate correct values in inputs
    for (const [key, field] of Object.entries(st.inputs)) {
      const inputEl = document.getElementById(`input_${key}`);
      if (inputEl) inputEl.value = field.correct;
    }

    // Select correct equation
    const eqRadio = document.querySelector(`input[name="stageEq"][value="${st.equationKey}"]`);
    if (eqRadio) eqRadio.checked = true;

    const feedback = this.dom.stageFeedback;
    feedback.className = 'stage-feedback hint';
    feedback.innerHTML = `
      <strong>Step-by-Step Stage Solution:</strong><br>
      • Velocity Analysis: ${st.calc.formulaV}<br>
      • Displacement Analysis: ${st.calc.formulaX}
    `;

    if (window.renderMathInElement) {
      window.renderMathInElement(feedback, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  }

  // ==========================================================================
  // 9. SYNTHESIS TABLE
  // ==========================================================================
  renderSynthesisTable() {
    const sc = this.scenario;
    const tbody = this.dom.synthesisTableBody;
    tbody.innerHTML = '';

    let totalDt = 0;
    let totalDx = 0;

    sc.stages.forEach((st, idx) => {
      totalDt += st.dt;
      totalDx += st.calc.dx;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong style="color: ${st.color}">Stage ${idx + 1}</strong> (${st.name.split(':')[1] || st.name})</td>
        <td>${st.dt.toFixed(1)} s</td>
        <td>${st.t0.toFixed(1)} s → ${st.t1.toFixed(1)} s</td>
        <td>${st.calc.dx >= 0 ? '+' : ''}${st.calc.dx.toFixed(1)} m</td>
      `;
      tbody.appendChild(row);
    });

    this.dom.synthTotalDt.innerHTML = `<strong>${totalDt.toFixed(1)} s</strong>`;
    this.dom.synthClockRange.innerHTML = `<strong>0.0 s → ${sc.totalTime.toFixed(1)} s</strong>`;
    this.dom.synthTotalDx.innerHTML = `<strong>${totalDx >= 0 ? '+' : ''}${totalDx.toFixed(1)} m</strong>`;
  }

  // ==========================================================================
  // 10. GENERAL RENDER DISPATCHER
  // ==========================================================================
  render() {
    this.renderTrack();
    this.renderGraph();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new KinematicsStagecrafter();
});
