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
      const res = await fetch(`/api/products?seller=${user._id}&status=available&limit=50`);
      const data = await res.json();
      const container = document.getElementById('my-products');
      const noProducts = document.getElementById('no-products');

      // Also load sold products
      const resSold = await fetch(`/api/products?seller=${user._id}&status=sold&limit=50`);
      const dataSold = await resSold.json();

      const allProducts = [...(data.data || []), ...(dataSold.data || [])];

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
  window.toggleStatus = async function(productId, currentStatus, listingType = 'sell') {
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

  // Delete product
  window.deleteProduct = async function(productId) {
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
