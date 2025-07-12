const { getArticleFiles } = require("../src/file-utils");
const fs = require("fs");
const path = require("path");

describe("file-utils", () => {
  test("getArticleFiles should return a list of markdown files in the articles directory", () => {
    const files = getArticleFiles();
    const expectedFiles = [
      path.join("articles", "test.md"),
      path.join("articles", "test1.md"),
      path.join("articles", "test2.md"),
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
    expect(title).toBe("テスト記事1");
    expect(body).toContain("# テスト記事1");
    expect(body).toContain("これはテスト記事1の内容です。");
  });
});
