/*
 * The hero: a planet crosses its star while the line beneath records the star's brightness.
 *
 * The curve is not a drawing of a dip. Each point is the share of the star's disc the planet
 * covers, computed from the same two circles the SVG draws, so ingress, the flat floor and egress
 * all fall out of the geometry. Uniform-disc model: a real star is darker toward its edge, which
 * rounds the floor of a real dip; this one stays flat, like the curve on the app icon.
 */
(function () {
  'use strict';

  var svg = document.querySelector('[data-transit]');
  if (!svg) return;

  // These mirror the markup in index.html (viewBox 0 0 640 620). Change one, change both.
  var CX = 320, CY = 250, R = 190; // star
  var P = 28.5, PY = 164.5; // planet radius, and the height of its path across the disc
  var X0 = 40, X1 = 600; // where a pass starts and ends
  var BASE = 520; // y of full brightness
  var DIP = 56; // drawn depth of the full dip
  var FULL = (P * P) / (R * R); // 2.25%: the share of the disc a planet this size can cover

  var PASS_MS = 8000, HOLD_MS = 1600, FADE_MS = 700;
  var LOOP_MS = PASS_MS + HOLD_MS + FADE_MS;
  var STATIC_X = 270; // where the planet sits in the markup, mid-transit

  /** Fraction of the star's light blocked with the planet's centre at x. */
  function blocked(x) {
    var d = Math.sqrt((x - CX) * (x - CX) + (PY - CY) * (PY - CY));
    if (d >= R + P) return 0;
    if (d <= R - P) return FULL;
    // The lens where two circles overlap.
    var a = P * P * Math.acos((d * d + P * P - R * R) / (2 * d * P));
    var b = R * R * Math.acos((d * d + R * R - P * P) / (2 * d * R));
    var c = 0.5 * Math.sqrt((-d + P + R) * (d + P - R) * (d - P + R) * (d + P + R));
    return (a + b - c) / (Math.PI * R * R);
  }

  function curveY(x) {
    return BASE + (blocked(x) / FULL) * DIP;
  }

  /** The whole light curve, keeping only the ends of flat runs so the path stays short. */
  function curvePath() {
    var pts = [];
    for (var x = X0; x <= X1; x++) pts.push([x, curveY(x)]);
    var d = 'M' + X0 + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var flatBefore = Math.abs(pts[i][1] - pts[i - 1][1]) < 0.01;
      var flatAfter = i + 1 < pts.length && Math.abs(pts[i + 1][1] - pts[i][1]) < 0.01;
      if (flatBefore && flatAfter) continue;
      d += 'L' + pts[i][0] + ' ' + pts[i][1].toFixed(1);
    }
    return d;
  }

  var planet = svg.querySelector('[data-planet]');
  var drawn = svg.querySelector('[data-drawn]');
  var trace = svg.querySelector('[data-curve]');
  var ghost = svg.querySelector('[data-ghost]');
  var pen = svg.querySelector('[data-pen]');

  var path = curvePath();
  trace.setAttribute('d', path);
  ghost.setAttribute('d', path);

  // Reduced motion keeps the markup's still frame: the planet mid-transit, the whole curve drawn.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function render(t) {
    var k = Math.min(t / PASS_MS, 1);
    var x = X0 + (X1 - X0) * k;
    var fade = t > PASS_MS + HOLD_MS ? 1 - (t - PASS_MS - HOLD_MS) / FADE_MS : 1;
    planet.setAttribute('cx', x.toFixed(2));
    drawn.setAttribute('width', x.toFixed(2));
    pen.setAttribute('cx', x.toFixed(2));
    pen.setAttribute('cy', curveY(x).toFixed(2));
    trace.style.opacity = fade;
    pen.style.opacity = fade;
  }

  // Start where the still frame left the planet, so the first animated frame doesn't jump.
  var elapsed = ((STATIC_X - X0) / (X1 - X0)) * PASS_MS;
  var last = null;
  var raf = 0;

  function frame(now) {
    // Clamp the step: after the tab was hidden, carry on rather than leap ahead.
    if (last !== null) elapsed = (elapsed + Math.min(now - last, 100)) % LOOP_MS;
    last = now;
    render(elapsed);
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    last = null;
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    window.cancelAnimationFrame(raf);
    raf = 0;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start();
      else stop();
    }).observe(svg);
  } else {
    start();
  }
})();
