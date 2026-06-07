/* ============================================================
   Chem - IB Diploma Chemistry (first assessment 2025) units +
   question banks. Structure 3.2 (organic / spectroscopy) is
   intentionally excluded. Mixed written/MC.
   Formulas written ASCII in source ("H2O", "SO4^2-", "->") and
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

  // ---- units = IB syllabus topics actually studied (3.2 excluded) ----
  var UNITS = [
    { id: 's1_1', name: 'Structure 1.1 - Particulate Nature of Matter', blurb: 'Elements, compounds, mixtures, states, kinetic theory, Kelvin.' },
    { id: 's1_2', name: 'Structure 1.2 - The Nuclear Atom', blurb: 'Protons, neutrons, electrons, isotopes, relative atomic mass.' },
    { id: 's1_3', name: 'Structure 1.3 - Electron Configurations', blurb: 'Emission spectra, energy levels, sublevels, Aufbau, ionization.' },
    { id: 's1_4', name: 'Structure 1.4 - The Mole', blurb: 'Avogadro, molar mass, empirical/molecular formula, concentration.' },
    { id: 's1_5', name: 'Structure 1.5 - Ideal Gases', blurb: 'Ideal gas assumptions, PV=nRT, combined gas law, molar volume.' },
    { id: 's2_1', name: 'Structure 2.1 - The Ionic Model', blurb: 'Cations/anions, ionic bonding, formulae, polyatomic ions, lattices.' },
    { id: 's2_2', name: 'Structure 2.2 - The Covalent Model', blurb: 'Lewis, VSEPR shapes, polarity, intermolecular forces, sigma/pi.' },
    { id: 's2_3', name: 'Structure 2.3 - The Metallic Model', blurb: 'Metallic bonding, conductivity, malleability, bond strength.' },
    { id: 's2_4', name: 'Structure 2.4 - From Models to Materials', blurb: 'Bonding continuum/triangle, alloys, polymers.' },
    { id: 's3_1', name: 'Structure 3.1 - The Periodic Table', blurb: 'Periods, groups, blocks, periodic trends, oxidation states.' },
    { id: 'r1_1', name: 'Reactivity 1.1 - Measuring Enthalpy Changes', blurb: 'Endo/exothermic, Q=mcDT, standard enthalpy, energy profiles.' },
    { id: 'r1_2', name: 'Reactivity 1.2 - Energy Cycles', blurb: 'Bond enthalpies, Hess law, formation/combustion, Born-Haber.' },
    { id: 'r1_3', name: 'Reactivity 1.3 - Energy from Fuels', blurb: 'Combustion, incomplete combustion, fossil fuels, biofuels.' },
    { id: 'r2_1', name: 'Reactivity 2.1 - Amount of Chemical Change', blurb: 'Equations, mole ratios, limiting reactant, yield, atom economy.' },
    { id: 'r2_2', name: 'Reactivity 2.2 - Rate of Chemical Change', blurb: 'Collision theory, activation energy, catalysts, factors.' },
    { id: 'r2_3', name: 'Reactivity 2.3 - Extent of Chemical Change', blurb: 'Dynamic equilibrium, Le Chatelier, equilibrium constant.' },
    { id: 'r3_1', name: 'Reactivity 3.1 - Proton Transfer (Acids & Bases)', blurb: 'Bronsted-Lowry, pH, strong/weak, neutralization.' },
    { id: 'r3_2', name: 'Reactivity 3.2 - Electron Transfer (Redox)', blurb: 'Oxidation/reduction, oxidation states, agents.' }
  ];

  function mc(unit, diff, q, choices, correct, explain) {
    return { unit: unit, diff: diff, type: 'mc', q: q, choices: choices, correct: correct, explain: explain };
  }
  function wr(unit, diff, q, accept, explain) {
    return { unit: unit, diff: diff, type: 'written', q: q, accept: accept, explain: explain };
  }

  var BANK = [
    // ================= STRUCTURE 1.1 - particulate nature =================
    mc('s1_1', 1, 'Which type of matter can be separated by physical methods?', ['Element', 'Compound', 'Mixture', 'Atom'], 2, 'Mixtures are not chemically bonded, so physical methods separate them.'),
    mc('s1_1', 1, 'A compound is best described as:', ['Atoms of one element', 'Different elements chemically bonded in a fixed ratio', 'Substances mixed in any ratio', 'A lattice of ions and electrons'], 1, 'A compound has elements chemically bonded in a fixed ratio.'),
    wr('s1_1', 1, 'The change of state directly from a gas to a solid is called ____.', ['deposition'], 'Deposition is the reverse of sublimation.'),
    mc('s1_1', 2, 'Which technique separates liquids using differences in boiling point?', ['Filtration', 'Distillation', 'Decanting', 'Paper chromatography'], 1, 'Distillation exploits different boiling points.'),
    wr('s1_1', 2, 'Convert 25 degrees Celsius to kelvin.', ['298', '298.15', '298 k'], 'K = degrees C + 273.15, so 25 + 273 = 298 K.'),
    mc('s1_1', 2, 'The temperature in kelvin is a measure of the average ____ of particles.', ['Potential energy', 'Kinetic energy', 'Mass', 'Charge'], 1, 'Absolute temperature is proportional to average kinetic energy.'),
    wr('s1_1', 1, 'What state symbol is used for a substance dissolved in water?', ['aq', '(aq)'], '(aq) denotes an aqueous solution.'),
    mc('s1_1', 2, 'Which change of state is endothermic?', ['Freezing', 'Condensation', 'Vaporization', 'Deposition'], 2, 'Vaporization absorbs energy to overcome attractions.'),
    mc('s1_1', 1, 'A homogeneous mixture has:', ['Two visible phases', 'Uniform composition throughout', 'A fixed chemical formula', 'Components in a fixed ratio'], 1, 'Homogeneous = uniform throughout (e.g. a solution).'),

    // ================= STRUCTURE 1.2 - nuclear atom =================
    wr('s1_2', 1, 'How many neutrons are in an atom of phosphorus-31 (Z = 15)?', ['16'], 'Neutrons = mass number - protons = 31 - 15 = 16.'),
    mc('s1_2', 1, 'What is the relative charge of a neutron?', ['+1', '-1', '0', '+2'], 2, 'Neutrons are electrically neutral.'),
    wr('s1_2', 2, 'How many electrons are in a Ca^2+ ion? (Z = 20)', ['18'], 'A 2+ ion has lost 2 electrons: 20 - 2 = 18.'),
    mc('s1_2', 1, 'Isotopes of an element have the same number of:', ['Neutrons but different protons', 'Protons but different neutrons', 'Electrons but different protons', 'Protons but different charge'], 1, 'Isotopes share protons; neutron number differs.'),
    wr('s1_2', 3, 'Chlorine is 75% an isotope of mass 35 and 25% mass 37. Calculate its relative atomic mass.', ['35.5', '35.50'], '(0.75 x 35) + (0.25 x 37) = 35.5.'),
    mc('s1_2', 1, 'Almost all of an atom\'s mass is found in the:', ['Electron cloud', 'Nucleus', 'Valence shell', 'Orbitals'], 1, 'Protons and neutrons in the nucleus hold nearly all the mass.'),
    mc('s1_2', 2, 'In the nuclear symbol notation, the larger (top) number represents the:', ['Atomic number', 'Mass number', 'Neutron number', 'Charge'], 1, 'The top number is the mass number (protons + neutrons).'),
    wr('s1_2', 1, 'How many protons are in an atom with atomic number 17?', ['17'], 'Atomic number equals the proton number.'),

    // ================= STRUCTURE 1.3 - electron configurations =================
    wr('s1_3', 2, 'A main energy level holds a maximum of 2n^2 electrons. What is the maximum for n = 3?', ['18'], '2 x 3^2 = 18 electrons.'),
    mc('s1_3', 2, 'What is the full electron configuration of sulfur (Z = 16)?', ['1s2 2s2 2p6 3s2 3p4', '1s2 2s2 2p6 3s2 3p6', '1s2 2s2 2p6 3s2', '1s2 2s2 2p4'], 0, 'Sulfur has 16 electrons: 2,2,6,2,4.'),
    mc('s1_3', 2, 'Following the Aufbau principle, which sublevel fills immediately after 4s?', ['3d', '4p', '4d', '3p'], 0, '4s fills before 3d because it is slightly lower in energy.'),
    mc('s1_3', 1, 'By the Pauli exclusion principle, the maximum number of electrons in one orbital is:', ['1', '2', '6', '8'], 1, 'An orbital holds 2 electrons of opposite spin.'),
    mc('s1_3', 2, 'Emission spectra are produced when electrons:', ['Absorb photons and rise to higher levels', 'Emit photons as they fall to lower levels', 'Are removed from the atom', 'Move within the same level'], 1, 'Falling electrons emit photons of specific energies.'),
    wr('s1_3', 3, 'Write the condensed electron configuration of potassium (Z = 19) using a noble gas core.', ['[ar]4s1', '[ar] 4s1'], 'Argon core plus the 19th electron: [Ar] 4s1.'),
    mc('s1_3', 3, 'Which element is an exception to the Aufbau filling order?', ['Cr', 'Ca', 'K', 'Ar'], 0, 'Chromium is [Ar] 3d5 4s1 for extra stability.'),
    mc('s1_3', 2, 'A line spectrum (rather than continuous) is evidence that electron energy levels are:', ['Continuous', 'Quantized (discrete)', 'Randomly distributed', 'Equal in energy'], 1, 'Discrete lines show only certain energy transitions occur.'),
    wr('s1_3', 1, 'What is the maximum number of electrons a p sublevel can hold?', ['6'], 'A p sublevel has 3 orbitals x 2 electrons = 6.'),

    // ================= STRUCTURE 1.4 - the mole =================
    mc('s1_4', 1, 'The Avogadro constant is approximately:', ['6.02 x 10^23', '3.00 x 10^8', '1.60 x 10^-19', '9.81'], 0, 'One mole contains about 6.02 x 10^23 entities.'),
    wr('s1_4', 2, 'Calculate the molar mass of CO2. (C = 12.0, O = 16.0)', ['44', '44.0', '44.01'], '12.0 + 2(16.0) = 44.0 g/mol.'),
    wr('s1_4', 2, 'How many moles are in 36.0 g of water? (M = 18.0 g/mol)', ['2', '2.0'], 'n = m / M = 36.0 / 18.0 = 2.00 mol.'),
    wr('s1_4', 2, 'What is the mass of 2.0 mol of NaOH? (M = 40.0 g/mol)', ['80', '80.0', '80 g'], 'm = n x M = 2.0 x 40.0 = 80 g.'),
    mc('s1_4', 3, 'A compound is 40.0% C, 6.7% H and 53.3% O by mass. What is its empirical formula?', ['CH2O', 'C2H4O2', 'CHO', 'CH3O'], 0, 'Dividing by Ar gives a 1:2:1 ratio: CH2O.'),
    wr('s1_4', 2, 'A solution contains 0.50 mol of solute in 2.0 dm^3. What is its concentration in mol/dm^3?', ['0.25', '0.25 mol/dm3'], 'c = n / V = 0.50 / 2.0 = 0.25 mol/dm3.'),
    wr('s1_4', 3, 'Using n = CV, how many moles are in 250 cm^3 of 0.20 mol/dm^3 solution?', ['0.05', '0.050'], 'n = 0.20 x 0.250 dm3 = 0.050 mol.'),
    mc('s1_4', 1, 'Avogadro\'s law states that equal volumes of gases at the same temperature and pressure contain equal numbers of:', ['Atoms', 'Molecules', 'Electrons', 'Protons'], 1, 'Equal volumes contain equal numbers of molecules.'),
    wr('s1_4', 2, 'Calculate the relative formula mass of CaCO3. (Ca = 40, C = 12, O = 16)', ['100'], '40 + 12 + 3(16) = 100.'),

    // ================= STRUCTURE 1.5 - ideal gases =================
    mc('s1_5', 1, 'An ideal gas is assumed to have particles with:', ['Significant volume', 'Negligible volume', 'Strong attractions', 'Inelastic collisions'], 1, 'Ideal gas particles have negligible volume and no forces.'),
    mc('s1_5', 2, 'Real gases deviate most from ideal behaviour at:', ['High temperature', 'Low pressure', 'Low temperature and high pressure', 'Standard conditions'], 2, 'Low T and high P bring particles close, where forces matter.'),
    mc('s1_5', 1, 'The ideal gas equation is:', ['PV = nRT', 'PV = RT', 'P = nRT', 'E = mc^2'], 0, 'PV = nRT links pressure, volume, moles and temperature.'),
    wr('s1_5', 1, 'In the equation PV = nRT, what does R represent?', ['gas constant', 'the gas constant', 'universal gas constant'], 'R is the universal gas constant.'),
    mc('s1_5', 2, 'At constant temperature, if the volume of a gas halves, the pressure:', ['Halves', 'Doubles', 'Quarters', 'Stays the same'], 1, 'Boyle\'s law: P and V are inversely proportional.'),
    mc('s1_5', 1, 'Collisions between ideal gas particles are assumed to be:', ['Elastic', 'Inelastic', 'Sticky', 'Reactive'], 0, 'No kinetic energy is lost in elastic collisions.'),
    mc('s1_5', 2, 'The molar volume of an ideal gas at STP (IB data booklet) is about:', ['22.7 dm^3', '24.0 dm^3', '18.0 dm^3', '1.00 dm^3'], 0, 'IB uses 22.7 dm3/mol at STP (273 K, 100 kPa).'),
    wr('s1_5', 2, 'At constant pressure, if the absolute temperature of a fixed mass of gas doubles, what happens to its volume?', ['doubles', 'it doubles', 'double'], 'Charles\'s law: V is proportional to absolute temperature.'),

    // ================= STRUCTURE 2.1 - ionic model =================
    wr('s2_1', 2, 'Write the formula of the ionic compound formed from Mg^2+ and Cl^-.', ['mgcl2'], 'One Mg2+ needs two Cl- to balance: MgCl2.'),
    mc('s2_1', 1, 'When a metal atom loses electrons it forms a:', ['Cation', 'Anion', 'Molecule', 'Isotope'], 0, 'Losing electrons gives a positive cation.'),
    wr('s2_1', 2, 'Write the formula of aluminium oxide, from Al^3+ and O^2-.', ['al2o3'], 'Balancing 3+ and 2- charges gives Al2O3.'),
    mc('s2_1', 2, 'Which is the formula of the sulfate ion?', ['SO4^2-', 'SO3^2-', 'NO3^-', 'CO3^2-'], 0, 'Sulfate is SO4^2-.'),
    mc('s2_1', 2, 'Which is the formula of the ammonium ion?', ['NH4^+', 'NO3^-', 'OH^-', 'NH3'], 0, 'Ammonium is the polyatomic cation NH4^+.'),
    mc('s2_1', 1, 'Ionic compounds conduct electricity when:', ['Solid', 'Molten or in aqueous solution', 'Never', 'Only as a gas'], 1, 'Mobile ions are needed; ions move when molten or dissolved.'),
    mc('s2_1', 3, 'Lattice enthalpy (ionic bond strength) is greatest for ions that are:', ['Larger with smaller charge', 'Smaller with higher charge', 'Larger with higher charge', 'Smaller with lower charge'], 1, 'Small, highly charged ions attract most strongly.'),
    wr('s2_1', 2, 'Write the formula of sodium oxide, from Na^+ and O^2-.', ['na2o'], 'Two Na+ balance one O2-: Na2O.'),
    mc('s2_1', 1, 'In an ionic bond, the electrostatic attraction is between:', ['Shared electron pairs', 'Oppositely charged ions', 'Cations and delocalized electrons', 'Neutral atoms'], 1, 'Ionic bonding is attraction between oppositely charged ions.'),

    // ================= STRUCTURE 2.2 - covalent model =================
    mc('s2_2', 1, 'A covalent bond is formed by:', ['Transfer of electrons', 'Sharing of a pair of electrons', 'A sea of delocalized electrons', 'Attraction between ions'], 1, 'Covalent bonds share electron pairs between nuclei.'),
    mc('s2_2', 1, 'The octet rule refers to atoms tending to reach how many valence electrons?', ['2', '6', '8', '10'], 2, 'A full octet of 8 valence electrons is stable.'),
    wr('s2_2', 2, 'How many electrons in total are shared in a triple bond?', ['6', 'six'], 'Three shared pairs = 6 electrons.'),
    mc('s2_2', 2, 'Using VSEPR, a molecule with 4 bonding pairs and no lone pairs has which shape?', ['Linear', 'Trigonal planar', 'Tetrahedral', 'Bent'], 2, 'Four electron domains with no lone pairs give a tetrahedron.'),
    mc('s2_2', 2, 'What is the shape of a molecule with 2 bonding pairs and 2 lone pairs, such as H2O?', ['Linear', 'Bent', 'Tetrahedral', 'Trigonal planar'], 1, 'Lone pairs push bonds into a bent shape (~104.5 degrees).'),
    mc('s2_2', 2, 'CO2 is a non-polar molecule because:', ['It has no polar bonds', 'Its bond dipoles cancel due to linear geometry', 'It is ionic', 'It has lone pairs on carbon'], 1, 'The two C=O dipoles cancel in the linear molecule.'),
    mc('s2_2', 2, 'What is the strongest intermolecular force present in water?', ['London (dispersion)', 'Dipole-dipole', 'Hydrogen bonding', 'Ionic bonding'], 2, 'O-H bonds allow strong hydrogen bonding.'),
    mc('s2_2', 2, 'Which molecule has only London (dispersion) forces between molecules?', ['H2O', 'NH3', 'CH4', 'HF'], 2, 'CH4 is non-polar, so only dispersion forces act.'),
    mc('s2_2', 1, 'The bond angle in a tetrahedral molecule such as CH4 is:', ['90 degrees', '104.5 degrees', '107 degrees', '109.5 degrees'], 3, 'Four equal electron domains give 109.5 degrees.'),
    wr('s2_2', 3, 'What is the hybridization of the carbon atom in CH4?', ['sp3', 'sp^3'], 'Four sigma bonds means sp3 hybridization.'),
    mc('s2_2', 3, 'A double bond consists of:', ['Two sigma bonds', 'One sigma and one pi bond', 'Two pi bonds', 'One sigma bond only'], 1, 'A double bond is 1 sigma (head-on) + 1 pi (sideways) bond.'),

    // ================= STRUCTURE 2.3 - metallic model =================
    mc('s2_3', 1, 'A metallic bond is the electrostatic attraction between:', ['Shared electron pairs', 'A lattice of cations and delocalized electrons', 'Oppositely charged ions', 'Neutral atoms'], 1, 'Metal cations sit in a sea of delocalized electrons.'),
    mc('s2_3', 1, 'Metals conduct electricity because they contain:', ['Fixed electrons', 'Mobile delocalized electrons', 'Free protons', 'Mobile neutrons'], 1, 'Delocalized electrons are free to move and carry charge.'),
    mc('s2_3', 2, 'Metallic bond strength increases with:', ['Lower cation charge and larger radius', 'Higher cation charge and smaller radius', 'Lower charge and smaller radius', 'Higher charge and larger radius'], 1, 'More charge and smaller ions mean stronger attraction.'),
    mc('s2_3', 2, 'Metals are malleable because:', ['Covalent bonds break easily', 'Layers of cations can slide while electrons adjust', 'Ions are fixed in place', 'They contain no electrons'], 1, 'Non-directional bonding lets layers slide without shattering.'),
    wr('s2_3', 1, 'What is the term for the attraction between a lattice of metal cations and a sea of delocalized electrons?', ['metallic bond', 'metallic bonding'], 'This is metallic bonding.'),
    mc('s2_3', 3, 'Transition elements have especially high melting points because of their:', ['Ionic bonding', 'Delocalized d (and s) electrons', 'Hydrogen bonding', 'Large atomic radius'], 1, 'More delocalized electrons strengthen the metallic bond.'),

    // ================= STRUCTURE 2.4 - models to materials =================
    mc('s2_4', 2, 'Bonding is best described as:', ['Strictly ionic', 'Strictly covalent', 'A continuum represented by a bonding triangle', 'Only metallic'], 2, 'The bonding triangle shows a continuum of bonding types.'),
    mc('s2_4', 1, 'An alloy is:', ['A pure metal', 'A mixture of a metal with other metals or non-metals', 'An ionic compound', 'A covalent network'], 1, 'Alloys are mixtures, giving enhanced properties.'),
    mc('s2_4', 2, 'Addition polymers form by:', ['Releasing a small molecule', 'Breaking the C=C double bond in each monomer', 'Ionic bonding', 'Hydrogen bonding'], 1, 'Alkene double bonds open to link monomers, atom economy 100%.'),
    mc('s2_4', 1, 'Polymers are large molecules built from repeating units called:', ['Monomers', 'Isomers', 'Isotopes', 'Ions'], 0, 'Monomers are the repeating subunits of a polymer.'),
    mc('s2_4', 2, 'Alloys are often harder than the pure metal because:', ['Different-sized atoms disrupt the orderly layers', 'They contain covalent bonds', 'They have no delocalized electrons', 'They are ionic'], 0, 'Atoms of different size stop layers sliding easily.'),
    wr('s2_4', 3, 'Condensation polymerisation joins monomers with the loss of a small molecule, often ____.', ['water'], 'Polyesters and polyamides release water on forming.'),
    mc('s2_4', 2, 'A compound\'s position in the bonding triangle is determined from its:', ['Mass and density', 'Electronegativity values', 'Boiling point', 'Colour'], 1, 'Average electronegativity and difference fix the position.'),

    // ================= STRUCTURE 3.1 - periodic table =================
    mc('s3_1', 1, 'Elements in the same group have the same number of:', ['Protons', 'Valence electrons', 'Neutrons', 'Occupied shells'], 1, 'Shared valence electrons give similar chemistry.'),
    mc('s3_1', 2, 'The period number of an element indicates its:', ['Number of valence electrons', 'Highest occupied main energy level', 'Group', 'Block'], 1, 'The period equals the outer energy level being filled.'),
    mc('s3_1', 2, 'Across period 3 from left to right, atomic radius:', ['Increases', 'Decreases', 'Stays the same', 'Doubles'], 1, 'Increasing nuclear charge pulls electrons inward.'),
    mc('s3_1', 2, 'Down group 1, atomic radius:', ['Increases', 'Decreases', 'Stays the same', 'Halves'], 0, 'Each element down a group has an extra electron shell.'),
    mc('s3_1', 1, 'Which is the most electronegative element?', ['F', 'O', 'Cl', 'Cs'], 0, 'Fluorine is the most electronegative element.'),
    mc('s3_1', 2, 'First ionization energy generally ____ across a period.', ['Increases', 'Decreases', 'Stays the same', 'Halves'], 0, 'Greater nuclear charge holds electrons more tightly.'),
    wr('s3_1', 1, 'What is the family name for the Group 17 elements?', ['halogens', 'halogen'], 'Group 17 are the halogens.'),
    mc('s3_1', 2, 'In which block of the periodic table is calcium (Group 2)?', ['s', 'p', 'd', 'f'], 0, 'Group 1 and 2 elements are in the s block.'),
    mc('s3_1', 2, 'Oxides of metals are generally:', ['Acidic', 'Basic', 'Neutral', 'Gaseous'], 1, 'Metal oxides tend to be basic; non-metal oxides acidic.'),
    wr('s3_1', 1, 'What is the usual oxidation state of oxygen in its compounds?', ['-2', '2-'], 'Oxygen is normally -2 (except peroxides and with fluorine).'),
    mc('s3_1', 3, 'The dip in first ionization energy from Mg to Al is evidence that:', ['Al has fewer protons', 'The electron removed from Al is in a higher-energy p sublevel', 'Al is a noble gas', 'Mg has more shells'], 1, 'Al\'s 3p electron is higher in energy and easier to remove.'),
    wr('s3_1', 2, 'Group 1 metals react with water to produce hydrogen and a metal ____.', ['hydroxide'], 'e.g. 2Na + 2H2O -> 2NaOH + H2.'),

    // ================= REACTIVITY 1.1 - enthalpy =================
    mc('r1_1', 1, 'An exothermic reaction:', ['Absorbs heat from the surroundings', 'Releases heat to the surroundings', 'Has no energy change', 'Always involves a gas'], 1, 'Exothermic reactions release energy (DH negative).'),
    mc('r1_1', 1, 'During an endothermic reaction, the temperature of the surroundings:', ['Increases', 'Decreases', 'Stays the same', 'Doubles'], 1, 'Energy is absorbed from the surroundings, cooling them.'),
    wr('r1_1', 2, 'In the equation Q = mcDT, what physical quantity does c represent?', ['specific heat capacity', 'heat capacity'], 'c is the specific heat capacity.'),
    mc('r1_1', 2, 'For an exothermic reaction, the sign of the standard enthalpy change is:', ['Positive', 'Negative', 'Zero', 'Always 1'], 1, 'Releasing energy gives a negative DH.'),
    wr('r1_1', 3, 'A reaction warms 100 g of water by 10.0 K. Using Q = mcDT with c = 4.18 J/g/K, calculate Q in joules.', ['4180', '4180 j'], 'Q = 100 x 4.18 x 10.0 = 4180 J.'),
    mc('r1_1', 1, 'The units of standard enthalpy change, DH, are:', ['kJ/mol', 'J only', 'mol', 'K'], 0, 'Standard enthalpy change is given in kJ/mol.'),
    mc('r1_1', 2, 'On an energy profile for an endothermic reaction, the products are:', ['Lower in energy than reactants', 'Higher in energy than reactants', 'Equal to reactants', 'At zero energy'], 1, 'Endothermic products sit higher than reactants.'),
    mc('r1_1', 2, 'Which statement about heat and temperature is correct?', ['They are the same thing', 'Temperature measures average kinetic energy of particles', 'Heat is measured in kelvin', 'Temperature measures total energy'], 1, 'Temperature is a measure of average kinetic energy.'),

    // ================= REACTIVITY 1.2 - energy cycles =================
    mc('r1_2', 1, 'Breaking a chemical bond is:', ['Exothermic (releases energy)', 'Endothermic (absorbs energy)', 'Energy-neutral', 'Always spontaneous'], 1, 'Bond breaking requires an input of energy.'),
    mc('r1_2', 1, 'Forming a chemical bond is:', ['Endothermic (absorbs energy)', 'Exothermic (releases energy)', 'Energy-neutral', 'Impossible'], 1, 'Bond forming releases energy.'),
    mc('r1_2', 3, 'If bonds broken require 800 kJ and bonds formed release 1000 kJ, the enthalpy change is:', ['+200 kJ', '-200 kJ', '+1800 kJ', '-1800 kJ'], 1, 'DH = bonds broken - bonds formed = 800 - 1000 = -200 kJ.'),
    wr('r1_2', 2, 'Hess\'s law states that the enthalpy change of a reaction is independent of the ____ taken.', ['path', 'pathway', 'route'], 'Enthalpy change depends only on initial and final states.'),
    mc('r1_2', 2, 'Average bond enthalpies are used because:', ['Bonds never vary', 'The same bond has slightly different strengths in different molecules', 'They are exact values', 'Energy is not conserved'], 1, 'A given bond varies slightly with its molecular environment.'),
    mc('r1_2', 3, 'The expression DH = Sum(DHf products) - Sum(DHf reactants) uses enthalpies of:', ['Formation', 'Combustion only', 'Atomization only', 'Neutralization'], 0, 'This standard relation uses enthalpies of formation.'),
    mc('r1_2', 3, 'A Born-Haber cycle applies Hess\'s law to the formation of:', ['Covalent gases', 'Ionic compounds', 'Metals', 'Acids'], 1, 'It breaks ionic compound formation into energy steps.'),

    // ================= REACTIVITY 1.3 - energy from fuels =================
    mc('r1_3', 1, 'Complete combustion of a hydrocarbon produces:', ['CO2 and H2O', 'CO and H2O', 'C and H2', 'CO2 only'], 0, 'Complete combustion gives carbon dioxide and water.'),
    mc('r1_3', 1, 'Incomplete combustion of hydrocarbons can produce the toxic gas:', ['CO2', 'CO', 'O2', 'N2'], 1, 'Limited oxygen forms poisonous carbon monoxide.'),
    wr('r1_3', 2, 'Complete combustion of methane: CH4 + 2O2 -> CO2 + ____. Give the missing product.', ['h2o', '2h2o', 'water'], 'CH4 + 2O2 -> CO2 + 2H2O.'),
    mc('r1_3', 1, 'Which of these is a fossil fuel?', ['Biodiesel', 'Coal', 'Hydrogen', 'Ethanol'], 1, 'Coal, crude oil and natural gas are fossil fuels.'),
    mc('r1_3', 1, 'Biofuels are classified as:', ['Non-renewable', 'Renewable', 'Fossil fuels', 'Nuclear'], 1, 'Biofuels regrow over short timescales via photosynthesis.'),
    mc('r1_3', 1, 'A greenhouse gas released when fossil fuels burn is:', ['O2', 'N2', 'CO2', 'He'], 2, 'Carbon dioxide is a greenhouse gas.'),
    wr('r1_3', 2, 'Incomplete combustion occurs when there is a limited supply of ____.', ['oxygen', 'air'], 'Insufficient oxygen leads to CO and soot.'),

    // ================= REACTIVITY 2.1 - amount of change =================
    wr('r2_1', 1, 'In N2 + 3H2 -> 2NH3, how many moles of H2 react with 1 mol of N2?', ['3'], 'The mole ratio of N2 to H2 is 1:3.'),
    mc('r2_1', 2, 'The limiting reactant in a reaction is the one that:', ['Is in excess', 'Is completely used up first', 'Has the largest mass', 'Is a catalyst'], 1, 'It runs out first and limits the yield.'),
    wr('r2_1', 2, 'Percentage yield = (experimental / theoretical) x 100. If theoretical yield is 5.0 g and you obtain 4.0 g, what is the percentage yield?', ['80', '80%'], '(4.0 / 5.0) x 100 = 80%.'),
    wr('r2_1', 3, 'Balance: Fe2O3 + CO -> Fe + CO2. What is the coefficient of CO?', ['3'], 'Fe2O3 + 3CO -> 2Fe + 3CO2.'),
    mc('r2_1', 2, 'Atom economy is a measure of:', ['Reaction speed', 'How much of the reactant atoms end up in the desired product', 'Equilibrium position', 'Activation energy'], 1, 'High atom economy means little waste (green chemistry).'),
    wr('r2_1', 2, 'In 2H2 + O2 -> 2H2O, how many moles of water form from 2 mol of H2?', ['2'], 'The H2 : H2O ratio is 1:1, so 2 mol H2 gives 2 mol H2O.'),
    wr('r2_1', 2, 'How many moles are in 4.0 g of NaOH? (M = 40.0 g/mol)', ['0.1', '0.10'], 'n = 4.0 / 40.0 = 0.10 mol.'),
    mc('r2_1', 1, 'Which state symbol represents a gas?', ['(s)', '(l)', '(g)', '(aq)'], 2, '(g) denotes a gaseous species.'),

    // ================= REACTIVITY 2.2 - rate of change =================
    mc('r2_2', 1, 'The rate of reaction is expressed as the change in:', ['Mass of catalyst', 'Concentration of a reactant or product per unit time', 'Temperature only', 'Colour'], 1, 'Rate = change in concentration per unit time.'),
    mc('r2_2', 2, 'Increasing temperature increases reaction rate mainly because particles:', ['Move slower', 'Collide more often and with greater energy', 'Become larger', 'Lose charge'], 1, 'More frequent, higher-energy collisions succeed more often.'),
    mc('r2_2', 2, 'A catalyst increases the rate of reaction by:', ['Raising the activation energy', 'Providing an alternative pathway with lower activation energy', 'Increasing the temperature', 'Shifting equilibrium'], 1, 'Catalysts lower Ea via an alternative route.'),
    mc('r2_2', 1, 'Activation energy is the:', ['Energy released by a reaction', 'Minimum energy needed for a successful collision', 'Energy of the products', 'Total bond energy'], 1, 'Colliding particles need at least Ea to react.'),
    mc('r2_2', 1, 'For a reaction involving a solid, the rate increases when the solid is:', ['In larger lumps', 'Broken into smaller pieces (more surface area)', 'Cooled', 'Compressed'], 1, 'More surface area means more collision sites.'),
    mc('r2_2', 2, 'According to collision theory, particles must collide with sufficient energy and the correct:', ['Orientation', 'Mass', 'Charge', 'Colour'], 0, 'Proper orientation is required for a successful collision.'),
    wr('r2_2', 1, 'What is the general name for a biological catalyst?', ['enzyme', 'enzymes'], 'Enzymes are biological catalysts.'),
    mc('r2_2', 3, 'In a multistep reaction mechanism, the overall rate is determined by the:', ['Fastest step', 'Slowest (rate-determining) step', 'First step always', 'Number of steps'], 1, 'The slowest elementary step limits the overall rate.'),

    // ================= REACTIVITY 2.3 - extent of change =================
    mc('r2_3', 1, 'At dynamic equilibrium, the rates of the forward and reverse reactions are:', ['Equal', 'Zero', 'Forward is greater', 'Reverse is greater'], 0, 'Equal opposing rates keep concentrations constant.'),
    mc('r2_3', 2, 'Increasing pressure shifts a gaseous equilibrium toward the side with:', ['More moles of gas', 'Fewer moles of gas', 'More solids', 'No change ever'], 1, 'The system opposes the change by reducing gas moles.'),
    mc('r2_3', 3, 'For an exothermic forward reaction, increasing temperature shifts the equilibrium:', ['Toward products', 'Toward reactants', 'No change', 'It stops'], 1, 'Higher T favours the endothermic (reverse) direction.'),
    mc('r2_3', 2, 'A value of Kc much greater than 1 indicates that at equilibrium:', ['Reactants are favoured', 'Products are favoured', 'No reaction occurs', 'Only solids remain'], 1, 'Large Kc means mostly products.'),
    mc('r2_3', 2, 'Adding more reactant to a system at equilibrium shifts it toward:', ['Products', 'Reactants', 'No shift', 'Solids'], 0, 'The system shifts to consume the added reactant.'),
    wr('r2_3', 1, 'A reaction in a closed system where forward and reverse rates are equal is said to be at dynamic ____.', ['equilibrium'], 'This is dynamic equilibrium.'),
    mc('r2_3', 2, 'Adding a catalyst to a system at equilibrium:', ['Shifts it toward products', 'Shifts it toward reactants', 'Does not change the position, only reaches it faster', 'Increases Kc'], 2, 'A catalyst speeds both directions equally.'),

    // ================= REACTIVITY 3.1 - proton transfer =================
    mc('r3_1', 1, 'A Bronsted-Lowry acid is a proton:', ['Donor', 'Acceptor', 'Sharer', 'Remover'], 0, 'An acid donates a proton (H^+).'),
    mc('r3_1', 1, 'A Bronsted-Lowry base is a proton:', ['Donor', 'Acceptor', 'Sharer', 'Carrier'], 1, 'A base accepts a proton.'),
    wr('r3_1', 1, 'What is the pH of a neutral solution at 298 K?', ['7'], 'Pure water is neutral at pH 7.'),
    mc('r3_1', 1, 'Acidic solutions have a pH that is:', ['Less than 7', 'Equal to 7', 'Greater than 7', 'Exactly 14'], 0, 'Acids have pH below 7.'),
    mc('r3_1', 2, 'As the concentration of H^+ ions increases, the pH:', ['Increases', 'Decreases', 'Stays the same', 'Doubles'], 1, 'pH = -log[H^+], so more H^+ means lower pH.'),
    mc('r3_1', 1, 'Which of these is a strong acid?', ['HCl', 'CH3COOH', 'NH3', 'NaCl'], 0, 'HCl fully dissociates; it is a strong acid.'),
    wr('r3_1', 1, 'An acid reacts with a base to produce a salt and ____.', ['water'], 'Neutralization gives a salt and water.'),
    mc('r3_1', 2, 'A solution at pH 3 compared with one at pH 5 is:', ['10 times more acidic', '100 times more acidic', '2 times more basic', 'Equal'], 1, 'Each pH unit is a factor of 10, so 2 units = 100x.'),
    mc('r3_1', 3, 'A strong acid is one that:', ['Fully dissociates in water', 'Partially dissociates', 'Has a high pH', 'Cannot be neutralized'], 0, 'Strong acids ionize completely in solution.'),
    wr('r3_1', 2, 'Which ion is responsible for acidity in aqueous solution?', ['h+', 'h3o+', 'hydrogen ion', 'hydronium'], 'Acids release H^+ (which forms H3O^+ in water).'),

    // ================= REACTIVITY 3.2 - redox =================
    mc('r3_2', 1, 'Oxidation is defined as the:', ['Gain of electrons', 'Loss of electrons', 'Gain of protons', 'Loss of neutrons'], 1, 'OIL RIG: Oxidation Is Loss of electrons.'),
    mc('r3_2', 1, 'Reduction is defined as the:', ['Loss of electrons', 'Gain of electrons', 'Loss of protons', 'Gain of neutrons'], 1, 'OIL RIG: Reduction Is Gain of electrons.'),
    wr('r3_2', 2, 'What is the oxidation state of chlorine in NaCl?', ['-1', '1-'], 'Na is +1, so Cl must be -1.'),
    wr('r3_2', 3, 'What is the oxidation state of sulfur in SO4^2-?', ['+6', '6', '6+'], 'Four O at -2 is -8; overall -2, so S is +6.'),
    mc('r3_2', 2, 'An oxidizing agent is a species that:', ['Loses electrons and is oxidized', 'Gains electrons and is itself reduced', 'Donates protons', 'Acts as a catalyst'], 1, 'The oxidizing agent takes electrons and is reduced.'),
    wr('r3_2', 1, 'What is the oxidation state of an atom in an uncombined element, such as O2?', ['0', 'zero'], 'Elements in their standard state have oxidation state 0.'),
    mc('r3_2', 1, 'In a redox reaction, the species that loses electrons is:', ['Oxidized', 'Reduced', 'A catalyst', 'A precipitate'], 0, 'Losing electrons is oxidation.'),
    wr('r3_2', 2, 'What is the usual oxidation state of hydrogen in compounds such as HCl?', ['+1', '1', '1+'], 'Hydrogen is usually +1 (except in metal hydrides).'),
    mc('r3_2', 3, 'What is the oxidation state of oxygen in a peroxide such as H2O2?', ['-2', '-1', '0', '+1'], 1, 'In peroxides each oxygen is -1.')
  ];

  // tag each with an index id
  BANK.forEach(function (q, i) { q.id = i; });

  var recent = [];
  function remember(id) { recent.push(id); if (recent.length > 14) recent.shift(); }

  function normalize(s) {
    return String(s).toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,;:!]+$/, '');
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
    if (!pool.length) { maxDiff = 3; pool = filt(BANK); }
    if (!pool.length) { mode = 'mixed'; pool = filt(BANK); }
    var topicPool = (opts.topic && enabled.indexOf(opts.topic) >= 0)
      ? pool.filter(function (q) { return q.unit === opts.topic; }) : [];
    var useTopic = topicPool.length && Math.random() < 0.7;
    var src = useTopic ? topicPool : pool;
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
