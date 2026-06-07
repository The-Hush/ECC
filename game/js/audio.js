/* ============================================================
   Audio - procedural chiptune in medieval modes (Dorian/Aeolian).
   Real sequenced melodies + synthesized SFX. No samples, no noise-spam.
   ============================================================ */
(function (G) {
  'use strict';

  var ctx = null, master = null, musicGain = null, sfxGain = null;
  var musicVol = 0.5, sfxVol = 0.7, muted = false;
  var current = null, schedTimer = null;
  var nextNoteTime = 0, beatPos = 0, activeTrack = null;
  var voiceNodes = [];

  // ---- note name -> frequency ----
  var SEMI = { C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11 };
  function freq(name) {
    if (!name) return 0;
    var m = name.match(/^([A-G][#b]?)(-?\d)$/);
    if (!m) return 0;
    var midi = (parseInt(m[2], 10) + 1) * 12 + SEMI[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  // compact pattern -> [[freq,beats],...]
  function v(notes) { return notes.map(function (n) { return [freq(n[0]), n[1]]; }); }

  // --------- TRACKS (each voice loops independently within loopBeats) ---------
  function buildTracks() {
    return {
      // gentle hall / town - D Dorian, lilting
      town: {
        bpm: 100,
        voices: [
          { wave: 'triangle', gain: 0.16, pat: v([
            ['A4',1],['D5',1],['F5',1],['E5',1], ['D5',2],['A4',1],['Bb4',1],
            ['C5',1],['A4',1],['F4',1],['A4',1], ['D5',2],[null,2],
            ['F5',1],['E5',1],['D5',1],['C5',1], ['D5',2],['F5',1],['G5',1],
            ['A5',2],['F5',1],['D5',1], ['E5',2],[null,2]
          ]) },
          { wave: 'sine', gain: 0.12, pat: v([
            ['D3',2],['A3',2], ['Bb2',2],['F3',2], ['G2',2],['D3',2], ['A2',2],['A3',2],
            ['D3',2],['A3',2], ['Bb2',2],['F3',2], ['C3',2],['G3',2], ['D3',2],['A3',2]
          ]) }
        ]
      },
      // overworld field - A Dorian, wandering, brighter
      field: {
        bpm: 116,
        voices: [
          { wave: 'square', gain: 0.10, pat: v([
            ['E5',1],['A5',1],['G5',1],['E5',1], ['F#5',2],['E5',1],['C#5',1],
            ['D5',1],['E5',1],['F#5',1],['E5',1], ['A4',2],['B4',1],['C#5',1],
            ['D5',1],['E5',1],['F#5',1],['A5',1], ['G5',2],['E5',1],['D5',1],
            ['C#5',1],['B4',1],['A4',1],['B4',1], ['A4',2],[null,2]
          ]) },
          { wave: 'triangle', gain: 0.13, pat: v([
            ['A2',1],['A3',1],['E3',2], ['F#2',1],['F#3',1],['C#3',2],
            ['D3',1],['D2',1],['A2',2], ['E3',1],['E2',1],['B2',2],
            ['A2',1],['A3',1],['E3',2], ['D3',1],['A2',1],['D3',2]
          ]) }
        ]
      },
      // battle - A Aeolian, driving
      battle: {
        bpm: 144,
        voices: [
          { wave: 'square', gain: 0.10, pat: v([
            ['A4',0.5],['C5',0.5],['E5',1],['A5',1], ['G5',0.5],['E5',0.5],['F5',1],['E5',1],
            ['D5',0.5],['F5',0.5],['A5',1],['G5',1], ['E5',1],['C5',1],
            ['A4',0.5],['C5',0.5],['E5',1],['A5',1], ['B5',0.5],['A5',0.5],['G5',1],['E5',1],
            ['F5',1],['E5',1],['D5',1],['C5',1], ['A4',2]
          ]) },
          { wave: 'sawtooth', gain: 0.07, pat: v([
            ['A2',1],['A2',1],['G2',1],['G2',1], ['F2',1],['F2',1],['E2',1],['E2',1],
            ['A2',1],['A2',1],['C3',1],['C3',1], ['D3',1],['E3',1],['A2',2]
          ]) }
        ]
      },
      // boss - D Phrygian, ominous
      boss: {
        bpm: 132,
        voices: [
          { wave: 'square', gain: 0.10, pat: v([
            ['D5',1],['Eb5',1],['D5',1],['A4',1], ['Bb4',1],['A4',1],['G4',1],['F4',1],
            ['D5',1],['Eb5',1],['F5',1],['D5',1], ['A5',2],['G5',1],['F5',1],
            ['Eb5',1],['D5',1],['Eb5',1],['F5',1], ['D5',2],[null,2]
          ]) },
          { wave: 'sawtooth', gain: 0.08, pat: v([
            ['D2',1],['D2',1],['Eb2',1],['Eb2',1], ['D2',1],['D2',1],['A2',1],['A2',1],
            ['D2',1],['D2',1],['F2',1],['F2',1], ['Eb2',1],['D2',1],['A2',2]
          ]) }
        ]
      },
      // brief victory loop - D major fanfare-y
      victory: {
        bpm: 150,
        voices: [
          { wave: 'square', gain: 0.12, pat: v([
            ['D5',0.5],['F#5',0.5],['A5',0.5],['D6',1], ['A5',0.5],['D6',1.5],
            ['G5',0.5],['B5',0.5],['D6',0.5],['G6',1], ['D6',1.5],[null,2]
          ]) },
          { wave: 'triangle', gain: 0.12, pat: v([
            ['D3',1],['A3',1], ['D3',1],['A3',1], ['G3',1],['D3',1], ['A2',1],['A3',1], ['D3',2]
          ]) }
        ]
      }
    };
  }
  var TRACKS = null;

  function ensure() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = musicVol; musicGain.connect(master);
      sfxGain = ctx.createGain(); sfxGain.gain.value = sfxVol; sfxGain.connect(master);
      TRACKS = buildTracks();
      return true;
    } catch (e) { return false; }
  }

  function clearVoices() {
    voiceNodes.forEach(function (vn) { try { vn.osc.stop(); } catch (e) {} });
    voiceNodes = [];
  }

  // schedule a single note
  function tone(t, f, dur, wave, peak, dest) {
    if (!f) return;
    var o = ctx.createOscillator(); o.type = wave;
    var g = ctx.createGain();
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(0.08, dur * 0.95));
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // each voice tracks its own index/time; we drive from a master beat clock
  function startMusicLoop() {
    var secPerBeat = 60 / activeTrack.bpm;
    activeTrack._voices = activeTrack.voices.map(function (vc) {
      return { vc: vc, idx: 0, t: nextNoteTime };
    });
    schedTimer = setInterval(function () {
      if (!ctx) return;
      var ahead = ctx.currentTime + 0.18;
      activeTrack._voices.forEach(function (st) {
        while (st.t < ahead) {
          var ev = st.vc.pat[st.idx];
          var f = ev[0], beats = ev[1];
          tone(st.t, f, beats * secPerBeat, st.vc.wave, st.vc.gain, musicGain);
          st.t += beats * secPerBeat;
          st.idx = (st.idx + 1) % st.vc.pat.length;
        }
      });
    }, 40);
  }

  // ---------------- public API ----------------
  var Audio = {
    unlock: function () { if (ensure() && ctx.state === 'suspended') ctx.resume(); },

    playMusic: function (name) {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (current === name && schedTimer) return;
      this.stopMusic();
      activeTrack = TRACKS[name];
      if (!activeTrack) return;
      current = name;
      nextNoteTime = ctx.currentTime + 0.06;
      startMusicLoop();
    },

    stopMusic: function () {
      if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
      clearVoices();
      current = null;
    },

    // one-shot jingle then resume previous track
    jingle: function (name, resumeTo) {
      if (!ensure()) return;
      var prev = resumeTo || current;
      this.playMusic(name);
      var ms = name === 'victory' ? 3400 : 2200;
      setTimeout(function () { if (prev && prev !== name) Audio.playMusic(prev); }, ms);
    },

    setMusicVol: function (x) { musicVol = x; if (musicGain) musicGain.gain.value = x; },
    setSfxVol: function (x) { sfxVol = x; if (sfxGain) sfxGain.gain.value = x; },
    setMuted: function (m) { muted = m; if (master) master.gain.value = m ? 0 : 1; },
    getMusicVol: function () { return musicVol; },
    getSfxVol: function () { return sfxVol; },
    isMuted: function () { return muted; },

    sfx: function (name) {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime, d = sfxGain;
      switch (name) {
        case 'select': tone(t, 740, 0.07, 'square', 0.18, d); break;
        case 'open': tone(t, 520, 0.06, 'triangle', 0.18, d); tone(t + 0.05, 780, 0.08, 'triangle', 0.16, d); break;
        case 'close': tone(t, 600, 0.06, 'triangle', 0.16, d); tone(t + 0.05, 380, 0.08, 'triangle', 0.15, d); break;
        case 'coin': tone(t, 1180, 0.05, 'square', 0.16, d); tone(t + 0.06, 1560, 0.09, 'square', 0.15, d); break;
        case 'correct':
          [['C5', 0], ['E5', 0.07], ['G5', 0.14], ['C6', 0.21]].forEach(function (n) {
            tone(t + n[1], freq(n[0]), 0.16, 'triangle', 0.2, d);
          }); break;
        case 'wrong':
          var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
          o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.3);
          g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
          o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.34); break;
        case 'hit':
          var oh = ctx.createOscillator(), gh = ctx.createGain(); oh.type = 'square';
          oh.frequency.setValueAtTime(320, t); oh.frequency.exponentialRampToValueAtTime(70, t + 0.16);
          gh.gain.setValueAtTime(0.22, t); gh.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          oh.connect(gh); gh.connect(d); oh.start(t); oh.stop(t + 0.2); break;
        case 'cast':
          [['A4', 0], ['D5', 0.05], ['A5', 0.1]].forEach(function (n) { tone(t + n[1], freq(n[0]), 0.14, 'sawtooth', 0.13, d); }); break;
        case 'heal':
          [['G4', 0], ['B4', 0.07], ['D5', 0.14], ['G5', 0.21]].forEach(function (n) { tone(t + n[1], freq(n[0]), 0.2, 'sine', 0.2, d); }); break;
        case 'levelup':
          [['C5', 0], ['E5', 0.1], ['G5', 0.2], ['C6', 0.3], ['G5', 0.42], ['C6', 0.5]].forEach(function (n) {
            tone(t + n[1], freq(n[0]), 0.22, 'square', 0.18, d);
          }); break;
        case 'defeat':
          [['G4', 0], ['F4', 0.18], ['Eb4', 0.36], ['C4', 0.56]].forEach(function (n) { tone(t + n[1], freq(n[0]), 0.4, 'triangle', 0.18, d); }); break;
        default: tone(t, 660, 0.06, 'square', 0.14, d);
      }
    }
  };

  G.Audio = Audio;
})(window.G = window.G || {});
