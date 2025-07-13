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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>${title} | ReviewHub</title>
    <link rel="stylesheet" href="../css/style.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <div class="header-content">
          <a href="../index.html" class="site-logo">ReviewHub</a>
          <nav class="main-nav">
            <div class="nav-item">
              <a href="../index.html" class="nav-link">ホーム</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">レビュー</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">比較</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">ニュース</a>
            </div>
          </nav>
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
              <a href="../index.html">ホーム</a> > <span>記事</span> >
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
            <div class="sidebar-widget">
              <div class="widget-header">
                <h3 class="widget-title">人気記事</h3>
              </div>
              <div class="widget-content">
                <ul class="popular-list">
                  <li class="popular-item">
                    <div class="popular-rank gold">1</div>
                    <div class="popular-content">
                      <a href="#" class="popular-title">最新攻略法</a>
                      <div class="popular-meta">👁 5,240 | 📅 2025/07/13</div>
                    </div>
                  </li>
                  <li class="popular-item">
                    <div class="popular-rank silver">2</div>
                    <div class="popular-content">
                      <a href="#" class="popular-title">おすすめ情報</a>
                      <div class="popular-meta">👁 4,180 | 📅 2025/07/12</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>ReviewHub</h3>
            <p>最新の情報とレビューをお届けします。</p>
          </div>
          <div class="footer-section">
            <h3>サイト情報</h3>
            <ul class="footer-links">
              <li><a href="#">お問い合わせ</a></li>
              <li><a href="#">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 ReviewHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <script src="../js/article-search.js"></script>
  </body>    </html>`;

    writeHtmlFile(outputPath, injectBeacon(articleHtml));
    articleLinks.push(
      `<article class="article-card">
                  <a
                    href="articles/${fileName}.html"
                    style="text-decoration: none; color: inherit"
                  >
                    <div class="card-thumbnail">
                      <img
                        src="https://via.placeholder.com/400x225"
                        alt="記事のサムネイル"
                        class="card-image"
                      />
                      <span class="card-badge">記事</span>
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">${title}</h3>
                      <p class="card-excerpt">
                        記事の内容をご覧ください...
                      </p>
                      <div class="card-meta">
                        <div class="card-date">📅 2025/07/13</div>
                        <div class="card-views">👁 1,230</div>
                      </div>
                    </div>
                  </a>
                </article>`
    );
  });

  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>記事一覧 - レビューサイト</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="container">
        <div class="header-content">
          <a href="#" class="site-logo">ReviewHub</a>
          <nav class="main-nav">
            <div class="nav-item">
              <a href="#" class="nav-link active">ホーム</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">レビュー</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">比較</a>
            </div>
            <div class="nav-item">
              <a href="#" class="nav-link">ニュース</a>
            </div>
          </nav>
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
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">信頼できる商品・サービス情報</h1>
          <p class="hero-subtitle">
            実際の体験に基づいたレビューと比較で、あなたの選択をサポート        
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">1,200+</span>
              <span class="stat-label">レビュー記事</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">150+</span>
              <span class="stat-label">対象商品</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">10,000+</span>
              <span class="stat-label">月間ユーザー</span>
            </div>
          </div>
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
          </div>
          <!-- サイドバー -->
          <aside class="sidebar">
            <!-- 人気記事ランキング -->
            <div class="sidebar-widget">
              <div class="widget-header">
                <h3 class="widget-title">人気記事ランキング</h3>
              </div>
              <div class="widget-content">
                <ul class="popular-list">
                  <li class="popular-item">
                    <div class="popular-rank gold">1</div>
                    <div class="popular-content">
                      <a href="#" class="popular-title">人気記事1</a>
                      <div class="popular-meta">👁 5,240 | 📅 2025/07/13</div>   
                    </div>
                  </li>
                  <li class="popular-item">
                    <div class="popular-rank silver">2</div>
                    <div class="popular-content">
                      <a href="#" class="popular-title">人気記事2</a>
                      <div class="popular-meta">👁 4,180 | 📅 2025/07/12</div>   
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <!-- カテゴリー -->
            <div class="sidebar-widget">
              <div class="widget-header">
                <h3 class="widget-title">カテゴリー</h3>
              </div>
              <div class="widget-content">
                <div class="category-list">
                  <a href="#" class="category-item">
                    <span class="category-name">商品レビュー</span>
                    <span class="category-count">156</span>
                  </a>
                  <a href="#" class="category-item">
                    <span class="category-name">サービス比較</span>
                    <span class="category-count">89</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    <!-- フッター -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>サイトについて</h3>
            <ul class="footer-links">
              <li><a href="#">運営方針</a></li>
              <li><a href="#">プライバシーポリシー</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>コンテンツ</h3>
            <ul class="footer-links">
              <li><a href="#">最新記事</a></li>
              <li><a href="#">人気記事</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 ReviewHub. All rights reserved.</p>
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
