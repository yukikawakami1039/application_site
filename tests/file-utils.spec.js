const { getArticleFiles } = require("../src/file-utils");
const fs = require("fs");
const path = require("path");

describe("file-utils", () => {
  test("getArticleFiles should return a list of markdown files in the articles directory", () => {
    const files = getArticleFiles();
    // 実際のファイルリストに合わせて期待値を更新
    const expectedFiles = [
      "articles/chiken_golf.md",
      "articles/genshin-impact-guide.md",
      "articles/kaikonhi.md",
      "articles/music_hearts.md",
      "articles/nyanko-senso.md",
      "articles/speak.md",
      "articles/test.md",
      "articles/test1.md",
      "articles/test2.md",
      "articles/townlife.md",
    ];

    // パスの区切り文字をOSに合わせて調整
    const normalizedFiles = files.map((file) => file.replace(/\\/g, "/"));
    const normalizedExpectedFiles = expectedFiles.map((file) =>
      file.replace(/\\/g, "/")
    );

    expect(normalizedFiles.sort()).toEqual(normalizedExpectedFiles.sort());
  });

  test("readArticleFile should return the content and title of a markdown file", () => {
    const filePath = path.join("articles", "test1.md");
    const { title, body } =
      require("../src/file-utils").readArticleFile(filePath);
    expect(title).toBe("テスト記事 1"); // 実際のファイル内容に合わせて修正
    expect(body).toContain("# テスト記事 1");
    expect(body).toContain("これはテスト記事 1 の内容です。");
  });
});
