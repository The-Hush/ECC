/* ============================================================
   Data - elements, Familiars (companions), enemies, zones, gear.
   ============================================================ */
(function (G) {
  'use strict';

  var ELEMENTS = {
    earth:  { name: 'Earth',  color: '#5f8d3a', css: 'el-earth' },
    flame:  { name: 'Flame',  color: '#d4622a', css: 'el-flame' },
    frost:  { name: 'Frost',  color: '#3f9bd6', css: 'el-frost' },
    storm:  { name: 'Storm',  color: '#7c5fd6', css: 'el-storm' },
    toxin:  { name: 'Toxin',  color: '#6fae3a', css: 'el-toxin' },
    arcane: { name: 'Arcane', color: '#b84fb0', css: 'el-arcane' }
  };
  // each element is STRONG against the one it beats
  var BEATS = { earth: 'toxin', toxin: 'frost', frost: 'storm', storm: 'flame', flame: 'arcane', arcane: 'earth' };
  function advantage(att, def) {
    if (BEATS[att] === def) return 1.5;
    if (BEATS[def] === att) return 0.7;
    return 1.0;
  }
  function advWord(att, def) {
    var m = advantage(att, def);
    return m > 1 ? 'strong' : (m < 1 ? 'weak' : 'normal');
  }

  function M(name, el, power, type, lvl, desc) {
    return { name: name, element: el, power: power, type: type, lvl: lvl, desc: desc };
  }

  // ---------------- FAMILIARS ----------------
  var FAMILIARS = {
    emberkit: {
      id: 'emberkit', name: 'Emberkit', element: 'flame', kind: 'critter',
      pal: { a: '#e0673a', b: '#f4a261', c: '#ffd27f' }, starter: true,
      blurb: 'A spry fox-cub wreathed in cinders. Eager and quick to spark.',
      moves: [
        M('Ember Nip', 'flame', 12, 'attack', 1, 'A swift, biting flame.'),
        M('Cinder Toss', 'flame', 17, 'attack', 3, 'Hurls hot embers.'),
        M('Warm Pelt', 'flame', 30, 'heal', 5, 'Curls up to mend wounds.'),
        M('Flare Pounce', 'flame', 26, 'attack', 7, 'A blazing leap.'),
        M('Wildfire', 'flame', 36, 'attack', 9, 'Unleashes a roaring blaze.')
      ]
    },
    mosskit: {
      id: 'mosskit', name: 'Mosskit', element: 'earth', kind: 'critter',
      pal: { a: '#6fae4a', b: '#8fd06e', c: '#cfe89a' }, starter: true,
      blurb: 'A hardy seedling-sprite. Patient, sturdy, and kind.',
      moves: [
        M('Root Jab', 'earth', 12, 'attack', 1, 'A poke from a sharp root.'),
        M('Pebble Volley', 'earth', 17, 'attack', 3, 'Flings a spray of stones.'),
        M('Photosynth', 'earth', 32, 'heal', 5, 'Drinks sunlight to heal.'),
        M('Bramble Bash', 'earth', 26, 'attack', 7, 'Lashes with thorny vines.'),
        M('Quake Stomp', 'earth', 36, 'attack', 9, 'Shakes the very ground.')
      ]
    },
    frostkit: {
      id: 'frostkit', name: 'Frostkit', element: 'frost', kind: 'critter',
      pal: { a: '#6fb7e0', b: '#a9dcf2', c: '#e6f6ff' }, starter: true,
      blurb: 'A snow-furred kit with a frost-gem brow. Calm and clever.',
      moves: [
        M('Frost Nip', 'frost', 12, 'attack', 1, 'A chilling little bite.'),
        M('Icicle Dart', 'frost', 17, 'attack', 3, 'Fires a sharpened icicle.'),
        M('Snow Mend', 'frost', 30, 'heal', 5, 'Packs healing snow on wounds.'),
        M('Cold Snap', 'frost', 26, 'attack', 7, 'A sudden freezing burst.'),
        M('Blizzard', 'frost', 36, 'attack', 9, 'A howling storm of ice.')
      ]
    },
    royalgel: {
      id: 'royalgel', name: 'Gelkin', element: 'earth', kind: 'slime',
      pal: { a: '#7fd0c0', b: '#4fae9a', c: '#d8fff4' },
      blurb: 'A noble heir of the slime court, freed from the Gelatinous King.',
      moves: [
        M('Bounce', 'earth', 14, 'attack', 1, 'A jiggly tackle.'),
        M('Acid Dab', 'toxin', 19, 'attack', 3, 'A dab of corrosive ooze.'),
        M('Gel Shield', 'earth', 0, 'guard', 4, 'Hardens into a protective shell.'),
        M('Engulf', 'earth', 28, 'attack', 7, 'Swallows the foe whole.'),
        M('Royal Slam', 'earth', 38, 'attack', 9, 'A crushing regal blow.')
      ]
    },
    sparkwing: {
      id: 'sparkwing', name: 'Sparkwing', element: 'storm', kind: 'bird',
      pal: { a: '#7c5fd6', b: '#b59cf0', c: '#ffe06a' },
      blurb: 'A crackling thunder-finch found deep in Whisperwood.',
      moves: [
        M('Static Peck', 'storm', 13, 'attack', 1, 'A shocking little peck.'),
        M('Gale Slash', 'storm', 18, 'attack', 3, 'A slicing gust.'),
        M('Updraft', 'storm', 30, 'heal', 5, 'Rides healing winds.'),
        M('Thunderclap', 'storm', 28, 'attack', 7, 'A deafening burst.'),
        M('Tempest', 'storm', 38, 'attack', 9, 'Calls down the storm.')
      ]
    },
    gloamcat: {
      id: 'gloamcat', name: 'Gloamcat', element: 'arcane', kind: 'critter',
      pal: { a: '#7a4fae', b: '#b07fd6', c: '#e0b0ff' },
      blurb: 'A shadow-stepping cat bound to the Skeleton Lord, now loyal to you.',
      moves: [
        M('Hex Scratch', 'arcane', 14, 'attack', 1, 'Claws laced with hexes.'),
        M('Gloom Bolt', 'arcane', 19, 'attack', 3, 'A bolt of dark energy.'),
        M('Phantom Veil', 'arcane', 0, 'guard', 4, 'Fades into shadow to brace.'),
        M('Soul Drain', 'arcane', 26, 'attack', 7, 'Saps the foe and heals a little.'),
        M('Eclipse', 'arcane', 40, 'attack', 9, 'Blots out all light.')
      ]
    },
    pyrax: {
      id: 'pyrax', name: 'Pyrax', element: 'flame', kind: 'dragon',
      pal: { a: '#d4452a', b: '#ff7a3a', c: '#ffd24a' },
      blurb: 'A young wyrm hatched from the Cinder Wyrm\'s last ember.',
      moves: [
        M('Flame Bite', 'flame', 16, 'attack', 1, 'A searing chomp.'),
        M('Ember Breath', 'flame', 22, 'attack', 3, 'A gout of fire.'),
        M('Molten Scale', 'flame', 0, 'guard', 4, 'Scales glow red to deflect blows.'),
        M('Inferno Dive', 'flame', 30, 'attack', 7, 'A blazing aerial dive.'),
        M('Cataclysm', 'flame', 44, 'attack', 9, 'A torrent of dragonfire.')
      ]
    },
    glacior: {
      id: 'glacior', name: 'Glacior', element: 'frost', kind: 'dragon',
      pal: { a: '#3f8fd6', b: '#7fc4f0', c: '#e6f6ff' },
      blurb: 'A glacial drake calved from the heart of the Glacial Titan.',
      moves: [
        M('Frost Fang', 'frost', 16, 'attack', 1, 'A bone-chilling bite.'),
        M('Rime Breath', 'frost', 22, 'attack', 3, 'Breathes a freezing fog.'),
        M('Glacial Hide', 'frost', 0, 'guard', 4, 'Forms an icy carapace.'),
        M('Avalanche', 'frost', 30, 'attack', 7, 'Buries the foe in ice.'),
        M('Absolute Zero', 'frost', 44, 'attack', 9, 'Freezes time itself.')
      ]
    },
    mirebloom: {
      id: 'mirebloom', name: 'Mirebloom', element: 'toxin', kind: 'fungus',
      pal: { a: '#7aae3a', b: '#5a8a2a', c: '#c0e070' },
      blurb: 'A sentient bloom gifted by the Plague Hag in surrender.',
      moves: [
        M('Spore Puff', 'toxin', 15, 'attack', 1, 'A burst of stinging spores.'),
        M('Acid Spray', 'toxin', 21, 'attack', 3, 'Sprays corrosive sap.'),
        M('Sunbloom', 'toxin', 34, 'heal', 5, 'Blooms to restore vigor.'),
        M('Toxic Cloud', 'toxin', 28, 'attack', 7, 'A choking miasma.'),
        M('Bloomburst', 'toxin', 42, 'attack', 9, 'Explodes in toxic petals.')
      ]
    },
    voidling: {
      id: 'voidling', name: 'Voidling', element: 'arcane', kind: 'wisp',
      pal: { a: '#5a3aae', b: '#9a6ad6', c: '#d0a0ff' },
      blurb: 'A fragment of the Archmagister\'s power, tamed at last.',
      moves: [
        M('Void Spark', 'arcane', 18, 'attack', 1, 'A mote of raw aether.'),
        M('Aether Lash', 'arcane', 24, 'attack', 3, 'A whip of pure magic.'),
        M('Null Field', 'arcane', 0, 'guard', 4, 'Warps space to absorb harm.'),
        M('Mind Rend', 'arcane', 32, 'attack', 7, 'Tears at the foe\'s will.'),
        M('Singularity', 'arcane', 48, 'attack', 9, 'Collapses all into the void.')
      ]
    }
  };

  // ---------------- ITEMS ----------------
  function I(id, name, slot, color, stats, price, tier, blurb) {
    return { id: id, name: name, slot: slot, icon: slot, color: color, stats: stats, price: price, tier: tier || 1, blurb: blurb || '' };
  }
  var ITEMS = {
    // weapons (Might)
    woodwand:   I('woodwand', 'Oaken Wand', 'weapon', '#8a5a2c', { might: 2 }, 30, 1, 'A simple apprentice\'s wand.'),
    athame:     I('athame', 'Apprentice Athame', 'weapon', '#9aa7b2', { might: 4 }, 70, 1, 'A keen ritual dagger.'),
    ironsword:  I('ironsword', 'Iron Sword', 'weapon', '#b9c2cc', { might: 6, vigor: 1 }, 140, 2, 'Honest steel.'),
    alchstaff:  I('alchstaff', 'Alchemist\'s Staff', 'weapon', '#7a4fae', { might: 5, lore: 3 }, 200, 2, 'Channels reagent-magic.'),
    runeblade:  I('runeblade', 'Runed Blade', 'weapon', '#3f9bd6', { might: 9, fortune: 2 }, 340, 3, 'Etched with luck-runes.'),
    cruciblescepter: I('cruciblescepter', 'Crucible Scepter', 'weapon', '#e8b84b', { might: 13, lore: 5 }, 600, 4, 'The headmaster\'s own scepter.'),
    // helms (Vigor)
    leathercap: I('leathercap', 'Leather Cap', 'helm', '#9b6b3a', { vigor: 2 }, 25, 1, 'Better than nothing.'),
    ironhelm:   I('ironhelm', 'Iron Helm', 'helm', '#b9c2cc', { vigor: 4 }, 90, 2, 'Dependable headgear.'),
    sagehood:   I('sagehood', 'Sage\'s Hood', 'helm', '#5f8d3a', { vigor: 2, lore: 4 }, 160, 2, 'Worn by hedge-scholars.'),
    knighthelm: I('knighthelm', 'Knight\'s Helm', 'helm', '#cfd6dd', { vigor: 7 }, 280, 3, 'Crested and proud.'),
    mythrilhelm:I('mythrilhelm', 'Mythril Helm', 'helm', '#a9dcf2', { vigor: 10, fortune: 2 }, 480, 4, 'Light as a whisper.'),
    // armor (Vigor / Lore)
    clothrobe:  I('clothrobe', 'Cloth Robe', 'armor', '#c08a4a', { vigor: 2, lore: 2 }, 30, 1, 'Plain but comfortable.'),
    chainmail:  I('chainmail', 'Chain Mail', 'armor', '#9aa7b2', { vigor: 6 }, 130, 2, 'Rings of riveted iron.'),
    alchrobe:   I('alchrobe', 'Alchemist\'s Robe', 'armor', '#7a4fae', { vigor: 3, lore: 6 }, 220, 2, 'Singed at the cuffs.'),
    platearmor: I('platearmor', 'Plate Armor', 'armor', '#cfd6dd', { vigor: 10 }, 380, 3, 'A walking fortress.'),
    dragonscale:I('dragonscale', 'Dragonscale Mail', 'armor', '#d4452a', { vigor: 12, fortune: 3 }, 640, 4, 'Forged from wyrm scales.'),
    // trinkets (Fortune / Lore)
    clover:     I('clover', 'Lucky Clover', 'trinket', '#5f8d3a', { fortune: 3 }, 60, 1, 'Found on a misty morning.'),
    sagering:   I('sagering', 'Sage Ring', 'trinket', '#3f9bd6', { lore: 4 }, 120, 2, 'Hums with old knowledge.'),
    bloodstone: I('bloodstone', 'Bloodstone Amulet', 'trinket', '#a32a2a', { vigor: 5 }, 150, 2, 'Warm to the touch.'),
    phoenix:    I('phoenix', 'Phoenix Charm', 'trinket', '#d4622a', { fortune: 5, lore: 3 }, 320, 3, 'Smolders eternally.'),
    philstone:  I('philstone', 'Philosopher\'s Stone', 'trinket', '#e8b84b', { lore: 6, fortune: 6 }, 700, 4, 'The legendary catalyst.')
  };

  var POTIONS = {
    draught: { id: 'draught', name: 'Healing Draught', color: '#d2433a', heal: 0.5, price: 25, blurb: 'Restores half your vigor.' },
    elixir:  { id: 'elixir', name: 'Greater Elixir', color: '#46a0d8', heal: 1.0, price: 60, blurb: 'Restores all of your vigor.' }
  };

  // ---------------- ENEMIES ----------------
  function E(id, name, el, kind, pal, lvl, hp, atk, exp, gold, drops, blurb, extra) {
    var o = { id: id, name: name, element: el, kind: kind, pal: pal, lvl: lvl, hp: hp, atk: atk, exp: exp, gold: gold, drops: drops || [], blurb: blurb || '' };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  var ENEMIES = {
    // Greenmoor (matter)
    gloop: E('gloop', 'Green Gloop', 'earth', 'slime', { a: '#7ac44a', b: '#5a9a2a', c: '#d8ff9a' }, 1, 28, 5, 9, 5, [{ item: 'leathercap', chance: 0.12 }], 'A wobbling blob of meadow-ooze.'),
    meadowsprite: E('meadowsprite', 'Meadow Sprite', 'arcane', 'imp', { a: '#9ad0e0', b: '#6fae8a', c: '#fff0a0' }, 2, 34, 6, 11, 7, [{ item: 'clothrobe', chance: 0.12 }], 'A mischievous flutter of pollen and light.'),
    thornbeetle: E('thornbeetle', 'Thorn Beetle', 'earth', 'bug', { a: '#6a8a3a', b: '#4a6a2a', c: '#d4622a' }, 3, 42, 7, 13, 8, [{ item: 'woodwand', chance: 0.1 }], 'Its shell bristles with thorns.'),
    kingslime: E('kingslime', 'Gelatinous King', 'earth', 'slime', { a: '#5fd0b0', b: '#3aae8a', c: '#e0fff4' }, 4, 130, 11, 70, 55, [{ item: 'ironsword', chance: 0.5 }], 'The bloated sovereign of the slime court.', { boss: true, crown: true, unlock: 'royalgel' }),

    // Whisperwood (atomic)
    capling: E('capling', 'Capling', 'toxin', 'fungus', { a: '#c08a4a', b: '#8a5a2a', c: '#e0c070' }, 4, 48, 8, 15, 9, [{ item: 'leathercap', chance: 0.12 }], 'A toddling mushroom with a wide brown cap.'),
    pixie: E('pixie', 'Wisp Pixie', 'arcane', 'wisp', { a: '#b07fd6', b: '#ffd27f', c: '#e0b0ff' }, 5, 54, 9, 17, 11, [{ item: 'sagering', chance: 0.08 }], 'A darting will-o-wisp of pale fire.'),
    duskwolf: E('duskwolf', 'Dusk Wolf', 'earth', 'beast', { a: '#6a5a4a', b: '#3a2a1a', c: '#8a7a6a' }, 6, 62, 11, 19, 12, [{ item: 'athame', chance: 0.15 }], 'It hunts between the ancient trees.'),
    eldwarden: E('eldwarden', 'Eldwood Warden', 'earth', 'golem', { a: '#5a7a3a', b: '#3a5a2a', c: '#c0e070' }, 7, 200, 14, 95, 70, [{ item: 'sagehood', chance: 0.5 }], 'An elder tree woken to wrath.', { boss: true, unlock: 'sparkwing' }),

    // Sunless Crypt (periodic)
    bonewalker: E('bonewalker', 'Bone Walker', 'arcane', 'skeleton', { a: '#ece6d6', b: '#bcae90', c: '#9be0ff' }, 7, 70, 13, 21, 13, [{ item: 'ironhelm', chance: 0.14 }], 'A clattering guardian of the tombs.'),
    cryptbat: E('cryptbat', 'Crypt Bat', 'arcane', 'imp', { a: '#5a4a6a', b: '#3a2a4a', c: '#b07fd6' }, 8, 76, 14, 23, 14, [{ item: 'clover', chance: 0.12 }], 'It screeches in the dark.', { faceLeft: true }),
    palewraith: E('palewraith', 'Pale Wraith', 'arcane', 'wisp', { a: '#bcd0e0', b: '#8fa0b0', c: '#e6f6ff' }, 9, 84, 16, 25, 16, [{ item: 'chainmail', chance: 0.12 }], 'A mournful spirit drifting the crypt.'),
    skellord: E('skellord', 'Skeleton Lord', 'arcane', 'skeleton', { a: '#f3eedd', b: '#cabf9a', c: '#9be0ff' }, 9, 280, 18, 130, 100, [{ item: 'knighthelm', chance: 0.5 }], 'The crowned tyrant of the Sunless Crypt.', { boss: true, crown: true, cape: true, unlock: 'gloamcat' }),

    // Emberforge (reactions / stoich)
    cinderimp: E('cinderimp', 'Cinder Imp', 'flame', 'imp', { a: '#d4622a', b: '#8a2a1a', c: '#ffd24a' }, 9, 92, 17, 27, 17, [{ item: 'athame', chance: 0.12 }], 'A gleeful spark-throwing devil.'),
    magmite: E('magmite', 'Magmite', 'flame', 'golem', { a: '#7a3a2a', b: '#4a1a0a', c: '#ff7a3a' }, 10, 110, 19, 30, 19, [{ item: 'chainmail', chance: 0.12 }], 'A lump of living molten rock.'),
    ashwisp: E('ashwisp', 'Ash Wisp', 'flame', 'wisp', { a: '#e07a3a', b: '#aa3a1a', c: '#ffd27f' }, 11, 118, 21, 33, 21, [{ item: 'sagering', chance: 0.1 }], 'A cinder that refuses to die.'),
    cinderwyrm: E('cinderwyrm', 'Cinder Wyrm', 'flame', 'dragon', { a: '#d4452a', b: '#7a1a0a', c: '#ffd24a' }, 12, 380, 23, 180, 150, [{ item: 'runeblade', chance: 0.5 }], 'A wyrm forged in the heart of the forge.', { boss: true, unlock: 'pyrax' }),

    // Frostspire (gases)
    frostsprite: E('frostsprite', 'Frostbite Sprite', 'frost', 'wisp', { a: '#7fc4f0', b: '#3f8fd6', c: '#e6f6ff' }, 12, 128, 22, 35, 22, [{ item: 'ironhelm', chance: 0.12 }], 'A nip of living cold.'),
    rimegolem: E('rimegolem', 'Rime Golem', 'frost', 'golem', { a: '#a9cbe0', b: '#6f9bbf', c: '#e6f6ff' }, 13, 150, 24, 38, 24, [{ item: 'platearmor', chance: 0.1 }], 'Hewn from blue glacier ice.'),
    snowstalker: E('snowstalker', 'Snow Stalker', 'frost', 'beast', { a: '#dfe9f0', b: '#9ab0c0', c: '#6fb7e0' }, 14, 160, 26, 41, 26, [{ item: 'sagehood', chance: 0.12 }], 'A white-furred hunter of the peaks.'),
    glacialtitan: E('glacialtitan', 'Glacial Titan', 'frost', 'golem', { a: '#7fb7e0', b: '#3f6f9f', c: '#e6f6ff' }, 15, 480, 28, 240, 200, [{ item: 'mythrilhelm', chance: 0.5 }], 'A mountain that learned to walk.', { boss: true, unlock: 'glacior' }),

    // Mirefen (solutions / acids)
    bogtoad: E('bogtoad', 'Bog Toad', 'toxin', 'beast', { a: '#6a8a3a', b: '#3a5a1a', c: '#c0e070' }, 15, 168, 27, 43, 27, [{ item: 'chainmail', chance: 0.12 }], 'It belches noxious bubbles.'),
    gasspore: E('gasspore', 'Gas Spore', 'toxin', 'fungus', { a: '#8aae4a', b: '#5a7a2a', c: '#d4e090' }, 16, 178, 29, 46, 29, [{ item: 'phoenix', chance: 0.06 }], 'A bloated sac of acrid vapor.'),
    mirewisp: E('mirewisp', 'Mire Wisp', 'toxin', 'wisp', { a: '#9ac44a', b: '#5a8a2a', c: '#e0ff90' }, 17, 188, 31, 49, 31, [{ item: 'alchrobe', chance: 0.12 }], 'A green glow that lures the lost.'),
    plaguehag: E('plaguehag', 'Plague Hag', 'toxin', 'mage', { a: '#5a7a2a', b: '#3a5a1a', c: '#a0e040' }, 18, 580, 33, 300, 260, [{ item: 'dragonscale', chance: 0.5 }], 'Witch of the festering fen.', { boss: true, unlock: 'mirebloom' }),

    // The Alchemist's Spire (final: bonding / thermo / all)
    homunculus: E('homunculus', 'Homunculus', 'arcane', 'mage', { a: '#9a6ad6', b: '#5a3aae', c: '#d0a0ff' }, 18, 196, 32, 51, 33, [{ item: 'alchstaff', chance: 0.12 }], 'A flask-born servant of the spire.'),
    brasssentinel: E('brasssentinel', 'Brass Sentinel', 'arcane', 'golem', { a: '#c0913a', b: '#8a5a1a', c: '#ffe06a' }, 19, 220, 34, 54, 35, [{ item: 'platearmor', chance: 0.14 }], 'Clockwork guardian of the stairs.'),
    hexbat: E('hexbat', 'Hex Bat', 'arcane', 'imp', { a: '#6a3a8a', b: '#3a1a5a', c: '#d0a0ff' }, 20, 232, 36, 57, 37, [{ item: 'sagering', chance: 0.14 }], 'Wings stitched from spellpaper.', { faceLeft: true }),
    archmagister: E('archmagister', 'Archmagister Mortcrucible', 'arcane', 'mage', { a: '#5a3aae', b: '#2a1a5a', c: '#d0a0ff' }, 22, 820, 40, 500, 500, [{ item: 'cruciblescepter', chance: 1.0 }, { item: 'philstone', chance: 1.0 }], 'The fallen headmaster who poisoned the curriculum. The final trial.', { boss: true, crown: true, unlock: 'voidling', final: true })
  };

  // ---------------- ZONES ----------------
  // topics = chem unit ids this zone draws questions from
  var ZONES = [
    {
      id: 'greenmoor', name: 'Greenmoor Plains', theme: 'grass',
      topics: ['s1_1', 's1_2'], recLevel: 1, mapX: 0.16, mapY: 0.66,
      enemies: ['gloop', 'meadowsprite', 'thornbeetle'], boss: 'kingslime',
      requires: null,
      intro: 'Rolling green hills dotted with wildflowers. Slimes wobble through the grass.'
    },
    {
      id: 'whisperwood', name: 'Whisperwood', theme: 'forest',
      topics: ['s1_3', 's3_1'], recLevel: 4, mapX: 0.34, mapY: 0.42,
      enemies: ['capling', 'pixie', 'duskwolf'], boss: 'eldwarden',
      requires: 'kingslime',
      intro: 'Ancient trees crowd close, their leaves whispering of atoms unseen.'
    },
    {
      id: 'crypt', name: 'Sunless Crypt', theme: 'dungeon',
      topics: ['s2_1', 's2_2'], recLevel: 7, mapX: 0.5, mapY: 0.66,
      enemies: ['bonewalker', 'cryptbat', 'palewraith'], boss: 'skellord',
      requires: 'eldwarden',
      intro: 'A cold dungeon of carved stone. The dead keep an orderly table here.'
    },
    {
      id: 'emberforge', name: 'Emberforge Caverns', theme: 'volcano',
      topics: ['r1_1', 'r1_2', 'r1_3'], recLevel: 9, mapX: 0.66, mapY: 0.42,
      enemies: ['cinderimp', 'magmite', 'ashwisp'], boss: 'cinderwyrm',
      requires: 'skellord',
      intro: 'Rivers of magma light the cavern red. Reactions roar in the heat.'
    },
    {
      id: 'frostspire', name: 'Frostspire Peaks', theme: 'snow',
      topics: ['s1_4', 's1_5'], recLevel: 12, mapX: 0.5, mapY: 0.2,
      enemies: ['frostsprite', 'rimegolem', 'snowstalker'], boss: 'glacialtitan',
      requires: 'cinderwyrm',
      intro: 'Wind howls across frozen peaks where gases freeze in the thin air.'
    },
    {
      id: 'mirefen', name: 'Mirefen Swamp', theme: 'swamp',
      topics: ['r3_1', 'r2_3', 's2_3'], recLevel: 15, mapX: 0.8, mapY: 0.64,
      enemies: ['bogtoad', 'gasspore', 'mirewisp'], boss: 'plaguehag',
      requires: 'glacialtitan',
      intro: 'A reeking bog of strange brews. Every puddle is a fresh solution.'
    },
    {
      id: 'spire', name: "The Alchemist's Spire", theme: 'spire',
      topics: ['r2_1', 'r2_2', 'r3_2', 's2_4'], recLevel: 18, mapX: 0.82, mapY: 0.26,
      enemies: ['homunculus', 'brasssentinel', 'hexbat'], boss: 'archmagister',
      requires: 'plaguehag',
      intro: 'The black tower of Mortcrucible. The final trial of the Crucible awaits at its peak.'
    }
  ];

  function zoneById(id) { return ZONES.find(function (z) { return z.id === id; }); }

  // shop stock (ordered roughly by tier)
  var SHOP_GEAR = ['leathercap', 'clothrobe', 'woodwand', 'clover', 'athame', 'ironhelm',
    'chainmail', 'sagehood', 'sagering', 'bloodstone', 'ironsword', 'alchstaff',
    'alchrobe', 'knighthelm', 'runeblade', 'phoenix', 'platearmor', 'mythrilhelm'];

  G.Data = {
    ELEMENTS: ELEMENTS, BEATS: BEATS, advantage: advantage, advWord: advWord,
    FAMILIARS: FAMILIARS, ITEMS: ITEMS, POTIONS: POTIONS, ENEMIES: ENEMIES,
    ZONES: ZONES, zoneById: zoneById, SHOP_GEAR: SHOP_GEAR
  };
})(window.G = window.G || {});
