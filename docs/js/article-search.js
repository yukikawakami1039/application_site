// 記事ページ専用の検索機能
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        // 記事ページからの検索は、検索結果をindex.htmlに移動して表示
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    // 検索語をURLパラメータとしてindex.htmlに遷移
                    const baseUrl = window.location.href.includes('/articles/') 
                        ? '../index.html' 
                        : 'index.html';
                    window.location.href = `${baseUrl}?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
        
        // 検索ボタンのクリックイベント
        const searchButton = document.querySelector('.search-box button');
        if (searchButton) {
            searchButton.addEventListener('click', function(e) {
                e.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    const baseUrl = window.location.href.includes('/articles/') 
                        ? '../index.html' 
                        : 'index.html';
                    window.location.href = `${baseUrl}?search=${encodeURIComponent(searchTerm)}`;
                }
            });
        }
    }
});
