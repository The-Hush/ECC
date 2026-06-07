/* ============================================================
   Sprites - procedural cartoon art (hero, familiars, enemies,
   tiles, props, item icons). Stylized with dark outlines.
   ============================================================ */
(function (G) {
  'use strict';

  var OUT = '#241910';

  function path(ctx, fn, fill, stroke, lw) {
    ctx.beginPath(); fn();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke !== null) { ctx.lineWidth = lw || 2; ctx.strokeStyle = stroke || OUT; ctx.stroke(); }
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
  function circle(ctx, x, y, r) { ctx.arc(x, y, r, 0, Math.PI * 2); }
  function ellipse(ctx, x, y, rx, ry) { ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
  function shade(hex, amt) {
    var c = hex.replace('#', '');
    var n = parseInt(c, 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function eyes(ctx, cx, cy, sp, r, look) {
    look = look || 0;
    [-sp, sp].forEach(function (dx) {
      path(ctx, function () { circle(ctx, cx + dx, cy, r); }, '#fff', OUT, 1.5);
      path(ctx, function () { circle(ctx, cx + dx + look, cy + r * 0.2, r * 0.5); }, '#1a1a1a', null);
    });
  }

  /* ---------------- HERO ---------------- */
  // appearance: {skin, hair, hairColor, tunic}; equip: {weapon, helm, armor, trinket} item ids
  function drawHero(ctx, cx, cy, s, ap, facing, frame, equip) {
    ap = ap || {};
    var skin = ap.skin || '#f0c39a', hair = ap.hairColor || '#5a3a1a', tunic = ap.tunic || '#4f7a32';
    var bob = Math.sin(frame * 0.4) * (s * 0.04);
    ctx.save();
    ctx.translate(cx, cy + bob);
    if (facing === 'left') ctx.scale(-1, 1);

    // shadow
    path(ctx, function () { ellipse(ctx, 0, s * 1.18, s * 0.7, s * 0.22); }, 'rgba(0,0,0,.22)', null);

    // legs
    var step = Math.sin(frame * 0.5) * s * 0.18;
    path(ctx, function () { rr(ctx, -s * 0.42, s * 0.55, s * 0.34, s * 0.6 + step * 0.3, s * 0.12); }, '#3a2a18', OUT, 2);
    path(ctx, function () { rr(ctx, s * 0.08, s * 0.55, s * 0.34, s * 0.6 - step * 0.3, s * 0.12); }, '#3a2a18', OUT, 2);

    // body / tunic + armor tint
    var armorTint = equip && equip.armor ? shade(tunic, -10) : tunic;
    path(ctx, function () { rr(ctx, -s * 0.55, -s * 0.15, s * 1.1, s * 0.85, s * 0.22); },
      armorTint, OUT, 2.5);
    // belt
    path(ctx, function () { rr(ctx, -s * 0.55, s * 0.42, s * 1.1, s * 0.16, s * 0.05); }, '#5a3a1a', OUT, 2);
    path(ctx, function () { rr(ctx, -s * 0.1, s * 0.42, s * 0.2, s * 0.16, s * 0.04); }, '#e8b84b', OUT, 1.5);
    if (equip && equip.armor) { // pauldrons
      path(ctx, function () { circle(ctx, -s * 0.5, -s * 0.08, s * 0.2); }, '#b9c2cc', OUT, 2);
      path(ctx, function () { circle(ctx, s * 0.5, -s * 0.08, s * 0.2); }, '#b9c2cc', OUT, 2);
    }

    // arms
    path(ctx, function () { rr(ctx, -s * 0.72, -s * 0.1, s * 0.24, s * 0.6, s * 0.1); }, shade(tunic, -16), OUT, 2);
    path(ctx, function () { rr(ctx, s * 0.48, -s * 0.1, s * 0.24, s * 0.6, s * 0.1); }, shade(tunic, -16), OUT, 2);

    // head
    path(ctx, function () { circle(ctx, 0, -s * 0.5, s * 0.46); }, skin, OUT, 2.5);
    // hair styles
    if (ap.hair !== 'bald') {
      ctx.fillStyle = hair; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
      if (ap.hair === 'long') {
        path(ctx, function () { rr(ctx, -s * 0.5, -s * 0.85, s * 1.0, s * 0.9, s * 0.3); }, hair, OUT, 2);
        path(ctx, function () { circle(ctx, 0, -s * 0.5, s * 0.46); }, skin, null); // re-show face
      } else if (ap.hair === 'spiky') {
        path(ctx, function () {
          for (var i = -2; i <= 2; i++) {
            var x = i * s * 0.18;
            ctx.moveTo(x - s * 0.1, -s * 0.78); ctx.lineTo(x, -s * 1.1); ctx.lineTo(x + s * 0.1, -s * 0.78);
          }
          ctx.arc(0, -s * 0.62, s * 0.46, Math.PI, 0);
        }, hair, OUT, 2);
      } else { // short / curly default cap
        path(ctx, function () { ctx.arc(0, -s * 0.52, s * 0.48, Math.PI * 1.04, Math.PI * 1.96); }, hair, OUT, 2);
      }
    }
    // helm overrides hair top
    if (equip && equip.helm) {
      path(ctx, function () { ctx.arc(0, -s * 0.55, s * 0.5, Math.PI, 0); }, '#b9c2cc', OUT, 2.5);
      path(ctx, function () { rr(ctx, -s * 0.5, -s * 0.58, s * 1.0, s * 0.14, s * 0.04); }, '#8a96a3', OUT, 2); // brim
      path(ctx, function () { rr(ctx, -s * 0.06, -s * 0.95, s * 0.12, s * 0.3, s * 0.04); }, '#d2433a', OUT, 1.5); // plume
    }
    // face
    eyes(ctx, 0, -s * 0.48, s * 0.17, s * 0.08, facing === 'left' ? 0 : 0);
    path(ctx, function () { ctx.arc(0, -s * 0.32, s * 0.12, 0.15 * Math.PI, 0.85 * Math.PI); }, null, '#7a4a30', 2);

    // weapon
    if (equip && equip.weapon) {
      ctx.save(); ctx.translate(s * 0.62, s * 0.1); ctx.rotate(-0.3);
      path(ctx, function () { rr(ctx, -s * 0.05, -s * 0.7, s * 0.1, s * 0.55, s * 0.03); }, '#dfe6ee', OUT, 1.5); // blade
      path(ctx, function () { rr(ctx, -s * 0.14, -s * 0.18, s * 0.28, s * 0.08, s * 0.03); }, '#8a5a2c', OUT, 1.5); // guard
      path(ctx, function () { rr(ctx, -s * 0.04, -s * 0.1, s * 0.08, s * 0.2, s * 0.03); }, '#5a3a1a', OUT, 1.5); // grip
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------------- CREATURE ARCHETYPES ---------------- */
  // pal: {a,b,c}; def may carry {boss, crown, cape}
  var ARCH = {
    slime: function (ctx, s, p, t, def) {
      var squash = 1 + Math.sin(t * 4) * 0.06;
      path(ctx, function () { ellipse(ctx, 0, s * 1.0, s * 0.85, s * 0.2); }, 'rgba(0,0,0,.2)', null);
      ctx.save(); ctx.scale(1 / squash, squash);
      path(ctx, function () {
        ctx.moveTo(-s, s * 0.7);
        ctx.bezierCurveTo(-s * 1.05, -s * 0.5, -s * 0.4, -s, 0, -s);
        ctx.bezierCurveTo(s * 0.4, -s, s * 1.05, -s * 0.5, s, s * 0.7);
        ctx.bezierCurveTo(s * 0.6, s * 0.95, -s * 0.6, s * 0.95, -s, s * 0.7);
      }, p.a, OUT, 2.5);
      path(ctx, function () { ellipse(ctx, -s * 0.3, -s * 0.3, s * 0.22, s * 0.14); }, 'rgba(255,255,255,.45)', null);
      ctx.restore();
      eyes(ctx, 0, -s * 0.05, s * 0.3, s * 0.16);
      path(ctx, function () { ctx.arc(0, s * 0.2, s * 0.22, 0.1 * Math.PI, 0.9 * Math.PI); }, null, OUT, 2);
      if (def && def.crown) {
        path(ctx, function () {
          ctx.moveTo(-s * 0.5, -s * 0.78); ctx.lineTo(-s * 0.35, -s * 1.05); ctx.lineTo(-s * 0.18, -s * 0.82);
          ctx.lineTo(0, -s * 1.12); ctx.lineTo(s * 0.18, -s * 0.82); ctx.lineTo(s * 0.35, -s * 1.05);
          ctx.lineTo(s * 0.5, -s * 0.78); ctx.closePath();
        }, '#e8b84b', OUT, 2);
      }
    },
    imp: function (ctx, s, p, t) {
      var fl = Math.sin(t * 8) * s * 0.1;
      path(ctx, function () { ellipse(ctx, 0, s * 0.95, s * 0.5, s * 0.14); }, 'rgba(0,0,0,.2)', null);
      // wings
      [-1, 1].forEach(function (d) {
        path(ctx, function () {
          ctx.moveTo(d * s * 0.3, -s * 0.1);
          ctx.quadraticCurveTo(d * s * 1.1, -s * 0.5 + fl, d * s * 0.9, s * 0.3 + fl);
          ctx.quadraticCurveTo(d * s * 0.6, s * 0.0, d * s * 0.3, -s * 0.1);
        }, shade(p.b, -10), OUT, 2);
      });
      path(ctx, function () { ellipse(ctx, 0, 0, s * 0.5, s * 0.55); }, p.a, OUT, 2.5);
      // horns
      [-1, 1].forEach(function (d) {
        path(ctx, function () { ctx.moveTo(d * s * 0.25, -s * 0.45); ctx.lineTo(d * s * 0.45, -s * 0.85); ctx.lineTo(d * s * 0.12, -s * 0.5); ctx.closePath(); }, p.c, OUT, 1.5);
      });
      eyes(ctx, 0, -s * 0.05, s * 0.18, s * 0.1);
      path(ctx, function () { ctx.moveTo(-s * 0.12, s * 0.28); ctx.lineTo(s * 0.12, s * 0.28); ctx.lineTo(0, s * 0.42); ctx.closePath(); }, '#fff', OUT, 1);
      // tail
      path(ctx, function () { ctx.moveTo(s * 0.3, s * 0.4); ctx.quadraticCurveTo(s * 0.7, s * 0.6, s * 0.6, s * 0.1); }, null, p.c, 3);
    },
    wisp: function (ctx, s, p, t) {
      var g = Math.sin(t * 5) * 0.1;
      ctx.save(); ctx.globalAlpha = 0.5;
      path(ctx, function () { circle(ctx, 0, 0, s * (0.95 + g)); }, p.c, null);
      ctx.restore();
      path(ctx, function () { circle(ctx, 0, 0, s * 0.55); }, p.a, OUT, 2);
      path(ctx, function () { circle(ctx, 0, 0, s * 0.3); }, shade(p.a, 50), null);
      // flame tails
      for (var i = -1; i <= 1; i++) {
        path(ctx, function () {
          ctx.moveTo(i * s * 0.3, s * 0.4);
          ctx.quadraticCurveTo(i * s * 0.3 + Math.sin(t * 6 + i) * s * 0.15, s * 0.9, i * s * 0.3, s * 0.5);
        }, p.b, null);
      }
      eyes(ctx, 0, -s * 0.05, s * 0.16, s * 0.08);
    },
    golem: function (ctx, s, p, t) {
      path(ctx, function () { ellipse(ctx, 0, s * 1.05, s * 0.7, s * 0.16); }, 'rgba(0,0,0,.2)', null);
      path(ctx, function () { rr(ctx, -s * 0.65, -s * 0.5, s * 1.3, s * 1.4, s * 0.18); }, p.a, OUT, 2.5);
      // cracks / core
      var glow = 0.6 + Math.sin(t * 3) * 0.3;
      ctx.save(); ctx.globalAlpha = glow;
      path(ctx, function () { circle(ctx, 0, s * 0.2, s * 0.22); }, p.c, null);
      ctx.restore();
      path(ctx, function () { rr(ctx, -s * 0.9, -s * 0.3, s * 0.28, s * 0.8, s * 0.1); }, shade(p.a, -16), OUT, 2);
      path(ctx, function () { rr(ctx, s * 0.62, -s * 0.3, s * 0.28, s * 0.8, s * 0.1); }, shade(p.a, -16), OUT, 2);
      eyes(ctx, 0, -s * 0.2, s * 0.22, s * 0.1);
    },
    beast: function (ctx, s, p, t) {
      var step = Math.sin(t * 6) * s * 0.08;
      path(ctx, function () { ellipse(ctx, 0, s * 0.95, s * 0.8, s * 0.16); }, 'rgba(0,0,0,.2)', null);
      // legs
      [-0.5, 0.5].forEach(function (d) {
        path(ctx, function () { rr(ctx, d * s - s * 0.1, s * 0.4, s * 0.2, s * 0.5 + (d > 0 ? step : -step), s * 0.06); }, shade(p.a, -18), OUT, 1.5);
      });
      path(ctx, function () { ellipse(ctx, 0, s * 0.2, s * 0.75, s * 0.5); }, p.a, OUT, 2.5);
      // tail
      path(ctx, function () { ctx.moveTo(s * 0.6, s * 0.2); ctx.quadraticCurveTo(s * 1.1, s * 0.0 + Math.sin(t * 5) * s * 0.1, s * 0.95, s * 0.4); }, null, p.a, 5);
      // head
      path(ctx, function () { circle(ctx, -s * 0.55, -s * 0.1, s * 0.42); }, p.a, OUT, 2.5);
      // ears
      [-0.2, 0.25].forEach(function (d) {
        path(ctx, function () { ctx.moveTo(-s * 0.65 + d * s, -s * 0.4); ctx.lineTo(-s * 0.6 + d * s, -s * 0.75); ctx.lineTo(-s * 0.45 + d * s, -s * 0.42); ctx.closePath(); }, p.b, OUT, 1.5);
      });
      eyes(ctx, -s * 0.55, -s * 0.12, s * 0.13, s * 0.08);
      path(ctx, function () { ellipse(ctx, -s * 0.85, -s * 0.02, s * 0.08, s * 0.06); }, '#222', OUT, 1);
    },
    critter: function (ctx, s, p, t) { // small friendly familiar
      var bob = Math.sin(t * 5) * s * 0.05;
      ctx.translate(0, bob);
      path(ctx, function () { ellipse(ctx, 0, s * 0.9, s * 0.55, s * 0.13); }, 'rgba(0,0,0,.2)', null);
      path(ctx, function () { ellipse(ctx, 0, s * 0.2, s * 0.55, s * 0.5); }, p.a, OUT, 2.5);
      path(ctx, function () { circle(ctx, 0, -s * 0.35, s * 0.42); }, p.a, OUT, 2.5);
      // ears
      [-1, 1].forEach(function (d) {
        path(ctx, function () { ctx.moveTo(d * s * 0.2, -s * 0.6); ctx.lineTo(d * s * 0.42, -s * 1.0); ctx.lineTo(d * s * 0.05, -s * 0.62); ctx.closePath(); }, p.a, OUT, 1.5);
        path(ctx, function () { ctx.moveTo(d * s * 0.2, -s * 0.62); ctx.lineTo(d * s * 0.33, -s * 0.85); ctx.lineTo(d * s * 0.1, -s * 0.62); ctx.closePath(); }, p.b, null); });
      // belly
      path(ctx, function () { ellipse(ctx, 0, s * 0.25, s * 0.3, s * 0.34); }, shade(p.a, 40), null);
      eyes(ctx, 0, -s * 0.35, s * 0.16, s * 0.09);
      path(ctx, function () { circle(ctx, 0, -s * 0.2, s * 0.05); }, '#c0506a', OUT, 1);
      // accent gem
      path(ctx, function () { ctx.moveTo(0, -s * 0.62); ctx.lineTo(s * 0.1, -s * 0.5); ctx.lineTo(0, -s * 0.38); ctx.lineTo(-s * 0.1, -s * 0.5); ctx.closePath(); }, p.c, OUT, 1.5);
    },
    dragon: function (ctx, s, p, t, def) {
      path(ctx, function () { ellipse(ctx, 0, s * 1.05, s * 0.9, s * 0.18); }, 'rgba(0,0,0,.2)', null);
      // wings
      [-1, 1].forEach(function (d) {
        var f = Math.sin(t * 4) * s * 0.12;
        path(ctx, function () {
          ctx.moveTo(d * s * 0.2, -s * 0.2);
          ctx.quadraticCurveTo(d * s * 1.3, -s * 0.7 - f, d * s * 1.1, s * 0.4 + f);
          ctx.quadraticCurveTo(d * s * 0.7, s * 0.0, d * s * 0.2, -s * 0.2);
        }, shade(p.b, -8), OUT, 2);
      });
      path(ctx, function () { ellipse(ctx, 0, s * 0.25, s * 0.6, s * 0.55); }, p.a, OUT, 2.5);
      path(ctx, function () { ellipse(ctx, 0, s * 0.3, s * 0.32, s * 0.36); }, shade(p.a, 30), null);
      // neck + head
      path(ctx, function () { rr(ctx, -s * 0.2, -s * 0.8, s * 0.4, s * 0.6, s * 0.15); }, p.a, OUT, 2);
      path(ctx, function () { ellipse(ctx, 0, -s * 0.85, s * 0.42, s * 0.34); }, p.a, OUT, 2.5);
      // horns
      [-1, 1].forEach(function (d) {
        path(ctx, function () { ctx.moveTo(d * s * 0.25, -s * 1.05); ctx.lineTo(d * s * 0.45, -s * 1.4); ctx.lineTo(d * s * 0.1, -s * 1.1); ctx.closePath(); }, p.c, OUT, 1.5);
      });
      eyes(ctx, 0, -s * 0.85, s * 0.16, s * 0.09);
      // tail
      path(ctx, function () { ctx.moveTo(s * 0.4, s * 0.5); ctx.quadraticCurveTo(s * 1.2, s * 0.7, s * 1.0, s * 0.1); }, null, p.a, 6);
    },
    mage: function (ctx, s, p, t, def) { // robed humanoid (witch / wizard / king)
      path(ctx, function () { ellipse(ctx, 0, s * 1.05, s * 0.6, s * 0.15); }, 'rgba(0,0,0,.2)', null);
      // robe
      path(ctx, function () {
        ctx.moveTo(-s * 0.15, -s * 0.25); ctx.lineTo(-s * 0.65, s * 0.95);
        ctx.lineTo(s * 0.65, s * 0.95); ctx.lineTo(s * 0.15, -s * 0.25); ctx.closePath();
      }, p.a, OUT, 2.5);
      path(ctx, function () { rr(ctx, -s * 0.06, -s * 0.1, s * 0.12, s * 1.0, s * 0.03); }, shade(p.a, -20), null);
      // head
      path(ctx, function () { circle(ctx, 0, -s * 0.42, s * 0.26); }, '#ecc39a', OUT, 2); // face
      eyes(ctx, 0, -s * 0.42, s * 0.1, s * 0.05);
      // hat / crown
      if (def && def.crown) {
        path(ctx, function () {
          ctx.moveTo(-s * 0.3, -s * 0.62); ctx.lineTo(-s * 0.2, -s * 0.92); ctx.lineTo(-s * 0.07, -s * 0.66);
          ctx.lineTo(0, -s * 0.98); ctx.lineTo(s * 0.07, -s * 0.66); ctx.lineTo(s * 0.2, -s * 0.92);
          ctx.lineTo(s * 0.3, -s * 0.62); ctx.closePath();
        }, '#e8b84b', OUT, 2);
      } else {
        path(ctx, function () { ctx.moveTo(-s * 0.34, -s * 0.6); ctx.lineTo(0, -s * 1.3); ctx.lineTo(s * 0.34, -s * 0.6); ctx.closePath(); }, p.b, OUT, 2); // pointy hat
        path(ctx, function () { ellipse(ctx, 0, -s * 0.58, s * 0.42, s * 0.1); }, p.b, OUT, 2); // brim
      }
      // staff
      ctx.save(); ctx.translate(s * 0.55, s * 0.1);
      path(ctx, function () { rr(ctx, -s * 0.04, -s * 0.7, s * 0.08, s * 1.3, s * 0.03); }, '#7a4a1f', OUT, 1.5);
      var glow = 0.6 + Math.sin(t * 4) * 0.3; ctx.globalAlpha = glow;
      path(ctx, function () { circle(ctx, 0, -s * 0.78, s * 0.16); }, p.c, OUT, 1.5);
      ctx.restore();
    },
    bug: function (ctx, s, p, t) {
      path(ctx, function () { ellipse(ctx, 0, s * 0.95, s * 0.6, s * 0.14); }, 'rgba(0,0,0,.2)', null);
      // legs
      ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
      for (var i = -1; i <= 1; i++) {
        [-1, 1].forEach(function (d) { ctx.beginPath(); ctx.moveTo(d * s * 0.3, s * 0.1 + i * s * 0.2); ctx.lineTo(d * s * 0.75, s * 0.3 + i * s * 0.22); ctx.stroke(); });
      }
      path(ctx, function () { ellipse(ctx, 0, s * 0.15, s * 0.55, s * 0.6); }, p.a, OUT, 2.5); // shell
      path(ctx, function () { ctx.moveTo(0, -s * 0.45); ctx.lineTo(0, s * 0.7); }, null, OUT, 2);
      path(ctx, function () { circle(ctx, 0, -s * 0.5, s * 0.3); }, shade(p.a, -20), OUT, 2); // head
      // antennae
      [-1, 1].forEach(function (d) { path(ctx, function () { ctx.moveTo(d * s * 0.12, -s * 0.7); ctx.quadraticCurveTo(d * s * 0.4, -s * 1.0, d * s * 0.25, -s * 0.6); }, null, OUT, 2); });
      eyes(ctx, 0, -s * 0.5, s * 0.12, s * 0.06);
      // accent spots
      [-0.25, 0.25].forEach(function (d) { path(ctx, function () { circle(ctx, d * s, s * 0.15, s * 0.1); }, p.c, OUT, 1.5); });
    },
    fungus: function (ctx, s, p, t) {
      var bob = Math.sin(t * 3) * s * 0.04;
      path(ctx, function () { ellipse(ctx, 0, s * 0.95, s * 0.55, s * 0.14); }, 'rgba(0,0,0,.2)', null);
      path(ctx, function () { rr(ctx, -s * 0.28, s * 0.0, s * 0.56, s * 0.8, s * 0.16); }, '#f0e6cf', OUT, 2.5); // stalk
      ctx.save(); ctx.translate(0, bob);
      path(ctx, function () { ctx.moveTo(-s * 0.7, s * 0.05); ctx.quadraticCurveTo(0, -s * 0.95, s * 0.7, s * 0.05); ctx.quadraticCurveTo(0, s * 0.2, -s * 0.7, s * 0.05); }, p.a, OUT, 2.5); // cap
      [[-0.35, -0.2, 0.14], [0.3, -0.35, 0.1], [0.05, -0.5, 0.12], [-0.1, -0.1, 0.09]].forEach(function (q) {
        path(ctx, function () { circle(ctx, q[0] * s, q[1] * s, q[2] * s); }, p.c, OUT, 1.5);
      });
      ctx.restore();
      eyes(ctx, 0, s * 0.35, s * 0.14, s * 0.07);
      path(ctx, function () { ctx.arc(0, s * 0.45, s * 0.12, 0.1 * Math.PI, 0.9 * Math.PI); }, null, OUT, 1.5);
    },
    bird: function (ctx, s, p, t) {
      var f = Math.sin(t * 7) * s * 0.18;
      path(ctx, function () { ellipse(ctx, 0, s * 0.9, s * 0.5, s * 0.12); }, 'rgba(0,0,0,.2)', null);
      [-1, 1].forEach(function (d) {
        path(ctx, function () {
          ctx.moveTo(d * s * 0.2, -s * 0.1);
          ctx.quadraticCurveTo(d * s * 1.0, -s * 0.4 - f, d * s * 0.85, s * 0.2 - f);
          ctx.quadraticCurveTo(d * s * 0.5, s * 0.0, d * s * 0.2, -s * 0.1);
        }, p.b, OUT, 2);
      });
      path(ctx, function () { ellipse(ctx, 0, s * 0.15, s * 0.45, s * 0.5); }, p.a, OUT, 2.5);
      path(ctx, function () { circle(ctx, 0, -s * 0.4, s * 0.3); }, p.a, OUT, 2.5);
      path(ctx, function () { ctx.moveTo(-s * 0.05, -s * 0.4); ctx.lineTo(-s * 0.35, -s * 0.3); ctx.lineTo(-s * 0.05, -s * 0.22); ctx.closePath(); }, '#e8b84b', OUT, 1.5); // beak
      // crest
      path(ctx, function () { ctx.moveTo(0, -s * 0.6); ctx.lineTo(s * 0.1, -s * 0.95); ctx.lineTo(s * 0.2, -s * 0.6); }, p.c, OUT, 1.5);
      eyes(ctx, s * 0.02, -s * 0.42, s * 0.1, s * 0.06);
    }
  };
  // fix skeleton (multi-statement) as a proper function
  ARCH.skeleton = function (ctx, s, p, t, def) {
    path(ctx, function () { ellipse(ctx, 0, s * 1.0, s * 0.55, s * 0.15); }, 'rgba(0,0,0,.2)', null);
    if (def && def.cape) {
      path(ctx, function () { ctx.moveTo(-s * 0.4, -s * 0.5); ctx.lineTo(-s * 0.75, s * 0.85); ctx.lineTo(s * 0.75, s * 0.85); ctx.lineTo(s * 0.4, -s * 0.5); ctx.closePath(); }, '#5b1d1d', OUT, 2);
    }
    path(ctx, function () { rr(ctx, -s * 0.34, s * 0.0, s * 0.68, s * 0.6, s * 0.12); }, '#ece6d6', OUT, 2.5); // ribs
    ctx.strokeStyle = OUT; ctx.lineWidth = 1.5;
    for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.16 + i * s * 0.15); ctx.lineTo(s * 0.3, s * 0.16 + i * s * 0.15); ctx.stroke(); }
    path(ctx, function () { rr(ctx, -s * 0.62, s * 0.02, s * 0.16, s * 0.55, s * 0.06); }, '#ece6d6', OUT, 1.5);
    path(ctx, function () { rr(ctx, s * 0.46, s * 0.02, s * 0.16, s * 0.55, s * 0.06); }, '#ece6d6', OUT, 1.5);
    // skull
    path(ctx, function () { circle(ctx, 0, -s * 0.42, s * 0.4); }, '#f3eedd', OUT, 2.5);
    path(ctx, function () { rr(ctx, -s * 0.18, -s * 0.18, s * 0.36, s * 0.18, s * 0.05); }, '#f3eedd', OUT, 1.5); // jaw
    [-1, 1].forEach(function (d) { path(ctx, function () { ellipse(ctx, d * s * 0.16, -s * 0.45, s * 0.1, s * 0.12); }, '#1a1a1a', OUT, 1); });
    var gl = def && def.boss ? '#9be0ff' : null;
    if (gl) { [-1, 1].forEach(function (d) { ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(t * 5) * 0.3; path(ctx, function () { circle(ctx, d * s * 0.16, -s * 0.45, s * 0.06); }, gl, null); ctx.restore(); }); }
    path(ctx, function () { ctx.moveTo(-s * 0.05, -s * 0.4); ctx.lineTo(s * 0.05, -s * 0.4); ctx.lineTo(0, -s * 0.28); ctx.closePath(); }, '#1a1a1a', null);
    if (def && def.crown) {
      path(ctx, function () {
        ctx.moveTo(-s * 0.42, -s * 0.7); ctx.lineTo(-s * 0.28, -s * 0.98); ctx.lineTo(-s * 0.14, -s * 0.74);
        ctx.lineTo(0, -s * 1.04); ctx.lineTo(s * 0.14, -s * 0.74); ctx.lineTo(s * 0.28, -s * 0.98);
        ctx.lineTo(s * 0.42, -s * 0.7); ctx.closePath();
      }, '#e8b84b', OUT, 2);
    }
  };

  function drawCreature(ctx, cx, cy, s, def, t) {
    var fn = ARCH[def.kind] || ARCH.slime;
    var pal = def.pal || { a: '#7aa84a', b: '#4f7a32', c: '#cfe89a' };
    ctx.save(); ctx.translate(cx, cy);
    if (def.faceLeft) ctx.scale(-1, 1);
    fn(ctx, s, pal, t || 0, def);
    ctx.restore();
  }

  /* ---------------- ITEM ICONS ---------------- */
  function drawItem(ctx, cx, cy, s, item) {
    ctx.save(); ctx.translate(cx, cy);
    var k = item.icon || item.slot || 'misc';
    if (k === 'potion') {
      path(ctx, function () { rr(ctx, -s * 0.4, -s * 0.3, s * 0.8, s * 0.85, s * 0.18); }, item.color || '#d2433a', OUT, 2);
      path(ctx, function () { rr(ctx, -s * 0.18, -s * 0.6, s * 0.36, s * 0.32, s * 0.06); }, '#cbb38a', OUT, 2); // cork
      path(ctx, function () { ellipse(ctx, -s * 0.15, s * 0.05, s * 0.12, s * 0.18); }, 'rgba(255,255,255,.5)', null);
    } else if (k === 'weapon') {
      path(ctx, function () { rr(ctx, -s * 0.08, -s * 0.6, s * 0.16, s * 0.8, s * 0.04); }, '#dfe6ee', OUT, 2);
      path(ctx, function () { rr(ctx, -s * 0.3, s * 0.18, s * 0.6, s * 0.12, s * 0.04); }, item.color || '#8a5a2c', OUT, 2);
      path(ctx, function () { rr(ctx, -s * 0.07, s * 0.28, s * 0.14, s * 0.32, s * 0.04); }, '#5a3a1a', OUT, 2);
    } else if (k === 'helm') {
      path(ctx, function () { ctx.arc(0, 0, s * 0.5, Math.PI, 0); }, item.color || '#b9c2cc', OUT, 2);
      path(ctx, function () { rr(ctx, -s * 0.5, -s * 0.04, s * 1.0, s * 0.16, s * 0.05); }, '#8a96a3', OUT, 2);
      path(ctx, function () { rr(ctx, -s * 0.05, -s * 0.6, s * 0.1, s * 0.3, s * 0.03); }, '#d2433a', OUT, 1.5);
    } else if (k === 'armor') {
      path(ctx, function () { ctx.moveTo(-s * 0.45, -s * 0.4); ctx.lineTo(s * 0.45, -s * 0.4); ctx.lineTo(s * 0.4, s * 0.45); ctx.lineTo(0, s * 0.6); ctx.lineTo(-s * 0.4, s * 0.45); ctx.closePath(); }, item.color || '#9aa7b2', OUT, 2);
      path(ctx, function () { ctx.moveTo(0, -s * 0.4); ctx.lineTo(0, s * 0.5); }, null, OUT, 2);
    } else if (k === 'trinket') {
      path(ctx, function () { circle(ctx, 0, 0, s * 0.42); }, item.color || '#e8b84b', OUT, 2);
      path(ctx, function () { ctx.moveTo(0, -s * 0.18); ctx.lineTo(s * 0.18, 0); ctx.lineTo(0, s * 0.2); ctx.lineTo(-s * 0.18, 0); ctx.closePath(); }, '#fff', OUT, 1.5);
    } else {
      path(ctx, function () { rr(ctx, -s * 0.4, -s * 0.4, s * 0.8, s * 0.8, s * 0.1); }, '#cbb38a', OUT, 2);
    }
    ctx.restore();
  }

  /* ---------------- icon canvas helpers ---------------- */
  function makeCanvas(px) { var c = document.createElement('canvas'); c.width = px; c.height = px; return c; }
  function creatureIcon(def, px) {
    px = px || 46; var c = makeCanvas(px); var ctx = c.getContext('2d');
    drawCreature(ctx, px / 2, px / 2 + px * 0.06, px * 0.33, def, 0); return c;
  }
  function heroIcon(ap, equip, px) {
    px = px || 50; var c = makeCanvas(px); var ctx = c.getContext('2d');
    drawHero(ctx, px / 2, px * 0.42, px * 0.3, ap, 'down', 0, equip); return c;
  }
  function itemIcon(item, px) {
    px = px || 46; var c = makeCanvas(px); var ctx = c.getContext('2d');
    drawItem(ctx, px / 2, px / 2, px * 0.42, item); return c;
  }

  G.Sprites = {
    OUT: OUT, path: path, rr: rr, circle: circle, ellipse: ellipse, shade: shade,
    drawHero: drawHero, drawCreature: drawCreature, drawItem: drawItem,
    creatureIcon: creatureIcon, heroIcon: heroIcon, itemIcon: itemIcon
  };
})(window.G = window.G || {});
