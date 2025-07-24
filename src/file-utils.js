const fs = require("fs");
const path = require("path");

const OUTPUT_ROOT = "docs";

function createOutputDirs() {
  const docsDir = path.join(process.cwd(), "docs");
  const docsArticlesDir = path.join(docsDir, "articles");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  if (!fs.existsSync(docsArticlesDir)) {
    fs.mkdirSync(docsArticlesDir, { recursive: true });
  }
}

function cleanBuild() {
  const docsArticlesDir = path.join(process.cwd(), "docs", "articles");
  if (fs.existsSync(docsArticlesDir)) {
    fs.rmSync(docsArticlesDir, { recursive: true, force: true });
  }
}

function getArticleFiles() {
  const articlesDir = path.join(process.cwd(), "articles");
  const files = fs.readdirSync(articlesDir);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join("articles", file));
}

function readArticleFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, "utf8");
  const titleMatch = content.match(/^#\s*(.*)/m);
  const title = titleMatch ? titleMatch[1] : "";

  return {
    title,
    body: content,
  };
}

// assets コピー関連の関数
function copyFileSync(sourcePath, destPath) {
  // 宛先ディレクトリが存在しない場合は作成
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // ファイルをコピー
  const content = fs.readFileSync(sourcePath, "utf8");
  fs.writeFileSync(destPath, content, "utf8");
}

function copyAssets() {
  const assetsDir = path.join(process.cwd(), "assets");
  const docsDir = path.join(process.cwd(), "docs");

  console.debug('[copyAssets] Starting asset copy process');
  console.debug('[copyAssets] Assets dir:', assetsDir);
  console.debug('[copyAssets] Docs dir:', docsDir);

  if (!fs.existsSync(assetsDir)) {
    console.debug('[copyAssets] Assets directory does not exist, skipping');
    return;
  }

  const files = fs.readdirSync(assetsDir);
  console.debug('[copyAssets] Found files:', files);

  files.forEach((file) => {
    const sourcePath = path.join(assetsDir, file);
    const stats = fs.statSync(sourcePath);

    if (stats.isFile()) {
      let destPath;

      // ファイルの種類に応じて適切なディレクトリに配置
      if (file === "style.css") {
        destPath = path.join(docsDir, "css", file);
      } else if (file === "script.js") {
        destPath = path.join(docsDir, "js", file);
      } else {
        destPath = path.join(docsDir, file);
      }

      console.debug('[copyAssets]', { srcPath: sourcePath, destPath });

      try {
        copyFileSync(sourcePath, destPath);
        console.debug('[copyAssets] Successfully copied:', file);
      } catch (error) {
        console.error('[copyAssets] Error copying file:', file, error);
      }
    }
  });

  console.debug('[copyAssets] Asset copy process completed');
}

module.exports = {
  OUTPUT_ROOT,
  createOutputDirs,
  cleanBuild,
  getArticleFiles,
  readArticleFile,
  copyFileSync,
  copyAssets,
};
