const fs = require("fs");
const path = require("path");
const { copyAssets } = require("../src/file-utils");

// テスト用のモック設定
jest.mock("fs");

describe("Debug Assets Copy", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 基本的なモック設定
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes("assets")) return true;
      if (filePath.includes("docs")) return true;
      return false;
    });

    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes("assets")) {
        return ["style.css", "script.js"];
      }
      return [];
    });

    fs.statSync.mockImplementation(() => ({
      isFile: () => true,
      isDirectory: () => false,
    }));

    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes("style.css")) {
        return ".container { margin: 0 auto; }";
      }
      if (filePath.includes("script.js")) {
        return "console.log('test');";
      }
      return "";
    });

    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
  });

  test("should handle missing assets directory gracefully", () => {
    // assetsディレクトリが存在しない場合をテスト
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes("assets")) return false;
      return true;
    });

    copyAssets();

    // ファイルコピーが呼ばれないことを確認
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test("should create correct directory structure", () => {
    copyAssets();

    // docs/cssディレクトリが作成されることを確認
    const expectedCssDir = path.join(process.cwd(), "docs", "css");
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedCssDir, {
      recursive: true,
    });

    // docs/jsディレクトリが作成されることを確認
    const expectedJsDir = path.join(process.cwd(), "docs", "js");
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedJsDir, {
      recursive: true,
    });
  });

  test("should verify file paths match expected docs structure", () => {
    copyAssets();

    // style.cssが正確にdocs/css/style.cssにコピーされることを確認
    const expectedCssPath = path.join(
      process.cwd(),
      "docs",
      "css",
      "style.css"
    );
    const cssWriteCall = fs.writeFileSync.mock.calls.find(
      (call) => call[0] === expectedCssPath
    );
    expect(cssWriteCall).toBeDefined();

    // script.jsが正確にdocs/js/script.jsにコピーされることを確認
    const expectedJsPath = path.join(process.cwd(), "docs", "js", "script.js");
    const jsWriteCall = fs.writeFileSync.mock.calls.find(
      (call) => call[0] === expectedJsPath
    );
    expect(jsWriteCall).toBeDefined();
  });
});
