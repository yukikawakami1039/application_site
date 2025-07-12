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

module.exports = {
  OUTPUT_ROOT,
  createOutputDirs,
  cleanBuild,
  getArticleFiles,
  readArticleFile,
};
