const { getArticleFiles } = require('../src/file-utils');
const fs = require('fs');
const path = require('path');

describe('file-utils', () => {
  const articlesDir = path.join(__dirname, '..', 'articles');

  // テスト前にarticlesディレクトリをクリーンアップし、テスト用のファイルを作成
  beforeEach(() => {
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir);
    }
    fs.writeFileSync(path.join(articlesDir, 'test1.md'), '# テストタイトル\n\nこれはテスト記事の本文です。');
    fs.writeFileSync(path.join(articlesDir, 'test2.md'), '# Test Article 2');
    fs.writeFileSync(path.join(articlesDir, 'not-a-markdown.txt'), 'This is not a markdown file.');
  });

  // 各テスト後にarticlesディレクトリをクリーンアップ
  afterEach(() => {
    fs.readdirSync(articlesDir).forEach(file => {
      fs.unlinkSync(path.join(articlesDir, file));
    });
    fs.rmdirSync(articlesDir);
  });

  test('getArticleFiles should return a list of markdown files in the articles directory', () => {
    const files = getArticleFiles();
    const expectedFiles = [
      path.join('articles', 'test1.md'),
      path.join('articles', 'test2.md'),
    ];
    // パスの区切り文字をOSに合わせて調整
    const normalizedFiles = files.map(file => file.replace(/\\/g, '/'));
    const normalizedExpectedFiles = expectedFiles.map(file => file.replace(/\\/g, '/'));

    expect(normalizedFiles.sort()).toEqual(normalizedExpectedFiles.sort());
  });

  test('readArticleFile should return the content and title of a markdown file', () => {
    const filePath = path.join('articles', 'test1.md');
    const { title, body } = require('../src/file-utils').readArticleFile(filePath);
    expect(title).toBe('テストタイトル');
    expect(body).toBe('# テストタイトル\n\nこれはテスト記事の本文です。');
  });
});