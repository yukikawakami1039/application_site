const fs = require("fs");
const path = require("path");
const { copyAssets, copyFileSync } = require("../src/file-utils");

// テスト用のモック設定
jest.mock("fs");

describe("Assets Copy Functionality", () => {
  beforeEach(() => {
    // fs関数のモックをリセット
    jest.clearAllMocks();
  });

  describe("copyFileSync", () => {
    test("should copy a file from source to destination", () => {
      const sourcePath = path.join(process.cwd(), "assets", "style.css");
      const destPath = path.join(process.cwd(), "docs", "css", "style.css");
      const cssContent = ".main-container { max-width: 1000px; }";

      // モックの設定
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(cssContent);
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      copyFileSync(sourcePath, destPath);

      expect(fs.readFileSync).toHaveBeenCalledWith(sourcePath, "utf8");
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        destPath,
        cssContent,
        "utf8"
      );
    });
  });

  describe("copyAssets", () => {
    test("should copy assets from assets/ to docs/", () => {
      const cssContent = ".main-container { max-width: 1000px; }";
      const jsContent = "console.log('LensReview loaded');";

      // モックの設定
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(["style.css", "script.js"]);
      fs.statSync.mockReturnValue({ isFile: () => true });
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes("style.css")) return cssContent;
        if (filePath.includes("script.js")) return jsContent;
        return "";
      });
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});

      copyAssets();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("style.css"),
        cssContent,
        "utf8"
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("script.js"),
        jsContent,
        "utf8"
      );
    });
  });
});
