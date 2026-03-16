(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const data = window.LAW_LIBRARY_DATA;
  const article = data.articles.find(a => a.id === id) || (data.guides || []).find(g => g.id === id);
  const isGuide = Boolean((data.guides || []).find(g => g.id === id));

  const category = article ? data.categories.find(c => c.slug === article.category) : null;

  const pageTitle = document.getElementById('articleTitle');
  const articleSummary = document.getElementById('articleSummary');
  const categoryTag = document.getElementById('categoryTag');
  const metaRow = document.getElementById('metaRow');
  const plainLanguage = document.getElementById('plainLanguage');
  const whatYouCanDo = document.getElementById('whatYouCanDo');
  const whenToContactLawyer = document.getElementById('whenToContactLawyer');
  const keyTakeaway = document.getElementById('keyTakeaway');
  const sourceList = document.getElementById('sourceList');
  const guideStepsBlock = document.getElementById('guideStepsBlock');
  const guideSteps = document.getElementById('guideSteps');
  const relatedGrid = document.getElementById('relatedGrid');
  const crumbCategory = document.getElementById('crumbCategory');
  const crumbArticle = document.getElementById('crumbArticle');
  const backToCategory = document.getElementById('backToCategory');

  if (!article || !category) {
    pageTitle.textContent = 'Article not found';
    articleSummary.textContent = 'Please return to the library home page.';
    return;
  }

  document.title = `${article.title} - LawConnect Library`;
  crumbCategory.textContent = category.name;
  crumbCategory.href = `category.html?category=${category.slug}`;
  crumbArticle.textContent = article.title;
  backToCategory.href = `category.html?category=${category.slug}`;
  backToCategory.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Back to ${category.name}`;

  pageTitle.textContent = article.title;
  articleSummary.textContent = article.summary;
  categoryTag.innerHTML = `<i class="fa-solid ${category.icon}"></i>${category.name}`;
  metaRow.innerHTML = `
    <span class="meta-chip"><i class="fa-regular fa-clock"></i>${article.readTime}</span>
    <span class="meta-chip"><i class="fa-regular fa-calendar"></i>${article.lastUpdated}</span>
    <span class="meta-chip"><i class="fa-solid fa-book"></i>${article.sources.length} official source${article.sources.length > 1 ? 's' : ''}</span>
  `;

  plainLanguage.innerHTML = article.plainLanguage.map(p => `<p>${p}</p>`).join('');
  if (isGuide && Array.isArray(article.steps) && guideStepsBlock && guideSteps) {
    guideStepsBlock.classList.remove('hidden');
    guideSteps.innerHTML = article.steps.map(step => `<li>${step}</li>`).join('');
  }
  whatYouCanDo.innerHTML = article.whatYouCanDo.map(item => `<li>${item}</li>`).join('');
  whenToContactLawyer.textContent = article.whenToContactLawyer;
  keyTakeaway.textContent = article.keyTakeaway;
  sourceList.innerHTML = article.sources.map(source => `
    <div class="source-item">
      <a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a>
    </div>
  `).join('');

  const pool = isGuide ? (data.guides || []).filter(g => g.category === article.category) : data.articles;
  const related = pool.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
  relatedGrid.innerHTML = related.map(item => `
    <a class="related-item" href="article.html?id=${item.id}">
      <h4>${item.title}</h4>
      <p>${item.summary}</p>
      <span class="read-link">Read this topic <i class="fa-solid fa-arrow-right"></i></span>
    </a>
  `).join('');
})();
