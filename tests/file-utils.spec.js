const { getArticleFiles } = require("../src/file-utils");
const fs = require("fs");
const path = require("path");

describe("file-utils", () => {
  test("getArticleFiles should return a list of markdown files in the articles directory", () => {
    const files = getArticleFiles();
    // 実際のファイルリストに合わせて期待値を更新
    const expectedFiles = [
      "articles/chiken_golf.md",
      "articles/kaikonhi.md",
      "articles/music_hearts.md",
      "articles/speak.md",
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
    const filePath = path.join("articles", "chiken_golf.md");
    const { title, body } =
      require("../src/file-utils").readArticleFile(filePath);
    expect(title).toContain("CHICKEN GOLF"); // より汎用的な部分一致チェック
    expect(title).toContain("チキンゴルフ");
    expect(body).toContain("# 【初心者歓迎】CHICKEN GOLF");
    expect(body).toContain("CHICKEN GOLFなら、ゴルフ経験ゼロでも");
  });
});
