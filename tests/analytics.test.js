/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");
const { build } = require("../src/main");

describe("Cloudflare Analytics Integration", () => {
  beforeEach(() => {
    // テスト前にクリーンアップ
    if (fs.existsSync(path.join(process.cwd(), "docs"))) {
      fs.rmSync(path.join(process.cwd(), "docs"), {
        recursive: true,
        force: true,
      });
    }
  });

  afterEach(() => {
    // テスト後にクリーンアップ
    if (fs.existsSync(path.join(process.cwd(), "docs"))) {
      fs.rmSync(path.join(process.cwd(), "docs"), {
        recursive: true,
        force: true,
      });
    }
  });

  test("Cloudflare beacon injected into index", () => {
    // ビルド実行
    build();

    // index.htmlの内容を読み取り
    const indexPath = path.join(process.cwd(), "docs", "index.html");
    expect(fs.existsSync(indexPath)).toBe(true);

    const html = fs.readFileSync(indexPath, "utf8");

    // Cloudflare beaconが含まれていることを確認
    expect(html).toMatch(/static\.cloudflareinsights/);
    expect(html).toMatch(/data-cf-beacon/);

    // beaconが1回だけ含まれていることを確認（重複注入を防ぐ）
    const beaconMatches = html.match(/static\.cloudflareinsights/g);
    expect(beaconMatches).toHaveLength(1);
  });

  test("Cloudflare beacon injected into article pages", () => {
    // ビルド実行
    build();

    // 記事ページをチェック
    const articlesDir = path.join(process.cwd(), "docs", "articles");
    const articleFiles = fs
      .readdirSync(articlesDir)
      .filter((file) => file.endsWith(".html"));

    expect(articleFiles.length).toBeGreaterThan(0);

    articleFiles.forEach((fileName) => {
      const articlePath = path.join(articlesDir, fileName);
      const html = fs.readFileSync(articlePath, "utf8");

      // 各記事ページにbeaconが含まれていることを確認
      expect(html).toMatch(/static\.cloudflareinsights/);
      expect(html).toMatch(/data-cf-beacon/);

      // beaconが1回だけ含まれていることを確認
      const beaconMatches = html.match(/static\.cloudflareinsights/g);
      expect(beaconMatches).toHaveLength(1);
    });
  });

  test("beacon not duplicated on multiple builds", () => {
    // 最初のビルド
    build();

    const indexPath = path.join(process.cwd(), "docs", "index.html");
    const firstBuildHtml = fs.readFileSync(indexPath, "utf8");

    // 2回目のビルド
    build();

    const secondBuildHtml = fs.readFileSync(indexPath, "utf8");

    // beaconが重複していないことを確認
    const firstMatches = firstBuildHtml.match(/static\.cloudflareinsights/g);
    const secondMatches = secondBuildHtml.match(/static\.cloudflareinsights/g);

    expect(firstMatches).toHaveLength(1);
    expect(secondMatches).toHaveLength(1);
  });
});
