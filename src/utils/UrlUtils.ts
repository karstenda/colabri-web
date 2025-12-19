export function getDocServiceConnUrl(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}://localhost:9001`;
  }

  if (hostname.startsWith('app.')) {
    const domain = hostname.substring(4);
    return `${protocol}://doc.${domain}`;
  }

  return `${protocol}://localhost:9001`;
}
