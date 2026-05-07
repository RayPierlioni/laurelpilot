import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["public", "server"];
const extensions = new Set([".js", ".html", ".css", ".mjs"]);
const blockedPatterns = [
  { label: "fetch(", regex: /fetch\(/ },
  { label: "XMLHttpRequest", regex: /XMLHttpRequest/ },
  { label: "api.openai", regex: /api\.openai/ },
  { label: "stripe", regex: /stripe/ },
  { label: "supabase", regex: /supabase/ },
  { label: "axios", regex: /axios/ },
  { label: "https://api", regex: /https:\/\/api/ },
];

const findings = [];

async function collectFiles(directory) {
  const absoluteDirectory = path.join(root, directory);
  const directoryStat = await stat(absoluteDirectory).catch(() => null);

  if (!directoryStat?.isDirectory()) {
    return [];
  }

  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(relativePath)));
      continue;
    }

    if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

for (const scanRoot of scanRoots) {
  const files = await collectFiles(scanRoot);

  for (const file of files) {
    const content = await readFile(path.join(root, file), "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of blockedPatterns) {
        if (pattern.regex.test(line)) {
          findings.push({
            file,
            line: index + 1,
            pattern: pattern.label,
            text: line.trim(),
          });
        }
      }
    });
  }
}

if (findings.length > 0) {
  console.error("External API guard failed. Runtime files contain blocked patterns:");
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} ${finding.pattern} ${finding.text}`);
  }
  process.exit(1);
}

console.log("External API guard passed: no blocked API-call patterns found in public/ or server/.");
