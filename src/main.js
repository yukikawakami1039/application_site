const fs = require("fs");
const path = require("path");
const marked = require("marked");
const {
  OUTPUT_ROOT,
  createOutputDirs,
  cleanBuild,
  getArticleFiles,
  readArticleFile,
} = require("./file-utils");

function writeHtmlFile(outputPath, content) {
  fs.writeFileSync(outputPath, content, "utf8");
}

function build() {
  cleanBuild();
  createOutputDirs();

  const articleFiles = getArticleFiles();
  const articleLinks = [];

  articleFiles.forEach((filePath) => {
    const { title, body } = readArticleFile(filePath);
    const htmlContent = marked.parse(body);
    const fileName = path.basename(filePath, ".md");
    const outputPath = path.join(
      process.cwd(),
      OUTPUT_ROOT,
      "articles",
      `${fileName}.html`
    );

    const articleHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
</head>
<body>
    <a href="../index.html">トップへ戻る</a>
    <hr>
    ${htmlContent}
</body>
</html>`;

    writeHtmlFile(outputPath, articleHtml);
    articleLinks.push(
      `<li><a href="articles/${fileName}.html">${title}</a></li>`
    );
  });

  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>記事一覧</title>
</head>
<body>
    <h1>記事一覧</h1>
    <ul>
        ${articleLinks.join("\n        ")}
    </ul>
</body>
</html>`;

  writeHtmlFile(path.join(process.cwd(), OUTPUT_ROOT, "index.html"), indexHtml);
}

module.exports = {
  build,
};

// スクリプトとして実行された場合はビルドを実行
if (require.main === module) {
  build();
}
