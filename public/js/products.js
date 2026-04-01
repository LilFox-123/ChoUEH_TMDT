// ===== Chợ UEH - Products Listing (AJAX) =====

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');
  const paginationEl = document.getElementById('pagination');
  const listingHeading = document.getElementById('listing-heading');
  const priceFilterLabel = document.getElementById('price-filter-label');
  const conditionFilterSection = document.getElementById('condition-filter-section');
  if (!grid) return;

  let currentPage = 1;
  let currentFilters = {
    listingType: 'sell'
  };

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('listingType')) currentFilters.listingType = urlParams.get('listingType');
  if (urlParams.get('category')) {
    currentFilters.category = urlParams.get('category');
    const radio = document.querySelector(`input[name="category"][value="${currentFilters.category}"]`);
    if (radio) radio.checked = true;
  }
  if (urlParams.get('search')) {
    currentFilters.search = urlParams.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = currentFilters.search;
  }
  if (urlParams.get('courseCode')) {
    currentFilters.courseCode = urlParams.get('courseCode');
    const courseCodeInput = document.getElementById('course-code-filter');
    if (courseCodeInput) courseCodeInput.value = currentFilters.courseCode;
  }
  if (urlParams.get('faculty')) {
    currentFilters.faculty = urlParams.get('faculty');
    const facultyFilter = document.getElementById('faculty-filter');
    if (facultyFilter) facultyFilter.value = currentFilters.faculty;
  }

  // === Filter chips rendering ===
  function renderFilterChips() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    const esc = window.AppUtils?.escapeHTML || (s => s.replace(/</g, '&lt;'));
    const categoryLabels = {
      'sach': 'Sách & Tài liệu', 'dien-tu': 'Điện tử',
      'do-dung': 'Đồ dùng', 'thoi-trang': 'Thời trang',
      'xe': 'Xe & Phương tiện', 'khac': 'Khác'
    };
    const chips = [];
    if (currentFilters.listingType && currentFilters.listingType !== 'sell')
      chips.push({ label: 'Đang cần', reset: () => { currentFilters.listingType = 'sell'; syncListingTypeUI(); } });
    if (currentFilters.category)
      chips.push({ label: categoryLabels[currentFilters.category] || currentFilters.category, reset: () => { currentFilters.category = ''; document.querySelectorAll('input[name="category"]').forEach(r => r.checked = false); } });
    if (currentFilters.faculty)
      chips.push({ label: currentFilters.faculty, reset: () => { currentFilters.faculty = ''; const el = document.getElementById('faculty-filter'); if (el) el.value = ''; } });
    if (currentFilters.courseCode)
      chips.push({ label: currentFilters.courseCode.toUpperCase(), reset: () => { currentFilters.courseCode = ''; const el = document.getElementById('course-code-filter'); if (el) el.value = ''; } });
    if (currentFilters.minPrice)
      chips.push({ label: `Từ ${Number(currentFilters.minPrice).toLocaleString('vi-VN')}đ`, reset: () => { currentFilters.minPrice = ''; const el = document.getElementById('min-price'); if (el) el.value = ''; } });
    if (currentFilters.maxPrice)
      chips.push({ label: `Đến ${Number(currentFilters.maxPrice).toLocaleString('vi-VN')}đ`, reset: () => { currentFilters.maxPrice = ''; const el = document.getElementById('max-price'); if (el) el.value = ''; } });
    if (currentFilters.condition)
      chips.push({ label: currentFilters.condition === 'new' ? 'Mới' : 'Đã dùng', reset: () => { currentFilters.condition = ''; setActiveConditionButton(''); } });

    if (!chips.length) { container.innerHTML = ''; return; }
    window._filterChips = chips;
    container.innerHTML = chips.map((c, i) => `
      <button onclick="removeFilter(${i})" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00464d] text-white text-xs font-semibold hover:bg-[#005f69] transition-colors">
        ${esc(c.label)}
        <span class="material-symbols-outlined" style="font-size:14px;line-height:1">close</span>
      </button>`).join('');
  }

  window.removeFilter = function (index) {
    if (!window._filterChips?.[index]) return;
    window._filterChips[index].reset();
    renderFilterChips();
    loadProducts();
  };

  function syncListingTypeUI() {
    const isWanted = currentFilters.listingType === 'wanted';
    const tabs = document.querySelectorAll('.listing-type-tab');

    tabs.forEach((tab) => {
      const tabIsActive = tab.dataset.listingType === currentFilters.listingType;
      tab.className = tabIsActive
        ? (isWanted
          ? 'listing-type-tab px-4 py-2 rounded-full bg-[#fff2cc] text-[#8a6400] text-sm font-bold border border-[#f1dca9]'
          : 'listing-type-tab px-4 py-2 rounded-full bg-primary text-white text-sm font-bold')
        : 'listing-type-tab px-4 py-2 rounded-full bg-white text-on-surface-variant text-sm font-bold border border-outline-variant/30';
    });

    listingHeading.textContent = isWanted ? 'Bảng nhu cầu sinh viên UEH' : 'Bài đăng đang bán';
    countEl.textContent = '(đang tải...)';
    priceFilterLabel.textContent = isWanted ? 'Ngân sách mong muốn (VND)' : 'Khoảng giá (VND)';
    conditionFilterSection.classList.toggle('hidden', isWanted);
  }

  function setActiveConditionButton(conditionValue = '') {
    document.querySelectorAll('.condition-btn').forEach((button) => {
      const isActive = button.dataset.condition === conditionValue;
      button.classList.toggle('bg-[#a2cdfe]', isActive);
      button.classList.toggle('text-[#295781]', isActive);
    });
  }

  async function loadProducts() {
    grid.innerHTML = Array(6).fill('<div class="skeleton h-72 rounded-xl"></div>').join('');

    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('limit', 12);
    params.set('listingType', currentFilters.listingType || 'sell');

    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.condition && currentFilters.listingType !== 'wanted') params.set('condition', currentFilters.condition);
    if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
    if (currentFilters.sort) params.set('sort', currentFilters.sort);
    if (currentFilters.courseCode) params.set('courseCode', currentFilters.courseCode);
    if (currentFilters.faculty) params.set('faculty', currentFilters.faculty);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      const isWanted = currentFilters.listingType === 'wanted';

      if (data.success && data.data.length > 0) {
        grid.innerHTML = data.data.map((product) => window.AppUtils.productCard(product)).join('');
        countEl.textContent = isWanted
          ? `(${data.pagination.total} nhu cầu)`
          : `(${data.pagination.total} sản phẩm)`;
        renderPagination(data.pagination);
      } else {
        grid.innerHTML = `
          <div class="col-span-full text-center py-16">
            <span class="material-symbols-outlined text-6xl text-[#bec8ca] mb-4 block">${isWanted ? 'forum' : 'search_off'}</span>
            <p class="text-lg font-semibold text-[#3f484a]">${isWanted ? 'Chưa có bài “Đang cần” phù hợp' : 'Không tìm thấy sản phẩm nào'}</p>
            <p class="text-sm text-[#6f797a]">${isWanted ? 'Thử đổi khoa, môn học hoặc ngân sách để xem thêm nhu cầu khác.' : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}</p>
          </div>
        `;
        countEl.textContent = isWanted ? '(0 nhu cầu)' : '(0 sản phẩm)';
        paginationEl.innerHTML = '';
      }
    } catch (error) {
      grid.innerHTML = '<p class="col-span-full text-center text-red-500 py-8">Lỗi kết nối server</p>';
    }
  }

  function renderPagination(pagination) {
    if (pagination.pages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let html = '';
    if (pagination.page > 1) {
      html += `<button class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e7f0f0] hover:bg-[#dbe4e5] text-[#3f484a] transition-colors" onclick="goToPage(${pagination.page - 1})"><span class="material-symbols-outlined">chevron_left</span></button>`;
    }

    for (let i = 1; i <= pagination.pages; i += 1) {
      const active = i === pagination.page
        ? 'bg-[#00464d] text-white font-bold'
        : 'bg-[#e7f0f0] hover:bg-[#dbe4e5] text-[#3f484a]';
      html += `<button class="w-10 h-10 flex items-center justify-center rounded-lg ${active} transition-colors" onclick="goToPage(${i})">${i}</button>`;
    }

    if (pagination.page < pagination.pages) {
      html += `<button class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e7f0f0] hover:bg-[#dbe4e5] text-[#3f484a] transition-colors" onclick="goToPage(${pagination.page + 1})"><span class="material-symbols-outlined">chevron_right</span></button>`;
    }

    paginationEl.innerHTML = html;
  }

  window.goToPage = function goToPage(page) {
    currentPage = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let searchTimeout;
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = event.target.value.trim();
        currentPage = 1;
        loadProducts();
      }, 400);
    });
  }

  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      currentFilters.category = event.target.value;
      currentPage = 1;
      loadProducts();
      renderFilterChips();
    });
  });

  document.querySelectorAll('.condition-btn').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveConditionButton(button.dataset.condition);
      currentFilters.condition = button.dataset.condition;
      currentPage = 1;
      loadProducts();
      renderFilterChips();
    });
  });

  document.querySelectorAll('.listing-type-tab').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilters.listingType = button.dataset.listingType;
      currentFilters.condition = '';
      setActiveConditionButton('');
      currentPage = 1;
      syncListingTypeUI();
      loadProducts();
      renderFilterChips();
    });
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      currentPage = 1;
      loadProducts();
    });
  }

  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const minPrice = document.getElementById('min-price');
      const maxPrice = document.getElementById('max-price');
      const courseCodeFilter = document.getElementById('course-code-filter');
      const facultyFilter = document.getElementById('faculty-filter');

      if (minPrice) currentFilters.minPrice = minPrice.value;
      if (maxPrice) currentFilters.maxPrice = maxPrice.value;
      if (courseCodeFilter) currentFilters.courseCode = courseCodeFilter.value.trim().toUpperCase();
      if (facultyFilter) currentFilters.faculty = facultyFilter.value;

      currentPage = 1;
      loadProducts();
      renderFilterChips();
    });
  }

  syncListingTypeUI();
  setActiveConditionButton(currentFilters.condition || '');
  loadProducts();
  renderFilterChips();
});
