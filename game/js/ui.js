/* ============================================================
   UI - title, creator, menus, world map, character, familiars,
   satchel, shop, settings, level-up allocation.
   ============================================================ */
(function (G) {
  'use strict';
  var Game = G.Game, S = G.Sprites, D = G.Data;
  function el(t, c, h) { return Game.el(t, c, h); }
  function closeX(panel) {
    var x = el('button', 'closeX', '&times;');
    x.addEventListener('click', function () { Game.closeOverlay(); });
    panel.appendChild(x); return x;
  }

  // ---------------- scenic backdrop scene ----------------
  var t0 = performance.now();
  var TitleScene = {
    enter: function () { Game.showHUD(false); Game.showToolbar(false); G.Audio.playMusic('town'); },
    render: function (ctx) {
      var t = (performance.now() - t0) / 1000;
      var g = ctx.createLinearGradient(0, 0, 0, 600);
      g.addColorStop(0, '#a9d6ee'); g.addColorStop(0.6, '#cfeacf'); g.addColorStop(1, '#bfe0a0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
      // sun
      ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.arc(770, 120, 56, 0, Math.PI * 2); ctx.fill();
      // hills
      var hills = [['#86c25a', 480, 70], ['#74b04a', 430, 30], ['#62a03c', 380, 0]];
      hills.forEach(function (h, i) {
        ctx.fillStyle = h[0]; ctx.beginPath(); ctx.moveTo(0, 600);
        for (var x = 0; x <= 960; x += 20) { ctx.lineTo(x, h[1] + Math.sin(x / 180 + i + t * 0.1) * (24 + i * 10)); }
        ctx.lineTo(960, 600); ctx.closePath(); ctx.fill();
      });
      // a few trees
      [120, 250, 840, 700].forEach(function (x, i) {
        var y = 430 + (i % 2) * 30;
        S.path(ctx, function () { S.rr(ctx, x - 5, y - 28, 10, 30, 3); }, '#7a4a24', S.OUT, 2);
        S.path(ctx, function () { S.circle(ctx, x, y - 44, 26); }, '#5a9a3a', S.OUT, 2.5);
      });
      // idle hero + familiar if a save/state exists
      if (Game.state) {
        S.drawCreature(ctx, 430, 500, 26, { kind: Game.famDef().kind, pal: Game.famDef().pal }, t);
        S.drawHero(ctx, 480, 500, 26, Game.state.appearance, 'down', Math.sin(t * 2) > 0 ? 1 : 0, Game.state.equipment);
      }
    }
  };
  Game.registerScene('titleScene', TitleScene);

  function drawCrestInto(node, px) {
    px = px || 120; var c = document.createElement('canvas'); c.width = px; c.height = px;
    var ctx = c.getContext('2d'); var s = px / 120;
    ctx.save(); ctx.translate(px / 2, px / 2); ctx.scale(s, s);
    // shield
    S.path(ctx, function () { ctx.moveTo(-44, -46); ctx.lineTo(44, -46); ctx.lineTo(44, 6); ctx.quadraticCurveTo(44, 44, 0, 56); ctx.quadraticCurveTo(-44, 44, -44, 6); ctx.closePath(); }, '#c1463a', '#4a0f0f', 5);
    S.path(ctx, function () { ctx.moveTo(-34, -36); ctx.lineTo(34, -36); ctx.lineTo(34, 4); ctx.quadraticCurveTo(34, 34, 0, 44); ctx.quadraticCurveTo(-34, 34, -34, 4); ctx.closePath(); }, '#e8b84b', null);
    // flask
    S.path(ctx, function () { ctx.moveTo(-8, -26); ctx.lineTo(8, -26); ctx.lineTo(8, -8); ctx.lineTo(20, 22); ctx.quadraticCurveTo(22, 34, 6, 34); ctx.lineTo(-6, 34); ctx.quadraticCurveTo(-22, 34, -20, 22); ctx.lineTo(-8, -8); ctx.closePath(); }, '#bfe6f0', '#2a1c10', 3);
    S.path(ctx, function () { ctx.moveTo(-12, 10); ctx.lineTo(14, 10); ctx.lineTo(18, 22); ctx.quadraticCurveTo(20, 30, 6, 30); ctx.lineTo(-6, 30); ctx.quadraticCurveTo(-18, 30, -16, 22); ctx.closePath(); }, '#7c5fd6', null);
    S.path(ctx, function () { S.circle(ctx, -2, 22, 3); }, '#fff', null);
    ctx.restore();
    node.appendChild(c);
  }

  // ---------------- TITLE ----------------
  function showTitle() {
    Game.setScene('titleScene');
    var panel = el('div', 'panel narrow center'); panel.id = 'titleWrap';
    var crest = el('div', 'title-crest'); drawCrestInto(crest, 120); panel.appendChild(crest);
    panel.appendChild(el('div', 'game-title', 'CRUCIBLE'));
    panel.appendChild(el('div', 'game-sub', 'A Chymical Quest'));
    panel.appendChild(el('div', '', '<div class="scroll-divider"></div>'));
    var row = el('div');
    var bNew = el('button', 'btn gold wide', Game.hasSave() ? 'New Game' : 'Begin Your Quest');
    bNew.addEventListener('click', function () {
      if (Game.hasSave()) {
        if (!confirm('Starting a new game will overwrite your saved quest. Continue?')) return;
      }
      openCreator();
    });
    row.appendChild(bNew);
    if (Game.hasSave()) {
      var bCont = el('button', 'btn wide', 'Continue');
      bCont.addEventListener('click', function () {
        Game.load(); Game.applyAudioConfig();
        Game.state.hp = Game.clamp(Game.state.hp || Game.maxHP(), 1, Game.maxHP());
        Game.closeOverlay();
        Game.fade(function () { Game.setScene('world', { zone: Game.state.pos.zone || 'town' }); });
      });
      row.appendChild(bCont);
    }
    var bSet = el('button', 'btn alt wide', 'Settings');
    bSet.addEventListener('click', function () { openSettings(true); });
    row.appendChild(bSet);
    panel.appendChild(row);
    panel.appendChild(el('p', 'muted', 'Move with WASD / arrows or tap-and-hold. Walk into foes to battle; answer Chymistry to strike. ' + G.Chem.count + ' questions await.'));
    Game.openOverlay(panel);
  }

  // ---------------- CHARACTER CREATOR ----------------
  function openCreator() {
    var draft = { name: '', skin: '#f0c39a', hair: 'short', hairColor: '#5a3a1a', tunic: '#4f7a32', starter: 'emberkit' };
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>Forge Your Adept</h2>';
    var grid = el('div', 'create-grid');
    var left = el('div');
    var prev = el('div', 'preview-box'); var pc = document.createElement('canvas'); pc.width = 200; pc.height = 200; prev.appendChild(pc); left.appendChild(prev);
    var pctx = pc.getContext('2d');
    function redraw() { pctx.clearRect(0, 0, 200, 200); S.drawHero(pctx, 100, 96, 50, { skin: draft.skin, hair: draft.hair, hairColor: draft.hairColor, tunic: draft.tunic }, 'down', 0, {}); }
    redraw();

    var right = el('div');
    // name
    var nameField = el('div', 'field'); nameField.innerHTML = '<label>Name</label>';
    var nameIn = el('input'); nameIn.type = 'text'; nameIn.maxLength = 14; nameIn.placeholder = 'Adept name...';
    nameIn.addEventListener('input', function () { draft.name = nameIn.value; });
    nameField.appendChild(nameIn); right.appendChild(nameField);

    function swatchRow(label, colors, key) {
      var f = el('div', 'field'); f.innerHTML = '<label>' + label + '</label>';
      var sw = el('div', 'swatches');
      colors.forEach(function (col) {
        var s2 = el('div', 'swatch' + (draft[key] === col ? ' sel' : '')); s2.style.background = col;
        s2.addEventListener('click', function () { draft[key] = col; G.Audio.sfx('select'); Array.prototype.forEach.call(sw.children, function (c) { c.classList.remove('sel'); }); s2.classList.add('sel'); redraw(); });
        sw.appendChild(s2);
      });
      f.appendChild(sw); right.appendChild(f);
    }
    swatchRow('Skin', ['#f6d6b8', '#f0c39a', '#d49b6a', '#a86a3f', '#7a4a28', '#5a3418'], 'skin');
    swatchRow('Hair', ['#1a1a1a', '#5a3a1a', '#9b6b2a', '#caa030', '#c14a2a', '#8a8a8a', '#e8e2d0', '#5f7ad0'], 'hairColor');
    swatchRow('Tunic', ['#4f7a32', '#a32a2a', '#3a6a9a', '#7c5fd6', '#caa030', '#2a2a3a', '#d4622a'], 'tunic');

    // hair style
    var styleF = el('div', 'field'); styleF.innerHTML = '<label>Hair Style</label>';
    var styleRow = el('div', 'opt-row');
    [['short', 'Short'], ['spiky', 'Spiky'], ['long', 'Long'], ['bald', 'Bald']].forEach(function (o) {
      var b = el('button', 'optbtn' + (draft.hair === o[0] ? ' sel' : ''), o[1]);
      b.addEventListener('click', function () { draft.hair = o[0]; G.Audio.sfx('select'); Array.prototype.forEach.call(styleRow.children, function (c) { c.classList.remove('sel'); }); b.classList.add('sel'); redraw(); });
      styleRow.appendChild(b);
    });
    styleF.appendChild(styleRow); right.appendChild(styleF);

    // starter familiar
    var famF = el('div', 'field'); famF.innerHTML = '<label>Choose your first Familiar</label>';
    var famRow = el('div', 'rowlist');
    ['emberkit', 'mosskit', 'frostkit'].forEach(function (fid) {
      var def = D.FAMILIARS[fid];
      var card = el('div', 'rowcard'); card.style.cursor = 'pointer';
      var ic = el('div', 'ic'); ic.appendChild(S.creatureIcon(def, 46)); card.appendChild(ic);
      var body = el('div', 'body');
      body.innerHTML = '<div class="rname">' + def.name + ' <span class="tag ' + D.ELEMENTS[def.element].css + '">' + D.ELEMENTS[def.element].name + '</span></div><div class="rdesc">' + def.blurb + '</div>';
      card.appendChild(body);
      function sel() { draft.starter = fid; G.Audio.sfx('select'); Array.prototype.forEach.call(famRow.children, function (c) { c.style.outline = ''; }); card.style.outline = '3px solid var(--gold)'; }
      card.addEventListener('click', sel);
      famRow.appendChild(card);
      if (draft.starter === fid) setTimeout(sel, 0);
    });
    famF.appendChild(famRow); right.appendChild(famF);

    grid.appendChild(left); grid.appendChild(right); panel.appendChild(grid);
    var br = el('div', 'btn-row');
    var back = el('button', 'btn alt', 'Back'); back.addEventListener('click', showTitle);
    var go = el('button', 'btn gold', 'Begin Quest');
    go.addEventListener('click', function () {
      var name = (draft.name || '').trim() || 'Adept';
      Game.newGame(name, { skin: draft.skin, hair: draft.hair, hairColor: draft.hairColor, tunic: draft.tunic }, draft.starter);
      Game.applyAudioConfig();
      Game.closeOverlay();
      G.Audio.sfx('levelup');
      Game.fade(function () {
        Game.setScene('world', { zone: 'town' });
        Game.dialogue([
          'Welcome to Aldermoor, ' + name + '. I am Master Quill, keeper of the Crucible.',
          'The Archmagister Mortcrucible has poisoned the realm\'s learning. Only by mastering Chymistry can you undo it.',
          'Wander out through the gate to the south. Walk into foes to battle - answer their riddles of Chymistry to strike them down!',
          'Spend gold at the Apothecary, swap Familiars at the Roost, and rest at the fountain. Now go - the realm needs you!'
        ], 'Master Quill');
      });
    });
    br.appendChild(back); br.appendChild(go); panel.appendChild(br);
    Game.openOverlay(panel);
  }

  // ---------------- PAUSE MENU ----------------
  function openMenu() {
    if (Game.overlayOpen()) { Game.closeOverlay(); return; }
    var panel = el('div', 'panel narrow center'); panel.innerHTML = '<h2>Menu</h2>';
    closeX(panel);
    [['Resume', function () { Game.closeOverlay(); }, 'gold'],
     ['Character', openCharacter, ''],
     ['Familiars', openFamiliars, ''],
     ['Satchel', openBag, ''],
     ['World Map', openWorldMap, ''],
     ['Settings', function () { openSettings(false); }, 'alt'],
     ['Save & Quit to Title', function () { Game.save(); Game.closeOverlay(); showTitle(); }, 'danger']
    ].forEach(function (o) {
      var b = el('button', 'btn wide ' + (o[2] || ''), o[0]);
      b.addEventListener('click', function () { G.Audio.sfx('select'); o[1](); });
      panel.appendChild(b);
    });
    Game.openOverlay(panel);
  }

  // ---------------- CHARACTER SHEET ----------------
  function openCharacter() {
    var p = Game.state, st = Game.stats();
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>' + p.name + '</h2>'; closeX(panel);
    var grid = el('div', 'create-grid');
    var left = el('div');
    var prev = el('div', 'preview-box'); var pc = document.createElement('canvas'); pc.width = 200; pc.height = 200; prev.appendChild(pc); left.appendChild(prev);
    S.drawHero(pc.getContext('2d'), 100, 96, 50, p.appearance, 'down', 0, p.equipment);
    var need = Game.expToNext(p.level);
    left.appendChild(el('p', 'center', '<b style="font-family:var(--font-head);font-size:18px">Level ' + p.level + '</b><br>XP ' + p.exp + ' / ' + need + '<br>Gold ' + p.gold));
    if (p.statPoints) left.appendChild(el('p', 'center', '<span class="tag" style="background:var(--gold-deep)">' + p.statPoints + ' stat points to spend</span>'));

    var right = el('div');
    right.appendChild(el('h3', '', 'Attributes'));
    var statInfo = [
      ['vigor', 'Vigor', 'Max vigor (HP)'],
      ['might', 'Might', 'Raw striking power'],
      ['lore', 'Lore', 'Spell power of moves'],
      ['fortune', 'Fortune', 'Crit chance, gold & drops']
    ];
    statInfo.forEach(function (s) {
      var row = el('div', 'statrow');
      row.innerHTML = '<span class="sname">' + s[1] + '</span><span class="sval">' + st[s[0]] + '</span><span class="sdesc">' + s[2] + '</span>';
      if (p.statPoints > 0) {
        var plus = el('button', 'plusbtn', '+');
        plus.addEventListener('click', function () { if (Game.allocate(s[0])) { G.Audio.sfx('select'); openCharacter(); } });
        row.appendChild(plus);
      }
      right.appendChild(row);
    });
    right.appendChild(el('div', '', '<div class="scroll-divider"></div>'));
    right.appendChild(el('p', 'muted',
      'Max Vigor: <b>' + Game.maxHP() + '</b><br>' +
      'Spell Power: <b>' + Game.spellPower() + '</b><br>' +
      'Crit Chance: <b>' + Math.round(Game.critChance() * 100) + '%</b><br>' +
      'Damage Reduction: <b>' + Math.round(Game.defense() * 100) + '%</b>'));

    right.appendChild(el('h3', '', 'Equipment'));
    var slots = el('div', 'rowlist');
    ['weapon', 'helm', 'armor', 'trinket'].forEach(function (slot) {
      var id = p.equipment[slot]; var it = id ? D.ITEMS[id] : null;
      var card = el('div', 'rowcard');
      var ic = el('div', 'ic'); if (it) ic.appendChild(S.itemIcon(it, 46)); card.appendChild(ic);
      var body = el('div', 'body');
      body.innerHTML = '<div class="rname">' + cap(slot) + ': ' + (it ? it.name : '<span class="muted">empty</span>') + '</div><div class="rdesc">' + (it ? statStr(it.stats) : 'Equip gear from your Satchel.') + '</div>';
      card.appendChild(body);
      if (it) { var un = el('button', 'btn sm alt', 'Remove'); un.addEventListener('click', function () { Game.unequip(slot); G.Audio.sfx('select'); openCharacter(); }); card.appendChild(un); }
      slots.appendChild(card);
    });
    right.appendChild(slots);

    grid.appendChild(left); grid.appendChild(right); panel.appendChild(grid);
    Game.openOverlay(panel);
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function statStr(stats) { return Object.keys(stats).map(function (k) { return '+' + stats[k] + ' ' + cap(k); }).join(', '); }

  // ---------------- LEVEL UP ----------------
  function openLevelUp(onDone) {
    var p = Game.state;
    function build() {
      var st = Game.stats();
      var panel = el('div', 'panel narrow center');
      panel.innerHTML = '<h2>Level Up!</h2><p>You reached <b style="font-family:var(--font-head)">Level ' + p.level + '</b>. Spend your points wisely.</p><p class="center"><span class="tag" style="background:var(--gold-deep)">' + p.statPoints + ' points left</span></p>';
      [['vigor', 'Vigor', 'More max vigor'], ['might', 'Might', 'More striking power'], ['lore', 'Lore', 'Stronger spells'], ['fortune', 'Fortune', 'Luck, crits, gold']].forEach(function (s) {
        var row = el('div', 'statrow');
        row.innerHTML = '<span class="sname">' + s[1] + '</span><span class="sval">' + st[s[0]] + '</span><span class="sdesc">' + s[2] + '</span>';
        var plus = el('button', 'plusbtn', '+'); if (p.statPoints <= 0) plus.setAttribute('disabled', '');
        plus.addEventListener('click', function () { if (Game.allocate(s[0])) { G.Audio.sfx('select'); Game.closeOverlay(); build(); } });
        row.appendChild(plus); panel.appendChild(row);
      });
      var go = el('button', 'btn gold wide', p.statPoints > 0 ? 'Save points for later' : 'Continue');
      go.addEventListener('click', function () { Game.closeOverlay(); Game.save(); if (onDone) onDone(); });
      panel.appendChild(go);
      Game.openOverlay(panel);
    }
    build();
  }

  // ---------------- FAMILIARS ----------------
  function openFamiliars() {
    var p = Game.state;
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>Familiar Roost</h2>'; closeX(panel);
    panel.appendChild(el('p', 'muted center', 'Your companions in battle. Set one as active - it fights at your side and powers your moves.'));
    var list = el('div', 'rowlist');
    p.familiars.forEach(function (inst, i) {
      var def = D.FAMILIARS[inst.id];
      var card = el('div', 'rowcard');
      var ic = el('div', 'ic'); ic.appendChild(S.creatureIcon(def, 46)); card.appendChild(ic);
      var moves = def.moves.filter(function (m) { return m.lvl <= inst.level; }).map(function (m) { return m.name; }).join(', ');
      var nextM = def.moves.find(function (m) { return m.lvl > inst.level; });
      var body = el('div', 'body');
      body.innerHTML = '<div class="rname">' + def.name + ' <span class="tag ' + D.ELEMENTS[def.element].css + '">' + D.ELEMENTS[def.element].name + '</span> <span class="muted" style="font-size:12px">Lv ' + inst.level + '</span></div>' +
        '<div class="rdesc">Moves: ' + moves + (nextM ? '<br><span class="muted">Next: ' + nextM.name + ' at Lv ' + nextM.lvl + '</span>' : '') + '</div>';
      card.appendChild(body);
      if (i === p.activeFamiliar) { card.appendChild(el('span', 'tag', 'Active')); card.lastChild.style.background = 'var(--leaf-dark)'; }
      else { var b = el('button', 'btn sm', 'Set Active'); b.addEventListener('click', function () { p.activeFamiliar = i; Game.save(); Game.updateHUD(); G.Audio.sfx('select'); openFamiliars(); }); card.appendChild(b); }
      list.appendChild(card);
    });
    panel.appendChild(list);
    var locked = Object.keys(D.FAMILIARS).filter(function (id) { return !Game.ownsFamiliar(id) && !D.FAMILIARS[id].starter; });
    if (locked.length) {
      panel.appendChild(el('h3', '', 'Yet to be tamed'));
      panel.appendChild(el('p', 'muted', 'Defeat zone bosses to recruit ' + locked.length + ' more Familiar' + (locked.length > 1 ? 's' : '') + '.'));
    }
    Game.openOverlay(panel);
  }

  // ---------------- SATCHEL ----------------
  function openBag() {
    var p = Game.state;
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>Satchel</h2>'; closeX(panel);
    // potions
    panel.appendChild(el('h3', '', 'Provisions'));
    var prow = el('div', 'rowlist');
    ['draught', 'elixir'].forEach(function (k) {
      var def = D.POTIONS[k];
      var card = el('div', 'rowcard');
      var ic = el('div', 'ic'); ic.appendChild(S.itemIcon({ icon: 'potion', color: def.color }, 46)); card.appendChild(ic);
      card.appendChild(el('div', 'body', '<div class="rname">' + def.name + ' x' + p.potions[k] + '</div><div class="rdesc">' + def.blurb + '</div>'));
      var b = el('button', 'btn sm', 'Drink'); if (!p.potions[k]) b.setAttribute('disabled', '');
      b.addEventListener('click', function () { if (!p.potions[k]) return; p.potions[k]--; Game.heal(def.heal * Game.maxHP()); G.Audio.sfx('heal'); Game.toast('Restored vigor.'); Game.save(); openBag(); });
      card.appendChild(b); prow.appendChild(card);
    });
    panel.appendChild(prow);
    // gear
    panel.appendChild(el('h3', '', 'Gear'));
    if (!p.inventory.length) panel.appendChild(el('p', 'muted', 'No spare gear. Defeat foes or visit the Apothecary.'));
    else {
      var list = el('div', 'rowlist');
      p.inventory.slice().forEach(function (id) {
        var it = D.ITEMS[id]; if (!it) return;
        var card = el('div', 'rowcard');
        var ic = el('div', 'ic'); ic.appendChild(S.itemIcon(it, 46)); card.appendChild(ic);
        card.appendChild(el('div', 'body', '<div class="rname">' + it.name + ' <span class="tag" style="background:var(--oak)">' + cap(it.slot) + '</span></div><div class="rdesc">' + statStr(it.stats) + '. ' + it.blurb + '</div>'));
        var b = el('button', 'btn sm', 'Equip'); b.addEventListener('click', function () { Game.equip(id); G.Audio.sfx('select'); Game.toast('Equipped ' + it.name); openBag(); }); card.appendChild(b);
        list.appendChild(card);
      });
      panel.appendChild(list);
    }
    Game.openOverlay(panel);
  }

  // ---------------- SHOP ----------------
  function openShop() {
    var p = Game.state;
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>The Apothecary</h2>'; closeX(panel);
    panel.appendChild(el('p', 'muted center', '"Reagents, relics and a fine elixir or two. What\'ll it be?" <span style="font-family:var(--font-head)">Gold: ' + p.gold + '</span>'));
    var tabs = el('div', 'btn-row');
    var buyB = el('button', 'btn sm gold', 'Buy'); var sellB = el('button', 'btn sm alt', 'Sell');
    tabs.appendChild(buyB); tabs.appendChild(sellB); panel.appendChild(tabs);
    var listWrap = el('div'); panel.appendChild(listWrap);

    function renderBuy() {
      listWrap.innerHTML = '<h3>Provisions</h3>';
      var pr = el('div', 'rowlist');
      ['draught', 'elixir'].forEach(function (k) {
        var def = D.POTIONS[k];
        var card = el('div', 'rowcard');
        var ic = el('div', 'ic'); ic.appendChild(S.itemIcon({ icon: 'potion', color: def.color }, 46)); card.appendChild(ic);
        card.appendChild(el('div', 'body', '<div class="rname">' + def.name + '</div><div class="rdesc">' + def.blurb + '</div>'));
        card.appendChild(el('div', 'price', def.price + 'g'));
        var b = el('button', 'btn sm', 'Buy'); b.addEventListener('click', function () { if (Game.spendGold(def.price)) { p.potions[k]++; G.Audio.sfx('coin'); Game.save(); openShop(); } else Game.toast('Not enough gold.'); });
        card.appendChild(b); pr.appendChild(card);
      });
      listWrap.appendChild(pr);
      listWrap.appendChild(el('h3', '', 'Gear'));
      var gl = el('div', 'rowlist');
      D.SHOP_GEAR.forEach(function (id) {
        var it = D.ITEMS[id];
        var card = el('div', 'rowcard');
        var ic = el('div', 'ic'); ic.appendChild(S.itemIcon(it, 46)); card.appendChild(ic);
        card.appendChild(el('div', 'body', '<div class="rname">' + it.name + ' <span class="tag" style="background:var(--oak)">' + cap(it.slot) + '</span></div><div class="rdesc">' + statStr(it.stats) + '. ' + it.blurb + '</div>'));
        card.appendChild(el('div', 'price', it.price + 'g'));
        var b = el('button', 'btn sm', 'Buy'); b.addEventListener('click', function () { if (Game.spendGold(it.price)) { Game.addItem(id); G.Audio.sfx('coin'); Game.toast('Bought ' + it.name); Game.save(); openShop(); } else Game.toast('Not enough gold.'); });
        card.appendChild(b); gl.appendChild(card);
      });
      listWrap.appendChild(gl);
    }
    function renderSell() {
      listWrap.innerHTML = '<h3>Sell Gear (half value)</h3>';
      if (!p.inventory.length) { listWrap.appendChild(el('p', 'muted', 'Nothing to sell.')); return; }
      var gl = el('div', 'rowlist');
      p.inventory.slice().forEach(function (id, idx) {
        var it = D.ITEMS[id]; if (!it) return; var val = Math.round(it.price * 0.5);
        var card = el('div', 'rowcard');
        var ic = el('div', 'ic'); ic.appendChild(S.itemIcon(it, 46)); card.appendChild(ic);
        card.appendChild(el('div', 'body', '<div class="rname">' + it.name + '</div><div class="rdesc">' + statStr(it.stats) + '</div>'));
        card.appendChild(el('div', 'price', val + 'g'));
        var b = el('button', 'btn sm alt', 'Sell'); b.addEventListener('click', function () { var i = p.inventory.indexOf(id); if (i >= 0) p.inventory.splice(i, 1); Game.addGold(val); G.Audio.sfx('coin'); Game.save(); openShop(); });
        card.appendChild(b); gl.appendChild(card);
      });
      listWrap.appendChild(gl);
    }
    buyB.addEventListener('click', function () { buyB.className = 'btn sm gold'; sellB.className = 'btn sm alt'; renderBuy(); });
    sellB.addEventListener('click', function () { sellB.className = 'btn sm gold'; buyB.className = 'btn sm alt'; renderSell(); });
    renderBuy();
    Game.openOverlay(panel);
  }

  // ---------------- WORLD MAP ----------------
  function openWorldMap() {
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>Realm of Chymistry</h2>'; closeX(panel);
    panel.appendChild(el('p', 'muted center', 'Choose your destination. Sealed lands open as you defeat their guardians.'));
    var mapW = 680, mapH = 380;
    var wrap = el('div'); wrap.id = 'mapCanvasWrap'; wrap.style.cssText = 'position:relative;width:' + mapW + 'px;max-width:100%;height:' + mapH + 'px;margin:0 auto;border-radius:14px;overflow:hidden;border:4px solid var(--oak-dark);';
    var mc = document.createElement('canvas'); mc.width = mapW; mc.height = mapH; mc.style.width = '100%'; mc.style.display = 'block';
    wrap.appendChild(mc);
    // draw parchment map
    var ctx = mc.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, mapH); g.addColorStop(0, '#ecd9a8'); g.addColorStop(1, '#dcc187');
    ctx.fillStyle = g; ctx.fillRect(0, 0, mapW, mapH);
    // paths between zones
    ctx.strokeStyle = 'rgba(120,84,32,.55)'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
    var zones = D.ZONES;
    ctx.beginPath();
    // town node
    var townX = 0.16 * mapW, townY = 0.86 * mapH;
    ctx.moveTo(townX, townY);
    zones.forEach(function (z) { ctx.lineTo(z.mapX * mapW, z.mapY * mapH); });
    ctx.stroke(); ctx.setLineDash([]);
    // decorative blobs
    ctx.fillStyle = 'rgba(90,140,60,.25)';
    [[120, 120, 60], [520, 90, 70], [300, 250, 80], [580, 280, 55]].forEach(function (b) { ctx.beginPath(); ctx.ellipse(b[0], b[1], b[2], b[2] * 0.6, 0, 0, Math.PI * 2); ctx.fill(); });

    wrap.appendChild(makeNode('Aldermoor (Town)', townX / mapW, townY / mapH, '#caa867', false, false, function () { Game.closeOverlay(); if (Game.state.pos.zone !== 'town') Game.fade(function () { Game.setScene('world', { zone: 'town' }); }); }, mapW, mapH));

    zones.forEach(function (z) {
      var unlocked = !z.requires || Game.state.flags.bosses[z.requires];
      var cleared = Game.state.flags.zonesCleared[z.id];
      var col = { grass: '#7cba4a', forest: '#4d8c3b', dungeon: '#6a6678', volcano: '#d4622a', snow: '#a9dcf2', swamp: '#5a7a2a', spire: '#7c5fd6' }[z.theme] || '#7cba4a';
      wrap.appendChild(makeNode(z.name + (cleared ? ' (cleared)' : '') + '\nLv ' + z.recLevel + '+', z.mapX, z.mapY, col, !unlocked, cleared, function () {
        if (!unlocked) { Game.toast('Defeat the guardian of ' + D.zoneById(z.requires === 'kingslime' ? 'greenmoor' : zoneByBoss(z.requires)).name + ' first.'); return; }
        Game.closeOverlay();
        Game.fade(function () { Game.setScene('world', { zone: z.id }); });
      }, mapW, mapH));
    });

    panel.appendChild(wrap);
    Game.openOverlay(panel);
  }
  function zoneByBoss(bossId) { var z = D.ZONES.find(function (z) { return z.boss === bossId; }); return z ? z.id : 'greenmoor'; }
  function makeNode(label, fx, fy, color, locked, cleared, onClick, mapW, mapH) {
    var node = el('div', 'map-node' + (locked ? ' locked' : '') + (cleared ? ' cleared' : ''));
    node.style.left = (fx * 100) + '%'; node.style.top = (fy * 100) + '%';
    var pin = el('div', 'map-pin'); pin.style.background = color;
    pin.innerHTML = '<i>' + (locked ? '&#128274;' : (cleared ? '&#10003;' : '&#9733;')) + '</i>';
    node.appendChild(pin);
    var lab = el('div', 'map-label'); lab.textContent = label.split('\n')[0]; node.appendChild(lab);
    if (label.split('\n')[1]) { var l2 = el('div', 'map-label'); l2.style.fontSize = '11px'; l2.textContent = label.split('\n')[1]; node.appendChild(l2); }
    node.addEventListener('click', function () { G.Audio.sfx('select'); onClick(); });
    return node;
  }

  // ---------------- SETTINGS ----------------
  function openSettings(fromTitle) {
    var c = Game.config;
    var panel = el('div', 'panel'); panel.innerHTML = '<h2>Settings</h2>';
    closeX(panel).addEventListener('click', function () { if (fromTitle) showTitle(); });

    // study units
    panel.appendChild(el('h3', '', 'Study Units'));
    panel.appendChild(el('p', 'muted', 'Toggle which Chymistry topics appear in battle. At least one must stay active.'));
    var ulist = el('div', 'rowlist');
    G.Chem.UNITS.forEach(function (u) {
      var on = c.units.indexOf(u.id) >= 0;
      var card = el('div', 'rowcard');
      card.appendChild(el('div', 'body', '<div class="rname">' + u.name + '</div><div class="rdesc">' + u.blurb + '</div>'));
      var b = el('button', 'btn sm ' + (on ? 'gold' : 'alt'), on ? 'On' : 'Off');
      b.addEventListener('click', function () {
        var idx = c.units.indexOf(u.id);
        if (idx >= 0) { if (c.units.length <= 1) { Game.toast('Keep at least one unit active.'); return; } c.units.splice(idx, 1); }
        else c.units.push(u.id);
        Game.save(); G.Audio.sfx('select'); openSettings(fromTitle);
      });
      card.appendChild(b); ulist.appendChild(card);
    });
    panel.appendChild(ulist);

    // question mode
    panel.appendChild(el('h3', '', 'Question Format'));
    var modeRow = el('div', 'opt-row');
    [['mixed', 'Mixed (default)'], ['mc', 'Multiple Choice only'], ['written', 'Written only']].forEach(function (o) {
      var b = el('button', 'optbtn' + (c.mode === o[0] ? ' sel' : ''), o[1]);
      b.addEventListener('click', function () { c.mode = o[0]; Game.save(); G.Audio.sfx('select'); openSettings(fromTitle); });
      modeRow.appendChild(b);
    });
    panel.appendChild(modeRow);

    // difficulty
    panel.appendChild(el('h3', '', 'Difficulty'));
    var diffRow = el('div', 'opt-row');
    [['normal', 'Adept (Normal)'], ['hard', 'Master (Hard)']].forEach(function (o) {
      var b = el('button', 'optbtn' + (c.difficulty === o[0] ? ' sel' : ''), o[1]);
      b.addEventListener('click', function () { c.difficulty = o[0]; Game.save(); G.Audio.sfx('select'); openSettings(fromTitle); });
      diffRow.appendChild(b);
    });
    panel.appendChild(diffRow);
    panel.appendChild(el('p', 'muted', 'Master mode gives foes more vigor and bite, harder questions, and harsher penalties for wrong answers.'));

    // audio
    panel.appendChild(el('h3', '', 'Sound'));
    panel.appendChild(slider('Music', c.musicVol, function (v) { c.musicVol = v; Game.applyAudioConfig(); Game.save(); }));
    panel.appendChild(slider('Effects', c.sfxVol, function (v) { c.sfxVol = v; Game.applyAudioConfig(); Game.save(); }));
    var muteB = el('button', 'btn sm ' + (c.muted ? 'danger' : 'alt'), c.muted ? 'Muted' : 'Sound On');
    muteB.addEventListener('click', function () { c.muted = !c.muted; Game.applyAudioConfig(); Game.save(); openSettings(fromTitle); });
    panel.appendChild(muteB);

    if (!fromTitle) {
      panel.appendChild(el('div', '', '<div class="scroll-divider"></div>'));
      var reset = el('button', 'btn sm danger', 'Erase Save & Restart');
      reset.addEventListener('click', function () { if (confirm('Erase your saved quest forever?')) { Game.wipe(); location.reload(); } });
      panel.appendChild(reset);
    }
    Game.openOverlay(panel);
  }
  function slider(label, val, onChange) {
    var f = el('div', 'field'); f.innerHTML = '<label>' + label + '</label>';
    var inp = el('input'); inp.type = 'range'; inp.min = 0; inp.max = 1; inp.step = 0.05; inp.value = val; inp.style.width = '100%';
    inp.addEventListener('input', function () { onChange(parseFloat(inp.value)); });
    f.appendChild(inp); return f;
  }

  G.UI = {
    showTitle: showTitle, openCreator: openCreator, openMenu: openMenu,
    openWorldMap: openWorldMap, openCharacter: openCharacter, openFamiliars: openFamiliars,
    openBag: openBag, openShop: openShop, openSettings: openSettings, openLevelUp: openLevelUp
  };
})(window.G = window.G || {});
