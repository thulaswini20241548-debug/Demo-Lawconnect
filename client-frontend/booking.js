// booking.js – Commit 10: Debounced filter input

const lawyers = [
  { name: 'Ms. S.G.L.S. Priyani', reg: 'SCR:A 12190', bar: 'CBA-2211', specialty: 'Property law', exp: '14 years', fee: '2500', loc: 'Colombo' },
  { name: 'Mr. Nuwan Jayawardena', reg: 'SCR:A 10876', bar: 'CBA-1902', specialty: 'Labour law', exp: '9 years', fee: '1800', loc: 'Negombo' },
  { name: 'Ms. Kamini Silva', reg: 'SCR:A 21456', bar: 'CBA-3417', specialty: 'Family law', exp: '21 years', fee: '3200', loc: 'Kandy' },
  { name: 'Mr. Roshan Perera', reg: 'SCR:A 33412', bar: 'CBA-5519', specialty: 'Constitutional law', exp: '7 years', fee: '1500', loc: 'Colombo' },
  { name: 'Mrs. Anoma Fonseka', reg: 'SCR:A 45123', bar: 'CBA-6721', specialty: 'Criminal law', exp: '15 years', fee: '2800', loc: 'Colombo' },
  { name: 'Mr. Sunil Abeysekera', reg: 'SCR:A 56789', bar: 'CBA-7823', specialty: 'Property law', exp: '20 years', fee: '3500', loc: 'Galle' },
  { name: 'Ms. Thilini Weerasinghe', reg: 'SCR:A 67890', bar: 'CBA-8912', specialty: 'Family law', exp: '5 years', fee: '1200', loc: 'Jaffna' },
];

function getSpecialtyIcon(specialty) {
  const map = {
    'Property law': 'fa-home',
    'Labour law': 'fa-briefcase',
    'Family law': 'fa-people-roof',
    'Criminal law': 'fa-handcuffs',
    'Constitutional law': 'fa-scale-balanced',
  };
  return map[specialty] || 'fa-gavel';
}

function displayLawyers(filtered = lawyers) {
  const container = document.getElementById('lawyerList');
  if (!container) return;
  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div class="card" style="grid-column:1/-1; text-align:center;">No lawyers match your criteria.</div>';
    return;
  }
  filtered.forEach(lawyer => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.lawyer = JSON.stringify(lawyer);
    const iconClass = getSpecialtyIcon(lawyer.specialty);
    card.innerHTML = `
      <div class="lawyer-card-header">
        <div style="display:flex; justify-content:space-between;">
          <span class="verified-badge"><i class="fas fa-badge-check"></i> Verified</span>
          <span style="font-size:12px;">SC: ${lawyer.reg}</span>
        </div>
      </div>
      <h3 style="margin:10px 0 5px;">${lawyer.name}</h3>
      <p><i class="fas ${iconClass}" style="color: var(--primary-dark);"></i> ${lawyer.specialty} · ${lawyer.exp}</p>
      <p><i class="fas fa-map-marker-alt" style="color: var(--primary-dark);"></i> ${lawyer.loc}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
        <span style="font-weight:700; color:var(--primary-darker);">LKR ${lawyer.fee}/hr</span>
        <button class="btn-small btn book-btn">Book</button>
      </div>
      <div style="font-size:11px; margin-top:8px; color: var(--text-muted);">Bar: ${lawyer.bar}</div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card && card.dataset.lawyer) {
        const lawyer = JSON.parse(card.dataset.lawyer);
        openBookingModal(lawyer);
      }
    });
  });
}

function filterLawyers() {
  const spec = document.getElementById('specialty').value;
  const loc = document.getElementById('location').value;
  const name = document.getElementById('searchName').value.trim().toLowerCase();
  return lawyers.filter(l =>
    (spec === 'All specialties' || l.specialty === spec) &&
    (loc === 'All locations' || l.loc === loc) &&
    (name === '' || l.name.toLowerCase().includes(name))
  );
}

// Modal elements
const modal = document.getElementById('bookingModal');
const modalName = document.getElementById('modalLawyerName');
const modalFee = document.getElementById('modalFee');
const bookingDatetime = document.getElementById('bookingDatetime');
const confirmBtn = document.getElementById('confirmBooking');
const closeBtn = document.getElementById('closeModal');
let currentLawyer = null;

function openBookingModal(lawyer) {
  currentLawyer = lawyer;
  modalName.innerText = `Book with ${lawyer.name}`;
  modalFee.innerText = `LKR ${lawyer.fee}`;
  modal.classList.add('active');
  setTimeout(() => bookingDatetime?.focus(), 100);
}

function closeModal() {
  modal.classList.remove('active');
  currentLawyer = null;
  bookingDatetime.value = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
closeBtn?.addEventListener('click', closeModal);

confirmBtn?.addEventListener('click', () => {
  const datetime = bookingDatetime.value;
  if (!datetime) {
    alert('Please select a date and time for your consultation.');
    bookingDatetime.focus();
    return;
  }

  const isLoggedIn = localStorage.getItem('lawconnect_loggedIn') === 'true';
  const role = localStorage.getItem('lawconnect_role');
  const user = JSON.parse(localStorage.getItem('lawconnect_user') || '{}');

  if (!isLoggedIn || role !== 'client') {
    alert('Please sign in as a client to book.');
    window.location.href = 'login.html';
    return;
  }

  const appointment = {
    id: Date.now(),
    lawyerId: currentLawyer.name,
    lawyerName: currentLawyer.name,
    clientId: user.id,
    clientName: user.name,
    datetime: datetime,
    fee: parseInt(currentLawyer.fee),
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString()
  };

  let appointments = JSON.parse(localStorage.getItem('lawconnect_appointments')) || [];
  appointments.push(appointment);
  localStorage.setItem('lawconnect_appointments', JSON.stringify(appointments));

  showToast(`Booking confirmed with ${currentLawyer.name}. Payment of LKR ${currentLawyer.fee} received.`, 'fa-credit-card');
  closeModal();
});

function showToast(message, icon = 'fa-check-circle') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

document.getElementById('applyFilter')?.addEventListener('click', () => {
  const filtered = filterLawyers();
  displayLawyers(filtered);
});

// Debounced search input
let filterTimeout;
document.getElementById('searchName')?.addEventListener('input', () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    const filtered = filterLawyers();
    displayLawyers(filtered);
  }, 300);
});

displayLawyers();