export function initSSE(res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
}

export function mergeFragments(res, html, { selector, mergeMode } = {}) {
  let out = 'event: datastar-merge-fragments\n';
  if (selector) out += `data: selector ${selector}\n`;
  if (mergeMode) out += `data: mergeMode ${mergeMode}\n`;
  for (const line of html.trim().split('\n')) {
    out += `data: fragments ${line}\n`;
  }
  out += '\n';
  res.write(out);
}

export function mergeSignals(res, signals) {
  const json = JSON.stringify(signals);
  res.write(`event: datastar-merge-signals\ndata: onlyIfMissing false\ndata: signals ${json}\n\n`);
}

export function closeSSE(res) {
  res.end();
}
