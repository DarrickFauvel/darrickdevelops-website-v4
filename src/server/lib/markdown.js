import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function toHtml(markdown) {
  if (!markdown) return '';
  return marked(markdown);
}
