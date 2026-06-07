/* ============================================================
   Core - state, save/load, leveling, scene manager, game loop,
   shared DOM/helpers. Everything hangs off G.Game.
   ============================================================ */
(function (G) {
  'use strict';

  var SAVE_KEY = 'crucible_save_v1';
  var canvas, ctx;
  var scenes = {}, current = null, lastT = 0;
  var keys = {};
  var pointer = { active: false, x: 0, y: 0 };

  // ---------- helpers ----------
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function chance(p) { return Math.random() < p; }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------- default state ----------
  function defaultConfig() {
    return {
      units: G.Chem.UNITS.map(function (u) { return u.id; }),
      mode: 'mixed',           // mixed | mc | written
      difficulty: 'normal',    // normal | hard
      musicVol: 0.5,
      sfxVol: 0.7,
      muted: false
    };
  }

  function newPlayer(name, appearance, starterId) {
    return {
      name: name || 'Adept',
      appearance: appearance || { skin: '#f0c39a', hair: 'short', hairColor: '#5a3a1a', tunic: '#4f7a32' },
      level: 1, exp: 0, statPoints: 0,
      base: { vigor: 6, might: 4, lore: 4, fortune: 2 },
      hp: 0,
      gold: 30,
      potions: { draught: 2, elixir: 0 },
      inventory: [],
      equipment: { weapon: null, helm: null, armor: null, trinket: null },
      familiars: [{ id: starterId, level: 1, exp: 0 }],
      activeFamiliar: 0,
      flags: { bosses: {}, zonesCleared: {}, tutorial: false },
      pos: { zone: 'town', x: 480, y: 330 }
    };
  }

  var Game = {
    state: null,
    config: defaultConfig(),
    pendingEncounterAfterMap: null,

    // ----- exposed helpers -----
    el: el, qs: qs, clamp: clamp, rand: rand, randInt: randInt, chance: chance, choice: choice,

    // ----- canvas access -----
    get ctx() { return ctx; },
    get canvas() { return canvas; },
    keys: keys,
    pointer: pointer,

    // ----- derived stats -----
    gearStats: function () {
      var p = this.state, tot = { vigor: 0, might: 0, lore: 0, fortune: 0 };
      ['weapon', 'helm', 'armor', 'trinket'].forEach(function (slot) {
        var id = p.equipment[slot]; if (!id) return;
        var it = G.Data.ITEMS[id]; if (!it) return;
        Object.keys(it.stats).forEach(function (k) { tot[k] = (tot[k] || 0) + it.stats[k]; });
      });
      return tot;
    },
    stats: function () {
      var b = this.state.base, g = this.gearStats();
      return {
        vigor: b.vigor + g.vigor, might: b.might + g.might,
        lore: b.lore + g.lore, fortune: b.fortune + g.fortune
      };
    },
    maxHP: function () {
      var s = this.stats();
      return 40 + s.vigor * 8 + this.state.level * 6;
    },
    spellPower: function () { return this.stats().lore; },
    critChance: function () { return clamp(0.05 + this.stats().fortune * 0.012, 0.05, 0.6); },
    defense: function () { var v = this.stats().vigor; return v / (v + 42); }, // fraction mitigated

    activeFam: function () { return this.state.familiars[this.state.activeFamiliar]; },
    famDef: function (inst) { return G.Data.FAMILIARS[(inst || this.activeFam()).id]; },
    famMoves: function (inst) {
      inst = inst || this.activeFam();
      var def = G.Data.FAMILIARS[inst.id];
      return def.moves.filter(function (m) { return m.lvl <= inst.level; });
    },

    // ----- progression -----
    expToNext: function (level) { return Math.round(25 * Math.pow(level, 1.5)); },
    famExpToNext: function (level) { return Math.round(18 * Math.pow(level, 1.45)); },

    gainExp: function (amount) {
      var p = this.state, gained = 0;
      p.exp += amount;
      while (p.exp >= this.expToNext(p.level)) {
        p.exp -= this.expToNext(p.level);
        p.level++; p.statPoints += 3; gained++;
      }
      return gained; // number of levels gained
    },
    famGainExp: function (inst, amount) {
      var learned = [];
      inst.exp += amount;
      while (inst.exp >= this.famExpToNext(inst.level)) {
        inst.exp -= this.famExpToNext(inst.level);
        inst.level++;
        var def = G.Data.FAMILIARS[inst.id];
        def.moves.forEach(function (m) { if (m.lvl === inst.level) learned.push(m); });
      }
      return learned; // moves newly unlocked
    },
    allocate: function (stat) {
      if (this.state.statPoints <= 0) return false;
      this.state.base[stat]++; this.state.statPoints--;
      this.save(); this.updateHUD(); return true;
    },

    heal: function (amount) {
      this.state.hp = clamp(this.state.hp + amount, 0, this.maxHP());
      this.updateHUD();
    },
    fullHeal: function () { this.state.hp = this.maxHP(); this.updateHUD(); },

    addGold: function (n) { this.state.gold += n; this.updateHUD(); },
    spendGold: function (n) {
      if (this.state.gold < n) return false;
      this.state.gold -= n; this.updateHUD(); return true;
    },
    addItem: function (id) { this.state.inventory.push(id); },
    ownsFamiliar: function (id) { return this.state.familiars.some(function (f) { return f.id === id; }); },
    unlockFamiliar: function (id) {
      if (this.ownsFamiliar(id)) return false;
      this.state.familiars.push({ id: id, level: Math.max(1, this.state.level - 1), exp: 0 });
      return true;
    },

    equip: function (id) {
      var it = G.Data.ITEMS[id]; if (!it) return;
      var p = this.state, slot = it.slot;
      var idx = p.inventory.indexOf(id); if (idx < 0) return;
      p.inventory.splice(idx, 1);
      if (p.equipment[slot]) p.inventory.push(p.equipment[slot]);
      p.equipment[slot] = id;
      p.hp = clamp(p.hp, 0, this.maxHP());
      this.save(); this.updateHUD();
    },
    unequip: function (slot) {
      var p = this.state; if (!p.equipment[slot]) return;
      p.inventory.push(p.equipment[slot]); p.equipment[slot] = null;
      p.hp = clamp(p.hp, 0, this.maxHP());
      this.save(); this.updateHUD();
    },

    // ----- save / load -----
    newGame: function (name, appearance, starterId) {
      this.config = defaultConfig();
      this.state = newPlayer(name, appearance, starterId);
      this.state.hp = this.maxHP();
      this.save();
    },
    save: function () {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, state: this.state, config: this.config }));
      } catch (e) { /* ignore */ }
    },
    hasSave: function () {
      try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    },
    load: function () {
      try {
        var raw = localStorage.getItem(SAVE_KEY); if (!raw) return false;
        var data = JSON.parse(raw);
        this.state = data.state;
        this.config = Object.assign(defaultConfig(), data.config || {});
        // sanity: make sure enabled units still exist
        var valid = G.Chem.UNITS.map(function (u) { return u.id; });
        this.config.units = (this.config.units || valid).filter(function (u) { return valid.indexOf(u) >= 0; });
        if (!this.config.units.length) this.config.units = valid;
        return true;
      } catch (e) { return false; }
    },
    wipe: function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} },

    applyAudioConfig: function () {
      G.Audio.setMusicVol(this.config.musicVol);
      G.Audio.setSfxVol(this.config.sfxVol);
      G.Audio.setMuted(this.config.muted);
    },

    questionMaxDiff: function (enemy) {
      var base = this.config.difficulty === 'hard' ? 3 : 2;
      if (enemy && enemy.boss) base = 3;
      return base;
    },

    // ----- scene manager -----
    registerScene: function (name, obj) { scenes[name] = obj; obj.name = name; },
    scene: function () { return current; },
    setScene: function (name, opts) {
      var next = scenes[name];
      if (!next) return;
      if (current && current.exit) current.exit();
      current = next;
      if (current.enter) current.enter(opts || {});
    },

    // ----- HUD / overlay / dialogue -----
    showHUD: function (show) {
      qs('#hud').classList.toggle('hidden', !show);
    },
    showToolbar: function (show) {
      qs('#toolbar').classList.toggle('hidden', !show);
    },
    updateHUD: function () {
      if (!this.state) return;
      var p = this.state;
      qs('#hudName').textContent = p.name;
      var mh = this.maxHP();
      qs('#hudHpFill').style.width = clamp(p.hp / mh * 100, 0, 100) + '%';
      qs('#hudHpText').textContent = Math.max(0, Math.round(p.hp)) + '/' + mh;
      var need = this.expToNext(p.level);
      qs('#hudXpFill').style.width = clamp(p.exp / need * 100, 0, 100) + '%';
      qs('#hudXpText').textContent = 'Lv ' + p.level + (p.statPoints ? '  (+' + p.statPoints + ')' : '');
      qs('#hudGold').textContent = p.gold;
      var av = qs('#hudAvatar');
      av.innerHTML = '';
      av.appendChild(G.Sprites.heroIcon(p.appearance, p.equipment, 50));
    },

    overlay: function () { return qs('#overlay'); },
    openOverlay: function (node) {
      var o = qs('#overlay'); o.innerHTML = ''; o.appendChild(node);
      o.classList.remove('hidden');
      G.Audio.sfx('open');
    },
    closeOverlay: function () {
      qs('#overlay').classList.add('hidden');
      qs('#overlay').innerHTML = '';
      G.Audio.sfx('close');
    },
    overlayOpen: function () { return !qs('#overlay').classList.contains('hidden'); },

    toast: function (msg, ms) {
      var t = qs('#toast'); t.innerHTML = msg; t.classList.remove('hidden');
      clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { t.classList.add('hidden'); }, ms || 1800);
    },

    dialogue: function (lines, speaker, onDone) {
      var box = qs('#dialogue'), txt = qs('#dlgText'), sp = qs('#dlgSpeaker');
      var i = 0;
      lines = Array.isArray(lines) ? lines : [lines];
      function show() {
        sp.textContent = speaker || '';
        txt.innerHTML = lines[i];
      }
      function advance() {
        i++;
        if (i >= lines.length) {
          box.classList.add('hidden');
          box.removeEventListener('click', advance);
          if (onDone) onDone();
        } else { G.Audio.sfx('select'); show(); }
      }
      box.classList.remove('hidden');
      box.addEventListener('click', advance);
      show();
    },

    fade: function (cb, dur) {
      var f = qs('#fade');
      if (!f) { f = el('div'); f.id = 'fade'; f.style.cssText = 'position:absolute;inset:0;background:#0a0703;z-index:80;opacity:0;pointer-events:none;transition:opacity .28s ease;'; qs('#stage').appendChild(f); }
      dur = dur || 280;
      f.style.opacity = '1';
      setTimeout(function () {
        if (cb) cb();
        f.style.opacity = '0';
      }, dur);
    }
  };

  // ---------- input ----------
  function onKey(e, down) {
    var k = e.key.toLowerCase();
    keys[k] = down;
    if (down && current && current.handleKey) current.handleKey(e);
    if (down && [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0) {
      if (e.target === document.body) e.preventDefault();
    }
  }
  function pointerPos(e) {
    var r = canvas.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: (cx - r.left) / r.width * 960, y: (cy - r.top) / r.height * 600 };
  }

  // ---------- game loop ----------
  function loop(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
    if (current) {
      if (current.update) current.update(dt);
      if (current.render && ctx) current.render(ctx, dt);
    }
    requestAnimationFrame(loop);
  }

  // ---------- responsive scaling ----------
  function fit() {
    var stage = qs('#stage');
    var pad = 8;
    var sw = window.innerWidth - pad, sh = window.innerHeight - pad;
    var scale = Math.min(sw / 960, sh / 600);
    scale = Math.max(0.3, scale);
    stage.style.transform = 'scale(' + scale + ')';
  }

  Game.boot = function () {
    canvas = qs('#scene'); ctx = canvas.getContext('2d');
    window.addEventListener('keydown', function (e) { onKey(e, true); });
    window.addEventListener('keyup', function (e) { onKey(e, false); });
    function pd(e) { pointer.active = true; var p = pointerPos(e); pointer.x = p.x; pointer.y = p.y; if (current && current.handlePointer) current.handlePointer(p.x, p.y, 'down'); }
    function pm(e) { if (!pointer.active) return; var p = pointerPos(e); pointer.x = p.x; pointer.y = p.y; }
    function pu() { pointer.active = false; if (current && current.handlePointer) current.handlePointer(pointer.x, pointer.y, 'up'); }
    canvas.addEventListener('mousedown', pd); canvas.addEventListener('mousemove', pm); window.addEventListener('mouseup', pu);
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); pd(e); }, { passive: false });
    canvas.addEventListener('touchmove', function (e) { e.preventDefault(); pm(e); }, { passive: false });
    canvas.addEventListener('touchend', function (e) { e.preventDefault(); pu(e); }, { passive: false });

    // any first interaction unlocks audio
    var unlockOnce = function () { G.Audio.unlock(); window.removeEventListener('pointerdown', unlockOnce); window.removeEventListener('keydown', unlockOnce); };
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);

    // menu / toolbar buttons
    qs('#btnMenu').addEventListener('click', function () { if (G.UI) G.UI.openMenu(); });
    Array.prototype.forEach.call(document.querySelectorAll('#toolbar .tool'), function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        G.Audio.sfx('select');
        if (act === 'map') G.UI.openWorldMap();
        else if (act === 'familiars') G.UI.openFamiliars();
        else if (act === 'character') G.UI.openCharacter();
        else if (act === 'bag') G.UI.openBag();
      });
    });

    window.addEventListener('resize', fit); fit();
    requestAnimationFrame(loop);
  };

  G.Game = Game;
})(window.G = window.G || {});
