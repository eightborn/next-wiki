const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "exports");
const retypeDir = path.join(root, ".retype");
const outputPdf = path.join(outputDir, "ceza-kanunu.pdf");

const pageOrder = [
  "criminal-code/general-provisions.md",
  "criminal-code/arrest-custody-and-suspect-rights.md",
  "criminal-code/sentencing-adjustments.md",
  "criminal-code/procedure-seizure-and-sanctions.md",
  "criminal-code/prosecutor-rules.md",
  "criminal-code/penalties/quick-reference.md",
  "criminal-code/penalties/offenses-against-life.md",
  "criminal-code/penalties/offenses-against-bodily-integrity.md",
  "criminal-code/penalties/offenses-against-personal-liberty.md",
  "criminal-code/penalties/offenses-against-sexual-integrity.md",
  "criminal-code/penalties/child-protection-offenses.md",
  "criminal-code/penalties/domestic-violence-and-protection-offenses.md",
  "criminal-code/penalties/threat-coercion-and-stalking.md",
  "criminal-code/penalties/property-offenses.md",
  "criminal-code/penalties/grand-property-offenses.md",
  "criminal-code/penalties/arson-and-dangerous-property-offenses.md",
  "criminal-code/penalties/public-order-offenses.md",
  "criminal-code/penalties/offenses-against-state-and-justice.md",
  "criminal-code/penalties/weapons-and-dangerous-materials.md",
  "criminal-code/penalties/melisa-offenses.md",
  "criminal-code/penalties/traffic-and-vehicle-offenses.md",
  "criminal-code/penalties/trade-license-and-profession-offenses.md",
];

function run(command, args, options = {}) {
  const result = childProcess.spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stripFrontMatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function getTitle(sourceFile) {
  const markdown = stripFrontMatter(read(path.join(root, sourceFile)));
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(sourceFile, ".md");
}

function sourceToBuiltHtml(sourceFile) {
  const relative = sourceFile.replace(/\\/g, "/").replace(/\.md$/, "");
  const parts = relative.split("/");
  const filename = parts.pop();

  if (filename === "index") {
    return path.join(retypeDir, ...parts, "index.html");
  }

  return path.join(retypeDir, ...parts, filename, "index.html");
}

function extractContent(html, sourceFile) {
  const startMarker = '<div class="relative retype-markdown" id="retype-content">';
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`Could not find Retype content start in ${sourceFile}`);

  const contentStart = start + startMarker.length;
  const footer = html.indexOf('<footer id="retype-content-footer"', contentStart);
  const bottomInclude = html.indexOf("<!-- Add content to _includes/bottom.md", contentStart);
  const endCandidates = [footer, bottomInclude].filter((index) => index !== -1);
  const end = endCandidates.length ? Math.min(...endCandidates) : html.indexOf("</main>", contentStart);
  if (end === -1) throw new Error(`Could not find Retype content end in ${sourceFile}`);

  return html
    .slice(contentStart, end)
    .replace(/<div id="retype-sidebar-right-toggle"><\/div>/g, "")
    .replace(/<doc-page-actions><\/doc-page-actions>/g, "")
    .replace(/<doc-anchor-target[^>]*><\/doc-anchor-target>/g, "")
    .replace(/<a class="header-anchor"[^>]*>.*?<\/a>/g, "")
    .replace(/\sdata-turbo="false"/g, "")
    .replace(/href="\/([^"]*)"/g, 'href="#$1"');
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Chrome or Edge was not found. Install a Chromium-based browser or set CHROME_PATH.");
  }

  return found;
}

function buildPrintHtml(sections) {
  const generatedAt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  const toc = sections
    .map((section, index) => `<li><a href="#section-${index + 1}">${escapeHtml(section.title)}</a></li>`)
    .join("\n");

  const body = sections
    .map((section, index) => {
      const content = section.content.replace(/(<h1\b[^>]*)(>)/, `$1 id="section-${index + 1}"$2`);
      return `<section class="pdf-section">${content}</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>EightbornV Ceza Kanunu</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      color: #15171a;
      background: #fff;
      font-family: Arial, "Segoe UI", sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      margin: 0;
    }

    a {
      color: #184f9c;
      text-decoration: none;
    }

    .cover {
      min-height: 88vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      page-break-after: always;
      border-bottom: 1px solid #d9dee7;
    }

    .cover h1 {
      font-size: 36pt;
      line-height: 1.05;
      margin: 0 0 12pt;
      letter-spacing: 0;
    }

    .cover p {
      color: #555f6f;
      font-size: 12pt;
      margin: 0;
    }

    .toc {
      page-break-after: always;
    }

    .toc h1 {
      font-size: 22pt;
      margin-top: 0;
    }

    .toc ol {
      column-count: 2;
      column-gap: 24pt;
      padding-left: 18pt;
    }

    .toc li {
      break-inside: avoid;
      margin: 0 0 5pt;
    }

    .pdf-section {
      page-break-before: always;
    }

    .pdf-section:first-of-type {
      page-break-before: auto;
    }

    h1 {
      font-size: 22pt;
      line-height: 1.15;
      margin: 0 0 18pt;
      page-break-after: avoid;
    }

    h2 {
      font-size: 16pt;
      margin: 18pt 0 8pt;
      page-break-after: avoid;
    }

    h3 {
      font-size: 13.5pt;
      margin: 17pt 0 7pt;
      page-break-after: avoid;
    }

    h4 {
      font-size: 11.5pt;
      margin: 11pt 0 5pt;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 8pt;
    }

    ul, ol {
      margin: 0 0 9pt 18pt;
      padding: 0;
    }

    li {
      margin: 0 0 4pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0 14pt;
      font-size: 8.4pt;
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #d6dbe4;
      padding: 4pt 5pt;
      vertical-align: top;
    }

    th {
      background: #f1f4f8;
      color: #222b38;
      font-weight: 700;
    }

    code {
      font-family: "Consolas", monospace;
      font-size: 0.92em;
      background: #f3f5f8;
      border: 1px solid #e1e6ee;
      border-radius: 3px;
      padding: 0 3px;
    }

    blockquote,
    .callout,
    .alert,
    .doc-alert,
    [class*="alert"],
    [class*="callout"] {
      border-left: 4px solid #4677c9;
      background: #f4f7fc;
      margin: 10pt 0;
      padding: 8pt 10pt;
      page-break-inside: avoid;
    }

    .badge,
    retype-badge,
    .penal-badge {
      display: inline-block;
      border-radius: 4px;
      padding: 1pt 5pt;
      font-size: 0.9em;
      font-weight: 700;
      line-height: 1.35;
      white-space: nowrap;
      border: 1px solid #d6dbe4;
      background: #eef2f7;
      color: #202632;
    }

    .penal-badge-record {
      background: #eee7ff;
      border-color: #cdbdff;
      color: #5b21b6;
    }

    hr {
      border: 0;
      border-top: 1px solid #d9dee7;
      margin: 16pt 0;
    }

    .page-meta {
      color: #667085;
      font-size: 9pt;
      margin-top: 16pt;
    }
  </style>
</head>
<body>
  <section class="cover">
    <h1>EightbornV<br>Ceza Kanunu</h1>
    <p>PDF çıktı tarihi: ${escapeHtml(generatedAt)}</p>
    <p class="page-meta">Bu belge wiki içeriğinden otomatik üretilmiştir.</p>
  </section>
  <section class="toc">
    <h1>İçindekiler</h1>
    <ol>
      ${toc}
    </ol>
  </section>
  ${body}
</body>
</html>`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  ensureDir(outputDir);
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "next-wiki-pdf-"));
  const outputHtml = path.join(workDir, "ceza-kanunu.html");

  run(process.execPath, [path.join(root, "node_modules", "retypeapp", "retype.js"), "build", "."]);

  const sections = pageOrder.map((sourceFile) => {
    const builtHtml = sourceToBuiltHtml(sourceFile);
    if (!fs.existsSync(builtHtml)) {
      throw new Error(`Built HTML not found for ${sourceFile}: ${builtHtml}`);
    }

    return {
      title: getTitle(sourceFile),
      sourceFile,
      content: extractContent(read(builtHtml), sourceFile),
    };
  });

  fs.writeFileSync(outputHtml, buildPrintHtml(sections), "utf8");

  const browser = findBrowser();
  const userDataDir = path.join(workDir, "browser-profile");
  ensureDir(userDataDir);

  try {
    run(browser, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
      `--user-data-dir=${userDataDir}`,
      "--print-to-pdf-no-header",
      `--print-to-pdf=${outputPdf}`,
      `file:///${outputHtml.replace(/\\/g, "/")}`,
    ]);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  console.log(`PDF exported: ${outputPdf}`);
}

main();
