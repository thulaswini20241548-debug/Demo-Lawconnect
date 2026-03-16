(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('category') || 'family';
  const data = window.LAW_LIBRARY_DATA;
  const category = data.categories.find(c => c.slug === slug);
  const articles = data.articles.filter(a => a.category === slug);

  const heading = document.getElementById('categoryName');
  const intro = document.getElementById('categoryIntro');
  const quickPoints = document.getElementById('quickPoints');
  const articleCount = document.getElementById('articleCount');
  const articleGrid = document.getElementById('articleGrid');
  const breadcrumb = document.getElementById('categoryCrumb');

  if (!category) {
    heading.textContent = 'Category not found';
    intro.textContent = 'Please go back to the library home page.';
    quickPoints.innerHTML = '';
    articleGrid.innerHTML = '<div class="empty-card"><h3>Category not found</h3></div>';
    return;
  }

  document.title = `${category.name} - LawConnect Library`;
  breadcrumb.textContent = category.name;
  heading.textContent = category.introTitle;
  intro.textContent = category.introText;
  articleCount.textContent = `${articles.length} articles in this category`;
  quickPoints.innerHTML = category.quickPoints.map(point => `<li>${point}</li>`).join('');

  articleGrid.innerHTML = articles.map(article => `
    <article class="article-card">
      <div class="article-top">
        <span class="article-tag"><i class="fa-solid ${category.icon}"></i>${category.name}</span>
        <span class="article-read">${article.readTime}</span>
      </div>
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <div class="article-actions">
        <a class="read-link" href="article.html?id=${article.id}">Open article <i class="fa-solid fa-arrow-right"></i></a>
        <span class="source-count">Updated ${article.lastUpdated}</span>
      </div>
    </article>
  `).join('');
})();
