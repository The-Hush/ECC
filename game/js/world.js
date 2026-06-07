/* ============================================================
   World - overworld scene: town hub + scrolling themed zones,
   hero movement, Familiar follower, roaming encounters, bosses.
   ============================================================ */
(function (G) {
  'use strict';
  var Game = G.Game, S = G.Sprites;

  var THEMES = {
    grass:   { g1: '#7cba4a', g2: '#6fae40', path: '#cdab6a', det: '#9ad06a', sky: '#bfe6f0' },
    forest:  { g1: '#579a45', g2: '#4d8c3b', path: '#9b7b4a', det: '#356a28', sky: '#9fd0a0' },
    dungeon: { g1: '#46424f', g2: '#3c3845', path: '#615d6e', det: '#2a2634', sky: '#1c1a24' },
    volcano: { g1: '#5a3a32', g2: '#4e302a', path: '#7a4a3a', det: '#d4622a', sky: '#3a1f18' },
    snow:    { g1: '#e2ebf2', g2: '#d2dfea', path: '#b4c6d6', det: '#a9dcf2', sky: '#cfe0ee' },
    swamp:   { g1: '#586a38', g2: '#4c5c2e', path: '#6a5a3a', det: '#36461a', sky: '#7a8a5a' },
    spire:   { g1: '#3a3450', g2: '#322c46', path: '#5a4a7a', det: '#7c5fd6', sky: '#1a1626' },
    town:    { g1: '#7cba4a', g2: '#6fae40', path: '#cdab6a', det: '#9ad06a', sky: '#bfe6f0' }
  };

  var TILE = 48;
  var area = null;        // current area state
  var trail = [];         // hero position history for follower
  var heroFrame = 0, facing = 'down', moving = false;
  var camX = 0, camY = 0;
  var encounterLock = false, idleHint = 0;

  function hash(x, y) { var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }

  // ---------- props ----------
  function drawProp(ctx, p, th) {
    var x = p.x, y = p.y, s = p.s || 1;
    ctx.save(); ctx.translate(x, y);
    S.path(ctx, function () { S.ellipse(ctx, 0, 0, 22 * s, 8 * s); }, 'rgba(0,0,0,.18)', null);
    switch (p.type) {
      case 'tree':
        S.path(ctx, function () { S.rr(ctx, -6 * s, -34 * s, 12 * s, 36 * s, 4 * s); }, '#7a4a24', S.OUT, 2);
        S.path(ctx, function () { S.circle(ctx, 0, -52 * s, 30 * s); }, th.det, S.OUT, 2.5);
        S.path(ctx, function () { S.circle(ctx, -18 * s, -44 * s, 20 * s); }, S.shade(th.det, 18), null);
        break;
      case 'pine': case 'snowpine':
        S.path(ctx, function () { S.rr(ctx, -5 * s, -20 * s, 10 * s, 24 * s, 3 * s); }, '#6a431f', S.OUT, 2);
        var pc = p.type === 'snowpine' ? '#3a7a4a' : th.det;
        [0, 1, 2].forEach(function (i) {
          S.path(ctx, function () { ctx.moveTo(-28 * s + i * 4 * s, -28 * s - i * 18 * s); ctx.lineTo(0, -58 * s - i * 18 * s); ctx.lineTo(28 * s - i * 4 * s, -28 * s - i * 18 * s); ctx.closePath(); }, pc, S.OUT, 2);
        });
        if (p.type === 'snowpine') { [[-12, -36], [10, -52], [0, -68]].forEach(function (q) { S.path(ctx, function () { S.circle(ctx, q[0] * s, q[1] * s, 5 * s); }, '#fff', null); }); }
        break;
      case 'bush':
        S.path(ctx, function () { S.circle(ctx, -10 * s, -8 * s, 13 * s); S.circle(ctx, 10 * s, -8 * s, 13 * s); S.circle(ctx, 0, -16 * s, 15 * s); }, th.det, S.OUT, 2);
        break;
      case 'flower':
        S.path(ctx, function () { ctx.moveTo(0, 0); ctx.lineTo(0, -14 * s); }, null, '#3a7a2a', 2);
        S.path(ctx, function () { for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2; S.circle(ctx, Math.cos(a) * 6 * s, -16 * s + Math.sin(a) * 6 * s, 4 * s); } }, p.color || '#e86aa0', S.OUT, 1);
        S.path(ctx, function () { S.circle(ctx, 0, -16 * s, 4 * s); }, '#ffd24a', null);
        break;
      case 'rock': case 'icerock': case 'lavarock':
        var rc = p.type === 'icerock' ? '#bcd6ea' : (p.type === 'lavarock' ? '#3a241c' : '#9a958c');
        S.path(ctx, function () { ctx.moveTo(-18 * s, 2 * s); ctx.lineTo(-12 * s, -16 * s); ctx.lineTo(8 * s, -20 * s); ctx.lineTo(20 * s, -4 * s); ctx.lineTo(12 * s, 4 * s); ctx.closePath(); }, rc, S.OUT, 2);
        if (p.type === 'lavarock') S.path(ctx, function () { ctx.moveTo(-8 * s, 0); ctx.lineTo(0, -8 * s); ctx.lineTo(6 * s, -2 * s); }, null, '#ff7a3a', 2);
        break;
      case 'mushroom':
        S.path(ctx, function () { S.rr(ctx, -5 * s, -16 * s, 10 * s, 18 * s, 4 * s); }, '#f0e6cf', S.OUT, 2);
        S.path(ctx, function () { ctx.moveTo(-18 * s, -14 * s); ctx.quadraticCurveTo(0, -34 * s, 18 * s, -14 * s); ctx.quadraticCurveTo(0, -6 * s, -18 * s, -14 * s); }, p.color || '#c0506a', S.OUT, 2);
        [[-8, -18], [6, -22], [0, -14]].forEach(function (q) { S.path(ctx, function () { S.circle(ctx, q[0] * s, q[1] * s, 3 * s); }, '#fff', null); });
        break;
      case 'grave':
        S.path(ctx, function () { S.rr(ctx, -14 * s, -34 * s, 28 * s, 40 * s, 12 * s); }, '#8a8694', S.OUT, 2.5);
        S.path(ctx, function () { S.rr(ctx, -3 * s, -30 * s, 6 * s, 16 * s, 2 * s); }, '#6a6678', null);
        S.path(ctx, function () { S.rr(ctx, -10 * s, -24 * s, 20 * s, 6 * s, 2 * s); }, '#6a6678', null);
        break;
      case 'pillar':
        S.path(ctx, function () { S.rr(ctx, -12 * s, -64 * s, 24 * s, 70 * s, 4 * s); }, '#6a6678', S.OUT, 2.5);
        S.path(ctx, function () { S.rr(ctx, -16 * s, -70 * s, 32 * s, 12 * s, 3 * s); }, '#7a7688', S.OUT, 2);
        S.path(ctx, function () { S.rr(ctx, -16 * s, -6 * s, 32 * s, 10 * s, 3 * s); }, '#7a7688', S.OUT, 2);
        break;
      case 'torch':
        S.path(ctx, function () { S.rr(ctx, -3 * s, -34 * s, 6 * s, 38 * s, 2 * s); }, '#5a3a1a', S.OUT, 2);
        var fl = 0.7 + Math.sin(performance.now() / 120 + x) * 0.3;
        ctx.save(); ctx.globalAlpha = fl;
        S.path(ctx, function () { ctx.moveTo(-7 * s, -34 * s); ctx.quadraticCurveTo(0, -56 * s, 7 * s, -34 * s); ctx.quadraticCurveTo(0, -28 * s, -7 * s, -34 * s); }, '#ff9a3a', null);
        S.path(ctx, function () { ctx.moveTo(-3 * s, -36 * s); ctx.quadraticCurveTo(0, -48 * s, 3 * s, -36 * s); }, '#ffe06a', null);
        ctx.restore();
        break;
      case 'cattail':
        S.path(ctx, function () { ctx.moveTo(0, 0); ctx.lineTo(-4 * s, -30 * s); }, null, '#5a7a2a', 3);
        S.path(ctx, function () { ctx.moveTo(2 * s, 0); ctx.lineTo(6 * s, -26 * s); }, null, '#5a7a2a', 3);
        S.path(ctx, function () { S.rr(ctx, -7 * s, -40 * s, 7 * s, 14 * s, 3 * s); }, '#7a4a1a', S.OUT, 1.5);
        break;
      case 'deadtree':
        S.path(ctx, function () { S.rr(ctx, -6 * s, -50 * s, 12 * s, 52 * s, 3 * s); }, '#4a3a2a', S.OUT, 2);
        S.path(ctx, function () { ctx.moveTo(0, -34 * s); ctx.lineTo(-20 * s, -52 * s); ctx.moveTo(0, -42 * s); ctx.lineTo(18 * s, -58 * s); }, null, '#4a3a2a', 4);
        break;
      case 'crystal':
        var cc = p.color || th.det;
        S.path(ctx, function () { ctx.moveTo(0, -44 * s); ctx.lineTo(10 * s, -16 * s); ctx.lineTo(4 * s, 2 * s); ctx.lineTo(-6 * s, 2 * s); ctx.lineTo(-10 * s, -16 * s); ctx.closePath(); }, cc, S.OUT, 2);
        S.path(ctx, function () { ctx.moveTo(0, -44 * s); ctx.lineTo(-2 * s, 2 * s); ctx.lineTo(-10 * s, -16 * s); ctx.closePath(); }, S.shade(cc, 40), null);
        break;
      case 'lava':
        ctx.restore(); return; // handled as ground tint elsewhere
    }
    ctx.restore();
  }

  // ---------- buildings (town) ----------
  function drawBuilding(ctx, b) {
    var x = b.x, y = b.y, w = b.w, h = b.h;
    ctx.save(); ctx.translate(x, y);
    S.path(ctx, function () { S.ellipse(ctx, 0, 4, w * 0.6, 12); }, 'rgba(0,0,0,.18)', null);
    // wall
    S.path(ctx, function () { S.rr(ctx, -w / 2, -h, w, h, 6); }, b.wall || '#d8c39a', S.OUT, 3);
    // timber frame
    S.path(ctx, function () { ctx.moveTo(-w / 2, -h * 0.4); ctx.lineTo(w / 2, -h * 0.4); }, null, '#6a4a2a', 3);
    // roof
    S.path(ctx, function () { ctx.moveTo(-w / 2 - 10, -h); ctx.lineTo(0, -h - 44); ctx.lineTo(w / 2 + 10, -h); ctx.closePath(); }, b.roof || '#b4502e', S.OUT, 3);
    // door
    S.path(ctx, function () { S.rr(ctx, -16, -44, 32, 44, 6); }, '#6a431f', S.OUT, 2.5);
    S.path(ctx, function () { S.circle(ctx, 8, -22, 2.5); }, '#e8b84b', null);
    // window
    S.path(ctx, function () { S.rr(ctx, -w / 2 + 14, -h + 16, 20, 20, 3); }, '#9bd0e0', S.OUT, 2);
    // sign
    if (b.sign) {
      S.path(ctx, function () { S.rr(ctx, -34, -h - 6, 68, 22, 5); }, '#caa867', S.OUT, 2);
      ctx.fillStyle = '#3a2708'; ctx.font = '14px MedievalSharp, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.sign, 0, -h + 5);
    }
    ctx.restore();
  }

  function drawFountain(ctx, x, y) {
    ctx.save(); ctx.translate(x, y);
    S.path(ctx, function () { S.ellipse(ctx, 0, 6, 46, 16); }, 'rgba(0,0,0,.18)', null);
    S.path(ctx, function () { S.ellipse(ctx, 0, 0, 44, 18); }, '#8a96a3', S.OUT, 3);
    S.path(ctx, function () { S.ellipse(ctx, 0, -2, 34, 13); }, '#5fa8d6', S.OUT, 2);
    S.path(ctx, function () { S.rr(ctx, -6, -30, 12, 26, 4); }, '#9aa7b2', S.OUT, 2);
    S.path(ctx, function () { S.circle(ctx, 0, -32, 7); }, '#7fc4f0', S.OUT, 2);
    ctx.restore();
  }

  // ---------- gate / portal ----------
  function drawPortal(ctx, p) {
    ctx.save(); ctx.translate(p.x, p.y);
    S.path(ctx, function () { S.ellipse(ctx, 0, 4, 30, 10); }, 'rgba(0,0,0,.2)', null);
    S.path(ctx, function () { ctx.moveTo(-22, 4); ctx.lineTo(-22, -34); ctx.arc(0, -34, 22, Math.PI, 0); ctx.lineTo(22, 4); }, '#6a6678', S.OUT, 4);
    var glow = 0.6 + Math.sin(performance.now() / 300) * 0.25;
    ctx.globalAlpha = glow;
    S.path(ctx, function () { ctx.moveTo(-15, 2); ctx.lineTo(-15, -32); ctx.arc(0, -32, 15, Math.PI, 0); ctx.lineTo(15, 2); }, p.color || '#7c5fd6', null);
    ctx.restore();
  }

  // ---------- area generation ----------
  function makeTown() {
    var W = 960, H = 600;
    var a = {
      id: 'town', theme: 'town', W: W, H: H,
      props: [], buildings: [], interact: [], roamers: [], boss: null,
      heroStart: { x: 480, y: 420 }
    };
    a.buildings.push({ x: 250, y: 250, w: 150, h: 110, roof: '#b4502e', wall: '#e6d3a8', sign: 'Apothecary' });
    a.buildings.push({ x: 710, y: 250, w: 150, h: 110, roof: '#3a6a8a', wall: '#d8d0c0', sign: 'Roost' });
    a.interact.push({ type: 'shop', x: 250, y: 320, r: 60, label: 'Shop [Space]' });
    a.interact.push({ type: 'roost', x: 710, y: 320, r: 60, label: 'Familiar Roost [Space]' });
    a.interact.push({ type: 'fountain', x: 480, y: 250, r: 60, label: 'Rest at Fountain [Space]' });
    a.interact.push({ type: 'gate', x: 480, y: 540, r: 70, label: 'Travel - World Map [Space]', color: '#7c5fd6' });
    // decorative trees / flowers
    for (var i = 0; i < 10; i++) {
      a.props.push({ type: choice(['tree', 'bush', 'flower']), x: rand(40, 920), y: rand(120, 560), s: 0.8, solid: false, color: '#e86aa0' });
    }
    // border trees
    for (var bx = 30; bx < 960; bx += 80) { a.props.push({ type: 'tree', x: bx, y: 70, s: 0.9, solid: false }); }
    return a;
  }
  function choice(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeZone(zoneId) {
    var z = G.Data.zoneById(zoneId);
    var W = 1680, H = 1180;
    var th = z.theme;
    var a = {
      id: zoneId, zone: z, theme: th, W: W, H: H,
      props: [], buildings: [], interact: [], roamers: [], boss: null,
      heroStart: { x: W / 2, y: H - 120 }
    };
    // exit portal near entrance
    a.interact.push({ type: 'exit', x: W / 2, y: H - 60, r: 64, label: 'Return to Town [Space]', color: '#5fa8d6' });
    // sign
    a.interact.push({ type: 'sign', x: W / 2 + 90, y: H - 110, r: 46, label: z.name + ' [Space]' });

    var propTypes = {
      grass: ['tree', 'bush', 'flower', 'rock'], forest: ['pine', 'tree', 'mushroom', 'bush', 'rock'],
      dungeon: ['pillar', 'grave', 'torch', 'rock'], volcano: ['lavarock', 'rock', 'crystal'],
      snow: ['snowpine', 'icerock', 'rock'], swamp: ['deadtree', 'cattail', 'mushroom', 'rock'],
      spire: ['pillar', 'crystal', 'torch']
    }[th] || ['tree', 'rock'];

    // scatter props (avoid center path corridor and spawn)
    for (var i = 0; i < 60; i++) {
      var px = rand(60, W - 60), py = rand(120, H - 160);
      if (Math.abs(px - W / 2) < 90 && py > 200) continue; // keep central path clear
      var solid = ['tree', 'pine', 'snowpine', 'pillar', 'rock', 'icerock', 'lavarock', 'deadtree', 'crystal', 'grave'].indexOf;
      a.props.push({ type: choice(propTypes), x: px, y: py, s: rand(0.8, 1.15), color: choice(['#e86aa0', '#ffd24a', '#b07fd6']) });
    }
    a.props.forEach(function (p) {
      p.solid = ['tree', 'pine', 'snowpine', 'pillar', 'rock', 'icerock', 'lavarock', 'deadtree', 'crystal', 'grave'].indexOf(p.type) >= 0;
      p.r = 18 * (p.s || 1);
    });

    // boss shrine at top
    var cleared = Game.state.flags.zonesCleared[zoneId];
    if (!cleared) {
      a.boss = { def: G.Data.ENEMIES[z.boss], x: W / 2, y: 110, r: 46, frame: 0 };
    }
    // roamers
    var n = 5;
    for (var k = 0; k < n; k++) spawnRoamer(a);
    return a;
  }

  function spawnRoamer(a) {
    var z = a.zone; if (!z) return;
    var id = choice(z.enemies);
    var x, y, tries = 0;
    do { x = rand(120, a.W - 120); y = rand(220, a.H - 260); tries++; }
    while (tries < 20 && (Math.abs(x - a.W / 2) < 80 || dist(x, y, a.heroStart.x, a.heroStart.y) < 220));
    a.roamers.push({ id: id, x: x, y: y, vx: 0, vy: 0, frame: Math.random() * 10, wander: 0 });
  }

  function dist(x1, y1, x2, y2) { var dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx * dx + dy * dy); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function dialogueOpen() { var d = document.getElementById('dialogue'); return d && !d.classList.contains('hidden'); }

  // ---------- collision ----------
  function blocked(a, x, y) {
    if (x < 28 || x > a.W - 28 || y < 90 || y > a.H - 24) return true;
    for (var i = 0; i < a.props.length; i++) {
      var p = a.props[i]; if (!p.solid) continue;
      if (dist(x, y, p.x, p.y - 6) < p.r + 14) return true;
    }
    if (a.buildings) for (var b = 0; b < a.buildings.length; b++) {
      var bd = a.buildings[b];
      if (x > bd.x - bd.w / 2 - 6 && x < bd.x + bd.w / 2 + 6 && y > bd.y - bd.h - 6 && y < bd.y + 10) return true;
    }
    return false;
  }

  // ---------- the scene ----------
  var hero = { x: 0, y: 0 };
  var fam = { x: 0, y: 0 };

  var World = {
    enter: function (opts) {
      opts = opts || {};
      var zoneId = opts.zone || Game.state.pos.zone || 'town';
      area = zoneId === 'town' ? makeTown() : makeZone(zoneId);
      Game.state.pos.zone = zoneId;
      hero.x = area.heroStart.x; hero.y = area.heroStart.y;
      if (opts.atX != null) { hero.x = opts.atX; hero.y = opts.atY; }
      fam.x = hero.x - 30; fam.y = hero.y;
      trail = [];
      facing = 'up'; encounterLock = false; idleHint = 0;
      Game.showHUD(true); Game.showToolbar(true);
      Game.updateHUD();
      G.Audio.playMusic(zoneId === 'town' ? 'town' : 'field');
      if (zoneId !== 'town' && !Game.state.flags['seen_' + zoneId]) {
        Game.state.flags['seen_' + zoneId] = true; Game.save();
        Game.dialogue([area.zone.intro], area.zone.name, null);
      }
      Game.save();
    },
    exit: function () { },

    handleKey: function (e) {
      var k = e.key.toLowerCase();
      if (k === 'escape') { G.UI.openMenu(); return; }
      if (Game.overlayOpen() || dialogueOpen()) return;
      if (k === ' ' || k === 'enter' || k === 'e') { tryInteract(); }
    },

    handlePointer: function (x, y, type) {
      if (type !== 'down') return;
      if (Game.overlayOpen() || dialogueOpen()) return;
      // world-space point
      var wx = x + camX, wy = y + camY;
      // tap an interactable / boss / roamer directly?
      var it = nearestInteract(wx, wy, 40);
      if (it && dist(hero.x, hero.y, it.x, it.y) < it.r + 30) { doInteract(it); return; }
      if (area.boss && dist(wx, wy, area.boss.x, area.boss.y) < area.boss.r + 20 &&
        dist(hero.x, hero.y, area.boss.x, area.boss.y) < area.boss.r + 40) { startBoss(); return; }
      // else move toward (pointer hold handled in update via Game.pointer)
    },

    update: function (dt) {
      if (encounterLock) return;
      if (Game.overlayOpen() || dialogueOpen()) { moving = false; if (area) area.roamers.forEach(function (r) { r.frame += dt * 8; }); return; }
      var spd = 168;
      var dx = 0, dy = 0;
      var K = Game.keys;
      if (K['arrowup'] || K['w']) dy -= 1;
      if (K['arrowdown'] || K['s']) dy += 1;
      if (K['arrowleft'] || K['a']) dx -= 1;
      if (K['arrowright'] || K['d']) dx += 1;
      // pointer-hold movement
      if (Game.pointer.active && !dx && !dy) {
        var tx = Game.pointer.x + camX, ty = Game.pointer.y + camY;
        var d = dist(hero.x, hero.y, tx, ty);
        if (d > 14) { dx = (tx - hero.x) / d; dy = (ty - hero.y) / d; }
      }
      var mag = Math.hypot(dx, dy);
      moving = mag > 0.01;
      if (moving) {
        dx /= mag; dy /= mag;
        if (Math.abs(dx) > Math.abs(dy)) facing = dx < 0 ? 'left' : 'right';
        else facing = dy < 0 ? 'up' : 'down';
        var nx = hero.x + dx * spd * dt, ny = hero.y + dy * spd * dt;
        if (!blocked(area, nx, hero.y)) hero.x = nx;
        if (!blocked(area, hero.x, ny)) hero.y = ny;
        heroFrame += dt * 10;
        idleHint = 0;
      } else { idleHint += dt; }

      // follower trail
      trail.push({ x: hero.x, y: hero.y });
      if (trail.length > 26) trail.shift();
      var target = trail[0] || hero;
      var fd = dist(fam.x, fam.y, target.x, target.y);
      if (fd > 6) { fam.x += (target.x - fam.x) * Math.min(1, dt * 6); fam.y += (target.y - fam.y) * Math.min(1, dt * 6); }

      // camera
      camX = Game.clamp(hero.x - 480, 0, Math.max(0, area.W - 960));
      camY = Game.clamp(hero.y - 300, 0, Math.max(0, area.H - 600));
      if (area.W <= 960) camX = 0; if (area.H <= 600) camY = 0;

      // roamers
      area.roamers.forEach(function (r) {
        r.wander -= dt; r.frame += dt * 8;
        if (r.wander <= 0) { r.wander = rand(1.2, 3); var ang = rand(0, Math.PI * 2); r.vx = Math.cos(ang) * 42; r.vy = Math.sin(ang) * 42; }
        var nx = r.x + r.vx * dt, ny = r.y + r.vy * dt;
        if (!blocked(area, nx, r.y)) r.x = nx; else r.vx *= -1;
        if (!blocked(area, r.x, ny)) r.y = ny; else r.vy *= -1;
        if (!encounterLock && dist(hero.x, hero.y, r.x, r.y) < 36) startEncounter(r);
      });
      if (area.boss) area.boss.frame += dt;

      // auto interaction hint handled in render
    },

    render: function (ctx) {
      var th = THEMES[area.theme] || THEMES.grass;
      // ground
      var x0 = Math.floor(camX / TILE) * TILE, y0 = Math.floor(camY / TILE) * TILE;
      for (var gx = x0; gx < camX + 960 + TILE; gx += TILE) {
        for (var gy = y0; gy < camY + 600 + TILE; gy += TILE) {
          var h = hash(gx / TILE, gy / TILE);
          ctx.fillStyle = h > 0.5 ? th.g1 : th.g2;
          ctx.fillRect(gx - camX, gy - camY, TILE, TILE);
          if (h > 0.86) { ctx.fillStyle = th.det; ctx.globalAlpha = 0.25; ctx.fillRect(gx - camX + 14, gy - camY + 18, 10, 8); ctx.globalAlpha = 1; }
        }
      }
      // central path
      ctx.fillStyle = th.path; ctx.globalAlpha = 0.85;
      ctx.fillRect(area.W / 2 - 46 - camX, -camY, 92, area.H);
      ctx.globalAlpha = 1;

      ctx.save(); ctx.translate(-camX, -camY);

      // collect drawables sorted by y for depth
      var draws = [];
      area.props.forEach(function (p) { draws.push({ y: p.y, fn: function () { drawProp(ctx, p, th); } }); });
      if (area.buildings) area.buildings.forEach(function (b) { draws.push({ y: b.y, fn: function () { drawBuilding(ctx, b); } }); });
      area.interact.forEach(function (it) {
        if (it.type === 'fountain') draws.push({ y: it.y, fn: function () { drawFountain(ctx, it.x, it.y); } });
        else if (it.type === 'gate' || it.type === 'exit') draws.push({ y: it.y, fn: function () { drawPortal(ctx, it); } });
        else if (it.type === 'sign') draws.push({ y: it.y, fn: function () { drawSign(ctx, it); } });
      });
      area.roamers.forEach(function (r) {
        var def = G.Data.ENEMIES[r.id];
        draws.push({ y: r.y, fn: function () { S.drawCreature(ctx, r.x, r.y, 26, def, r.frame); } });
      });
      if (area.boss) {
        var bd = area.boss;
        draws.push({ y: bd.y, fn: function () { drawBossShrine(ctx, bd); } });
      }
      // hero + familiar
      var famDef = Game.famDef();
      draws.push({ y: fam.y, fn: function () { S.drawCreature(ctx, fam.x, fam.y, 22, { kind: famDef.kind, pal: famDef.pal, faceLeft: hero.x < fam.x }, heroFrame); } });
      draws.push({ y: hero.y, fn: function () { S.drawHero(ctx, hero.x, hero.y, 22, Game.state.appearance, facing, moving ? heroFrame : 0, Game.state.equipment); } });

      draws.sort(function (a, b) { return a.y - b.y; });
      draws.forEach(function (d) { d.fn(); });

      // interaction labels
      var it2 = nearestInteract(hero.x, hero.y, 0);
      if (it2 && dist(hero.x, hero.y, it2.x, it2.y) < it2.r + 24) floatLabel(ctx, it2.x, it2.y - 56, it2.label);
      if (area.boss && dist(hero.x, hero.y, area.boss.x, area.boss.y) < area.boss.r + 40)
        floatLabel(ctx, area.boss.x, area.boss.y - 70, 'Challenge ' + area.boss.def.name + ' [Space]');

      ctx.restore();

      // vignette for dark zones
      if (area.theme === 'dungeon' || area.theme === 'spire' || area.theme === 'volcano') {
        var g = ctx.createRadialGradient(480, 300, 160, 480, 300, 560);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
      }
    },

    // called by battle when it finishes
    returnFromBattle: function (won, ctx2) {
      encounterLock = false;
      Game.setScene('world', { zone: area.id, atX: hero.x, atY: hero.y });
    }
  };

  function drawSign(ctx, it) {
    ctx.save(); ctx.translate(it.x, it.y);
    S.path(ctx, function () { S.rr(ctx, -4, -30, 8, 30, 2); }, '#6a431f', S.OUT, 2);
    S.path(ctx, function () { S.rr(ctx, -24, -46, 48, 22, 4); }, '#caa867', S.OUT, 2);
    ctx.fillStyle = '#3a2708'; ctx.font = '13px MedievalSharp'; ctx.textAlign = 'center'; ctx.fillText('?', 0, -31);
    ctx.restore();
  }
  function drawBossShrine(ctx, bd) {
    ctx.save(); ctx.translate(bd.x, bd.y);
    S.path(ctx, function () { S.ellipse(ctx, 0, 40, 70, 18); }, 'rgba(0,0,0,.25)', null);
    // pedestal
    S.path(ctx, function () { S.rr(ctx, -54, 18, 108, 26, 6); }, '#5a5466', S.OUT, 3);
    [-44, 44].forEach(function (dx) { S.path(ctx, function () { S.rr(ctx, dx - 8, -36, 16, 56, 3); }, '#6a6678', S.OUT, 2); S.path(ctx, function () { S.circle(ctx, dx, -40, 6); }, '#ff9a3a', null); });
    ctx.restore();
    // the boss creature itself
    S.drawCreature(ctx, bd.x, bd.y - 4, 46, bd.def, bd.frame);
  }

  function floatLabel(ctx, x, y, text) {
    ctx.save();
    ctx.font = '15px MedievalSharp';
    var w = ctx.measureText(text).width + 22;
    var bob = Math.sin(performance.now() / 300) * 3;
    ctx.translate(x, y + bob);
    S.path(ctx, function () { S.rr(ctx, -w / 2, -18, w, 26, 8); }, 'rgba(40,24,10,.92)', '#caa867', 2);
    ctx.fillStyle = '#ffe9b0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, -4);
    ctx.restore();
  }

  function nearestInteract(x, y, pad) {
    var best = null, bd = 1e9;
    area.interact.forEach(function (it) {
      var d = dist(x, y, it.x, it.y);
      if (d < it.r + 24 + pad && d < bd) { bd = d; best = it; }
    });
    return best;
  }
  function tryInteract() {
    var it = nearestInteract(hero.x, hero.y, 0);
    if (it && dist(hero.x, hero.y, it.x, it.y) < it.r + 24) { doInteract(it); return; }
    if (area.boss && dist(hero.x, hero.y, area.boss.x, area.boss.y) < area.boss.r + 40) startBoss();
  }
  function doInteract(it) {
    G.Audio.sfx('select');
    if (it.type === 'shop') G.UI.openShop();
    else if (it.type === 'roost') G.UI.openFamiliars();
    else if (it.type === 'fountain') { Game.fullHeal(); Game.toast('Your vigor is fully restored.'); G.Audio.sfx('heal'); }
    else if (it.type === 'gate') G.UI.openWorldMap();
    else if (it.type === 'exit') { Game.fade(function () { Game.setScene('world', { zone: 'town' }); }); }
    else if (it.type === 'sign') Game.dialogue([area.zone.intro, 'Topic of study here: ' + area.zone.topics.map(function (t) { return G.Chem.unitName(t); }).join(', ') + '.'], area.zone.name);
  }

  function startEncounter(roamer) {
    if (encounterLock) return;
    encounterLock = true;
    Game.battleCtx = { enemyId: roamer.id, isBoss: false, zoneId: area.id, roamer: roamer };
    G.Audio.sfx('select');
    Game.fade(function () {
      // remove roamer, schedule respawn
      var idx = area.roamers.indexOf(roamer);
      if (idx >= 0) area.roamers.splice(idx, 1);
      setTimeout(function () { if (area && area.id !== 'town') spawnRoamer(area); }, 8000);
      Game.setScene('battle', Game.battleCtx);
    });
  }
  function startBoss() {
    if (encounterLock || !area.boss) return;
    encounterLock = true;
    Game.battleCtx = { enemyId: area.boss.def.id, isBoss: true, zoneId: area.id };
    Game.fade(function () { Game.setScene('battle', Game.battleCtx); });
  }

  // expose for battle to update world after boss win
  World.markBossDefeated = function (zoneId) {
    if (area && area.id === zoneId) area.boss = null;
  };
  World.heroPos = function () { return { x: hero.x, y: hero.y }; };

  Game.registerScene('world', World);
  G.World = World;
})(window.G = window.G || {});
