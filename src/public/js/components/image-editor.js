const EXPORT_W = 1280;
const EXPORT_H = 720;
const PREVIEW_W = 800;
const PREVIEW_H = 450;

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

function drawFrame(ctx, img, state, w, h) {
  drawTechBackground(ctx, w, h);
  ctx.save();
  ctx.translate(w / 2 + state.offsetX * (w / PREVIEW_W), h / 2 + state.offsetY * (h / PREVIEW_H));
  ctx.rotate((state.rotation * Math.PI) / 180);
  const baseScale = state.scale * (w / PREVIEW_W);
  ctx.scale(baseScale, baseScale);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

function fitScale(img, w, h) {
  const scaleX = w / img.naturalWidth;
  const scaleY = h / img.naturalHeight;
  return Math.max(scaleX, scaleY);
}

export function initImageEditor({ projectId, proxyUrl, previewImgId, openBtnId }) {
  const openBtn     = document.getElementById(openBtnId);
  const previewImg  = document.getElementById(previewImgId);
  const modal       = document.getElementById('img-editor-modal');
  const backdrop    = modal.querySelector('.img-editor-modal__backdrop');
  const canvas      = document.getElementById('img-editor-canvas');
  const ctx         = canvas.getContext('2d');
  const zoomSlider  = document.getElementById('img-editor-zoom');
  const rotSlider   = document.getElementById('img-editor-rotation');
  const rotateCCW   = document.getElementById('img-editor-rotate-ccw');
  const rotateCW    = document.getElementById('img-editor-rotate-cw');
  const resetBtn    = document.getElementById('img-editor-reset');
  const cancelBtn   = document.getElementById('img-editor-cancel');
  const saveBtn     = document.getElementById('img-editor-save');
  const statusEl    = document.getElementById('img-editor-status');

  canvas.width  = PREVIEW_W;
  canvas.height = PREVIEW_H;

  let img     = null;
  let state   = { offsetX: 0, offsetY: 0, scale: 1, rotation: 0 };
  let initial = { scale: 1 };
  let dragging = false;
  let dragStart = { x: 0, y: 0, ox: 0, oy: 0 };

  function redraw() {
    if (!img) return;
    drawFrame(ctx, img, state, PREVIEW_W, PREVIEW_H);
  }

  function resetState() {
    const s = fitScale(img, PREVIEW_W, PREVIEW_H);
    initial.scale = s;
    state = { offsetX: 0, offsetY: 0, scale: s, rotation: 0 };
    zoomSlider.value  = '0';
    rotSlider.value   = '0';
  }

  function scaleFromSlider(v) {
    return initial.scale * Math.pow(2, parseFloat(v));
  }

  function openModal() {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resetState();
      redraw();
    };
    img.onerror = () => {
      showStatus('Failed to load image.', true);
    };
    img.src = proxyUrl + '?t=' + Date.now();

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
    const out = Object.assign(document.createElement('canvas'), { width: EXPORT_W, height: EXPORT_H });
    const octx = out.getContext('2d');
    drawFrame(octx, img, state, EXPORT_W, EXPORT_H);
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
      const res  = await fetch(`/admin/projects/${projectId}/edit-thumbnail`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { url } = await res.json();
      previewImg.src = url;
      closeModal();
    } catch (err) {
      showStatus('Save failed: ' + err.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  zoomSlider.addEventListener('input', () => {
    if (!img) return;
    state.scale = scaleFromSlider(zoomSlider.value);
    redraw();
  });

  rotSlider.addEventListener('input', () => {
    if (!img) return;
    state.rotation = parseFloat(rotSlider.value);
    redraw();
  });

  rotateCCW.addEventListener('click', () => {
    if (!img) return;
    state.rotation = ((state.rotation - 90) + 360) % 360;
    if (state.rotation > 180) state.rotation -= 360;
    rotSlider.value = String(state.rotation);
    redraw();
  });

  rotateCW.addEventListener('click', () => {
    if (!img) return;
    state.rotation = ((state.rotation + 90) + 360) % 360;
    if (state.rotation > 180) state.rotation -= 360;
    rotSlider.value = String(state.rotation);
    redraw();
  });

  resetBtn.addEventListener('click', () => {
    if (!img) return;
    resetState();
    redraw();
  });

  // ── Drag to pan ───────────────────────────────────────────────────────────

  canvas.addEventListener('mousedown', e => {
    dragging  = true;
    dragStart = { x: e.clientX, y: e.clientY, ox: state.offsetX, oy: state.offsetY };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    state.offsetX = dragStart.ox + (e.clientX - dragStart.x);
    state.offsetY = dragStart.oy + (e.clientY - dragStart.y);
    redraw();
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  // ── Touch pan ─────────────────────────────────────────────────────────────

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
    const step = e.deltaY < 0 ? 0.1 : -0.1;
    const newVal = Math.min(3, Math.max(-3, parseFloat(zoomSlider.value) + step));
    zoomSlider.value = String(newVal);
    state.scale = scaleFromSlider(newVal);
    redraw();
  }, { passive: false });

  // ── Open / close ──────────────────────────────────────────────────────────

  openBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  document.getElementById('img-editor-close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', save);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}
