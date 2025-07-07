const fs = require('fs');
const path = require('path');
const { build } = require('../src/main');

// fsモジュールをモック化
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // fsの実際の関数を一部保持
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('main build process', () => {
  const articlesDir = path.join(process.cwd(), 'articles');
  const publicDir = path.join(process.cwd(), 'public');
  const publicArticlesDir = path.join(publicDir, 'articles');

  beforeEach(() => {
    // モックのリセット
    fs.readdirSync.mockReset();
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
    fs.existsSync.mockReset();
    fs.mkdirSync.mockReset();

    // ディレクトリが存在しないと仮定
    fs.existsSync.mockReturnValue(false);

    // getArticleFilesが返す値をモック
    fs.readdirSync.mockReturnValueOnce([
      'test1.md',
      'test2.md',
      'not-a-markdown.txt',
    ]);

    // readArticleFileが返す値をモック
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('test1.md')) {
        return '# テストタイトル1\n\n本文1';
      } else if (filePath.includes('test2.md')) {
        return '# テストタイトル2\n\n本文2';
      }
      return '';
    });
  });

  test('should generate HTML files for each markdown article', () => {
    build();

    // public/articlesディレクトリが作成されることを確認
    expect(fs.mkdirSync).toHaveBeenCalledWith(publicDir, { recursive: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith(publicArticlesDir, { recursive: true });

    // test1.mdからtest1.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(publicArticlesDir, 'test1.html'),
      expect.stringContaining('<title>テストタイトル1</title>'),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(publicArticlesDir, 'test1.html'),
      expect.stringContaining('<h1>テストタイトル1</h1>\n<p>本文1</p>'),
      'utf8'
    );

    // test2.mdからtest2.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(publicArticlesDir, 'test2.html'),
      expect.stringContaining('<title>テストタイトル2</title>'),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(publicArticlesDir, 'test2.html'),
      expect.stringContaining('<h1>テストタイトル2</h1>\n<p>本文2</p>'),
      'utf8'
    );

    // index.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(publicDir, 'index.html'),
      expect.stringContaining(
        '<h1>記事一覧</h1>' +
        '\n    <ul>' +
        '\n        <li><a href="articles/test1.html">テストタイトル1</a></li>' +
        '\n        <li><a href="articles/test2.html">テストタイトル2</a></li>' +
        '\n    </ul>'
      ),
      'utf8'
    );
  });
});