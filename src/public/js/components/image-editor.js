const EXPORT_W = 1280;
const EXPORT_H = 720;
const PREVIEW_W = 800;
const PREVIEW_H = 450;
const ZOOM_STEP  = 0.25;
const ROT_STEP   = 15;

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
  drawTechBackground(ctx, w, h);
  ctx.save();
  ctx.translate(w / 2 + state.offsetX * s, h / 2 + state.offsetY * s);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.scale(state.scale * s, state.scale * s);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

export function initImageEditor({ projectId, proxyUrl, originalProxyUrl, previewImgId, openBtnId, savedTransform }) {
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
  let state           = { offsetX: 0, offsetY: 0, zoomExp: 0, scale: 1, rotation: 0 };
  let baseScale       = 1;
  let dragging        = false;
  let dragStart       = { x: 0, y: 0, ox: 0, oy: 0 };
  let loadedFromUpload = false;
  let originalSource  = null;

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
    baseScale = Math.max(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
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

  function loadImage(url, transform = null) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resetState();
      if (transform) {
        state.offsetX  = transform.offsetX  ?? 0;
        state.offsetY  = transform.offsetY  ?? 0;
        state.zoomExp  = transform.zoomExp  ?? 0;
        state.scale    = baseScale * Math.pow(2, state.zoomExp);
        state.rotation = transform.rotation ?? 0;
        updateDisplay();
      }
      redraw();
    };
    img.onerror = () => showStatus('Failed to load image.', true);
    img.src = url.startsWith('blob:')
      ? url
      : url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  }

  function openModal() {
    if (!proxyUrl) return;
    loadedFromUpload = false;
    originalSource = originalProxyUrl || proxyUrl;
    loadImage(originalSource, savedTransform);
    useOriginalBtn.hidden = !originalProxyUrl;
    modal.hidden = false;
    modal.classList.remove('is-closing');
    document.body.style.overflow = 'hidden';
    hideStatus();
  }

  function openWithSource(source) {
    loadedFromUpload = true;
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    originalSource = url;
    loadImage(url);
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

  async function save() {
    saveBtn.disabled = true;
    showStatus('Saving…');
    try {
      const form = new FormData();
      if (loadedFromUpload) {
        // Send the original file — no canvas crop
        const blob = await fetch(originalSource).then(r => r.blob());
        form.append('image', blob, 'upload');
      }
      form.append('offsetX', state.offsetX);
      form.append('offsetY', state.offsetY);
      form.append('zoomExp', state.zoomExp);
      form.append('rotation', state.rotation);
      const res = await fetch(`/admin/projects/${projectId}/edit-thumbnail`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { url } = await res.json();
      if (loadedFromUpload) {
        location.reload();
        return;
      }
      if (previewImg) {
        if (url) previewImg.src = url;
        const ox = (state.offsetX * 0.125).toFixed(3);
        const oy = (state.offsetY * 0.125).toFixed(3);
        const sc = Math.pow(2, state.zoomExp).toFixed(4);
        previewImg.style.transform = `translate(calc(${ox}cqw), calc(${oy}cqw)) scale(${sc}) rotate(${state.rotation}deg)`;
      }
      closeModal();
    } catch (err) {
      showStatus('Save failed: ' + err.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  }

  // ── Zoom buttons ──────────────────────────────────────────────────────────

  zoomOutBtn.addEventListener('click', () => { if (img) applyZoom(state.zoomExp - ZOOM_STEP); });
  zoomInBtn.addEventListener('click',  () => { if (img) applyZoom(state.zoomExp + ZOOM_STEP); });

  // ── Rotation buttons ──────────────────────────────────────────────────────

  rotCCW90.addEventListener('click',   () => { if (img) applyRotation(state.rotation - 90); });
  rotCW90.addEventListener('click',    () => { if (img) applyRotation(state.rotation + 90); });
  rotStepCCW.addEventListener('click', () => { if (img) applyRotation(state.rotation - ROT_STEP); });
  rotStepCW.addEventListener('click',  () => { if (img) applyRotation(state.rotation + ROT_STEP); });

  resetBtn.addEventListener('click', () => { if (img && originalSource) loadImage(originalSource); });

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
