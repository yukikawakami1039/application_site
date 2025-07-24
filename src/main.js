const fs = require("fs");
const path = require("path");
const marked = require("marked");
const {
  OUTPUT_ROOT,
  createOutputDirs,
  cleanBuild,
  getArticleFiles,
  getGameFiles,
  readArticleFile,
  copyAssets,
} = require("./file-utils");

// Cloudflare Web Analytics beacon for PV tracking
// TODO: Replace "YOUR_SITE_ID" with actual Cloudflare site token before deployment
const BEACON =
  '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ' +
  'data-cf-beacon=\'{"token":"30cf6039280346649693ea9f201e6f43"}\'></script>';

function injectBeacon(html) {
  return html.includes("static.cloudflareinsights")
    ? html
    : html.replace("</head>", `${BEACON}\n</head>`);
}

function writeHtmlFile(outputPath, content) {
  fs.writeFileSync(outputPath, content, "utf8");
}

function build() {
  cleanBuild();
  createOutputDirs();

  // Build articles
  const articleFiles = getArticleFiles();
  const articleLinks = buildSection(articleFiles, 'articles');

  // Build games
  const gameFiles = getGameFiles();
  const gameLinks = buildSection(gameFiles, 'games');

  // Build main index page
  buildMainIndex(articleLinks, gameLinks);

  // Copy assets after HTML generation
  copyAssets();

  console.debug("build complete");
}

function buildSection(files, sectionType) {
  const links = [];
  
  if (files.length === 0) {
    // Build section index if it's games (even with empty list)
    if (sectionType === 'games') {
      buildGamesIndex([]);
    }
    return [];
  }
  
  files.forEach((filePath) => {
    const { title, body } = readArticleFile(filePath);
    const htmlContent = marked.parse(body);
    const fileName = path.basename(filePath, ".md");
    const outputPath = path.join(
      process.cwd(),
      OUTPUT_ROOT,
      sectionType,
      `${fileName}.html`
    );

    const pageHtml = buildPageHtml(title, htmlContent, sectionType);
    writeHtmlFile(outputPath, injectBeacon(pageHtml));
    
    const linkHtml = buildLinkHtml(title, fileName, sectionType);
    links.push(linkHtml);
  });

  // Build section index if it's games
  if (sectionType === 'games') {
    buildGamesIndex(links);
  }

  return links;
}

function buildPageHtml(title, htmlContent, sectionType) {
  const breadcrumbText = sectionType === 'games' ? 'ゲーム' : '記事';
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>${title} | LensReview</title>
    <link rel="stylesheet" href="../css/style.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <div class="header-content">
          <a href="../index.html" class="site-logo" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 1.8rem; color: #2c3e50; text-decoration: none; letter-spacing: -0.02em;">
            <span style="color: #00d4aa;">Lens</span>Review
          </a>
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="商品・サービスを検索..."
            />
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
      <div class="container">
        <div class="content-wrapper">
          <div class="articles-section">
            <nav class="breadcrumb">
              <a href="../index.html">ホーム</a> > <span>${breadcrumbText}</span> >
              <span>${title}</span>
            </nav>
            <article class="article-detail">
              <div class="article-header">
                <h1 class="article-title">${title}</h1>
              </div>
              <div class="article-content">
                ${htmlContent}
              </div>
            </article>
          </div>
          <aside class="sidebar">
          </aside>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-bottom">
          <p>&copy; 2025 LensReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <script src="../js/article-search.js"></script>
  </body>    </html>`;
}

function buildLinkHtml(title, fileName, sectionType) {
  return `<article class="article-card">
                  <a
                    href="${sectionType}/${fileName}.html"
                    style="text-decoration: none; color: inherit"
                  >
                    <div class="card-thumbnail">
                      <img
                        src="https://picsum.photos/400/225?random=${Math.floor(
                          Math.random() * 1000
                        )}"
                        alt="${sectionType === 'games' ? 'ゲーム' : '記事'}のサムネイル"
                        class="card-image"
                      />
                      <span class="card-badge">${sectionType === 'games' ? 'ゲーム' : '記事'}</span>
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">${title}</h3>
                      <p class="card-excerpt">
                        ${sectionType === 'games' ? 'ゲーム' : '記事'}の内容をご覧ください...
                      </p>
                      <div class="card-meta">
                        <div class="card-date">📅 2025/07/13</div>
                        <div class="card-views">👁 1,230</div>
                      </div>
                    </div>
                  </a>
                </article>`;
}

function buildGamesIndex(gameLinks) {
  const gamesIndexPath = path.join(process.cwd(), OUTPUT_ROOT, "games", "index.html");
  
  const gamesIndexHtml = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>ゲーム一覧 - LensReview</title>
    <link rel="stylesheet" href="../css/style.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <div class="header-content">
          <a href="../index.html" class="site-logo" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 1.8rem; color: #2c3e50; text-decoration: none; letter-spacing: -0.02em;">
            <span style="color: #00d4aa;">Lens</span>Review
          </a>
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="商品・サービスを検索..."
            />
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
      <div class="container">
        <div class="content-wrapper">
          <div class="articles-section">
            <nav class="breadcrumb">
              <a href="../index.html">ホーム</a> > <span>ゲーム一覧</span>
            </nav>
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">ゲーム一覧</h2>
              </div>
              <div class="article-grid">
                ${gameLinks.join("\n                ")}
              </div>
            </section>
          </div>
          <aside class="sidebar">
          </aside>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-bottom">
          <p>&copy; 2025 LensReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <script src="../js/article-search.js"></script>
  </body>
</html>`;
  
  writeHtmlFile(gamesIndexPath, injectBeacon(gamesIndexHtml));
}

function buildMainIndex(articleLinks, gameLinks) {
  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>記事一覧 - LensReview</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="container">
        <div class="header-content">
          <a href="#" class="site-logo" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 1.8rem; color: #2c3e50; text-decoration: none; letter-spacing: -0.02em;">
            <span style="color: #00d4aa;">Lens</span>Review
          </a>
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="商品・サービスを検索..."
            />
          </div>
        </div>
      </div>
    </header>
    <!-- ヒーローセクション -->
    <section class="hero" style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://picsum.photos/1920/800?random=6'); background-size: cover; background-position: center; background-attachment: fixed; background-repeat: no-repeat; position: relative; min-height: 80vh; display: flex; align-items: center;">
      <div class="container">
        <div class="hero-content" style="color: white; text-align: center; max-width: 900px; margin: 0 auto; padding: 4rem 0;">
          <h1 class="hero-title" style="font-size: clamp(2.5rem, 5vw, 4.5rem); margin-bottom: 1.5rem; font-weight: 300; line-height: 1.1; letter-spacing: -0.02em; font-family: 'Helvetica Neue', Arial, sans-serif;">
            Discover<br>
            <span style="font-weight: 700; background: linear-gradient(135deg, #00d4aa, #00a3cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Authentic Reviews</span>
          </h1>
          <p class="hero-subtitle" style="font-size: clamp(1.1rem, 2.5vw, 1.4rem); margin-bottom: 3rem; opacity: 0.9; line-height: 1.7; font-weight: 300; max-width: 600px; margin-left: auto; margin-right: auto; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.01em;">
            実際の体験から生まれた信頼できるレビューで、<br>
            あなたの最適な選択をサポートします
          </p>
        </div>
      </div>
    </section>
    <!-- メインコンテンツ -->
    <main class="main-content">
      <div class="container">
        <div class="content-wrapper">
          <!-- 記事一覧 -->
          <div class="articles-section">
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">最新記事</h2>
                <a href="#" class="section-link">すべて見る →</a>
              </div>
              <div class="article-grid">
                ${articleLinks.join("\n                ")}
              </div>
            </section>
            ${gameLinks.length > 0 ? `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">ゲーム</h2>
                <a href="games/" class="section-link">ゲーム一覧 →</a>
              </div>
              <div class="article-grid">
                ${gameLinks.join("\n                ")}
              </div>
            </section>` : ''}
          </div>
          <!-- サイドバー -->
          <aside class="sidebar">
          </aside>
        </div>
      </div>
    </main>
    <!-- フッター -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-bottom">
          <p>&copy; 2025 LensReview. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <!-- JavaScript -->
    <script src="js/search.js"></script>
  </body>
</html>`;

  writeHtmlFile(
    path.join(process.cwd(), OUTPUT_ROOT, "index.html"),
    injectBeacon(indexHtml)
  );
}

module.exports = {
  build,
};

// スクリプトとして実行された場合はビルドを実行
if (require.main === module) {
  build();
}
