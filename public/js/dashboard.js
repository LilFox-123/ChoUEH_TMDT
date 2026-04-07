// ===== Chợ UEH - Dashboard =====

document.addEventListener('DOMContentLoaded', async () => {
  const user = window.AppUtils.getUser() || await window.AppUtils.syncCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/products/stats/me');
      const data = await res.json();
      if (data.success) {
        document.getElementById('stat-total').textContent = data.stats.total;
        document.getElementById('stat-available').textContent = data.stats.available;
        document.getElementById('stat-sold').textContent = data.stats.sold;
        document.getElementById('stat-views').textContent = data.stats.views;
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function loadGreenScore() {
    try {
      const res = await fetch(`/api/users/${user._id}/green-score`);
      const data = await res.json();
      if (!data.success) return;

      const greenScore = data.data;
      const nextMilestoneText = greenScore.nextMilestone
        ? `Còn ${Math.max(greenScore.nextMilestone - greenScore.totalItemsReused, 0)} món nữa để lên cấp tiếp theo.`
        : 'Bạn đã đạt cấp cao nhất của UEH Green Score.';

      document.getElementById('green-score-items').textContent = greenScore.totalItemsReused;
      document.getElementById('green-score-money').textContent = window.AppUtils.formatPrice(greenScore.estimatedMoneySaved);
      document.getElementById('green-score-co2').textContent = `${greenScore.co2Reduced} kg`;
      document.getElementById('green-score-level').textContent = greenScore.level;
      document.getElementById('green-score-level-badge').textContent = `${greenScore.totalItemsReused} món`;
      document.getElementById('green-score-progress').style.width = `${greenScore.progressPercent}%`;
      document.getElementById('green-score-progress-text').textContent = `${greenScore.level}. ${nextMilestoneText}`;
    } catch (err) {
      console.error('Failed to load green score:', err);
    }
  }

  // Load my products
  async function loadMyProducts() {
    try {
      // Fetch ALL seller products regardless of status (no status filter for owner's dashboard)
      const res = await fetch(`/api/products?seller=${user._id}&limit=100`);
      const data = await res.json();
      const container = document.getElementById('my-products');
      const noProducts = document.getElementById('no-products');

      const allProducts = data.data || [];

      if (allProducts.length > 0) {
        container.innerHTML = allProducts.map(p => window.AppUtils.dashboardCard(p)).join('');
        noProducts.classList.add('hidden');
      } else {
        container.innerHTML = '';
        noProducts.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  async function refreshDashboardInsights() {
    await Promise.all([
      loadStats(),
      loadGreenScore()
    ]);
  }

  // Toggle product status
  window.toggleStatus = async function (productId, currentStatus, listingType = 'sell') {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        const successMessage = listingType === 'wanted'
          ? (newStatus === 'sold' ? 'Đã đánh dấu đã tìm được' : 'Đã mở lại nhu cầu')
          : (newStatus === 'sold' ? 'Đã đánh dấu đã bán' : 'Đã hiển thị lại');
        window.AppUtils.showToast(successMessage, 'success');
        await Promise.all([
          loadMyProducts(),
          refreshDashboardInsights()
        ]);
      }
    } catch (err) {
      window.AppUtils.showToast('Lỗi cập nhật', 'error');
    }
  };

  // Handle transaction status change with buyer selection for 'sold'
  window.handleTxStatusChange = function (productId, currentStatus, selectEl) {
    const newStatus = selectEl.value;

    if (newStatus === 'sold') {
      // Revert select to current value while modal is open
      selectEl.value = currentStatus;
      // Show buyer selection modal
      showBuyerSelectModal(productId, () => {
        // After buyer selection (or skip), update status to sold
        updateTxStatus(productId, 'sold', selectEl);
      });
    } else {
      updateTxStatus(productId, newStatus, selectEl);
    }
  };

  // Show buyer selection modal
  async function showBuyerSelectModal(productId, onConfirm) {
    try {
      const res = await fetch(`/api/products/${productId}/buyers`);
      const data = await res.json();

      if (!data.success) {
        window.AppUtils.showToast('Lỗi tải danh sách người mua', 'error');
        return;
      }

      const buyers = data.buyers || [];

      if (buyers.length === 0) {
        // No buyers found - ask to confirm
        if (confirm('Không tìm thấy người nhắn tin về sản phẩm này. Bạn vẫn muốn đánh dấu đã bán không?')) {
          onConfirm();
        }
        return;
      }

      // Create modal
      const modal = document.createElement('div');
      modal.id = 'buyer-modal';
      modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';

      const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      };

      const buyerListHtml = buyers.map((buyer, idx) => `
        <label class="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors">
          <input type="radio" name="selected-buyer" value="${buyer._id}" class="accent-primary" ${idx === 0 ? 'checked' : ''}>
          <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-sm font-bold shrink-0">
            ${buyer.avatar ? `<img src="${window.AppUtils.esc(buyer.avatar)}" class="w-full h-full object-cover rounded-full">` : getInitials(buyer.name)}
          </div>
          <span class="font-semibold text-sm text-on-surface">${window.AppUtils.esc(buyer.name)}</span>
        </label>
      `).join('');

      modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 class="font-bold text-lg text-on-surface mb-1">Bạn đã bán cho ai?</h3>
          <p class="text-xs text-on-surface-variant mb-4">Chọn người mua để họ có thể đánh giá bạn sau này</p>
          <div id="buyer-list" class="space-y-2 max-h-60 overflow-y-auto mb-4">
            ${buyerListHtml}
          </div>
          <div class="flex gap-3">
            <button id="buyer-skip" class="flex-1 py-2 text-sm border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">Bỏ qua</button>
            <button id="buyer-confirm" class="flex-1 py-2 text-sm bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors">Xác nhận</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Handle skip
      modal.querySelector('#buyer-skip').addEventListener('click', () => {
        modal.remove();
        onConfirm();
      });

      // Handle confirm
      modal.querySelector('#buyer-confirm').addEventListener('click', async () => {
        const selectedRadio = modal.querySelector('input[name="selected-buyer"]:checked');
        if (!selectedRadio) {
          modal.remove();
          onConfirm();
          return;
        }

        const buyerId = selectedRadio.value;

        try {
          const setRes = await fetch(`/api/products/${productId}/buyer`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerId })
          });

          const setData = await setRes.json();

          if (setData.success) {
            window.AppUtils.showToast('Đã lưu thông tin người mua', 'success');
          }
        } catch (err) {
          console.error('Failed to set buyer:', err);
        }

        modal.remove();
        onConfirm();
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

    } catch (err) {
      console.error('Failed to load buyers:', err);
      window.AppUtils.showToast('Lỗi tải danh sách người mua', 'error');
    }
  }

  // Update transaction status (for sell listings)
  window.updateTxStatus = async function (productId, newStatus, selectEl) {
    const txLabels = {
      available: 'Đang bán',
      negotiating: 'Thương lượng',
      deposited: 'Đã đặt cọc',
      sold: 'Đã bán'
    };
    const txBadgeConfig = {
      available: 'bg-green-100 text-green-700',
      negotiating: 'bg-amber-100 text-amber-700',
      deposited: 'bg-orange-100 text-orange-700',
      sold: 'bg-gray-100 text-gray-500'
    };

    try {
      const res = await fetch(`/api/products/${productId}/transaction-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        window.AppUtils.showToast('✅ Đã cập nhật trạng thái', 'success');
        // Update badge in-place
        const card = selectEl.closest('[data-product-id]');
        if (card) {
          const badge = card.querySelector('.tx-badge');
          if (badge) {
            badge.className = `tx-badge text-xs font-bold px-2 py-1 rounded ${txBadgeConfig[newStatus] || ''}`;
            badge.textContent = txLabels[newStatus] || newStatus;
          }
        }
        // Refresh stats
        await refreshDashboardInsights();
      } else {
        window.AppUtils.showToast(data.message || 'Cập nhật thất bại', 'error');
      }
    } catch (err) {
      window.AppUtils.showToast('Lỗi kết nối', 'error');
    }
  };

  // Delete product
  window.deleteProduct = async function (productId) {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        window.AppUtils.showToast('Xóa sản phẩm thành công', 'success');
        await Promise.all([
          loadMyProducts(),
          refreshDashboardInsights()
        ]);
      } else {
        window.AppUtils.showToast(data.message, 'error');
      }
    } catch (err) {
      window.AppUtils.showToast('Lỗi xóa sản phẩm', 'error');
    }
  };

  await Promise.all([
    refreshDashboardInsights(),
    loadMyProducts()
  ]);
});
