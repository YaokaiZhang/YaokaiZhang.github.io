// Ink-wash backdrop carried over from the first version of the site: a domain-warped mist,
// distant mountains and a pale sun in one fragment shader, plus a generated paper-fibre tile.
// One backdrop for the whole site, with a fixed tint; it follows the light/dark theme.

export function initInk() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- paper tiles (CSS vars, used as repeating backgrounds) ---------- */
  function tile(size, fill) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    fill(x, size);
    return `url(${c.toDataURL('image/png')})`;
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  root.style.setProperty('--tile-fibre', tile(640, (x, s) => {
    const img = x.createImageData(s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = 70; img.data[i + 1] = 62; img.data[i + 2] = 52;
      img.data[i + 3] = Math.random() < 0.5 ? 0 : Math.random() * 10;
    }
    x.putImageData(img, 0, 0);
    x.lineCap = 'round';
    for (let i = 0; i < 300; i++) {                      // fibres
      const px = rnd(0, s), py = rnd(0, s), len = rnd(10, 46), a = rnd(0, Math.PI * 2), bend = rnd(-0.6, 0.6);
      x.strokeStyle = `rgba(${90 + (Math.random() * 40) | 0},${78 + (Math.random() * 30) | 0},62,${rnd(0.03, 0.09)})`;
      x.lineWidth = rnd(0.4, 1.1);
      x.beginPath(); x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a + bend) * len * 0.5, py + Math.sin(a + bend) * len * 0.5, px + Math.cos(a) * len, py + Math.sin(a) * len);
      x.stroke();
    }
    for (let i = 0; i < 160; i++) {                      // flecks
      x.fillStyle = `rgba(70,58,44,${rnd(0.06, 0.22)})`;
      x.beginPath(); x.arc(rnd(0, s), rnd(0, s), rnd(0.4, 1.1), 0, Math.PI * 2); x.fill();
    }
  }));

  root.style.setProperty('--tile-light', tile(320, (x, s) => {
    const img = x.createImageData(s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.random() < 0.6 ? 0 : Math.random() * 20;
    }
    x.putImageData(img, 0, 0);
  }));

  /* ---------- WebGL ---------- */
  const canvas = document.getElementById('ink');
  const darkQ = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : darkQ.matches);
  const api = { paused: false, setTint() {}, redraw() {} };
  const gl = canvas && canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { document.body.classList.add('no-gl'); return api; }

  const FRAG = `
precision highp float;
uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse; uniform vec3 u_tint; uniform float u_dark;

vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm3(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { v += a * snoise(p); p *= 2.0; a *= 0.5; } return v; }
float fbm4(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.0; a *= 0.5; } return v; }
float ridge(float x, float seed, float t){
  return snoise(vec2(x*1.6 + seed*7.3 + t*3.0, seed)) * 0.5
       + snoise(vec2(x*3.9 + seed*2.1 - t*2.0, seed*1.3)) * 0.25
       + snoise(vec2(x*9.0 + seed, seed*0.7)) * 0.08;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 st = vec2(uv.x * asp, uv.y);
  float t = u_time * 0.02;
  vec2 p = st * 0.62;

  vec2 q = vec2(fbm3(p + t), fbm3(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm3(p + 1.6*q + vec2(1.7, 9.2) + 0.6*t), fbm3(p + 1.6*q + vec2(8.3, 2.8) - 0.5*t));
  float f = fbm4(p + 1.5*r);

  // light: warm paper and black ink; dark: night paper and pale ink
  vec3 paper = mix(vec3(0.957, 0.949, 0.925), vec3(0.071, 0.075, 0.086), u_dark);
  vec3 mist  = mix(vec3(0.865, 0.875, 0.850), vec3(0.110, 0.118, 0.137), u_dark);
  vec3 slate = mix(vec3(0.740, 0.750, 0.730), vec3(0.180, 0.192, 0.220), u_dark);
  vec3 ink   = mix(vec3(0.165, 0.161, 0.153), vec3(0.780, 0.800, 0.860), u_dark);
  vec3 hi    = mix(vec3(1.0), vec3(0.16, 0.17, 0.20), u_dark);
  vec3 tint  = mix(u_tint, hi, 0.55);

  vec3 col = mix(paper, mist, smoothstep(0.0, 0.55, f*f*2.2) * 0.55);
  col = mix(col, slate, clamp(length(q)*0.5, 0.0, 1.0) * 0.14);
  col = mix(col, tint, smoothstep(0.2, 0.8, length(r)) * 0.2);
  col = mix(col, hi, smoothstep(0.6, 1.0, f) * 0.3);

  // light: a pale red sun; dark: a crescent moon with a faint halo. Edges bled by noise.
  vec2 sc = vec2(asp*0.80, 0.745);
  float wob = snoise(st*7.0 + t*5.0) * 0.005;
  float sd = length(st - sc) + wob;
  float disc = smoothstep(0.085, 0.078, sd);
  col = mix(col, vec3(0.70, 0.22, 0.22), disc * 0.085 * (1.0 - u_dark));
  float md = length(st - sc) + wob;
  float moon = smoothstep(0.062, 0.056, md) * smoothstep(0.052, 0.060, length(st - sc - vec2(0.026, 0.014)) + wob);
  float halo = exp(-pow(md / 0.16, 2.0)) * 0.035;
  col = mix(col, vec3(0.86, 0.88, 0.93), (moon * 0.26 + halo) * u_dark);

  // distant mountains, far to near, each cut by a band of mist
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float y = 0.36 - fi*0.085 + ridge(st.x, fi + 1.0, t) * (0.07 + fi*0.012);
    float soft = 0.004 + (3.0 - fi) * 0.003;
    float m = smoothstep(y + soft, y - soft, uv.y);
    float foot = mix(0.25, 1.0, smoothstep(y - 0.20, y, uv.y));
    float streak = 0.92 + 0.08 * snoise(vec2(st.x*6.0 + uv.y*3.0, uv.y*2.0 + fi*3.0));
    col = mix(col, ink, (0.05 + 0.035*fi) * m * foot * streak);
    float band = exp(-pow((uv.y - (y - 0.09)) / 0.05, 2.0)) * (0.35 + 0.2*snoise(vec2(st.x*1.5 + t*8.0, fi)));
    col = mix(col, paper, band * 0.55 * m);
  }

  // a drop of ink that follows the pointer
  vec2 d = (uv - u_mouse) * vec2(asp, 1.0);
  float k = exp(-dot(d, d) * 26.0) * (0.55 + 0.45*snoise(st*6.0 + t*4.0));
  col = mix(col, ink, k * 0.08);

  col *= 1.0 - 0.07 * pow(length(uv - 0.5) * 1.25, 2.0);
  gl_FragColor = vec4(col, 1.0);
}`;

  function sh(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }');
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { document.body.classList.add('no-gl'); return api; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uTime = U('u_time'), uRes = U('u_res'), uMouse = U('u_mouse'), uTint = U('u_tint'), uDark = U('u_dark');

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  let tint = hex('#9aa5c8'), tintT = tint.slice();
  let mouse = [-1, -1], mouseT = [-1, -1];
  api.setTint = (h) => { tintT = hex(h); if (reduce) { tint = tintT.slice(); draw(); } };

  function resize() {
    const w = innerWidth, h = innerHeight;
    // pixel budget: this is mist, it does not need device resolution
    const scale = Math.min(1, Math.sqrt(1.15e6 / (w * h)));
    canvas.width = Math.max(2, Math.round(w * scale));
    canvas.height = Math.max(2, Math.round(h * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    draw();
  }

  let t0 = performance.now(), frozen = 0;
  function draw() {
    const now = reduce ? frozen : (performance.now() - t0) / 1000;
    gl.uniform1f(uTime, now + 40);
    gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uDark, isDark() ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  api.redraw = draw;
  darkQ.addEventListener('change', draw);
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouseT = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; if (mouse[0] < 0) mouse = mouseT.slice(); });
  resize();
  if (reduce) return api;

  let last = 0;
  (function loop(now) {
    requestAnimationFrame(loop);
    if (api.paused || document.hidden || now - last < 33) return;   // ~30fps is plenty for slow mist
    last = now;
    for (let i = 0; i < 3; i++) tint[i] += (tintT[i] - tint[i]) * 0.04;
    mouse[0] += (mouseT[0] - mouse[0]) * 0.06; mouse[1] += (mouseT[1] - mouse[1]) * 0.06;
    draw();
  })(0);
  return api;
}
