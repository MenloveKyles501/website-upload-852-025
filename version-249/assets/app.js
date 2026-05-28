
const MOVIES = window.MOVIES || [];
const PLAYER_SOURCES = ["https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8", "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"];
const SITE_NAME = "高清电影大全";
function byId(id) { return document.getElementById(id); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function esc(text) { return String(text || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function trunc(text, n) { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
function poster(movie) { return movie.poster || `./${((movie.index - 1) % 150) + 1}.jpg`; }
function movieLink(movie) { return `movie-${movie.index}.html`; }
function cardHtml(movie, descLen = 92) {
  const meta = [movie.year, movie.region, movie.type].filter(Boolean).join(' · ');
  const tags = (movie.tags || []).slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('');
  return `<a class="card" href="${movieLink(movie)}"><div class="poster" style="--poster:url('${poster(movie)}')"></div><div class="body"><h3>${esc(movie.title)}</h3><div class="meta"><span>${esc(meta)}</span>${tags ? `<span>${tags}</span>` : ''}</div><p class="desc">${esc(trunc(movie.one_line || movie.summary || '', descLen))}</p><span class="more">查看详情 →</span></div></a>`;
}
function setupMenu() { const btn = byId('menuBtn'); const menu = byId('mobileMenu'); if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('open')); }
function setupSearchForms() { qsa('[data-search-form]').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); const input = form.querySelector('input'); location.href = `search.html?q=${encodeURIComponent((input && input.value || '').trim())}`; })); }
function setupHeroCarousel() {
  const root = byId('heroCarousel'); if (!root) return;
  const slides = qsa('.hero-slide', root); const prev = byId('heroPrev'); const next = byId('heroNext'); if (!slides.length) return;
  let active = 0;
  const render = () => slides.forEach((s, i) => s.classList.toggle('active', i === active));
  const go = delta => { active = (active + delta + slides.length) % slides.length; render(); };
  render();
  let timer = setInterval(() => go(1), 4500);
  const reset = () => { clearInterval(timer); timer = setInterval(() => go(1), 4500); };
  if (prev) prev.addEventListener('click', () => { go(-1); reset(); });
  if (next) next.addEventListener('click', () => { go(1); reset(); });
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', reset);
}
function renderSearch() {
  const root = byId('searchResults'); const input = byId('searchInput'); if (!root || !input) return;
  const url = new URL(location.href); const initial = (url.searchParams.get('q') || '').trim(); input.value = initial;
  const doSearch = () => {
    const q = input.value.trim().toLowerCase();
    const list = !q ? MOVIES.slice(0, 80) : MOVIES.filter(m => {
      const blob = [m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line, m.summary, m.review].join(' ').toLowerCase();
      return blob.includes(q);
    }).slice(0, 120);
    root.innerHTML = list.length ? `<div class="grid cards">${list.map(m => cardHtml(m)).join('')}</div>` : `<div class="empty">未找到相关影片，请尝试更换关键词。</div>`;
    const count = byId('searchCount'); if (count) count.textContent = String(list.length);
  };
  input.addEventListener('input', doSearch);
  doSearch();
}
function setupPlayer() {
  const shell = byId('playerShell'); if (!shell) return;
  const video = byId('playerVideo'); const overlay = byId('playerOverlay'); const button = byId('playerButton');
  const status = byId('playerStatus'); const label = byId('playerLabel'); const source = shell.dataset.src || PLAYER_SOURCES[0];
  if (label) label.textContent = shell.dataset.title || SITE_NAME;
  let hls = null;
  const start = () => {
    try {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); shell.classList.add('playing'); if (status) status.textContent = '已准备播放'; });
        hls.on(window.Hls.Events.ERROR, (_, data) => { if (status) status.textContent = data && data.details ? String(data.details) : '播放中断'; });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); shell.classList.add('playing'); if (status) status.textContent = '已准备播放'; }, { once: true });
      } else {
        if (status) status.textContent = '当前浏览器无法直接播放此格式';
      }
    } catch (err) { if (status) status.textContent = '播放器初始化失败'; }
  };
  const play = () => start();
  [button, overlay, video].forEach(el => el && el.addEventListener('click', play));
  video.addEventListener('play', () => shell.classList.add('playing'));
  video.addEventListener('pause', () => shell.classList.remove('playing'));
  video.addEventListener('ended', () => shell.classList.remove('playing'));
  start();
}
document.addEventListener('DOMContentLoaded', () => { setupMenu(); setupSearchForms(); setupHeroCarousel(); renderSearch(); setupPlayer(); });
