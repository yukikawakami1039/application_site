const fs = require('fs');
const path = require('path');

function getArticleFiles() {
  const articlesDir = path.join(process.cwd(), 'articles');
  const files = fs.readdirSync(articlesDir);
  return files.filter(file => file.endsWith('.md'))
              .map(file => path.join('articles', file));
}

function readArticleFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const titleMatch = content.match(/^#\s*(.*)/m);
  const title = titleMatch ? titleMatch[1] : '';

  return {
    title,
    body: content,
  };
}

module.exports = {
  getArticleFiles,
  readArticleFile,
};