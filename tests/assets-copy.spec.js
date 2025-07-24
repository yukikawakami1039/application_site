const fs = require("fs");
const path = require("path");
const { copyAssets, copyFileSync } = require("../src/file-utils");

// テスト用のモック設定
jest.mock("fs");

describe("Assets Copy Functionality", () => {
  beforeEach(() => {
    // fs関数のモックをリセット
    jest.clearAllMocks();

    // 既存ファイルの存在をモック
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes("assets")) return true; // assetsディレクトリ全体の存在をモック
      if (filePath.includes("docs")) return true;
      return false;
    });

    // ディレクトリ読み込みをモック
    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes("assets")) {
        return ["style.css", "script.js"];
      }
      return [];
    });

    // ファイル統計情報をモック
    fs.statSync.mockImplementation(() => ({
      isFile: () => true,
      isDirectory: () => false,
    }));

    // ファイル読み込みをモック
    fs.readFileSync.mockImplementation((filePath, encoding) => {
      if (filePath.includes("style.css")) {
        return `
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 16px;
          }
          
          .main-container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            padding: 2rem;
          }
          
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .site-header {
            background: #fff;
            border-bottom: 1px solid #e5e5e5;
          }
        `;
      }
      if (filePath.includes("script.js")) {
        return `
          document.addEventListener('DOMContentLoaded', function() {
            console.log('LensReview loaded');
          });
        `;
      }
      return "";
    });

    // ファイル書き込みをモック - 引数を記録
    fs.writeFileSync.mockImplementation((filePath, content, encoding) => {
      // 実際には何もしないが、Jest がモック呼び出しを記録する
    });

    // ディレクトリ作成をモック
    fs.mkdirSync.mockImplementation(() => {});
  });

  describe("copyFileSync", () => {
    test("should copy a single file from source to destination", () => {
      const sourcePath = path.join(process.cwd(), "assets", "style.css");
      const destPath = path.join(process.cwd(), "docs", "css", "style.css");

      copyFileSync(sourcePath, destPath);

      expect(fs.readFileSync).toHaveBeenCalledWith(sourcePath, "utf8");
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        destPath,
        expect.any(String),
        "utf8"
      );

      // 内容の検証は別途実行
      const writeCall = fs.writeFileSync.mock.calls.find(
        (call) => call[0] === destPath
      );
      expect(writeCall).toBeDefined();
      expect(writeCall[1]).toMatch(/\.container/);
    });

    test("should create destination directory if it doesn't exist", () => {
      const sourcePath = path.join(process.cwd(), "assets", "script.js");
      const destPath = path.join(process.cwd(), "docs", "js", "script.js");

      // この特定のテストでは、ディレクトリが存在しないケースをテスト
      fs.existsSync.mockImplementation((filePath) => {
        if (filePath.includes("script.js")) return true;
        if (filePath.includes("docs/js")) return false;
        if (filePath.includes("assets")) return true;
        return false;
      });

      copyFileSync(sourcePath, destPath);

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(destPath), {
        recursive: true,
      });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe("copyAssets", () => {
    test("should copy all assets from assets/ to docs/ with flexible content checking", () => {
      copyAssets();

      // style.cssがdocs/css/にコピーされることを確認（内容は any(String) で柔軟にチェック）
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("docs/css/style.css"),
        expect.stringContaining(".container"),
        "utf8"
      );

      // script.jsがdocs/js/にコピーされることを確認（内容は any(String) で柔軟にチェック）
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("docs/js/script.js"),
        expect.stringContaining("LensReview loaded"),
        "utf8"
      );

      // CSS内容の検証（別途変数に保存してから toMatch で検証）
      const cssWriteCall = fs.writeFileSync.mock.calls.find((call) =>
        call[0].includes("style.css")
      );
      expect(cssWriteCall).toBeDefined();
      expect(cssWriteCall[1]).toMatch(/\.container/);

      // JS内容の検証（別途変数に保存してから toMatch で検証）
      const jsWriteCall = fs.writeFileSync.mock.calls.find((call) =>
        call[0].includes("script.js")
      );
      expect(jsWriteCall).toBeDefined();
      expect(jsWriteCall[1]).toMatch(/LensReview loaded/);
    });

    test("should ensure docs/css/style.css path is created", () => {
      copyAssets();

      // docs/css/style.cssの完全パスが作成されることを確認
      const expectedPath = path.join(process.cwd(), "docs", "css", "style.css");
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedPath,
        expect.any(String),
        "utf8"
      );

      // ディレクトリ作成が呼ばれることを確認（docs/cssディレクトリ）
      const expectedDir = path.join(process.cwd(), "docs", "css");
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, {
        recursive: true,
      });
    });

    test("should verify that copied CSS contains .main-container class", () => {
      copyAssets();

      // writeFileSyncが.main-containerを含むCSSで呼ばれることを確認
      const writeCall = fs.writeFileSync.mock.calls.find((call) =>
        call[0].includes("style.css")
      );

      expect(writeCall).toBeDefined();
      expect(writeCall[1]).toMatch(/\.main-container\s*{/);
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

    test("should create correct directory structure for CSS files", () => {
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

    test("should handle file copy errors gracefully", () => {
      // copyFileSyncが例外を投げる場合をテスト
      const mockError = new Error("Permission denied");
      fs.readFileSync.mockImplementation(() => {
        throw mockError;
      });

      // consoleのエラーログをモック
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      copyAssets();

      // エラーがコンソールに出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith(
        "[copyAssets] Error copying file:",
        "style.css",
        mockError
      );

      consoleSpy.mockRestore();
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
      const expectedJsPath = path.join(
        process.cwd(),
        "docs",
        "js",
        "script.js"
      );
      const jsWriteCall = fs.writeFileSync.mock.calls.find(
        (call) => call[0] === expectedJsPath
      );
      expect(jsWriteCall).toBeDefined();
    });
  });
});
