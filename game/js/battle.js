/* ============================================================
   Battle - turn-based combat where your Familiar's moves are
   powered by answering chemistry questions.
   ============================================================ */
(function (G) {
  'use strict';
  var Game = G.Game, S = G.Sprites, D = G.Data;

  var bs = null;          // battle state
  var ui = null;          // dom refs
  var anim = null;        // animation timers

  function el(t, c, h) { return Game.el(t, c, h); }

  function buildUI() {
    var root = el('div'); root.id = 'battleUI';
    var top = el('div', 'bt-top');
    // enemy plate
    var ep = el('div', 'enemy-plate');
    ep.innerHTML = '<div class="bt-name"><span id="enName"></span><span id="enEl" class="tag"></span></div>' +
      '<div class="bt-hpbar"><span id="enHp"></span></div><div class="bt-hptext" id="enHpTxt"></div>';
    // party plate
    var pp = el('div', 'party-plate');
    pp.innerHTML = '<div class="bt-name"><span id="myName"></span><span id="advHint" class="muted" style="font-size:12px"></span></div>' +
      '<div class="bt-hpbar ally"><span id="myHp"></span></div><div class="bt-hptext" id="myHpTxt"></div>';
    top.appendChild(ep); top.appendChild(pp);

    var bottom = el('div', 'bt-bottom');
    bottom.innerHTML = '<div class="bt-msg" id="btMsg"></div><div class="move-grid" id="moveGrid"></div>';
    root.appendChild(top); root.appendChild(bottom);
    Game.qs('#stage').appendChild(root);

    ui = {
      root: root, enName: Game.qs('#enName', root), enEl: Game.qs('#enEl', root),
      enHp: Game.qs('#enHp', root), enHpTxt: Game.qs('#enHpTxt', root),
      myName: Game.qs('#myName', root), myHp: Game.qs('#myHp', root), myHpTxt: Game.qs('#myHpTxt', root),
      advHint: Game.qs('#advHint', root), msg: Game.qs('#btMsg', root), grid: Game.qs('#moveGrid', root),
      enPlate: ep, myPlate: pp
    };
  }

  function refreshBars() {
    ui.enHp.style.width = Game.clamp(bs.enemy.hp / bs.enemy.maxHp * 100, 0, 100) + '%';
    ui.enHpTxt.textContent = Math.max(0, Math.ceil(bs.enemy.hp)) + '/' + bs.enemy.maxHp;
    var mh = Game.maxHP();
    ui.myHp.style.width = Game.clamp(Game.state.hp / mh * 100, 0, 100) + '%';
    ui.myHpTxt.textContent = Math.max(0, Math.ceil(Game.state.hp)) + '/' + mh;
  }

  function setMsg(html) { ui.msg.innerHTML = html; }

  function renderMoves() {
    ui.grid.innerHTML = '';
    var moves = Game.famMoves();
    moves.forEach(function (m) {
      var b = el('button', 'movebtn');
      var elTag = D.ELEMENTS[m.element];
      var kind = m.type === 'heal' ? 'Heal' : (m.type === 'guard' ? 'Guard' : 'Power ' + m.power);
      b.innerHTML = '<div class="mvname">' + m.name + ' <span class="tag ' + elTag.css + '">' + elTag.name + '</span></div>' +
        '<div class="mvmeta">' + kind + ' - ' + m.desc + '</div>';
      b.addEventListener('click', function () { if (!bs.busy) chooseMove(m); });
      ui.grid.appendChild(b);
    });
    // items + flee row
    var draughts = Game.state.potions.draught + Game.state.potions.elixir;
    var pot = el('button', 'movebtn');
    pot.innerHTML = '<div class="mvname">Use Draught <span class="tag" style="background:#a32a2a">' + draughts + '</span></div><div class="mvmeta">Restore vigor (no question)</div>';
    pot.addEventListener('click', function () { if (!bs.busy) usePotion(); });
    if (!draughts) pot.setAttribute('disabled', '');
    ui.grid.appendChild(pot);

    var flee = el('button', 'movebtn');
    flee.innerHTML = '<div class="mvname">Flee</div><div class="mvmeta">' + (bs.isBoss ? 'You cannot flee a boss!' : 'Escape back to the field') + '</div>';
    flee.addEventListener('click', function () { if (!bs.busy) flwhen(); });
    if (bs.isBoss) flee.setAttribute('disabled', '');
    ui.grid.appendChild(flee);
  }

  function showMoves(show) { ui.grid.style.display = show ? 'grid' : 'none'; }

  // ---------- turn logic ----------
  function chooseMove(move) {
    bs.busy = true; showMoves(false);
    setMsg('Channeling <b>' + move.name + '</b>... answer to unleash it!');
    askQuestion(move, function (correct, q) {
      applyMove(move, correct, q);
    });
  }

  function usePotion() {
    var p = Game.state;
    var which = p.potions.elixir > 0 ? 'elixir' : 'draught';
    if ((which === 'draught' && !p.potions.draught) ) { return; }
    p.potions[which]--;
    var heal = D.POTIONS[which].heal * Game.maxHP();
    Game.heal(heal); G.Audio.sfx('heal');
    setMsg('You drink a ' + D.POTIONS[which].name + ' and recover ' + Math.round(heal) + ' vigor.');
    refreshBars(); flashPlate(ui.myPlate, 'flash');
    bs.busy = true; showMoves(false);
    setTimeout(enemyTurn, 900);
  }

  function flwhen() {
    if (bs.isBoss) return;
    if (Game.chance(0.7)) {
      setMsg('You slip away from the ' + bs.enemy.def.name + '.');
      bs.busy = true; showMoves(false);
      setTimeout(function () { endBattle(false, true); }, 800);
    } else {
      setMsg('You failed to escape!');
      bs.busy = true; showMoves(false);
      setTimeout(enemyTurn, 700);
    }
  }

  function applyMove(move, correct, q) {
    var hard = Game.config.difficulty === 'hard';
    if (correct) {
      G.Audio.sfx('cast');
      if (move.type === 'heal') {
        var heal = move.power * (1 + Game.spellPower() * 0.04);
        Game.heal(heal);
        setMsg('Correct! <b>' + move.name + '</b> restores ' + Math.round(heal) + ' vigor.');
        flashPlate(ui.myPlate, 'flash');
      } else if (move.type === 'guard') {
        bs.shield = 0.6;
        setMsg('Correct! <b>' + move.name + '</b> braces you against the next blow.');
        flashPlate(ui.myPlate, 'flash');
      } else {
        var r = computeDamage(move);
        bs.enemy.hp -= r.dmg;
        anim.enemyHurt = 0.4; anim.famLunge = 0.3;
        G.Audio.sfx('hit');
        var extra = r.crit ? ' <b>Critical!</b>' : '';
        extra += r.elMult > 1 ? ' <span style="color:#2c6e1f">It\'s super effective!</span>' : (r.elMult < 1 ? ' <span class="muted">Not very effective...</span>' : '');
        setMsg('Correct! <b>' + move.name + '</b> hits for ' + r.dmg + ' damage.' + extra);
        flashPlate(ui.enPlate, 'shake');
      }
    } else {
      G.Audio.sfx('wrong');
      var ans = q.type === 'written' ? ('The answer was <b>' + q.answerHtml + '</b>. ') :
        ('The answer was <b>' + correctChoice(q) + '</b>. ');
      setMsg('Not quite. ' + ans + '<span class="muted">' + q.explainHtml + '</span>');
      bs.punish = hard ? 1.7 : 1.4;
    }
    refreshBars();
    if (bs.enemy.hp <= 0) { setTimeout(function () { victory(); }, 1000); return; }
    setTimeout(enemyTurn, correct ? 1100 : 1700);
  }

  function correctChoice(q) {
    var c = q.choices.find(function (x) { return x.correct; });
    return c ? c.html : '';
  }

  function computeDamage(move) {
    var offense = 1 + Game.spellPower() * 0.05 + Game.activeFam().level * 0.045 + Game.stats().might * 0.03;
    var elMult = D.advantage(move.element, bs.enemy.el);
    var critC = Game.critChance() + (bs.speedBonus ? 0.25 : 0);
    var crit = Game.chance(critC);
    var dmg = Math.round(move.power * offense * elMult * (crit ? 1.8 : 1) * Game.rand(0.92, 1.08));
    return { dmg: Math.max(1, dmg), crit: crit, elMult: elMult };
  }

  function enemyTurn() {
    if (Game.state.hp <= 0) return;
    var base = bs.enemy.atk * Game.rand(0.85, 1.15);
    if (bs.punish) { base *= bs.punish; bs.punish = 0; }
    var dmg = base * (1 - Game.defense());
    if (bs.shield) { dmg *= (1 - bs.shield); bs.shield = 0; }
    dmg = Math.max(2, Math.round(dmg));
    Game.state.hp -= dmg;
    anim.heroHurt = 0.4; anim.enemyLunge = 0.3;
    G.Audio.sfx('hit');
    setMsg(ui.msg.innerHTML + '<br><b>' + bs.enemy.def.name + '</b> strikes you for ' + dmg + ' damage.');
    flashPlate(ui.myPlate, 'shake');
    refreshBars();
    Game.updateHUD();
    if (Game.state.hp <= 0) { setTimeout(function () { defeat(); }, 1000); return; }
    bs.busy = false; bs.speedBonus = false;
    setTimeout(function () { setMsg('Choose your Familiar\'s move.'); showMoves(true); renderMoves(); }, 1100);
  }

  function flashPlate(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }

  // ---------- question card ----------
  function askQuestion(move, done) {
    var q = G.Chem.draw({
      units: Game.config.units,
      topic: bs.topic,
      maxDiff: Game.questionMaxDiff(bs.enemy.def),
      mode: Game.config.mode
    });
    bs.speedBonus = false;
    var card = el('div'); card.id = 'questionCard';
    var startT = performance.now();
    var head = '<div class="q-top"><span class="q-topic">' + q.unitName + ' &bull; for ' + move.name + '</span><span class="q-timer" id="qTimer"></span></div>';
    var body = '<div class="q-text">' + q.qHtml + '</div>';
    var answerArea, feedback = '<div class="q-feedback" id="qFb"></div>';

    if (q.type === 'mc') {
      answerArea = '<div class="q-choices" id="qChoices"></div>';
    } else {
      answerArea = '<div class="written-wrap"><input id="qInput" type="text" autocomplete="off" spellcheck="false" placeholder="Type your answer..." /><button class="btn gold" id="qSubmit">Cast</button></div>';
    }
    card.innerHTML = head + body + answerArea + feedback;
    Game.qs('#stage').appendChild(card);

    var timerEl = Game.qs('#qTimer', card), fb = Game.qs('#qFb', card);
    var tInt = setInterval(function () {
      var s = (performance.now() - startT) / 1000;
      timerEl.textContent = s.toFixed(1) + 's' + (s < 6 ? '  (speed bonus!)' : '');
    }, 100);

    function finish(correct) {
      clearInterval(tInt);
      bs.speedBonus = correct && (performance.now() - startT) / 1000 < 6;
      setTimeout(function () { card.remove(); done(correct, q); }, 950);
    }

    if (q.type === 'mc') {
      var box = Game.qs('#qChoices', card);
      var letters = ['A', 'B', 'C', 'D', 'E'];
      q.choices.forEach(function (ch, i) {
        var b = el('button', 'choice');
        b.innerHTML = '<span class="ck">' + letters[i] + '</span>' + ch.html;
        b.addEventListener('click', function () {
          if (box.dataset.done) return; box.dataset.done = '1';
          Array.prototype.forEach.call(box.children, function (c) { c.style.pointerEvents = 'none'; });
          if (ch.correct) { b.classList.add('correct'); fb.className = 'q-feedback ok'; fb.innerHTML = 'Correct! ' + q.explainHtml; G.Audio.sfx('correct'); finish(true); }
          else {
            b.classList.add('wrong');
            Array.prototype.forEach.call(box.children, function (c, j) { if (q.choices[j].correct) c.classList.add('correct'); });
            fb.className = 'q-feedback no'; fb.innerHTML = q.explainHtml;
            finish(false);
          }
        });
        box.appendChild(b);
      });
    } else {
      var input = Game.qs('#qInput', card), sub = Game.qs('#qSubmit', card);
      input.focus();
      function submit() {
        if (card.dataset.done) return; card.dataset.done = '1';
        input.disabled = true; sub.disabled = true;
        var ok = G.Chem.checkWritten(input.value, q.accept);
        if (ok) { fb.className = 'q-feedback ok'; fb.innerHTML = 'Correct! ' + q.explainHtml; G.Audio.sfx('correct'); }
        else { fb.className = 'q-feedback no'; fb.innerHTML = 'The answer was <b>' + q.answerHtml + '</b>. ' + q.explainHtml; }
        finish(ok);
      }
      sub.addEventListener('click', submit);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    }
  }

  // ---------- end states ----------
  function victory() {
    var enemy = bs.enemy.def;
    G.Audio.jingle('victory', bs.isBoss ? 'town' : 'field');
    var fortune = Game.stats().fortune;
    var gold = Math.round(enemy.gold * (1 + fortune * 0.02) * Game.rand(0.9, 1.15));
    var levels = Game.gainExp(enemy.exp);
    Game.addGold(gold);
    // familiar exp
    var learned = Game.famGainExp(Game.activeFam(), Math.round(enemy.exp * 0.85));
    // drops
    var gained = [];
    (enemy.drops || []).forEach(function (d) {
      if (Math.random() < d.chance + fortune * 0.01) { Game.addItem(d.item); gained.push(D.ITEMS[d.item].name); }
    });
    // boss handling
    var unlockedFam = null;
    if (bs.isBoss) {
      Game.state.flags.bosses[enemy.id] = true;
      Game.state.flags.zonesCleared[bs.zoneId] = true;
      if (enemy.unlock && Game.unlockFamiliar(enemy.unlock)) unlockedFam = D.FAMILIARS[enemy.unlock];
      if (G.World.markBossDefeated) G.World.markBossDefeated(bs.zoneId);
    }
    Game.save();

    var html = '<h2>Victory!</h2><p class="center">You vanquished the <b>' + enemy.name + '</b>.</p><div class="scroll-divider"></div>';
    html += '<div class="rowlist">';
    html += rewardRow('Experience', '+' + enemy.exp + ' XP' + (levels ? '  (Level up x' + levels + '!)' : ''));
    html += rewardRow('Gold', '+' + gold);
    if (gained.length) html += rewardRow('Items found', gained.join(', '));
    if (learned.length) html += rewardRow(Game.famDef().name + ' learned', learned.map(function (m) { return m.name; }).join(', '));
    if (unlockedFam) html += rewardRow('New Familiar!', unlockedFam.name + ' has joined you!');
    html += '</div>';
    if (bs.isBoss && enemy.final) {
      html += '<div class="scroll-divider"></div><p class="center" style="font-family:var(--font-head)">The Crucible is complete. You have mastered the realm of Chymistry!</p>';
    }
    html += '<div class="btn-row"><button class="btn gold" id="vicGo">Continue</button></div>';
    var panel = el('div', 'panel narrow'); panel.innerHTML = html;
    Game.openOverlay(panel);
    Game.qs('#vicGo').addEventListener('click', function () {
      Game.closeOverlay();
      var after = function () {
        if (bs.isBoss && unlockedFam) {
          Game.dialogue(['As the ' + enemy.name + ' falls, ' + unlockedFam.name + ' steps from the shadows...', unlockedFam.blurb, 'Visit the Familiar Roost to make it your companion!'], 'A New Ally', proceed);
        } else proceed();
      };
      function proceed() { endBattle(true, false); }
      if (levels > 0) G.UI.openLevelUp(after);
      else after();
    });
  }
  function rewardRow(name, val) {
    return '<div class="rowcard"><div class="body"><div class="rname">' + name + '</div><div class="rdesc">' + val + '</div></div></div>';
  }

  function defeat() {
    G.Audio.sfx('defeat');
    var lost = Math.round(Game.state.gold * 0.2);
    Game.state.gold -= lost;
    var panel = el('div', 'panel narrow');
    panel.innerHTML = '<h2>Defeated...</h2><p class="center">The <b>' + bs.enemy.def.name + '</b> bested you. You stagger back to Aldermoor and lose ' + lost + ' gold.</p>' +
      '<div class="btn-row"><button class="btn" id="dfGo">Return to Town</button></div>';
    Game.openOverlay(panel);
    Game.qs('#dfGo').addEventListener('click', function () {
      Game.closeOverlay();
      Game.fullHeal(); Game.save();
      cleanup();
      Game.fade(function () { Game.setScene('world', { zone: 'town' }); });
    });
  }

  function endBattle(won, fled) {
    cleanup();
    Game.save();
    Game.fade(function () {
      var pos = G.World.heroPos ? G.World.heroPos() : null;
      Game.setScene('world', { zone: bs ? bs.zoneId : 'town', atX: pos ? pos.x : null, atY: pos ? pos.y : null });
    });
  }

  function cleanup() {
    if (ui && ui.root) ui.root.remove();
    var qc = Game.qs('#questionCard'); if (qc) qc.remove();
    ui = null;
  }

  // ---------- scene ----------
  var Battle = {
    enter: function (opts) {
      var def = D.ENEMIES[opts.enemyId];
      var z = D.zoneById(opts.zoneId);
      var hard = Game.config.difficulty === 'hard';
      var hpMul = hard ? 1.28 : 1, atkMul = hard ? 1.2 : 1;
      bs = {
        enemy: { def: def, el: def.element, hp: Math.round(def.hp * hpMul), maxHp: Math.round(def.hp * hpMul), atk: def.atk * atkMul },
        isBoss: !!opts.isBoss, zoneId: opts.zoneId,
        topic: z ? Game.choice(z.topics) : null,
        busy: true, shield: 0, punish: 0, speedBonus: false
      };
      anim = { enemyHurt: 0, heroHurt: 0, famLunge: 0, enemyLunge: 0, t: 0 };
      Game.showHUD(true); Game.showToolbar(false);
      buildUI();
      var fam = Game.famDef();
      ui.enName.textContent = def.name;
      ui.enEl.className = 'tag ' + D.ELEMENTS[def.element].css; ui.enEl.textContent = D.ELEMENTS[def.element].name;
      ui.myName.textContent = fam.name + ' (Lv ' + Game.activeFam().level + ')';
      var advs = D.advWord(fam.element, def.element);
      ui.advHint.textContent = 'Your ' + D.ELEMENTS[fam.element].name + ' is ' + advs + ' vs ' + D.ELEMENTS[def.element].name;
      refreshBars();
      G.Audio.playMusic(opts.isBoss ? 'boss' : 'battle');
      showMoves(false);
      var line = opts.isBoss ? 'The <b>' + def.name + '</b> looms before you!' : 'A wild <b>' + def.name + '</b> appears!';
      setMsg(line + ' <span class="muted">(' + def.blurb + ')</span>');
      setTimeout(function () {
        bs.busy = false;
        setMsg('Choose your Familiar\'s move.');
        showMoves(true); renderMoves();
      }, 1400);
    },
    exit: function () { cleanup(); },
    update: function (dt) {
      if (!anim) return; anim.t += dt;
      ['enemyHurt', 'heroHurt', 'famLunge', 'enemyLunge'].forEach(function (k) { if (anim[k] > 0) anim[k] = Math.max(0, anim[k] - dt); });
    },
    render: function (ctx) {
      // arena background
      var z = D.zoneById(bs.zoneId);
      var theme = z ? z.theme : 'grass';
      drawArena(ctx, theme);
      var t = anim.t;
      // enemy (left, facing right)
      var ex = 270 + (anim.enemyLunge > 0 ? 40 : 0);
      var ey = 250 + Math.sin(t * 2) * 4;
      ctx.save();
      if (anim.enemyHurt > 0 && Math.floor(t * 20) % 2) ctx.globalAlpha = 0.4;
      var bossScale = bs.isBoss ? 1.5 : 1.05;
      S.drawCreature(ctx, ex, ey, 60 * bossScale, { kind: bs.enemy.def.kind, pal: bs.enemy.def.pal, boss: bs.enemy.def.boss, crown: bs.enemy.def.crown, cape: bs.enemy.def.cape, faceLeft: !bs.enemy.def.faceLeft }, t);
      ctx.restore();
      // hero + familiar (right)
      var hx = 700, hy = 360;
      S.drawHero(ctx, hx, hy, 40, Game.state.appearance, 'left', Math.sin(t * 2) > 0 ? 1 : 0, Game.state.equipment);
      var fx = 610 - (anim.famLunge > 0 ? 36 : 0), fy = 380 + Math.sin(t * 2.4) * 4;
      ctx.save();
      S.drawCreature(ctx, fx, fy, 48, { kind: Game.famDef().kind, pal: Game.famDef().pal, faceLeft: true }, t);
      ctx.restore();
    },
    handleKey: function (e) {
      if (e.key.toLowerCase() === 'escape' && !bs.busy && !bs.isBoss) flwhen();
    }
  };

  function drawArena(ctx, theme) {
    var th = (G.WorldThemes && G.WorldThemes[theme]) || null;
    var sky = { grass: ['#bfe6f0', '#dff3e0'], forest: ['#a9d8b0', '#cfe8c0'], dungeon: ['#2a2634', '#14121c'], volcano: ['#5a2418', '#2a1008'], snow: ['#cfe0ee', '#eef6fc'], swamp: ['#7a8a5a', '#5a6a3a'], spire: ['#2a2440', '#14101e'] }[theme] || ['#bfe6f0', '#dff3e0'];
    var g = ctx.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
    // ground
    var gc = { grass: '#6fae40', forest: '#4d8c3b', dungeon: '#3c3845', volcano: '#4e302a', snow: '#d2dfea', swamp: '#4c5c2e', spire: '#322c46' }[theme] || '#6fae40';
    ctx.fillStyle = gc; ctx.fillRect(0, 360, 960, 240);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    for (var i = 0; i < 8; i++) ctx.fillRect(0, 360 + i * 30, 960, 2);
    // simple back decor
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.beginPath(); ctx.ellipse(270, 360, 130, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(660, 420, 150, 28, 0, 0, Math.PI * 2); ctx.fill();
    if (theme === 'dungeon' || theme === 'spire' || theme === 'volcano') {
      var v = ctx.createRadialGradient(480, 300, 180, 480, 300, 560);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 960, 600);
    }
  }

  Game.registerScene('battle', Battle);
  G.Battle = Battle;
})(window.G = window.G || {});
