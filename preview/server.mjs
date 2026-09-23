import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 43127);

const TYPES = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".md": "text/markdown; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

function page(readme) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>양지호 · hhegi</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #0d1117;
      color: #e6edf3;
      font-family: "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
    }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      max-width: 1080px;
      margin: 0 auto;
      padding: 40px 24px 8px;
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 24px;
      align-items: center;
    }
    header img {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      border: 1px solid #30363d;
      object-fit: cover;
    }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .login { color: #8b949e; font-size: 20px; margin-top: 2px; }
    .bio { margin: 10px 0 0; color: #c9d1d9; }
    .meta { margin-top: 10px; color: #8b949e; font-size: 14px; display: flex; gap: 14px; flex-wrap: wrap; }
    nav {
      max-width: 1080px;
      margin: 18px auto 0;
      padding: 0 24px;
      border-bottom: 1px solid #30363d;
      display: flex;
      gap: 8px;
    }
    nav span {
      padding: 10px 12px;
      border-bottom: 2px solid transparent;
      color: #8b949e;
      font-size: 14px;
    }
    nav span.on { color: #e6edf3; border-bottom-color: #f78166; font-weight: 600; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px; }
    .readme {
      border: 1px solid #30363d;
      border-radius: 8px;
      background: #0d1117;
      padding: 20px 16px 8px;
    }
    .readme img { height: auto; vertical-align: middle; }
    .readme details { margin-top: 8px; }
    .readme summary { cursor: pointer; list-style: none; }
    .readme summary::-webkit-details-marker { display: none; }
    .note {
      margin-top: 18px;
      color: #8b949e;
      font-size: 13px;
      line-height: 1.6;
    }
    @media (max-width: 720px) {
      header { grid-template-columns: 72px 1fr; padding: 24px 16px 8px; gap: 14px; }
      header img { width: 72px; height: 72px; }
      h1 { font-size: 22px; }
      .login { font-size: 16px; }
      main { padding: 16px; }
      .readme a img[width="32%"] { width: 100% !important; }
    }
  </style>
</head>
<body>
  <header>
    <img src="/preview/avatar.jpg" alt="양지호 프로필 사진">
    <div>
      <h1>양지호</h1>
      <div class="login">hhegi</div>
      <p class="bio">저장소마다 포켓몬 한 마리. 커밋이 레벨을 올리고, 머지된 풀 리퀘스트가 도감에 남습니다.</p>
      <div class="meta">
        <span>팔로워 4</span>
        <span>팔로잉 8</span>
        <span>공개 활동 2022년부터</span>
      </div>
    </div>
  </header>
  <nav>
    <span class="on">Overview</span>
    <span>Repositories</span>
  </nav>
  <main>
    <article class="readme">${readme}</article>
    <p class="note">
      이 화면은 <a href="https://github.com/hhegi">hhegi</a> 프로필에 올라갈 README 미리보기입니다.
      GitHub에 공개 저장소 이름을 <b>hhegi</b>로 만들고 이 저장소 내용을 올리면 프로필 Overview에 같은 카드가 보입니다.
      Actions의 pokerepo 워크플로가 매일 카드를 다시 그립니다.
    </p>
  </main>
</body>
</html>`;
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = join(ROOT, rel);
  if (full !== ROOT && !full.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return null;
  if (full.includes(`${sep}.git${sep}`) || full.endsWith(`${sep}.git`)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (url.pathname === "/") {
      const readme = await readFile(join(ROOT, "README.md"), "utf8");
      const html = page(readme);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(html);
      return;
    }
    const file = safePath(url.pathname);
    if (!file) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`preview http://127.0.0.1:${PORT}`);
});
