// ===== Chợ UEH - Product Detail (AJAX) =====

function renderBadgeGroup(container, values, baseClassName, prefix = '') {
  if (!container) return;
  container.replaceChildren();

  values.forEach((value) => {
    const badge = document.createElement('span');
    badge.className = baseClassName;
    badge.textContent = `${prefix}${value}`;
    container.appendChild(badge);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof PRODUCT_ID === 'undefined') return;

  try {
    const res = await fetch(`/api/products/${PRODUCT_ID}`);
    const data = await res.json();

    if (!data.success) {
      document.querySelector('main').innerHTML = '<div class="pt-24 pb-16 text-center"><span class="material-symbols-outlined text-6xl text-[#bec8ca] mb-4 block">error</span><p class="text-xl font-bold">Không tìm thấy bài đăng</p><a href="/products" class="inline-block mt-4 text-[#00464d] font-bold underline">Quay lại danh sách</a></div>';
      return;
    }

    const product = data.data;
    const isWanted = product.listingType === 'wanted';

    document.getElementById('breadcrumb-title').textContent = product.title;
    document.title = `${product.title} - Chợ UEH`;

    const mainImage = document.getElementById('main-image');
    if (product.images && product.images.length > 0) {
      mainImage.src = product.images[0];
    } else {
      mainImage.src = 'https://placehold.co/800x600/e1eaeb/6f797a?text=No+Image';
    }

    const thumbnails = document.getElementById('thumbnails');
    if (product.images && product.images.length > 1) {
      thumbnails.innerHTML = product.images.map((image, index) => `
        <div class="aspect-square rounded-lg overflow-hidden cursor-pointer ${index === 0 ? 'ring-2 ring-[#00464d]' : 'hover:opacity-80'} transition-opacity" onclick="document.getElementById('main-image').src='${image}'; document.querySelectorAll('#thumbnails > div').forEach((thumbnail) => thumbnail.classList.remove('ring-2', 'ring-[#00464d]')); this.classList.add('ring-2', 'ring-[#00464d]')">
          <img class="w-full h-full object-cover" src="${image}" alt=""/>
        </div>
      `).join('');
    }

    const productCondition = document.getElementById('product-condition');
    const listingTypeBadge = document.getElementById('listing-type-badge');
    const detailShell = document.getElementById('detail-shell');
    const productPriceCaption = document.getElementById('product-price-caption');
    const productPrice = document.getElementById('product-price');
    const buttonLabel = document.getElementById('btn-message-label');

    if (isWanted) {
      productCondition.textContent = window.AppUtils.urgencyLabel(product.urgency);
      productCondition.className = 'bg-[#e7f6ef] text-[#24935e] px-3 py-1 rounded-full text-xs font-semibold';
      listingTypeBadge.textContent = 'Đang cần';
      listingTypeBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-[#fff2cc] text-[#8a6400]';
      detailShell.classList.add('border-[#f1dca9]', 'bg-[#fffef8]');
      productPriceCaption.textContent = 'Ngân sách mong muốn';
      productPrice.textContent = window.AppUtils.formatBudgetRange(product.budgetMin, product.budgetMax);
      productPrice.classList.remove('text-primary');
      productPrice.classList.add('text-[#8a5f00]');
      buttonLabel.textContent = 'Tôi có món này';
    } else {
      productCondition.textContent = product.condition === 'new' ? 'Mới 100%' : 'Đã qua sử dụng';
      listingTypeBadge.textContent = 'Đang bán';
      productPriceCaption.textContent = 'Giá bán';
      productPrice.textContent = window.AppUtils.formatPrice(product.price);
      buttonLabel.textContent = 'Nhắn tin';
    }

    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-meta').textContent = `${isWanted ? 'Đăng nhu cầu tại' : 'Đăng tại'} ${product.location} • ${window.AppUtils.timeAgo(product.createdAt)}`;
    document.getElementById('product-description').textContent = product.description;

    const wantedContextCard = document.getElementById('wanted-context-card');
    const wantedContextMeta = document.getElementById('wanted-context-meta');
    if (isWanted) {
      const wantedTokens = [
        `Ngân sách ${window.AppUtils.formatBudgetRange(product.budgetMin, product.budgetMax)}`,
        window.AppUtils.urgencyLabel(product.urgency)
      ];
      renderBadgeGroup(
        wantedContextMeta,
        wantedTokens,
        'px-3 py-1 rounded-full bg-white text-[#8a6400] border border-[#f1dca9] font-semibold'
      );
      wantedContextCard.classList.remove('hidden');
    }

    const contextBadge = document.getElementById('ueh-context-badge');
    const contextTitle = document.getElementById('ueh-context-title');
    const contextMeta = document.getElementById('ueh-context-meta');
    const suitableYears = Array.isArray(product.suitableForYear) ? product.suitableForYear : [];
    const contextTokens = [];

    if (product.courseCode || product.courseName) {
      contextTitle.textContent = [product.courseCode, product.courseName].filter(Boolean).join(' • ');
    } else {
      contextTitle.textContent = isWanted
        ? 'Nhu cầu dành cho sinh viên UEH'
        : 'Sản phẩm phù hợp cho sinh viên UEH';
    }

    if (product.faculty) contextTokens.push(product.faculty);
    if (product.academicYear) contextTokens.push(`Niên khóa ${product.academicYear}`);
    if (product.semester) contextTokens.push(`Học kỳ ${product.semester}`);
    if (suitableYears.length > 0) contextTokens.push(`Phù hợp năm ${suitableYears.join(', ')}`);

    if (product.courseCode || product.courseName || contextTokens.length > 0) {
      renderBadgeGroup(
        contextMeta,
        contextTokens,
        'px-3 py-1 rounded-full bg-white text-primary border border-primary/10 font-semibold'
      );
      contextBadge.classList.remove('hidden');
    }

    const meetingContextCard = document.getElementById('meeting-context-card');
    const meetingPointsBadges = document.getElementById('meeting-points-badges');
    const preferredTimeSlotsBadges = document.getElementById('preferred-time-slots-badges');
    const meetingPoints = Array.isArray(product.meetingPoints) ? product.meetingPoints : [];
    const preferredTimeSlots = Array.isArray(product.preferredTimeSlots) ? product.preferredTimeSlots : [];

    if (meetingPoints.length > 0 || preferredTimeSlots.length > 0) {
      renderBadgeGroup(
        meetingPointsBadges,
        meetingPoints,
        'px-3 py-1 rounded-full bg-white text-secondary border border-secondary/15 font-semibold',
        '📍 '
      );
      renderBadgeGroup(
        preferredTimeSlotsBadges,
        preferredTimeSlots,
        'px-3 py-1 rounded-full bg-white text-secondary border border-secondary/15 font-semibold',
        '📍 '
      );
      meetingContextCard.classList.remove('hidden');
    }

    if (product.seller) {
      const sellerName = product.seller.displayName || product.seller.name || 'Người bán UEH';
      const sellerRating = product.seller.rating ?? '5.0';
      const sellerMeta = product.seller.memberSince
        ? `Tham gia ${window.AppUtils.timeAgo(product.seller.memberSince)}`
        : 'Thành viên UEH';

      document.getElementById('seller-card').innerHTML = `
        <div class="w-14 h-14 bg-[#a7eefa] rounded-full flex items-center justify-center text-[#00464d]">
          <span class="material-symbols-outlined text-2xl">person</span>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-on-surface">${window.AppUtils.esc(sellerName)}</h3>
          <div class="flex items-center gap-1 text-xs text-[#3f484a]">
            <span class="material-symbols-outlined text-sm text-yellow-500" style="font-variation-settings: 'FILL' 1;">star</span>
            <span class="font-bold">${window.AppUtils.esc(sellerRating)}</span>
            <span>${window.AppUtils.esc(sellerMeta)}</span>
          </div>
        </div>
      `;
    }

    document.getElementById('btn-message').addEventListener('click', () => {
      const user = window.AppUtils.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      if (product.sellerId && product.sellerId === user._id) {
        window.AppUtils.showToast(isWanted ? 'Đây là bài đăng cần của bạn' : 'Đây là sản phẩm của bạn', 'info');
        return;
      }

      if (!product.sellerId) {
        window.AppUtils.showToast('Không tìm thấy người đăng bài', 'error');
        return;
      }

      window.location.href = `/messages?userId=${product.sellerId}&productId=${product._id}`;
    });

    const relatedRes = await fetch(`/api/products?category=${product.category}&listingType=${product.listingType}&limit=4`);
    const relatedData = await relatedRes.json();
    const relatedContainer = document.getElementById('related-products');
    if (relatedData.success && relatedData.data.length > 0) {
      relatedContainer.innerHTML = relatedData.data
        .filter((item) => item._id !== product._id)
        .slice(0, 4)
        .map((item) => window.AppUtils.productCard(item))
        .join('');
    }
  } catch (error) {
    console.error('Failed to load product:', error);
  }
});
