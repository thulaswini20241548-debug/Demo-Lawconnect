(function () {
  const data = window.LAW_LIBRARY_DATA;
  const categories = data.categories;
  const articles = data.articles;
  const guides = data.guides || [];

  const categoryGrid = document.getElementById('categoryGrid');
  const articlesGrid = document.getElementById('articlesGrid');
  const categoryCount = document.getElementById('categoryCount');
  const articleCount = document.getElementById('articleCount');
  const searchInput = document.getElementById('librarySearch');
  const sortSelect = document.getElementById('sortSelect');
  const pillsWrap = document.getElementById('categoryPills');
  const guidesGrid = document.getElementById('guidesGrid');
  const guideCount = document.getElementById('guideCount');

  let activeCategory = 'all';
  let query = '';
  let sortMode = 'featured';

  const categoryArticleCount = slug => articles.filter(a => a.category === slug).length;
  const getCategory = slug => categories.find(c => c.slug === slug);

  function renderCategories() {
    categoryGrid.innerHTML = categories.map(category => `
      <a class="category-card" href="category.html?category=${category.slug}">
        <div class="category-icon"><i class="fa-solid ${category.icon}"></i></div>
        <h3>${category.name}</h3>
        <p>${category.shortDescription}</p>
        <div class="category-meta">
          <span class="soft-pill">${categoryArticleCount(category.slug)} articles</span>
          <span class="link-arrow">Open <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </a>
    `).join('');

    categoryCount.textContent = `${categories.length} categories`;
  }

  function matchesSearch(article) {
    const haystack = [article.title, article.summary, article.category, ...(article.whatYouCanDo || []), ...(article.plainLanguage || [])].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function getFilteredArticles() {
    let filtered = [...articles].filter(article => (activeCategory === 'all' || article.category === activeCategory));
    if (query.trim()) filtered = filtered.filter(matchesSearch);

    if (sortMode === 'az') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'time') {
      filtered.sort((a, b) => parseInt(a.readTime, 10) - parseInt(b.readTime, 10));
    } else {
      filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return filtered;
  }

  function renderArticles() {
    const filtered = getFilteredArticles();
    articleCount.textContent = `${filtered.length} articles`;

    if (!filtered.length) {
      articlesGrid.innerHTML = `
        <div class="empty-card">
          <h3>No articles matched your search</h3>
          <p>Try a different word like <strong>arrest</strong>, <strong>rent</strong>, <strong>salary</strong>, or <strong>maintenance</strong>.</p>
        </div>
      `;
      return;
    }

    articlesGrid.innerHTML = filtered.map(article => {
      const category = getCategory(article.category);
      return `
        <article class="article-card">
          <div class="article-top">
            <span class="article-tag"><i class="fa-solid ${category.icon}"></i>${category.name}</span>
            <span class="article-read">${article.readTime}</span>
          </div>
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <div class="article-actions">
            <a class="read-link" href="article.html?id=${article.id}">Read article <i class="fa-solid fa-arrow-right"></i></a>
            <span class="source-count">${article.sources.length} source${article.sources.length > 1 ? 's' : ''}</span>
          </div>
        </article>
      `;
    }).join('');
  }


  function renderGuides() {
    if (!guidesGrid || !guideCount) return;
    guideCount.textContent = `${guides.length} guides`;
    guidesGrid.innerHTML = guides.map(guide => {
      const category = getCategory(guide.category);
      const previewSteps = (guide.steps || []).slice(0, 3).map(step => `<li>${step}</li>`).join('');
      return `
        <article class="guide-card">
          <div class="guide-top">
            <span class="guide-icon"><i class="fa-solid ${guide.icon || category.icon}"></i></span>
            <span class="guide-steps-pill">${guide.steps.length} steps</span>
          </div>
          <span class="article-tag"><i class="fa-solid ${category.icon}"></i>${category.name}</span>
          <h3>${guide.title}</h3>
          <p>${guide.summary}</p>
          <ul class="guide-points">${previewSteps}</ul>
          <div class="article-actions">
            <a class="read-link" href="article.html?id=${guide.id}">Open guide <i class="fa-solid fa-arrow-right"></i></a>
            <span class="source-count">${guide.sources.length} source${guide.sources.length > 1 ? 's' : ''}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderPills() {
    pillsWrap.innerHTML = ['all', ...categories.map(c => c.slug)].map(slug => {
      const active = slug === activeCategory ? 'active' : '';
      const label = slug === 'all' ? 'All Categories' : getCategory(slug).name;
      return `<button class="${active}" data-slug="${slug}">${label}</button>`;
    }).join('');

    pillsWrap.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.slug;
        renderPills();
        renderArticles();
      });
    });
  }

  searchInput.addEventListener('input', e => {
    query = e.target.value;
    renderArticles();
  });

  sortSelect.addEventListener('change', e => {
    sortMode = e.target.value;
    renderArticles();
  });

  renderCategories();
  renderGuides();
  renderPills();
  renderArticles();
})();
