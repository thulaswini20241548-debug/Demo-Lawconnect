const categories = [
  { title: 'Constitutional Law', desc: 'Fundamental rights, structure of government – plain language.', icon: 'fa-scale-balanced', badge: 'Beginner' },
  { title: 'Criminal Law', desc: 'Offences, penalties, bail process, what to expect in court. ', icon: 'fa-gavel', badge: 'Hot' },  
  { title: 'Family Law', desc: 'Marriage, divorce, child custody, maintenance.', icon: 'fa-people-roof', badge: 'Beginner' },
  { title: 'Property Law', desc: 'Land deeds, transfer, inheritance, boundary disputes.', icon: 'fa-house-chimney', badge: 'Popular' },
  { title: 'Labour Law', desc: 'Employment rights, EPF, termination, workplace issues.', icon: 'fa-briefcase', badge: 'Popular' },  
  { title: 'Commercial Law', desc: 'Contracts, partnerships, business registration.', icon: 'fa-file-invoice', badge: 'Advanced' },
  { title: 'Administrative Law', desc: 'Decisions by government agencies, appeals.', icon: 'fa-building', badge: 'Advanced' }, 
  { title: 'Environmental Law', desc: 'Pollution controls, land use, wildlife protection.', icon: 'fa-leaf', badge: 'Beginner' }
];
function renderLibrary(filter = '') {
  const container = document.getElementById('libraryCategories');
  if (!container) return;
  const filtered = categories.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));
  container.innerHTML = filtered.map(c => {
    let badgeClass = 'badge';
    if (c.badge === 'Popular') badgeClass += ' popular';
    if (c.badge === 'Beginner') badgeClass += ' beginner';
    return `
      <div class="card lib-card">
        <i class="fas ${c.icon}"></i>
        <div style="margin-bottom: 10px;">
          <span class="${badgeClass}">${c.badge}</span>
        </div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <a href="#" class="btn-small btn-outline" style="margin-top:16px; display:inline-block;">Read more</a>
      </div>
    `;
  }).join('');
}
document.getElementById('libSearch')?.addEventListener('input', (e) => {
  renderLibrary(e.target.value);
});

renderLibrary();