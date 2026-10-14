(() => {
  const CFG = window.CARD_CONFIG || {};
  const screens = [...document.querySelectorAll(".screen")];
  const nav = document.querySelector(".nav");
  const backBtn = document.getElementById("back");
  const nextBtn = document.getElementById("next");
  const muteBtn = document.getElementById("mute");
  const dots = document.querySelector(".dots");
  const OWN_KEY = "the-birthday-message";
  const player = new Audio();
  player.preload = "auto";
  let current = 0;
  let muted = false;
  let sent = !!readOwn();

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  function readOwn() {
    try { return JSON.parse(localStorage.getItem(OWN_KEY) || "null"); } catch { return null; }
  }

  // ---------- Word-by-word text animation ----------
  document.querySelectorAll("[data-split]").forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");
  });

  // ---------- Cover calendar ----------
  (function calendar() {
    const svg = document.querySelector(".calendar");
    const ns = "http://www.w3.org/2000/svg";
    const colX = i => 58 + i * 97;
    const rowY = r => 200 + r * 66;
    const dow = svg.querySelector(".cal-dow");
    "SMTWTFS".split("").forEach((d, i) => {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", colX(i)); t.setAttribute("y", 132); t.textContent = d; dow.appendChild(t);
    });
    const days = svg.querySelector(".cal-days");
    const firstCol = 4; // October 1, 2026 is a Thursday
    let cx14 = 0, cy14 = 0;
    for (let d = 1; d <= 31; d++) {
      const p = d - 1 + firstCol, x = colX(p % 7), y = rowY(Math.floor(p / 7));
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", x); t.setAttribute("y", y); t.textContent = d;
      if (d === 14) { t.classList.add("on"); cx14 = x; cy14 = y; }
      days.appendChild(t);
    }
    const today = svg.querySelector(".today");
    today.setAttribute("cx", cx14); today.setAttribute("cy", cy14);
    days.parentNode.insertBefore(today, days);
    // Hand-drawn marker loop: a wobbly ellipse that overlaps itself at the end
    const pts = [];
    for (let k = 0; k <= 64; k++) {
      const a = -1.9 + (k / 64) * Math.PI * 2.25;
      const rx = 64 + Math.sin(k * 0.7) * 3 + k * 0.12;
      const ry = 52 + Math.cos(k * 0.9) * 3 + k * 0.08;
      pts.push(`${(cx14 + rx * Math.cos(a)).toFixed(1)},${(cy14 - 4 + ry * Math.sin(a)).toFixed(1)}`);
    }
    const rc = svg.querySelector(".red-circle");
    rc.setAttribute("d", "M" + pts.join(" L"));
    rc.setAttribute("pathLength", "1");
  })();

  // Sparkles on the cover
  (function sparkles() {
    const box = document.querySelector(".sparkles");
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
      const z = 3 + Math.random() * 5; s.style.width = s.style.height = z + "px";
      box.appendChild(s);
    }
  })();

  // ---------- Navigation ----------
  screens.forEach((_, i) => { if (i) dots.appendChild(document.createElement("i")); });

  function canLeave(i) {
    return !(screens[i].dataset.gate === "message" && !sent);
  }

  function go(i) {
    if (i < 0 || i >= screens.length || i === current) return;
    if (i > current && !canLeave(current)) { nudgeForm(); return; }
    screens[current].classList.remove("active");
    current = i;
    const s = screens[current];
    // restart CSS animations
    void s.offsetWidth;
    s.classList.add("active");
    updateNav();
    playFor(s);
    onEnter(s, i);
  }

  function updateNav() {
    nav.classList.toggle("hidden", current === 0);
    backBtn.disabled = current <= 1;
    nextBtn.disabled = current === screens.length - 1 || !canLeave(current);
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === current - 1));
  }

  backBtn.addEventListener("click", () => go(current - 1));
  nextBtn.addEventListener("click", () => go(current + 1));
  document.addEventListener("keydown", e => {
    if (e.target.matches("textarea, input")) return;
    if (e.key === "ArrowRight" && current > 0) go(current + 1);
    if (e.key === "ArrowLeft" && current > 1) go(current - 1);
  });
  let tx = null, ty = null;
  document.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", e => {
    if (tx === null || current === 0) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) go(current + 1); else if (current > 1) go(current - 1);
    }
  });

  // ---------- Audio ----------
  function playFor(s) {
    player.pause();
    const src = s.dataset.audio;
    if (!src) return;
    player.src = src;
    player.currentTime = 0;
    if (!muted) player.play().catch(() => {});
  }
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    if (muted) player.pause(); else if (player.src) { player.currentTime = 0; player.play().catch(() => {}); }
  });
  document.getElementById("replay").addEventListener("click", () => {
    player.currentTime = 0;
    if (muted) muteBtn.click(); else player.play().catch(() => {});
  });

  document.getElementById("start").addEventListener("click", () => {
    muteBtn.classList.add("show");
    // unlock audio on iOS within the tap
    player.src = screens[1].dataset.audio;
    player.play().catch(() => {});
    go(1);
  });

  // ---------- Per-screen extras ----------
  function onEnter(s, i) {
    const counter = s.querySelector(".counter");
    if (counter) countUp(counter);
    if (s.querySelector(".fireworks")) Fireworks.start(s.querySelector(".fireworks")); else Fireworks.stop();
    if (s.id === "reveal") { Confetti.start(s.querySelector(".confetti")); loadMessages(); } else Confetti.stop();
    if (s.dataset.gate === "message") setTimeout(() => document.getElementById("msgText").focus({ preventScroll: true }), 900);
  }

  function countUp(el) {
    const to = +el.dataset.to, t0 = performance.now(), dur = 1700;
    el.textContent = "0";
    const step = t => {
      const p = Math.min(1, (t - t0 - 500) / dur);
      if (p > 0) el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- Message form ----------
  const form = document.getElementById("msgForm");
  const msgText = document.getElementById("msgText");
  const msgName = document.getElementById("msgName");
  const proceed = document.getElementById("proceed");
  const hint = document.getElementById("msgHint");
  const own = readOwn();
  if (own) { msgText.value = own.message; msgName.value = own.name || ""; }

  function validate() {
    const ok = msgText.value.trim().length >= 2;
    proceed.disabled = !ok;
    hint.classList.remove("err");
    hint.textContent = ok ? "Thank you! Tap Proceed to find out 👀" : "Leave a message to continue";
  }
  msgText.addEventListener("input", validate);
  validate();

  function nudgeForm() {
    hint.classList.add("err");
    hint.textContent = "Leave a message for The Birthday first 💛";
    msgText.focus();
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const message = msgText.value.trim();
    if (message.length < 2) return nudgeForm();
    const name = msgName.value.trim();
    proceed.disabled = true;
    proceed.textContent = "Sending…";
    const prev = readOwn();
    const changed = !prev || prev.message !== message || (prev.name || "") !== name;
    if (changed && CFG.formResponseUrl && CFG.messageEntry) {
      const body = new URLSearchParams();
      body.append(CFG.messageEntry, message);
      if (CFG.nameEntry) body.append(CFG.nameEntry, name);
      try {
        await Promise.race([
          fetch(CFG.formResponseUrl, { method: "POST", mode: "no-cors", body }),
          new Promise(r => setTimeout(r, 6000))
        ]);
      } catch {}
    }
    store.set(OWN_KEY, JSON.stringify({ name, message }));
    sent = true;
    proceed.textContent = "Proceed ➜";
    proceed.disabled = false;
    updateNav();
    go(current + 1);
  });

  // ---------- Reveal: collage ----------
  (function collage() {
    const box = document.querySelector(".collage");
    const wide = new Set([4, 7, 8]);
    for (let i = 1; i <= 11; i++) {
      const f = document.createElement("figure");
      f.style.setProperty("--i", i);
      f.style.setProperty("--r", ((i * 37) % 9 - 4) + "deg");
      if (wide.has(i)) f.classList.add("wide");
      f.innerHTML = `<img src="img/collage/c${String(i).padStart(2, "0")}.webp" alt="Deedee" loading="lazy">`;
      box.appendChild(f);
    }
  })();

  // ---------- Reveal: messages ----------
  let bubbleTimer = null;
  async function loadMessages() {
    const list = [];
    try {
      const r = await fetch("messages.json", { cache: "no-store" });
      if (r.ok) (await r.json()).forEach(m => m && m.message && list.push({ name: m.name || "", message: m.message }));
    } catch {}
    if (CFG.sheetCsvUrl) {
      try {
        const r = await fetch(CFG.sheetCsvUrl + (CFG.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now());
        if (r.ok) list.push(...fromCsv(await r.text()));
      } catch {}
    }
    const mine = readOwn();
    const seen = new Set();
    const all = [];
    if (mine) { all.push({ ...mine, mine: true }); seen.add(key(mine)); }
    list.forEach(m => { if (!seen.has(key(m))) { seen.add(key(m)); all.push(m); } });
    showBubbles(all);
  }
  const key = m => (m.name || "").trim().toLowerCase() + "|" + m.message.trim().toLowerCase();

  function fromCsv(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (rows.length < 2) return [];
    const head = rows[0].map(h => h.toLowerCase());
    let mi = head.findIndex(h => h.includes("message"));
    let ni = head.findIndex(h => h.includes("name"));
    if (mi < 0) mi = head.length - 1;
    return rows.slice(1)
      .map(r => ({ message: (r[mi] || "").trim(), name: ni >= 0 ? (r[ni] || "").trim() : "" }))
      .filter(m => m.message);
  }

  function showBubbles(all) {
    const box = document.querySelector(".bubbles");
    clearInterval(bubbleTimer);
    box.innerHTML = "";
    if (!all.length) return;
    const perView = Math.min(all.length, window.innerWidth < 600 ? 5 : 8);
    let offset = 0;
    const slots = [];
    for (let k = 0; k < perView; k++) slots.push({ x: 4 + ((k * 41) % 60) + Math.random() * 8, y: 16 + (k / perView) * 62 + Math.random() * 6 });
    const render = () => {
      box.innerHTML = "";
      for (let k = 0; k < perView; k++) {
        const m = all[(offset + k) % all.length];
        const b = document.createElement("div");
        b.className = "bubble" + (m.mine ? " mine" : "");
        b.style.left = slots[k].x + "%";
        b.style.top = slots[k].y + "%";
        b.style.setProperty("--dx", (Math.random() * 40 - 20).toFixed(0) + "px");
        b.style.setProperty("--dy", (Math.random() * 30 - 15).toFixed(0) + "px");
        b.style.setProperty("--d", (4 + Math.random() * 3).toFixed(1) + "s");
        b.style.animationDelay = `0s, ${k * 0.25}s`;
        b.textContent = m.message;
        if (m.name) { const n = document.createElement("b"); n.textContent = "— " + m.name; b.appendChild(n); }
        box.appendChild(b);
      }
      offset += perView;
    };
    render();
    if (all.length > perView) bubbleTimer = setInterval(render, 7000);
  }

  // ---------- Canvas effects ----------
  function fitCanvas(c) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
    const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  const Fireworks = (() => {
    let raf = null, parts = [], canvas, ctx, last = 0;
    const colors = ["#f2c14e", "#ffe7a3", "#ff4d5e", "#ffffff", "#ff9a3c"];
    function burst() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const x = w * (0.15 + Math.random() * 0.7), y = h * (0.12 + Math.random() * 0.38);
      const col = colors[Math.floor(Math.random() * colors.length)];
      const n = 46 + Math.floor(Math.random() * 30);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, sp = 1.6 + Math.random() * 2.6;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col });
      }
      // rocket trail
      parts.push({ x, y: h * 0.75, vx: 0, vy: 0, life: 0.5, col: "#ffe7a3", trail: y });
    }
    function frame(t) {
      if (t - last > 650) { burst(); last = t; }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.globalCompositeOperation = "lighter";
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        if (p.trail !== undefined) {
          ctx.strokeStyle = `rgba(255,231,163,${p.life})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.trail + 20); ctx.stroke();
          p.life -= 0.08; continue;
        }
        p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.013;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    return {
      start(c) { canvas = c; ctx = fitCanvas(c); parts = []; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      stop() { cancelAnimationFrame(raf); raf = null; }
    };
  })();

  const Confetti = (() => {
    let raf = null, bits = [], canvas, ctx;
    const colors = ["#f2c14e", "#e8b33a", "#ffffff", "#7a0f1c", "#1a0f0a", "#ff4d5e"];
    function frame() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const b of bits) {
        b.y += b.vy; b.x += Math.sin(b.y / 30 + b.p) * 0.8; b.r += b.vr;
        if (b.y > h + 20) { b.y = -20; b.x = Math.random() * w; }
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    return {
      start(c) {
        canvas = c; ctx = fitCanvas(c);
        const w = c.clientWidth, h = c.clientHeight;
        bits = Array.from({ length: 90 }, () => ({ x: Math.random() * w, y: Math.random() * -h, vy: 1 + Math.random() * 2.2, vr: Math.random() * 0.1 - 0.05, r: Math.random() * 6, s: 6 + Math.random() * 8, p: Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)] }));
        cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
      },
      stop() { cancelAnimationFrame(raf); raf = null; }
    };
  })();

  window.addEventListener("resize", () => {
    const s = screens[current];
    if (s.querySelector(".fireworks")) Fireworks.start(s.querySelector(".fireworks"));
    if (s.id === "reveal") Confetti.start(s.querySelector(".confetti"));
  });

  // ---------- Boot ----------
  screens[0].classList.add("active");
  updateNav();
})();
