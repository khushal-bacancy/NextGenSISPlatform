const fs = require("fs");
const path = require("path");

const nextServerAppDir = path.join(process.cwd(), ".next", "server", "app");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function ensureManifestStub(manifestPath) {
  if (fs.existsSync(manifestPath)) {
    return false;
  }
  const content = "globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};\n";
  fs.writeFileSync(manifestPath, content, "utf8");
  return true;
}

function run() {
  const allFiles = walk(nextServerAppDir);
  const nftFiles = allFiles.filter((file) => file.endsWith("page.js.nft.json"));
  let created = 0;

  for (const nftFile of nftFiles) {
    const raw = fs.readFileSync(nftFile, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const referencesManifest = Array.isArray(parsed.files)
      && parsed.files.some((item) => item.endsWith("page_client-reference-manifest.js"));
    if (!referencesManifest) {
      continue;
    }
    const manifestPath = path.join(path.dirname(nftFile), "page_client-reference-manifest.js");
    if (ensureManifestStub(manifestPath)) {
      created += 1;
    }
  }

  console.log(
    created > 0
      ? `Created ${created} missing client-reference manifest stub(s).`
      : "No missing client-reference manifests found."
  );
}

run();
