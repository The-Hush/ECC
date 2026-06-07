/* ============================================================
   Chem - curriculum units + question banks (mixed written/MC).
   Formulas written ASCII in source ("H2O", "Na^+", "->") and
   rendered with subscripts/superscripts/arrows at display time.
   ============================================================ */
(function (G) {
  'use strict';

  // ---- display formatter (source stays ASCII / unicode-safe) ----
  function chemFormat(s) {
    if (s == null) return '';
    var out = String(s);
    out = out.replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>');
    out = out.replace(/\^(\{[^}]+\}|[0-9]*[+\-]?)/g, function (m, g) {
      return '<sup>' + g.replace(/[{}]/g, '') + '</sup>';
    });
    out = out.replace(/<=>/g, ' &harr; ').replace(/->/g, ' &rarr; ');
    return out;
  }

  // ---- units (only active study topics; no excluded/red-x units) ----
  var UNITS = [
    { id: 'matter', name: 'Matter & Its Changes', blurb: 'States, properties, physical vs chemical change.' },
    { id: 'atomic', name: 'Atomic Structure', blurb: 'Protons, neutrons, electrons, isotopes, ions.' },
    { id: 'periodic', name: 'The Periodic Table', blurb: 'Groups, periods, families and trends.' },
    { id: 'bonding', name: 'Chemical Bonding', blurb: 'Ionic, covalent and metallic bonds.' },
    { id: 'reactions', name: 'Reactions & Equations', blurb: 'Reaction types and balancing.' },
    { id: 'stoich', name: 'The Mole & Stoichiometry', blurb: 'Moles, molar mass, conversions.' },
    { id: 'gases', name: 'States of Matter & Gases', blurb: 'Kinetic theory and the gas laws.' },
    { id: 'solutions', name: 'Solutions & Concentration', blurb: 'Solutes, solvents and molarity.' },
    { id: 'acids', name: 'Acids & Bases', blurb: 'pH, ions and neutralization.' },
    { id: 'thermo', name: 'Thermochemistry', blurb: 'Energy, endo/exothermic, enthalpy.' }
  ];

  function mc(unit, diff, q, choices, correct, explain) {
    return { unit: unit, diff: diff, type: 'mc', q: q, choices: choices, correct: correct, explain: explain };
  }
  function wr(unit, diff, q, accept, explain) {
    return { unit: unit, diff: diff, type: 'written', q: q, accept: accept, explain: explain };
  }

  var BANK = [
    // ---------------- MATTER ----------------
    mc('matter', 1, 'Which of these is a CHEMICAL change?', ['Melting ice', 'Dissolving sugar in tea', 'Iron rusting', 'Boiling water'], 2, 'Rusting forms a new substance (iron oxide). The others are physical changes.'),
    mc('matter', 1, 'Which state of matter has a definite volume but NO definite shape?', ['Solid', 'Liquid', 'Gas', 'Plasma'], 1, 'A liquid keeps its volume but takes the shape of its container.'),
    wr('matter', 1, 'A pure substance made of only one kind of atom is called a(n) ____.', ['element'], 'An element cannot be broken into simpler substances by chemical means.'),
    mc('matter', 1, 'Which is a PHYSICAL property?', ['Flammability', 'Reactivity with acid', 'Density', 'Ability to rust'], 2, 'Density can be measured without changing the substance chemically.'),
    mc('matter', 2, 'A homogeneous mixture is also called a ____.', ['Compound', 'Solution', 'Element', 'Suspension'], 1, 'A solution is uniform throughout (e.g. salt water).'),
    wr('matter', 2, 'The change of state directly from a GAS to a SOLID is called ____.', ['deposition'], 'Deposition is the reverse of sublimation.'),
    mc('matter', 2, 'Which is an EXTENSIVE property (depends on amount)?', ['Temperature', 'Color', 'Mass', 'Density'], 2, 'Mass depends on how much matter is present; the others do not.'),
    wr('matter', 2, 'Separating a liquid mixture using differences in boiling point is called ____.', ['distillation'], 'Distillation boils off and recondenses components separately.'),
    mc('matter', 1, 'Which is NOT a pure substance?', ['Oxygen gas', 'Table salt', 'Air', 'Distilled water'], 2, 'Air is a mixture of gases; the others are pure substances.'),
    mc('matter', 2, 'Sublimation is the change from ____.', ['Solid to gas', 'Liquid to gas', 'Gas to liquid', 'Solid to liquid'], 0, 'Dry ice subliming is the classic example.'),

    // ---------------- ATOMIC ----------------
    mc('atomic', 1, 'Which subatomic particle carries a NEGATIVE charge?', ['Proton', 'Neutron', 'Electron', 'Nucleus'], 2, 'Electrons are negative; protons are positive; neutrons are neutral.'),
    wr('atomic', 1, 'How many protons are in an atom with atomic number 11?', ['11'], 'Atomic number equals the number of protons.'),
    mc('atomic', 1, 'Isotopes of an element differ in their number of ____.', ['Protons', 'Electrons', 'Neutrons', 'Charge'], 2, 'Same protons, different neutrons gives different mass numbers.'),
    wr('atomic', 2, 'Carbon-14 has 6 protons. How many neutrons does it have?', ['8'], 'Neutrons = mass number - protons = 14 - 6 = 8.'),
    mc('atomic', 1, 'The mass number of an atom equals the number of ____.', ['Protons only', 'Neutrons only', 'Protons + neutrons', 'Electrons + protons'], 2, 'Mass number counts the nucleons: protons plus neutrons.'),
    mc('atomic', 1, 'Almost all of an atom\'s MASS is located in the ____.', ['Electron cloud', 'Nucleus', 'Valence shell', 'Orbitals'], 1, 'Protons and neutrons in the nucleus hold nearly all the mass.'),
    wr('atomic', 2, 'An atom with 17 protons and 18 electrons has a charge of ____.', ['-1', '1-'], 'One extra electron gives a 1- charge (a chloride ion).'),
    mc('atomic', 2, 'An ion with a 2+ charge has ____.', ['2 more electrons than protons', '2 fewer electrons than protons', '2 more neutrons', '2 fewer protons'], 1, 'Losing 2 electrons leaves 2 more protons than electrons: a 2+ charge.'),
    mc('atomic', 1, 'What is the maximum number of electrons in the first shell (n=1)?', ['2', '8', '18', '32'], 0, 'The first shell holds at most 2 electrons.'),
    mc('atomic', 3, 'What is the electron configuration of oxygen (Z=8)?', ['1s2 2s2 2p4', '1s2 2s2 2p6', '1s2 2s2 2p2', '1s2 2p6'], 0, 'Oxygen has 8 electrons: 2 + 2 + 4.'),

    // ---------------- PERIODIC ----------------
    mc('periodic', 1, 'Elements in the same GROUP have the same number of ____.', ['Protons', 'Valence electrons', 'Neutrons', 'Shells'], 1, 'Shared valence electron count gives similar chemical behavior.'),
    mc('periodic', 1, 'Which of these is a noble gas?', ['Oxygen', 'Neon', 'Sodium', 'Chlorine'], 1, 'Neon is in Group 18, the noble gases.'),
    wr('periodic', 2, 'The most reactive metals are found in Group number ____.', ['1', 'group 1'], 'Group 1, the alkali metals, are the most reactive metals.'),
    mc('periodic', 2, 'Across a period (left to right), atomic radius generally ____.', ['Increases', 'Decreases', 'Stays the same', 'Doubles'], 1, 'Greater nuclear charge pulls electrons in, shrinking the atom.'),
    mc('periodic', 2, 'Electronegativity is HIGHEST near which element?', ['Francium', 'Fluorine', 'Helium', 'Sodium'], 1, 'Fluorine is the most electronegative element.'),
    wr('periodic', 1, 'What family is Group 17 known as?', ['halogens', 'halogen'], 'The halogens are very reactive nonmetals.'),
    mc('periodic', 2, 'Which atom has the LARGEST atomic radius?', ['Li', 'Na', 'K', 'H'], 2, 'Radius increases down a group, so K is largest here.'),
    mc('periodic', 2, 'Down a group, ionization energy generally ____.', ['Increases', 'Decreases', 'Stays the same', 'Triples'], 1, 'Outer electrons are farther away and easier to remove.'),
    wr('periodic', 1, 'Shiny, conductive, malleable elements are classified as ____.', ['metals', 'metal'], 'These are characteristic properties of metals.'),
    mc('periodic', 1, 'A horizontal row on the periodic table is called a ____.', ['Group', 'Period', 'Family', 'Shell'], 1, 'Rows are periods; columns are groups.'),

    // ---------------- BONDING ----------------
    mc('bonding', 1, 'A bond formed by TRANSFERRING electrons is ____.', ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], 1, 'Ionic bonds transfer electrons from metal to nonmetal.'),
    mc('bonding', 1, 'A bond formed by SHARING electrons is ____.', ['Ionic', 'Covalent', 'Metallic', 'Electrostatic'], 1, 'Covalent bonds share electron pairs between nonmetals.'),
    wr('bonding', 1, 'Write the formula for the compound of Na^+ and Cl^-.', ['nacl'], 'Charges balance 1 to 1, giving NaCl.'),
    mc('bonding', 2, 'Which pair will form an IONIC bond?', ['O and O', 'Na and Cl', 'C and H', 'N and N'], 1, 'A metal (Na) plus a nonmetal (Cl) gives an ionic bond.'),
    wr('bonding', 2, 'How many electrons are shared in a DOUBLE bond?', ['4', 'four'], 'A double bond shares two pairs = 4 electrons.'),
    mc('bonding', 2, 'Water (H2O) is a ____ molecule.', ['Nonpolar', 'Polar', 'Ionic', 'Metallic'], 1, 'Its bent shape and uneven sharing make it polar.'),
    mc('bonding', 1, 'The octet rule says atoms tend to reach ____ valence electrons.', ['2', '6', '8', '10'], 2, 'A full outer shell of 8 is especially stable.'),
    wr('bonding', 2, 'Write the formula for the compound of Mg^2+ and O^2-.', ['mgo'], 'The 2+ and 2- charges cancel 1 to 1, giving MgO.'),
    mc('bonding', 2, 'Which compound contains COVALENT bonds?', ['NaCl', 'KBr', 'CO2', 'MgO'], 2, 'CO2 is two nonmetals sharing electrons.'),
    wr('bonding', 3, 'Write the formula for the compound of Ca^2+ and Cl^-.', ['cacl2'], 'One Ca2+ needs two Cl- to balance: CaCl2.'),

    // ---------------- REACTIONS ----------------
    mc('reactions', 1, 'Balancing equations satisfies the law of conservation of ____.', ['Energy', 'Mass', 'Charge', 'Volume'], 1, 'Atoms are neither created nor destroyed, so mass is conserved.'),
    wr('reactions', 2, 'Balance: H2 + O2 -> H2O. What is the coefficient of H2O?', ['2'], '2H2 + O2 -> 2H2O balances all atoms.'),
    mc('reactions', 1, '2H2 + O2 -> 2H2O is which type of reaction?', ['Synthesis', 'Decomposition', 'Single replacement', 'Double replacement'], 0, 'Two reactants combine into one product: synthesis.'),
    mc('reactions', 2, 'CH4 + 2O2 -> CO2 + 2H2O is a ____ reaction.', ['Synthesis', 'Combustion', 'Decomposition', 'Double replacement'], 1, 'A fuel burning in oxygen to give CO2 and water is combustion.'),
    wr('reactions', 2, 'Balance: 2Na + Cl2 -> 2NaCl. What is the coefficient of Na?', ['2'], 'Two sodium atoms react with one Cl2 to make 2 NaCl.'),
    mc('reactions', 1, 'A reaction of the form AB -> A + B is ____.', ['Synthesis', 'Decomposition', 'Combustion', 'Single replacement'], 1, 'One compound breaking apart is decomposition.'),
    mc('reactions', 2, 'A + BC -> AC + B is which reaction type?', ['Double replacement', 'Single replacement', 'Synthesis', 'Combustion'], 1, 'One element replaces another: single replacement.'),
    wr('reactions', 3, 'Balance: Fe + O2 -> Fe2O3. What is the coefficient of Fe?', ['4'], '4Fe + 3O2 -> 2Fe2O3 balances iron and oxygen.'),
    mc('reactions', 1, 'Which is a sign that a chemical reaction occurred?', ['Temperature change', 'Gas bubbles forming', 'Color change', 'All of these'], 3, 'Any of these can indicate a new substance has formed.'),
    wr('reactions', 3, 'Balance: N2 + H2 -> NH3. What is the coefficient of H2?', ['3'], 'N2 + 3H2 -> 2NH3 (the Haber process).'),

    // ---------------- STOICH ----------------
    mc('stoich', 1, 'Avogadro\'s number is approximately ____.', ['6.02 x 10^23', '3.14 x 10^23', '1.6 x 10^-19', '9.8'], 0, 'One mole contains about 6.02 x 10^23 particles.'),
    wr('stoich', 2, 'What is the molar mass of water (H2O) in g/mol? (H=1, O=16)', ['18', '18.0', '18.02'], '2(1) + 16 = 18 g/mol.'),
    mc('stoich', 1, 'The molar mass of carbon (C) is about ____.', ['6 g/mol', '12 g/mol', '14 g/mol', '1 g/mol'], 1, 'Carbon\'s atomic mass is about 12 g/mol.'),
    wr('stoich', 2, 'How many moles are in 36 g of water? (molar mass = 18 g/mol)', ['2', '2.0'], 'moles = mass / molar mass = 36 / 18 = 2.'),
    mc('stoich', 2, 'How many grams are in 2 moles of helium? (He = 4 g/mol)', ['2', '4', '8', '16'], 2, 'mass = moles x molar mass = 2 x 4 = 8 g.'),
    wr('stoich', 2, 'What is the molar mass of CO2? (C=12, O=16)', ['44'], '12 + 2(16) = 44 g/mol.'),
    mc('stoich', 2, 'At STP, one mole of any gas occupies about ____.', ['22.4 L', '1 L', '18 L', '6.02 L'], 0, 'The molar volume of a gas at STP is 22.4 L.'),
    wr('stoich', 1, 'How many moles is 6.02 x 10^23 atoms?', ['1', 'one'], 'That is exactly one mole by definition.'),
    mc('stoich', 3, 'The molar mass of NaCl is ____. (Na=23, Cl=35.5)', ['48.5', '58.5', '35.5', '23'], 1, '23 + 35.5 = 58.5 g/mol.'),
    wr('stoich', 3, 'How many grams are in 0.5 mol of O2? (O2 = 32 g/mol)', ['16'], '0.5 x 32 = 16 g.'),

    // ---------------- GASES ----------------
    mc('gases', 1, 'Boyle\'s law: at constant temperature, pressure and volume are ____.', ['Directly proportional', 'Inversely proportional', 'Always equal', 'Unrelated'], 1, 'Squeeze the volume smaller and pressure rises.'),
    mc('gases', 1, 'Charles\'s law relates volume to ____.', ['Pressure', 'Temperature', 'Moles', 'Density'], 1, 'At constant pressure, volume rises with absolute temperature.'),
    wr('gases', 1, 'What is the temperature at STP, in degrees Celsius?', ['0'], 'STP is 0 degrees C (273 K) and 1 atm.'),
    mc('gases', 1, 'As temperature increases, gas particles move ____.', ['Slower', 'Faster', 'They stop', 'No change'], 1, 'Higher temperature means greater average kinetic energy.'),
    mc('gases', 2, 'The ideal gas law is written as ____.', ['PV = nRT', 'E = mc^2', 'F = ma', 'PV = RT only'], 0, 'PV = nRT links pressure, volume, moles and temperature.'),
    wr('gases', 2, 'At constant temperature, if a gas\'s volume decreases, its pressure will ____.', ['increase', 'increases', 'rise', 'go up'], 'Boyle\'s law: volume down means pressure up.'),
    mc('gases', 2, 'Which is an assumption of kinetic molecular theory?', ['Particles strongly attract', 'Collisions lose energy', 'Particles are in constant random motion', 'Gases have fixed volume'], 2, 'Ideal gas particles move randomly and collide elastically.'),
    wr('gases', 1, 'What is the pressure at STP, in atmospheres?', ['1', 'one'], 'STP pressure is 1 atm.'),
    mc('gases', 3, 'Doubling the absolute temperature at constant pressure ____ the volume.', ['Halves', 'Doubles', 'No change', 'Triples'], 1, 'Volume is directly proportional to absolute temperature.'),
    mc('gases', 1, 'Gas pressure is caused by particles ____.', ['Sticking together', 'Colliding with the container walls', 'Changing mass', 'Losing charge'], 1, 'Countless collisions with the walls create pressure.'),

    // ---------------- SOLUTIONS ----------------
    mc('solutions', 1, 'In salt water, the salt is the ____.', ['Solvent', 'Solute', 'Solution', 'Suspension'], 1, 'The solute is the substance being dissolved.'),
    mc('solutions', 1, 'Water is often called the universal ____.', ['Solute', 'Solvent', 'Acid', 'Base'], 1, 'Water dissolves a huge range of substances.'),
    wr('solutions', 2, 'Molarity is moles of solute per liter of ____.', ['solution', 'soln'], 'Molarity = moles solute / liters of solution.'),
    mc('solutions', 1, 'Molarity (M) is defined as ____.', ['mol/L', 'g/L', 'L/mol', 'mol/kg'], 0, 'Molarity has units of moles per liter.'),
    wr('solutions', 2, 'What is the molarity of 2 mol of NaCl dissolved in 1 L of solution?', ['2', '2 m'], 'M = 2 mol / 1 L = 2 M.'),
    mc('solutions', 2, 'A solution that can dissolve no more solute is ____.', ['Dilute', 'Saturated', 'Unsaturated', 'Weak'], 1, 'A saturated solution holds the maximum dissolved solute.'),
    wr('solutions', 2, 'What molarity results from 1 mol of solute in 2 L of solution?', ['0.5', '0.5 m'], 'M = 1 / 2 = 0.5 M.'),
    mc('solutions', 2, 'For most solids, raising the temperature ____ solubility in water.', ['Increases', 'Decreases', 'Has no effect', 'Removes'], 0, 'Most solids dissolve more readily when warmer.'),
    mc('solutions', 1, 'Which speeds up dissolving?', ['Stirring', 'Larger crystals', 'Lower temperature', 'Less solvent'], 0, 'Stirring brings fresh solvent to the solute surface.'),
    wr('solutions', 3, 'How many moles of solute are in 3 L of a 2 M solution?', ['6', '6 mol'], 'moles = M x V = 2 x 3 = 6 mol.'),

    // ---------------- ACIDS ----------------
    mc('acids', 1, 'Acids have a pH that is ____.', ['Equal to 7', 'Less than 7', 'Greater than 7', 'Exactly 14'], 1, 'Acidic solutions have pH below 7.'),
    mc('acids', 1, 'Bases have a pH that is ____.', ['Less than 7', 'Equal to 7', 'Greater than 7', 'Negative'], 2, 'Basic (alkaline) solutions have pH above 7.'),
    wr('acids', 1, 'A neutral solution has a pH of ____.', ['7'], 'Pure water is neutral at pH 7.'),
    mc('acids', 1, 'Acids produce which ion in water?', ['OH^-', 'H^+', 'Na^+', 'Cl^-'], 1, 'Acids release hydrogen ions (H^+).'),
    mc('acids', 1, 'Bases produce which ion in water?', ['H^+', 'OH^-', 'H2', 'O2'], 1, 'Bases release hydroxide ions (OH^-).'),
    wr('acids', 2, 'An acid plus a base produces a salt and ____.', ['water'], 'Neutralization makes a salt and water.'),
    mc('acids', 2, 'Which of these is a STRONG acid?', ['HCl', 'NaOH', 'NaCl', 'CH4'], 0, 'HCl fully ionizes in water; NaOH is a base.'),
    mc('acids', 1, 'Litmus paper turns ____ in an acid.', ['Blue', 'Red', 'Green', 'Yellow'], 1, 'Acids turn blue litmus red.'),
    wr('acids', 2, 'The reaction between an acid and a base is called ____.', ['neutralization', 'neutralisation'], 'It neutralizes both to form salt and water.'),
    mc('acids', 2, 'A solution of pH 3 is ____ a solution of pH 5.', ['More basic than', 'More acidic than', 'Equal to', 'Neutral compared to'], 1, 'Lower pH means more acidic; each step is 10x.'),

    // ---------------- THERMO ----------------
    mc('thermo', 1, 'A reaction that RELEASES heat is ____.', ['Endothermic', 'Exothermic', 'Isothermal', 'Neutral'], 1, 'Exothermic reactions release energy to the surroundings.'),
    mc('thermo', 1, 'A reaction that ABSORBS heat is ____.', ['Endothermic', 'Exothermic', 'Combustion', 'Neutral'], 0, 'Endothermic reactions take in energy.'),
    wr('thermo', 1, 'What is the SI unit of energy?', ['joule', 'joules', 'j'], 'Energy is measured in joules (J).'),
    mc('thermo', 2, 'In an exothermic reaction, the products have ____ energy than the reactants.', ['More', 'Less', 'Equal', 'Infinite'], 1, 'Released energy means products sit lower in energy.'),
    wr('thermo', 1, 'Energy that flows because of a temperature difference is called ____.', ['heat'], 'Heat flows from hotter to colder.'),
    mc('thermo', 1, 'Burning fuel is an example of a(n) ____ process.', ['Endothermic', 'Exothermic', 'Freezing', 'Melting'], 1, 'Combustion releases heat and light.'),
    mc('thermo', 2, 'Melting ice is ____ because it absorbs heat.', ['Exothermic', 'Endothermic', 'Neutral', 'Combustion'], 1, 'Melting requires energy input, so it is endothermic.'),
    wr('thermo', 2, 'A negative enthalpy change indicates a reaction is ____.', ['exothermic'], 'Negative delta H means energy is released.'),
    mc('thermo', 3, 'The measure of disorder in a system is ____.', ['Enthalpy', 'Entropy', 'Energy', 'Density'], 1, 'Entropy describes disorder or randomness.'),
    mc('thermo', 2, 'When water freezes, it ____ energy.', ['Absorbs', 'Releases', 'Creates', 'Destroys'], 1, 'Freezing is exothermic; it releases heat.')
  ];

  // tag each with an index id
  BANK.forEach(function (q, i) { q.id = i; });

  var recent = [];
  function remember(id) { recent.push(id); if (recent.length > 12) recent.shift(); }

  function normalize(s) {
    return String(s).toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,;:!]+$/, '')
      .replace(/\s*mol\/?l?\s*$/, function (m) { return m.trim() ? ' m' : m; });
  }
  function checkWritten(input, accept) {
    var n = normalize(input).replace(/\s/g, '');
    return accept.some(function (a) { return normalize(a).replace(/\s/g, '') === n; });
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function unitName(id) { var u = UNITS.find(function (x) { return x.id === id; }); return u ? u.name : id; }

  // opts: { units:[ids], topic:id|null, maxDiff:1-3, mode:'mixed'|'mc'|'written' }
  function draw(opts) {
    opts = opts || {};
    var enabled = (opts.units && opts.units.length) ? opts.units : UNITS.map(function (u) { return u.id; });
    var mode = opts.mode || 'mixed';
    var maxDiff = opts.maxDiff || 2;

    function filt(pool) {
      return pool.filter(function (q) {
        if (enabled.indexOf(q.unit) < 0) return false;
        if (mode === 'mc' && q.type !== 'mc') return false;
        if (mode === 'written' && q.type !== 'written') return false;
        if (q.diff > maxDiff) return false;
        return true;
      });
    }
    var pool = filt(BANK);
    if (!pool.length) { // relax difficulty if needed
      maxDiff = 3; pool = filt(BANK);
    }
    if (!pool.length) { // relax mode
      mode = 'mixed'; pool = filt(BANK);
    }
    // topic bias
    var topicPool = (opts.topic && enabled.indexOf(opts.topic) >= 0)
      ? pool.filter(function (q) { return q.unit === opts.topic; }) : [];
    var useTopic = topicPool.length && Math.random() < 0.7;
    var src = useTopic ? topicPool : pool;
    // avoid recent repeats
    var fresh = src.filter(function (q) { return recent.indexOf(q.id) < 0; });
    if (fresh.length) src = fresh;
    var q = src[Math.floor(Math.random() * src.length)];
    remember(q.id);
    return format(q);
  }

  function format(q) {
    var out = {
      raw: q, type: q.type, unit: q.unit, unitName: unitName(q.unit),
      qHtml: chemFormat(q.q),
      explainHtml: chemFormat(q.explain || '')
    };
    if (q.type === 'mc') {
      var opts = q.choices.map(function (c, i) { return { html: chemFormat(c), correct: i === q.correct, raw: c }; });
      out.choices = shuffle(opts);
    } else {
      out.accept = q.accept;
      out.answerHtml = chemFormat(q.accept[0]);
    }
    return out;
  }

  G.Chem = {
    UNITS: UNITS, chemFormat: chemFormat, draw: draw,
    checkWritten: checkWritten, unitName: unitName,
    count: BANK.length
  };
})(window.G = window.G || {});
