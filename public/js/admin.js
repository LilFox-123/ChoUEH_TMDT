// ===== Chợ UEH - Admin Panel JS =====

const _adminProductCache = new Map();

window.AdminApp = {
  async initDashboard() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.success) {
        window.location.href = '/login';
        return;
      }

      document.getElementById('stat-users').textContent = data.stats.totalUsers;
      document.getElementById('stat-products').textContent = data.stats.totalProducts;
      document.getElementById('stat-messages').textContent = data.stats.totalMessages;
      document.getElementById('stat-categories').textContent = data.stats.productsByCategory.length;

      const recentProducts = document.getElementById('recent-products');
      recentProducts.innerHTML = data.recentProducts.map((product) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <span class="material-symbols-outlined text-emerald-500">inventory_2</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">${window.AppUtils.esc(product.title)}</p>
            <p class="text-xs text-gray-400">${window.AppUtils.esc(product.seller?.name || 'N/A')} · ${product.listingType === 'wanted' ? window.AppUtils.formatBudgetRange(product.budgetMin, product.budgetMax) : window.AppUtils.formatPrice(product.price)}</p>
          </div>
          <span class="text-xs text-gray-400">${window.AppUtils.timeAgo(product.createdAt)}</span>
        </div>
      `).join('');

      const recentUsers = document.getElementById('recent-users');
      recentUsers.innerHTML = data.recentUsers.map((user) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-sm text-blue-600">person</span></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">${window.AppUtils.esc(user.name)}</p>
            <p class="text-xs text-gray-400">${window.AppUtils.esc(user.email)}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} font-bold">${user.role}</span>
        </div>
      `).join('');

      const categoryLabels = {
        sach: 'Sách',
        'dien-tu': 'Điện tử',
        'do-dung': 'Đồ dùng',
        'thoi-trang': 'Thời trang',
        xe: 'Xe',
        khac: 'Khác'
      };
      const categoryColors = {
        sach: 'bg-blue-500',
        'dien-tu': 'bg-emerald-500',
        'do-dung': 'bg-orange-500',
        'thoi-trang': 'bg-pink-500',
        xe: 'bg-purple-500',
        khac: 'bg-gray-500'
      };
      const maxCount = Math.max(...data.stats.productsByCategory.map((category) => category.count), 1);
      const categoryBars = document.getElementById('category-bars');
      categoryBars.innerHTML = data.stats.productsByCategory.map((category) => `
        <div class="flex items-center gap-4">
          <span class="text-sm font-semibold w-24 text-right">${categoryLabels[category._id] || category._id}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div class="${categoryColors[category._id] || 'bg-gray-500'} h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-700" style="width:${(category.count / maxCount) * 100}%">${category.count}</div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Admin stats error:', error);
      window.AppUtils.showToast('Không có quyền truy cập Admin', 'error');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  },

  usersPage: 1,
  async initUsers() {
    this.loadUsers();
    const search = document.getElementById('user-search');
    let timeout;
    if (search) {
      search.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.usersPage = 1;
          this.loadUsers();
        }, 400);
      });
    }
  },

  async loadUsers() {
    const search = document.getElementById('user-search')?.value || '';
    try {
      const res = await fetch(`/api/admin/users?page=${this.usersPage}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!data.success) {
        window.location.href = '/';
        return;
      }

      const tbody = document.getElementById('users-table');
      tbody.innerHTML = data.data.map((user) => `
        <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-sm text-blue-600">person</span></div>
              <div>
                <p class="font-semibold text-sm">${window.AppUtils.esc(user.name)}</p>
                <p class="text-xs text-gray-400">${window.AppUtils.esc(user.email)}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600">${window.AppUtils.esc(user.studentId)}</td>
          <td class="px-6 py-4 text-gray-600 text-xs">${window.AppUtils.esc(user.department || '-')}</td>
          <td class="px-6 py-4"><span class="text-xs px-2.5 py-1 rounded-full font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">${user.role}</span></td>
          <td class="px-6 py-4 text-gray-400 text-xs">${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
          <td class="px-6 py-4 text-right">
            <button data-edit-user="${user._id}" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors mr-1"><span class="material-symbols-outlined text-sm align-middle">edit</span></button>
            <button data-delete-user="${user._id}" data-user-name="${window.AppUtils.esc(user.name)}" class="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"><span class="material-symbols-outlined text-sm align-middle">delete</span></button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit-user]').forEach((button) => {
        button.addEventListener('click', () => {
          const userId = button.dataset.editUser;
          const user = data.data.find((item) => item._id === userId);
          if (user) {
            openEditUserModal(userId, user.name, user.email, user.phone || '', user.role, user.department || '', user.year || '');
          }
        });
      });

      tbody.querySelectorAll('[data-delete-user]').forEach((button) => {
        button.addEventListener('click', () => adminDeleteUser(button.dataset.deleteUser, button.dataset.userName));
      });

      this.renderPagination('users-pagination', data.pagination, (page) => {
        this.usersPage = page;
        this.loadUsers();
      });
    } catch (error) {
      console.error(error);
    }
  },

  productsPage: 1,
  async initProducts() {
    this.loadAdminProducts();
    const search = document.getElementById('product-search');
    const categoryFilter = document.getElementById('product-category-filter');
    let timeout;

    if (search) {
      search.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.productsPage = 1;
          this.loadAdminProducts();
        }, 400);
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.productsPage = 1;
        this.loadAdminProducts();
      });
    }
  },

  async loadAdminProducts() {
    const search = document.getElementById('product-search')?.value || '';
    const category = document.getElementById('product-category-filter')?.value || '';

    try {
      const res = await fetch(`/api/admin/products?page=${this.productsPage}&search=${encodeURIComponent(search)}&category=${category}`);
      const data = await res.json();
      if (!data.success) return;

      const statusColors = {
        available: 'bg-green-100 text-green-700',
        sold: 'bg-red-100 text-red-700',
        reserved: 'bg-yellow-100 text-yellow-700'
      };

      _adminProductCache.clear();
      data.data.forEach((product) => _adminProductCache.set(product._id, product));

      const tbody = document.getElementById('products-table');
      tbody.innerHTML = data.data.map((product) => `
        <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              ${product.images && product.images[0]
                ? `<img src="${window.AppUtils.esc(product.images[0])}" class="w-10 h-10 rounded-lg object-cover"/>`
                : '<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><span class="material-symbols-outlined text-gray-400 text-sm">image</span></div>'}
              <div class="min-w-0">
                <p class="font-semibold text-sm truncate max-w-[220px]">${window.AppUtils.esc(product.title)}</p>
                <div class="flex gap-2 mt-1 flex-wrap">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${product.listingType === 'wanted' ? 'bg-[#fff2cc] text-[#8a6400]' : 'bg-[#d0e4ff] text-[#295781]'}">${window.AppUtils.listingTypeLabel(product.listingType)}</span>
                  ${product.listingType === 'wanted' && product.urgency ? `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#e7f6ef] text-[#24935e]">${window.AppUtils.urgencyLabel(product.urgency)}</span>` : ''}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600 text-xs">${window.AppUtils.esc(product.seller?.name || 'N/A')}</td>
          <td class="px-6 py-4 font-bold text-primary text-sm">${product.listingType === 'wanted' ? window.AppUtils.formatBudgetRange(product.budgetMin, product.budgetMax) : window.AppUtils.formatPrice(product.price)}</td>
          <td class="px-6 py-4 text-xs text-gray-500">${window.AppUtils.categoryLabel(product.category)}</td>
          <td class="px-6 py-4"><span class="text-xs px-2.5 py-1 rounded-full font-bold ${statusColors[product.status] || ''}">${window.AppUtils.statusLabel(product)}</span></td>
          <td class="px-6 py-4 text-right">
            <button data-edit-product="${product._id}" class="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors mr-1"><span class="material-symbols-outlined text-sm align-middle">edit</span></button>
            <button data-delete-product="${product._id}" class="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"><span class="material-symbols-outlined text-sm align-middle">delete</span></button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit-product]').forEach((button) => {
        button.addEventListener('click', () => {
          const product = _adminProductCache.get(button.dataset.editProduct);
          if (product) openEditProductModal(product);
        });
      });

      tbody.querySelectorAll('[data-delete-product]').forEach((button) => {
        button.addEventListener('click', () => adminDeleteProduct(button.dataset.deleteProduct));
      });

      this.renderPagination('products-pagination', data.pagination, (page) => {
        this.productsPage = page;
        this.loadAdminProducts();
      });
    } catch (error) {
      console.error(error);
    }
  },

  renderPagination(containerId, pagination, callback) {
    const container = document.getElementById(containerId);
    if (!container || pagination.pages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    let html = '';
    for (let i = 1; i <= pagination.pages; i += 1) {
      const active = i === pagination.page
        ? 'bg-[#0f2027] text-white'
        : 'bg-white text-gray-600 hover:bg-gray-100';
      html += `<button class="w-9 h-9 rounded-lg ${active} text-xs font-bold border border-gray-200 transition-colors" data-page="${i}">${i}</button>`;
    }

    container.innerHTML = html;
    container.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => callback(Number(button.dataset.page)));
    });
  }
};

function openEditUserModal(id, name, email, phone, role, department, year) {
  document.getElementById('edit-user-id').value = id;
  document.getElementById('edit-user-name').value = name;
  document.getElementById('edit-user-email').value = email;
  document.getElementById('edit-user-phone').value = phone;
  document.getElementById('edit-user-role').value = role;
  document.getElementById('edit-user-department').value = department;
  document.getElementById('edit-user-year').value = year;
  document.getElementById('edit-user-modal').classList.remove('hidden');
}

function closeEditUserModal() {
  document.getElementById('edit-user-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const editUserForm = document.getElementById('edit-user-form');
  if (!editUserForm) return;

  editUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-user-id').value;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('edit-user-name').value,
          email: document.getElementById('edit-user-email').value,
          phone: document.getElementById('edit-user-phone').value,
          role: document.getElementById('edit-user-role').value,
          department: document.getElementById('edit-user-department').value,
          year: document.getElementById('edit-user-year').value
        })
      });
      const data = await res.json();
      if (data.success) {
        window.AppUtils.showToast('Cập nhật thành công!', 'success');
        closeEditUserModal();
        window.AdminApp.loadUsers();
      } else {
        window.AppUtils.showToast(data.message, 'error');
      }
    } catch (error) {
      window.AppUtils.showToast('Lỗi cập nhật', 'error');
    }
  });
});

async function adminDeleteUser(id, name) {
  if (!confirm(`Bạn chắc chắn muốn xóa người dùng "${name}"?\nTất cả sản phẩm và tin nhắn cũng sẽ bị xóa.`)) return;

  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      window.AppUtils.showToast('Đã xóa người dùng', 'success');
      window.AdminApp.loadUsers();
    } else {
      window.AppUtils.showToast(data.message, 'error');
    }
  } catch (error) {
    window.AppUtils.showToast('Lỗi xóa', 'error');
  }
}

function openEditProductModal(product) {
  document.getElementById('edit-product-id').value = product._id;
  document.getElementById('edit-product-title').value = product.title || '';
  document.getElementById('edit-product-listing-type').value = product.listingType || 'sell';
  document.getElementById('edit-product-price').value = product.price ?? '';
  document.getElementById('edit-product-budget-min').value = product.budgetMin ?? '';
  document.getElementById('edit-product-budget-max').value = product.budgetMax ?? '';
  document.getElementById('edit-product-urgency').value = product.urgency || 'medium';
  document.getElementById('edit-product-category').value = product.category;
  document.getElementById('edit-product-condition').value = product.condition || 'used';
  document.getElementById('edit-product-status').value = product.status || 'available';
  document.getElementById('edit-product-description').value = product.description || '';
  document.getElementById('edit-product-course-code').value = product.courseCode || '';
  document.getElementById('edit-product-course-name').value = product.courseName || '';
  document.getElementById('edit-product-faculty').value = product.faculty || '';
  document.getElementById('edit-product-academic-year').value = product.academicYear || '';
  document.getElementById('edit-product-semester').value = product.semester || '';

  document.querySelectorAll('input[name="edit-suitable-year"]').forEach((input) => {
    input.checked = Array.isArray(product.suitableForYear) && product.suitableForYear.includes(Number(input.value));
  });
  document.querySelectorAll('input[name="edit-meeting-point"]').forEach((input) => {
    input.checked = Array.isArray(product.meetingPoints) && product.meetingPoints.includes(input.value);
  });
  document.querySelectorAll('input[name="edit-preferred-time-slot"]').forEach((input) => {
    input.checked = Array.isArray(product.preferredTimeSlots) && product.preferredTimeSlots.includes(input.value);
  });

  const imagesDiv = document.getElementById('edit-product-images');
  if (product.images && product.images.length > 0) {
    imagesDiv.innerHTML = product.images.map((image, index) => `
      <div class="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-100">
        <img src="${window.AppUtils.esc(image)}" class="w-full h-full object-cover"/>
        <button type="button" data-remove-img="${product._id}" data-img-index="${index}" class="absolute inset-0 bg-red-500/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `).join('');

    imagesDiv.querySelectorAll('[data-remove-img]').forEach((button) => {
      button.addEventListener('click', () => adminRemoveImage(button.dataset.removeImg, Number.parseInt(button.dataset.imgIndex, 10)));
    });
  } else {
    imagesDiv.innerHTML = '<p class="text-xs text-gray-400 col-span-4">Chưa có ảnh</p>';
  }

  document.getElementById('edit-product-modal').classList.remove('hidden');
}

function closeEditProductModal() {
  document.getElementById('edit-product-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const editProductForm = document.getElementById('edit-product-form');
  if (!editProductForm) return;

  editProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const formData = new FormData();

    formData.append('title', document.getElementById('edit-product-title').value);
    formData.append('listingType', document.getElementById('edit-product-listing-type').value);
    formData.append('price', document.getElementById('edit-product-price').value);
    formData.append('budgetMin', document.getElementById('edit-product-budget-min').value);
    formData.append('budgetMax', document.getElementById('edit-product-budget-max').value);
    formData.append('urgency', document.getElementById('edit-product-urgency').value);
    formData.append('category', document.getElementById('edit-product-category').value);
    formData.append('condition', document.getElementById('edit-product-condition').value);
    formData.append('status', document.getElementById('edit-product-status').value);
    formData.append('description', document.getElementById('edit-product-description').value);
    formData.append('courseCode', document.getElementById('edit-product-course-code').value.trim().toUpperCase());
    formData.append('courseName', document.getElementById('edit-product-course-name').value.trim());
    formData.append('faculty', document.getElementById('edit-product-faculty').value);
    formData.append('academicYear', document.getElementById('edit-product-academic-year').value.trim());
    formData.append('semester', document.getElementById('edit-product-semester').value);
    formData.append('suitableForYear', '');
    document.querySelectorAll('input[name="edit-suitable-year"]:checked').forEach((input) => {
      formData.append('suitableForYear', input.value);
    });
    formData.append('meetingPoints', '');
    document.querySelectorAll('input[name="edit-meeting-point"]:checked').forEach((input) => {
      formData.append('meetingPoints', input.value);
    });
    formData.append('preferredTimeSlots', '');
    document.querySelectorAll('input[name="edit-preferred-time-slot"]:checked').forEach((input) => {
      formData.append('preferredTimeSlots', input.value);
    });

    const newImages = document.getElementById('edit-product-new-images').files;
    for (let i = 0; i < newImages.length; i += 1) {
      formData.append('images', newImages[i]);
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        window.AppUtils.showToast('Cập nhật sản phẩm thành công!', 'success');
        closeEditProductModal();
        window.AdminApp.loadAdminProducts();
      } else {
        window.AppUtils.showToast(data.message, 'error');
      }
    } catch (error) {
      window.AppUtils.showToast('Lỗi cập nhật', 'error');
    }
  });
});

async function adminRemoveImage(productId, index) {
  if (!confirm('Xóa ảnh này?')) return;

  try {
    const res = await fetch(`/api/admin/products/${productId}/images/${index}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      window.AppUtils.showToast('Đã xóa ảnh', 'success');
      _adminProductCache.set(productId, data.data);
      openEditProductModal(data.data);
    } else {
      window.AppUtils.showToast(data.message, 'error');
    }
  } catch (error) {
    window.AppUtils.showToast('Lỗi xóa ảnh', 'error');
  }
}

async function adminDeleteProduct(id) {
  if (!confirm('Bạn chắc chắn muốn xóa bài đăng này?')) return;

  try {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      window.AppUtils.showToast('Đã xóa sản phẩm', 'success');
      window.AdminApp.loadAdminProducts();
    } else {
      window.AppUtils.showToast(data.message, 'error');
    }
  } catch (error) {
    window.AppUtils.showToast('Lỗi xóa', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stat-users') && !document.getElementById('users-table')) {
    window.AdminApp.initDashboard();
  }
});
