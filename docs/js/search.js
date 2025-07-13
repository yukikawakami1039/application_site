// 検索機能の実装
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-input");
  const articleCards = document.querySelectorAll(".article-card");
  const noResultsMessage = document.createElement("div");

  // URLパラメータから検索語を取得
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");

  // 検索結果なしメッセージの作成
  noResultsMessage.className = "no-results";
  noResultsMessage.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
            <h3>検索結果が見つかりませんでした</h3>
            <p>別のキーワードで検索してみてください</p>
        </div>
    `;

  // 記事データの抽出（検索対象のテキスト）
  const articleData = Array.from(articleCards).map((card) => {
    const title = card.querySelector(".card-title")?.textContent || "";
    const excerpt = card.querySelector(".card-excerpt")?.textContent || "";
    const href = card.querySelector("a")?.getAttribute("href") || "";

    return {
      element: card,
      title: title.toLowerCase(),
      excerpt: excerpt.toLowerCase(),
      href: href,
      searchText: (title + " " + excerpt).toLowerCase(),
    };
  });

  // 検索実行関数
  function performSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    let visibleCount = 0;

    if (searchTerm === "") {
      // 検索語が空の場合は全て表示
      articleData.forEach((item) => {
        item.element.style.display = "block";
        visibleCount++;
      });
      removeNoResultsMessage();
    } else {
      // 検索実行
      articleData.forEach((item) => {
        const isMatch =
          item.searchText.includes(searchTerm) ||
          item.title.includes(searchTerm) ||
          item.excerpt.includes(searchTerm);

        if (isMatch) {
          item.element.style.display = "block";
          visibleCount++;
        } else {
          item.element.style.display = "none";
        }
      });

      // 検索結果がない場合のメッセージ表示
      if (visibleCount === 0) {
        showNoResultsMessage();
      } else {
        removeNoResultsMessage();
      }
    }

    // 検索結果件数の更新
    updateResultCount(visibleCount, searchTerm);
  }

  // 検索結果なしメッセージの表示
  function showNoResultsMessage() {
    const articleGrid = document.querySelector(".article-grid");
    if (articleGrid && !document.querySelector(".no-results")) {
      articleGrid.appendChild(noResultsMessage);
    }
  }

  // 検索結果なしメッセージの削除
  function removeNoResultsMessage() {
    const existingMessage = document.querySelector(".no-results");
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  // 検索結果件数の更新
  function updateResultCount(count, searchTerm) {
    let resultInfo = document.querySelector(".search-result-info");

    if (!resultInfo) {
      resultInfo = document.createElement("div");
      resultInfo.className = "search-result-info";
      resultInfo.style.cssText = `
                margin-bottom: 20px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
                font-size: 14px;
                color: #666;
            `;

      const sectionHeader = document.querySelector(".section-header");
      if (sectionHeader) {
        sectionHeader.insertAdjacentElement("afterend", resultInfo);
      }
    }

    if (searchTerm) {
      resultInfo.innerHTML = `「${searchTerm}」の検索結果: ${count}件`;
      resultInfo.style.display = "block";
    } else {
      resultInfo.style.display = "none";
    }
  }

  // リアルタイム検索のイベントリスナー
  if (searchInput) {
    // 入力時の検索（デバウンス処理付き）
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(this.value);
      }, 300); // 300ms後に検索実行
    });

    // Enterキー押下時の検索
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(searchTimeout);
        performSearch(this.value);
      }
    });
  }

  // 検索ボタンのクリックイベント（もしあれば）
  const searchButton = document.querySelector(".search-box button");
  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (searchInput) {
        performSearch(searchInput.value);
      }
    });
  }

  // 高度な検索機能: タグフィルタ
  const tagLinks = document.querySelectorAll(".tag");
  tagLinks.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault();
      const tagText = this.textContent.trim();
      if (searchInput) {
        searchInput.value = tagText;
        performSearch(tagText);
        searchInput.focus();
      }
    });
  });

  // カテゴリーフィルタ
  const categoryLinks = document.querySelectorAll(".category-item");
  categoryLinks.forEach((category) => {
    category.addEventListener("click", function (e) {
      e.preventDefault();
      const categoryName =
        this.querySelector(".category-name")?.textContent.trim();
      if (categoryName && searchInput) {
        searchInput.value = categoryName;
        performSearch(categoryName);
        searchInput.focus();
      }
    });
  });

  // 初期検索実行（URLパラメータがある場合）
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    performSearch(searchParam);
    saveSearchHistory(searchParam);
  }
});

// 検索のハイライト機能
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(
    regex,
    '<mark style="background: yellow; padding: 1px 2px;">$1</mark>'
  );
}

// 検索履歴の保存（localStorage使用）
function saveSearchHistory(searchTerm) {
  if (!searchTerm.trim()) return;

  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // 重複削除
  history = history.filter((term) => term !== searchTerm);

  // 先頭に追加
  history.unshift(searchTerm);

  // 最大10件まで保存
  history = history.slice(0, 10);

  localStorage.setItem("searchHistory", JSON.stringify(history));
}

// 検索履歴の取得
function getSearchHistory() {
  return JSON.parse(localStorage.getItem("searchHistory") || "[]");
}
