window.AppUtils = {
  getUser() {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  saveAuth(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this.updateNavbar();
  },

  clearAuth() {
    localStorage.removeItem('user');
    this.updateNavbar();
  },

  async syncCurrentUser() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success) {
        this.saveAuth(data.user);
        return data.user;
      }
    } catch (error) {
      // Ignore sync failures and fall back to guest UI.
    }

    this.clearAuth();
    return null;
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Clear client state even if the network request fails.
    }

    this.clearAuth();
    window.location.href = '/login';
  },

  esc(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    toast.innerHTML = `<span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;font-size:20px">${icons[type] || 'info'}</span>${this.esc(message)}`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  },

  formatPrice(price) {
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return 'Liên hệ';
    }

    return `${new Intl.NumberFormat('vi-VN').format(price)}đ`;
  },

  formatBudgetRange(min, max) {
    const normalizedMin = min === undefined || min === null || min === '' ? undefined : Number(min);
    const normalizedMax = max === undefined || max === null || max === '' ? undefined : Number(max);

    if (Number.isFinite(normalizedMin) && Number.isFinite(normalizedMax)) {
      return `${this.formatPrice(normalizedMin)} - ${this.formatPrice(normalizedMax)}`;
    }

    if (Number.isFinite(normalizedMin)) {
      return `Từ ${this.formatPrice(normalizedMin)}`;
    }

    if (Number.isFinite(normalizedMax)) {
      return `Tối đa ${this.formatPrice(normalizedMax)}`;
    }

    return 'Ngân sách linh hoạt';
  },

  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  },

  categoryLabel(category) {
    const labels = {
      sach: 'Sách & Tài liệu',
      'dien-tu': 'Điện tử',
      'do-dung': 'Đồ dùng',
      'thoi-trang': 'Thời trang',
      xe: 'Xe & Phương tiện',
      khac: 'Khác'
    };

    return labels[category] || 'Khác';
  },

  urgencyLabel(level) {
    const labels = {
      low: 'Chưa gấp',
      medium: 'Cần trong tuần',
      high: 'Cần gấp'
    };

    return labels[level] || 'Cần phản hồi';
  },

  listingTypeLabel(listingType) {
    return listingType === 'wanted' ? 'Đang cần' : 'Đang bán';
  },

  statusLabel(product) {
    const wantedLabels = {
      available: 'Đang cần',
      sold: 'Đã tìm được',
      reserved: 'Đang trao đổi'
    };
    const sellLabels = {
      available: 'Đang bán',
      sold: 'Đã bán',
      reserved: 'Đã đặt'
    };

    return (product.listingType === 'wanted' ? wantedLabels : sellLabels)[product.status] || product.status;
  },

  transactionStatusBadge(status) {
    const config = {
      available: { label: 'Đang bán', bg: 'bg-green-100', text: 'text-green-700', icon: 'sell', dot: false },
      negotiating: { label: 'Đang thương lượng', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'handshake', dot: true },
      deposited: { label: 'Đã đặt cọc', bg: 'bg-orange-100', text: 'text-orange-700', icon: 'payments', dot: false },
      sold: { label: 'Đã bán', bg: 'bg-gray-100', text: 'text-gray-500', icon: 'check_circle', dot: false }
    };
    const s = config[status] || config.available;
    const dotHtml = s.dot ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1"></span>' : '';
    return `<span class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${s.bg} ${s.text}">${dotHtml}<span class="material-symbols-outlined text-xs">${s.icon}</span>${s.label}</span>`;
  },

  async contactListingOwner(ownerId, productId) {
    const user = this.getUser() || await this.syncCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!ownerId || ownerId === user._id) {
      this.showToast('Đây là bài đăng của bạn', 'info');
      return;
    }

    window.location.href = `/messages?userId=${ownerId}&productId=${productId}`;
  },

  productCard(product) {
    return product.listingType === 'wanted'
      ? this.wantedCard(product)
      : this.sellCard(product);
  },

  sellCard(product) {
    const image = product.images && product.images.length > 0
      ? this.esc(product.images[0])
      : 'https://placehold.co/400x400/e1eaeb/6f797a?text=No+Image';
    const sellerName = product.seller ? this.esc(product.seller.name) : 'Ẩn danh';
    const txStatus = product.transactionStatus || 'available';
    const isSold = txStatus === 'sold';
    const grayscaleClass = isSold ? 'grayscale' : '';

    return `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm block group">
        <a href="/product/${product._id}" class="block">
          <div class="relative h-48 overflow-hidden">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${grayscaleClass}" src="${image}" alt="${this.esc(product.title)}" loading="lazy"/>
            <div class="absolute top-3 left-3 flex flex-col gap-1.5">
              <div class="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#00464d] uppercase tracking-tight">${product.condition === 'new' ? 'Mới' : 'Đã dùng'}</div>
              ${this.transactionStatusBadge(txStatus)}
            </div>
          </div>
          <div class="p-4 space-y-2">
            <h3 class="font-bold text-sm line-clamp-2 leading-snug">${this.esc(product.title)}</h3>
            <div class="text-lg font-black text-[#005F69]">${this.formatPrice(product.price)}</div>
            <div class="flex items-center justify-between text-[11px] text-[#3f484a] pt-1">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span>${sellerName}</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>${this.timeAgo(product.createdAt)}</span>
            </div>
          </div>
        </a>
      </div>
    `;
  },

  wantedCard(product) {
    const sellerId = product.seller?._id || '';
    const sellerName = product.seller ? this.esc(product.seller.name) : 'Ẩn danh';
    const contextTokens = [product.courseCode, product.faculty].filter(Boolean);

    return `
      <div class="product-card rounded-xl border-2 border-dashed border-[#f1c977] bg-[#fffdf6] shadow-sm overflow-hidden">
        <a href="/product/${product._id}" class="block p-4 space-y-3 hover:bg-[#fff9ec] transition-colors">
          <div class="flex items-start justify-between gap-3">
            <span class="px-3 py-1 rounded-full bg-[#fff2cc] text-[#9a6b00] text-[11px] font-bold uppercase tracking-wide">Đang cần</span>
            <span class="px-3 py-1 rounded-full bg-[#e7f6ef] text-[#24935e] text-[11px] font-bold">${this.urgencyLabel(product.urgency)}</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#fff3d9] text-[#b47b00] flex items-center justify-center">
            <span class="material-symbols-outlined">help</span>
          </div>
          <div>
            <h3 class="font-bold text-sm leading-snug line-clamp-2">${this.esc(product.title)}</h3>
            <p class="text-xs text-[#6f797a] mt-2 line-clamp-2">${this.esc(product.description || 'Sinh viên UEH đang tìm món đồ này.')}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            ${contextTokens.length > 0 ? contextTokens.map((token) => `<span class="px-2.5 py-1 rounded-full bg-white border border-[#f1dca9] text-[#7f6122] text-[11px] font-semibold">${this.esc(token)}</span>`).join('') : '<span class="px-2.5 py-1 rounded-full bg-white border border-[#f1dca9] text-[#7f6122] text-[11px] font-semibold">Nhu cầu chung UEH</span>'}
          </div>
          <div class="rounded-xl bg-white border border-[#f1dca9] px-3 py-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#9a6b00]">Ngân sách mong muốn</p>
            <p class="text-sm font-black text-[#7f5a00] mt-1">${this.formatBudgetRange(product.budgetMin, product.budgetMax)}</p>
          </div>
          <div class="flex items-center justify-between text-[11px] text-[#6f797a] pt-1">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span>${sellerName}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>${this.timeAgo(product.createdAt)}</span>
          </div>
        </a>
        <div class="px-4 pb-4">
          <button type="button" onclick="window.AppUtils.contactListingOwner('${sellerId}', '${product._id}')" class="w-full rounded-lg bg-[#00464d] text-white py-2.5 text-sm font-bold hover:bg-[#005f69] transition-colors">Tôi có món này</button>
        </div>
      </div>
    `;
  },

  dashboardCard(product) {
    const image = product.images && product.images.length > 0
      ? this.esc(product.images[0])
      : 'https://placehold.co/400x400/e1eaeb/6f797a?text=No+Image';
    const isWanted = product.listingType === 'wanted';
    const amountDisplay = isWanted
      ? this.formatBudgetRange(product.budgetMin, product.budgetMax)
      : this.formatPrice(product.price);
    const typeBadgeClass = isWanted
      ? 'bg-[#fff2cc] text-[#9a6b00]'
      : 'bg-[#d0e4ff] text-[#295781]';
    
    // Transaction status for sell listings
    const txStatus = product.transactionStatus || 'available';
    const txBadgeConfig = {
      available: 'bg-green-100 text-green-700',
      negotiating: 'bg-amber-100 text-amber-700',
      deposited: 'bg-orange-100 text-orange-700',
      sold: 'bg-gray-100 text-gray-500'
    };
    const txLabels = {
      available: 'Đang bán',
      negotiating: 'Thương lượng',
      deposited: 'Đã đặt cọc',
      sold: 'Đã bán'
    };
    
    // For wanted listings, use old status system
    const wantedStatusColors = {
      available: 'bg-green-100 text-green-700',
      sold: 'bg-gray-100 text-gray-500'
    };
    const wantedLabels = {
      available: 'Đang cần',
      sold: 'Đã tìm được'
    };
    
    const badgeClass = isWanted ? (wantedStatusColors[product.status] || '') : (txBadgeConfig[txStatus] || '');
    const badgeLabel = isWanted ? (wantedLabels[product.status] || product.status) : (txLabels[txStatus] || txStatus);
    
    // Status control: dropdown for sell, toggle for wanted
    let statusControl;
    if (isWanted) {
      const toggleLabel = product.status === 'available' ? 'Đánh dấu đã tìm được' : 'Mở lại nhu cầu';
      statusControl = `<button onclick="toggleStatus('${product._id}','${product.status}','wanted')" class="flex-1 text-xs py-2 bg-[#e7f0f0] text-[#00464d] rounded-lg font-semibold hover:bg-[#dbe4e5] transition-colors">${toggleLabel}</button>`;
    } else {
      statusControl = `
        <select onchange="updateTxStatus('${product._id}', this.value, this)" class="flex-1 text-xs py-2 px-2 bg-[#e7f0f0] text-[#00464d] rounded-lg font-semibold border-none focus:ring-2 focus:ring-primary cursor-pointer">
          <option value="available" ${txStatus === 'available' ? 'selected' : ''}>Đang bán</option>
          <option value="negotiating" ${txStatus === 'negotiating' ? 'selected' : ''}>Thương lượng</option>
          <option value="deposited" ${txStatus === 'deposited' ? 'selected' : ''}>Đã đặt cọc</option>
          <option value="sold" ${txStatus === 'sold' ? 'selected' : ''}>Đã bán</option>
        </select>`;
    }

    return `
      <div class="bg-white rounded-xl overflow-hidden shadow-sm ghost-border" data-product-id="${product._id}">
        <div class="h-40 overflow-hidden"><img class="w-full h-full object-cover" src="${image}" alt="${this.esc(product.title)}"/></div>
        <div class="p-4 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="tx-badge text-xs font-bold px-2 py-1 rounded ${badgeClass}">${badgeLabel}</span>
            <span class="text-xs px-2 py-1 rounded ${typeBadgeClass} font-bold">${this.listingTypeLabel(product.listingType)}</span>
          </div>
          <h3 class="font-bold text-sm line-clamp-2">${this.esc(product.title)}</h3>
          <div class="text-primary font-black">${amountDisplay}</div>
          <div class="text-xs text-[#6f797a]">${this.timeAgo(product.createdAt)}</div>
          <div class="flex gap-2 pt-2">
            ${statusControl}
            <button onclick="deleteProduct('${product._id}')" class="text-xs py-2 px-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  updateNavbar() {
    const authDiv = document.getElementById('navbar-auth');
    if (!authDiv) return;

    const user = this.getUser();
    if (!user) return;

    const adminLink = user.role === 'admin'
      ? `<a href="/admin" class="text-slate-600 hover:bg-[#ecf5f6] p-2 rounded-lg transition-all" title="Admin"><span class="material-symbols-outlined text-red-500">admin_panel_settings</span></a>`
      : '';

    authDiv.innerHTML = `
      ${adminLink}
      <a href="/messages" class="relative text-slate-600 hover:bg-[#ecf5f6] p-2 rounded-lg transition-all" title="Tin nhắn">
        <span id="unread-badge" class="hidden absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[#EC6D33] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none z-10">0</span>
        <span class="material-symbols-outlined">chat</span>
      </a>
      <a href="/dashboard" class="text-slate-600 hover:bg-[#ecf5f6] p-2 rounded-lg transition-all" title="Dashboard"><span class="material-symbols-outlined">dashboard</span></a>
      <a href="/profile" class="flex items-center gap-2 text-slate-600 hover:bg-[#ecf5f6] px-3 py-2 rounded-lg transition-all text-sm font-semibold">
        <span class="material-symbols-outlined text-[#00464d]">account_circle</span>${user.name.split(' ').pop()}
      </a>
      <a href="/post-ad" class="bg-[#EC6D33] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:brightness-110 transition-all text-sm">Đăng tin</a>
    `;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await window.AppUtils.syncCurrentUser();
  window.AppUtils.updateNavbar();

  // Start polling unread count after navbar is rendered
  if (document.querySelector('a[href="/messages"]')) {
    pollUnreadCount();
    setInterval(pollUnreadCount, 30000);
  }
});

// === Unread message badge polling ===
async function pollUnreadCount() {
  const badge = document.getElementById('unread-badge');
  if (!badge) return;
  try {
    const res = await fetch('/api/messages/unread-count', { credentials: 'include' });
    if (!res.ok) return;
    const { count = 0 } = await res.json();
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch (e) { /* silent fail — không break nếu user chưa đăng nhập */ }
}
