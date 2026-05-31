const EXPORT_W = 1280;
const EXPORT_H = 720;
const PREVIEW_W = 800;
const PREVIEW_H = 450;
const ZOOM_STEP  = 0.25;
const ROT_STEP   = 15;

// Frame configs — all dimensions at PREVIEW_W (800px) coordinate space
const FRAMES = {
  desktop: {
    type: 'desktop',
    barH: 28, barR: 6,
    barColor: '#e2e2e5', barBorder: '#c4c4cc',
    dots: [
      { x: 10, y: 14, r: 4, fill: '#ff5f57' },
      { x: 22, y: 14, r: 4, fill: '#febc2e' },
      { x: 34, y: 14, r: 4, fill: '#28c840' },
    ],
    urlBar: { x: 44, y: 6, w: 714, h: 14, r: 3 },
  },
  tablet: {
    type: 'portrait',
    outerW: 260, outerH: 378, outerR: 16,
    bezColor: '#1c1c1e', bezBorder: '#3a3a3c',
    padT: 13, padR: 9, padB: 18, padL: 9, screenR: 5,
    homeBar: { w: 46, h: 3, color: '#555', bottom: 6 },
  },
  mobile: {
    type: 'portrait',
    outerW: 196, outerH: 396, outerR: 42,
    bezColor: '#1a1a1c', bezBorder: '#3a3a3c',
    padT: 33, padR: 12, padB: 26, padL: 12, screenR: 12,
    island: { w: 60, h: 16, top: 10 },
    homeBar: { w: 46, h: 3, color: 'rgba(255,255,255,0.35)', bottom: 7 },
    innerGlow: 'rgba(255,255,255,0.07)',
    shadow: true,
  },
};

function getScreenRect(cfg, w, h) {
  const s = w / PREVIEW_W;
  if (cfg.type === 'desktop') {
    return { x: 0, y: cfg.barH * s, w, h: h - cfg.barH * s, r: 0 };
  }
  const cx = w / 2, cy = h / 2;
  const fw = cfg.outerW * s, fh = cfg.outerH * s;
  return {
    x: cx - fw / 2 + cfg.padL * s,
    y: cy - fh / 2 + cfg.padT * s,
    w: fw - (cfg.padL + cfg.padR) * s,
    h: fh - (cfg.padT + cfg.padB) * s,
    r: cfg.screenR * s,
  };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function makeFrameOverlay(cfg, w, h) {
  const off = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const ctx = off.getContext('2d');
  const s = w / PREVIEW_W;

  if (cfg.type === 'desktop') {
    const barH = cfg.barH * s;
    ctx.fillStyle = cfg.barColor;
    rr(ctx, 0, 0, w, barH, [cfg.barR * s, cfg.barR * s, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = cfg.barBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barH); ctx.lineTo(w, barH);
    ctx.stroke();
    cfg.dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x * s, d.y * s, d.r * s, 0, Math.PI * 2);
      ctx.fillStyle = d.fill;
      ctx.fill();
    });
    const ub = cfg.urlBar;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#d0d0d8';
    ctx.lineWidth = 1;
    rr(ctx, ub.x * s, ub.y * s, ub.w * s, ub.h * s, ub.r * s);
    ctx.fill(); ctx.stroke();

  } else {
    const cx = w / 2, cy = h / 2;
    const fw = cfg.outerW * s, fh = cfg.outerH * s;
    const fx = cx - fw / 2, fy = cy - fh / 2;
    const outerR = cfg.outerR * s;

    if (cfg.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 40 * s;
      ctx.shadowOffsetY = 16 * s;
    }
    ctx.fillStyle = cfg.bezColor;
    rr(ctx, fx, fy, fw, fh, outerR);
    ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    ctx.strokeStyle = cfg.bezBorder;
    ctx.lineWidth = 2 * s;
    rr(ctx, fx, fy, fw, fh, outerR);
    ctx.stroke();

    if (cfg.innerGlow) {
      ctx.strokeStyle = cfg.innerGlow;
      ctx.lineWidth = 2 * s;
      rr(ctx, fx + s, fy + s, fw - 2 * s, fh - 2 * s, outerR - s);
      ctx.stroke();
    }

    const sc = getScreenRect(cfg, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    rr(ctx, sc.x, sc.y, sc.w, sc.h, sc.r);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    if (cfg.island) {
      const { w: iw, h: ih, top: it } = cfg.island;
      ctx.fillStyle = '#000';
      rr(ctx, cx - (iw * s) / 2, fy + it * s, iw * s, ih * s, (ih * s) / 2);
      ctx.fill();
    }
    if (cfg.homeBar) {
      const { w: hw, h: hh, color, bottom: hb } = cfg.homeBar;
      ctx.fillStyle = color;
      rr(ctx, cx - (hw * s) / 2, fy + fh - hb * s - hh * s, hw * s, hh * s, (hh * s) / 2);
      ctx.fill();
    }
  }
  return off;
}

function drawTechBackground(ctx, w, h) {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const off = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const oc  = off.getContext('2d');
  oc.fillStyle = isDark ? '#181824' : '#eef0f8';
  oc.fillRect(0, 0, w, h);
  const dotColor = isDark ? 'rgba(107,141,232,0.28)' : 'rgba(65,99,191,0.20)';
  oc.fillStyle = dotColor;
  const spacing = 18;
  for (let x = 0; x <= w; x += spacing) {
    for (let y = 0; y <= h; y += spacing) {
      oc.beginPath();
      oc.arc(x, y, 1.2, 0, Math.PI * 2);
      oc.fill();
    }
  }
  ctx.filter = 'blur(7px)';
  ctx.drawImage(off, 0, 0);
  ctx.filter = 'none';
}

function drawScene(ctx, img, state, w, h) {
  const s = w / PREVIEW_W;
  const cfg = FRAMES[state.frame] ?? null;

  drawTechBackground(ctx, w, h);

  if (cfg) {
    const sc = getScreenRect(cfg, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sc.x, sc.y, sc.w, sc.h, sc.r);
    ctx.clip();
  }

  ctx.save();
  ctx.translate(w / 2 + state.offsetX * s, h / 2 + state.offsetY * s);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.scale(state.scale * s, state.scale * s);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  if (cfg) {
    ctx.restore();
    ctx.drawImage(makeFrameOverlay(cfg, w, h), 0, 0);
  }
}

// Export the positioned image without the device chrome, scaled to fill the export canvas.
// The card CSS handles the device frame display.
function drawExport(ctx, img, state, w, h) {
  const cfg = FRAMES[state.frame] ?? null;
  let exportState = state;

  if (cfg) {
    const sc = getScreenRect(cfg, PREVIEW_W, PREVIEW_H);
    // Image was fitted to fill the screen area. Scale up to fill the full export canvas.
    const scaleUp = Math.max(PREVIEW_W / sc.w, PREVIEW_H / sc.h);
    exportState = {
      ...state,
      frame: 'none',
      scale: state.scale * scaleUp,
      offsetX: state.offsetX * scaleUp,
      offsetY: state.offsetY * scaleUp,
    };
  }
  drawScene(ctx, img, exportState, w, h);
}

export function initImageEditor({ projectId, proxyUrl, originalProxyUrl, previewImgId, openBtnId }) {
  const openBtn      = openBtnId  ? document.getElementById(openBtnId)  : null;
  const previewImg   = previewImgId ? document.getElementById(previewImgId) : null;
  const modal        = document.getElementById('img-editor-modal');
  const backdrop     = modal.querySelector('.img-editor-modal__backdrop');
  const canvas       = document.getElementById('img-editor-canvas');
  const ctx          = canvas.getContext('2d');
  const zoomOutBtn   = document.getElementById('img-editor-zoom-out');
  const zoomInBtn    = document.getElementById('img-editor-zoom-in');
  const zoomVal      = document.getElementById('img-editor-zoom-val');
  const rotCCW90     = document.getElementById('img-editor-rotate-ccw');
  const rotCW90      = document.getElementById('img-editor-rotate-cw');
  const rotStepCCW   = document.getElementById('img-editor-rot-step-ccw');
  const rotStepCW    = document.getElementById('img-editor-rot-step-cw');
  const rotVal       = document.getElementById('img-editor-rot-val');
  const resetBtn     = document.getElementById('img-editor-reset');
  const cancelBtn    = document.getElementById('img-editor-cancel');
  const saveBtn      = document.getElementById('img-editor-save');
  const statusEl     = document.getElementById('img-editor-status');
  const useOriginalBtn = document.getElementById('img-editor-use-original');

  canvas.width  = PREVIEW_W;
  canvas.height = PREVIEW_H;

  let img             = null;
  let state           = { offsetX: 0, offsetY: 0, zoomExp: 0, scale: 1, rotation: 0, frame: 'none' };
  let baseScale       = 1;
  let dragging        = false;
  let dragStart       = { x: 0, y: 0, ox: 0, oy: 0 };
  let loadedFromUpload = false; // true when opened from a local file/url (not existing thumbnail)

  function updateDisplay() {
    const pct = Math.round((state.scale / baseScale) * 100);
    zoomVal.textContent = pct + '%';
    rotVal.textContent  = Math.round(state.rotation) + '°';
  }

  function redraw() {
    if (!img) return;
    drawScene(ctx, img, state, PREVIEW_W, PREVIEW_H);
  }

  function resetState() {
    const cfg = FRAMES[state.frame] ?? null;
    let fitW = PREVIEW_W, fitH = PREVIEW_H;
    if (cfg) {
      const sc = getScreenRect(cfg, PREVIEW_W, PREVIEW_H);
      fitW = sc.w; fitH = sc.h;
    }
    baseScale = Math.max(fitW / img.naturalWidth, fitH / img.naturalHeight);
    state = { ...state, offsetX: 0, offsetY: 0, zoomExp: 0, scale: baseScale, rotation: 0 };
    updateDisplay();
  }

  function applyZoom(exp) {
    state.zoomExp = Math.min(3, Math.max(-3, exp));
    state.scale   = baseScale * Math.pow(2, state.zoomExp);
    updateDisplay();
    redraw();
  }

  function applyRotation(deg) {
    let r = ((deg % 360) + 360) % 360;
    if (r > 180) r -= 360;
    state.rotation = r;
    updateDisplay();
    redraw();
  }

  function loadImage(url) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { resetState(); redraw(); };
    img.onerror = () => showStatus('Failed to load image.', true);
    img.src = url + '?t=' + Date.now();
  }

  function openModal() {
    if (!proxyUrl) return;
    loadedFromUpload = false;
    loadImage(proxyUrl);
    useOriginalBtn.hidden = !originalProxyUrl;
    modal.hidden = false;
    modal.classList.remove('is-closing');
    document.body.style.overflow = 'hidden';
    hideStatus();
  }

  function openWithSource(source) {
    loadedFromUpload = true;
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    loadImage(url);
    // Reset frame selection to none
    modal.querySelectorAll('[data-frame]').forEach(b => b.classList.remove('is-active'));
    modal.querySelector('[data-frame="none"]').classList.add('is-active');
    state.frame = 'none';
    useOriginalBtn.hidden = true;
    modal.hidden = false;
    modal.classList.remove('is-closing');
    document.body.style.overflow = 'hidden';
    hideStatus();
  }

  function closeModal() {
    modal.classList.add('is-closing');
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.style.overflow = '';
      img = null;
    }, 180);
  }

  function showStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    statusEl.classList.toggle('img-editor-modal__status--error', isError);
  }

  function hideStatus() {
    statusEl.hidden = true;
    statusEl.textContent = '';
  }

  async function exportBlob() {
    const out  = Object.assign(document.createElement('canvas'), { width: EXPORT_W, height: EXPORT_H });
    drawExport(out.getContext('2d'), img, state, EXPORT_W, EXPORT_H);
    return new Promise((resolve, reject) => {
      out.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    });
  }

  async function save() {
    saveBtn.disabled = true;
    showStatus('Saving…');
    try {
      const blob = await exportBlob();
      const form = new FormData();
      form.append('image', blob, 'thumbnail.png');
      form.append('frame', state.frame);
      const res = await fetch(`/admin/projects/${projectId}/edit-thumbnail`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { url } = await res.json();
      if (loadedFromUpload) {
        location.reload();
        return;
      }
      if (previewImg) {
        previewImg.src = url;
        const wrapper = document.getElementById('js-thumb-wrapper');
        if (wrapper) wrapper.dataset.frame = state.frame === 'none' ? '' : state.frame;
      }
      closeModal();
    } catch (err) {
      showStatus('Save failed: ' + err.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  }

  // ── Frame selector ────────────────────────────────────────────────────────

  modal.querySelectorAll('[data-frame]').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('[data-frame]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.frame = btn.dataset.frame;
      if (img) { resetState(); redraw(); }
    });
  });

  // ── Zoom buttons ──────────────────────────────────────────────────────────

  zoomOutBtn.addEventListener('click', () => { if (img) applyZoom(state.zoomExp - ZOOM_STEP); });
  zoomInBtn.addEventListener('click',  () => { if (img) applyZoom(state.zoomExp + ZOOM_STEP); });

  // ── Rotation buttons ──────────────────────────────────────────────────────

  rotCCW90.addEventListener('click',   () => { if (img) applyRotation(state.rotation - 90); });
  rotCW90.addEventListener('click',    () => { if (img) applyRotation(state.rotation + 90); });
  rotStepCCW.addEventListener('click', () => { if (img) applyRotation(state.rotation - ROT_STEP); });
  rotStepCW.addEventListener('click',  () => { if (img) applyRotation(state.rotation + ROT_STEP); });

  resetBtn.addEventListener('click', () => { if (img) { resetState(); redraw(); } });

  // ── Pan ───────────────────────────────────────────────────────────────────

  canvas.addEventListener('mousedown', e => {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY, ox: state.offsetX, oy: state.offsetY };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    state.offsetX = dragStart.ox + (e.clientX - dragStart.x);
    state.offsetY = dragStart.oy + (e.clientY - dragStart.y);
    redraw();
  });

  window.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = 'grab'; });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    dragging  = true;
    dragStart = { x: t.clientX, y: t.clientY, ox: state.offsetX, oy: state.offsetY };
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    state.offsetX = dragStart.ox + (t.clientX - dragStart.x);
    state.offsetY = dragStart.oy + (t.clientY - dragStart.y);
    redraw();
  }, { passive: false });

  canvas.addEventListener('touchend', () => { dragging = false; });

  // ── Scroll to zoom ────────────────────────────────────────────────────────

  canvas.addEventListener('wheel', e => {
    if (!img) return;
    e.preventDefault();
    applyZoom(state.zoomExp + (e.deltaY < 0 ? 0.1 : -0.1));
  }, { passive: false });

  // ── Open / close ──────────────────────────────────────────────────────────

  if (openBtn) openBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  document.getElementById('img-editor-close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  if (useOriginalBtn && originalProxyUrl) {
    useOriginalBtn.addEventListener('click', () => { hideStatus(); loadImage(originalProxyUrl); });
  }

  document.addEventListener('open-editor-with-source', e => openWithSource(e.detail.file || e.detail.url));
}
