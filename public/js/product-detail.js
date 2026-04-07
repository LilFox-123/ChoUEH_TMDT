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
    window._currentProduct = product;
    const isWanted = product.listingType === 'wanted';

    document.getElementById('breadcrumb-title').textContent = product.title;
    document.title = `${product.title} - Chợ UEH`;

    const mainImage = document.getElementById('main-image');
    if (product.images && product.images.length > 0) {
      mainImage.src = product.images[0];
      mainImage.style.cursor = 'zoom-in';
      mainImage.addEventListener('click', () => openLightbox(0));
    } else {
      mainImage.src = 'https://placehold.co/800x600/e1eaeb/6f797a?text=No+Image';
    }

    const thumbnails = document.getElementById('thumbnails');
    if (product.images && product.images.length > 1) {
      thumbnails.innerHTML = product.images.map((image, index) => `
        <div class="aspect-square rounded-lg overflow-hidden cursor-pointer ${index === 0 ? 'ring-2 ring-[#00464d]' : 'hover:opacity-80'} transition-opacity" onclick="document.getElementById('main-image').src='${image}'; document.querySelectorAll('#thumbnails > div').forEach((thumbnail) => thumbnail.classList.remove('ring-2', 'ring-[#00464d]')); this.classList.add('ring-2', 'ring-[#00464d]'); openLightbox(${index})">
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

      // Transaction status badge (replaces old static "Đang bán" badge)
      const txStatus = product.transactionStatus || 'available';
      const txConfig = {
        available: { label: 'Đang bán', bg: 'bg-green-100', text: 'text-green-700', icon: 'sell', dot: false },
        negotiating: { label: 'Đang thương lượng', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'handshake', dot: true },
        deposited: { label: 'Đã đặt cọc', bg: 'bg-orange-100', text: 'text-orange-700', icon: 'payments', dot: false },
        sold: { label: 'Đã bán', bg: 'bg-gray-100', text: 'text-gray-500', icon: 'check_circle', dot: false }
      };
      const txS = txConfig[txStatus] || txConfig.available;
      const dotHtml = txS.dot ? '<span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1"></span>' : '';
      listingTypeBadge.innerHTML = `${dotHtml}<span class="material-symbols-outlined text-sm mr-1">${txS.icon}</span>${txS.label}`;
      listingTypeBadge.className = `flex items-center px-3 py-1 rounded-full text-xs font-semibold ${txS.bg} ${txS.text}`;

      productPriceCaption.textContent = 'Giá bán';
      productPrice.textContent = window.AppUtils.formatPrice(product.price);
      buttonLabel.textContent = 'Nhắn tin';

      // Transaction status notice banner
      const existingBanner = document.getElementById('tx-status-banner');
      if (existingBanner) existingBanner.remove();

      if (txStatus === 'negotiating' || txStatus === 'deposited') {
        const bannerConfig = {
          negotiating: { icon: '⚠️', text: 'Sản phẩm đang được thương lượng — bạn vẫn có thể liên hệ người bán', bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-800' },
          deposited: { icon: '🔒', text: 'Sản phẩm đã được đặt cọc — khả năng cao đã có chủ', bg: 'bg-orange-50', border: 'border-orange-200', textColor: 'text-orange-800' }
        };
        const bc = bannerConfig[txStatus];
        const banner = document.createElement('div');
        banner.id = 'tx-status-banner';
        banner.className = `${bc.bg} ${bc.border} border rounded-xl p-4 flex items-start gap-3 mt-4`;
        banner.innerHTML = `<span class="text-xl">${bc.icon}</span><p class="text-sm font-medium ${bc.textColor}">${bc.text}</p>`;
        productPrice.parentElement.insertBefore(banner, productPrice.nextSibling);
      }

      // Seller transaction status controls (below badge row, owner only)
      const currentUser = window.AppUtils.getUser();
      if (currentUser && product.sellerId === currentUser._id) {
        const existingControls = document.getElementById('seller-tx-controls');
        if (existingControls) existingControls.remove();

        const badgeRow = listingTypeBadge.parentElement;
        const controlBlock = document.createElement('div');
        controlBlock.id = 'seller-tx-controls';
        controlBlock.className = 'mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/20';

        const btnClass = (status) => {
          const base = 'flex-1 min-w-0 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all';
          if (status === txStatus) {
            const activeStyles = {
              available: 'bg-green-600 text-white',
              negotiating: 'bg-amber-500 text-white',
              deposited: 'bg-orange-500 text-white',
              sold: 'bg-gray-500 text-white'
            };
            return `${base} ${activeStyles[status]}`;
          }
          const inactiveStyles = {
            available: 'border border-green-600 text-green-700 hover:bg-green-50',
            negotiating: 'border border-amber-500 text-amber-700 hover:bg-amber-50',
            deposited: 'border border-orange-500 text-orange-700 hover:bg-orange-50',
            sold: 'border border-gray-400 text-gray-600 hover:bg-gray-50'
          };
          return `${base} ${inactiveStyles[status]}`;
        };

        controlBlock.innerHTML = `
          <p class="text-xs font-semibold text-on-surface-variant mb-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">tune</span>Cập nhật trạng thái
          </p>
          <div class="flex flex-wrap sm:flex-nowrap gap-2">
            <button type="button" data-status="available" class="${btnClass('available')}">Đang bán</button>
            <button type="button" data-status="negotiating" class="${btnClass('negotiating')}">Thương lượng</button>
            <button type="button" data-status="deposited" class="${btnClass('deposited')}">Đã đặt cọc</button>
            <button type="button" data-status="sold" class="${btnClass('sold')}">Đã bán</button>
          </div>
        `;
        badgeRow.after(controlBlock);

        // Attach handlers with in-place update
        controlBlock.querySelectorAll('button[data-status]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const newStatus = btn.dataset.status;
            if (newStatus === txStatus) return;

            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span>';

            try {
              const res = await fetch(`/api/products/${product._id}/transaction-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionStatus: newStatus })
              });
              const data = await res.json();

              if (data.success) {
                window.AppUtils.showToast('✅ Đã cập nhật trạng thái', 'success');
                // Update badge in-place
                const newTxS = txConfig[newStatus] || txConfig.available;
                const newDotHtml = newTxS.dot ? '<span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1"></span>' : '';
                listingTypeBadge.innerHTML = `${newDotHtml}<span class="material-symbols-outlined text-sm mr-1">${newTxS.icon}</span>${newTxS.label}`;
                listingTypeBadge.className = `flex items-center px-3 py-1 rounded-full text-xs font-semibold ${newTxS.bg} ${newTxS.text}`;
                // Reload to refresh controls
                setTimeout(() => window.location.reload(), 800);
              } else {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
                window.AppUtils.showToast(data.message || 'Cập nhật thất bại', 'error');
              }
            } catch (err) {
              btn.disabled = false;
              btn.innerHTML = originalHtml;
              window.AppUtils.showToast('Lỗi kết nối', 'error');
            }
          });
        });
      }
    }

    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-meta').textContent = `${isWanted ? 'Đăng nhu cầu tại' : 'Đăng tại'} ${product.location} • ${window.AppUtils.timeAgo(product.createdAt)}`;
    document.getElementById('product-description').textContent = product.description;

    const categoryLabels = {
      'sach': 'Sách & Tài liệu', 'dien-tu': 'Điện tử',
      'do-dung': 'Đồ dùng', 'thoi-trang': 'Thời trang',
      'xe': 'Xe & Phương tiện', 'khac': 'Khác'
    };
    const quickBlock = document.getElementById('quick-info-block');
    if (quickBlock) {
      quickBlock.classList.remove('hidden');
      const views = document.getElementById('info-views');
      const time = document.getElementById('info-time');
      const cat = document.getElementById('info-category');
      const loc = document.getElementById('info-location');
      if (views) views.textContent = (product.views || 0) + ' lượt';
      if (time) time.textContent = product.timeAgo || 'Vừa đăng';
      if (cat) cat.textContent = categoryLabels[product.category] || product.category || '–';
      if (loc) loc.textContent = product.location || '–';
    }

    // Share block
    const shareCopyBtn = document.getElementById('share-copy-link');
    const shareCopiedMsg = document.getElementById('share-copied-msg');
    const shareFbLink = document.getElementById('share-facebook');
    const shareZaloLink = document.getElementById('share-zalo');
    const pageUrl = window.location.href;
    if (shareFbLink) shareFbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
    if (shareZaloLink) shareZaloLink.href = `https://zalo.me/share/url?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(product.title || '')}`;
    if (shareCopyBtn) {
      shareCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
          if (shareCopiedMsg) { shareCopiedMsg.classList.remove('hidden'); setTimeout(() => shareCopiedMsg.classList.add('hidden'), 2500); }
        });
      });
    }

    // Report block
    const reportBtn = document.getElementById('report-btn');
    const reportModal = document.getElementById('report-modal');
    const reportCancel = document.getElementById('report-cancel');
    const reportSubmit = document.getElementById('report-submit');
    if (reportBtn && reportModal) {
      reportBtn.addEventListener('click', () => { reportModal.classList.remove('hidden'); reportModal.classList.add('flex'); });
      reportCancel.addEventListener('click', () => { reportModal.classList.add('hidden'); reportModal.classList.remove('flex'); });
      reportModal.addEventListener('click', (e) => { if (e.target === reportModal) { reportModal.classList.add('hidden'); reportModal.classList.remove('flex'); } });
      reportSubmit.addEventListener('click', () => {
        const reason = document.querySelector('input[name="report-reason"]:checked');
        if (!reason) { alert('Vui lòng chọn lý do báo cáo.'); return; }
        reportModal.classList.add('hidden'); reportModal.classList.remove('flex');
        alert('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất có thể.');
      });
    }

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
        <a href="/sellers/${product.sellerId}" class="flex items-center gap-4 flex-1">
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
        </a>
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

    // Rating section logic
    const ratingSection = document.getElementById('rating-section');
    const currentUser = window.AppUtils.getUser();
    const isSold = product.transactionStatus === 'sold';
    const isOwner = currentUser && product.sellerId === currentUser._id;
    const isBuyer = currentUser && product.buyerId && product.buyerId === currentUser._id;

    // Show rating section only if: logged in, is the buyer, transaction is sold, not the seller
    if (currentUser && isBuyer && isSold && !isOwner && ratingSection) {
      // First check if user already reviewed
      try {
        const checkRes = await fetch(`/api/reviews?product=${product._id}&reviewer=${currentUser._id}`);
        const checkData = await checkRes.json();

        if (checkData.success && checkData.exists) {
          // Already reviewed - show message instead of form
          ratingSection.classList.remove('hidden');
          ratingSection.innerHTML = `
            <div class="text-center py-4">
              <span class="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
              <p class="text-green-700 font-semibold">✅ Bạn đã đánh giá giao dịch này</p>
            </div>
          `;
          return;
        }
      } catch (err) {
        console.error('Failed to check review status:', err);
      }

      ratingSection.classList.remove('hidden');

      let selectedRating = 0;
      const starBtns = ratingSection.querySelectorAll('.star-btn');
      const submitBtn = document.getElementById('submit-rating');
      const commentEl = document.getElementById('rating-comment');
      const ratingForm = document.getElementById('rating-form');
      const ratingSuccess = document.getElementById('rating-success');

      function updateStars(rating) {
        starBtns.forEach((btn, idx) => {
          const icon = btn.querySelector('.material-symbols-outlined');
          if (idx < rating) {
            btn.classList.remove('text-gray-300');
            btn.classList.add('text-yellow-400');
            icon.style.fontVariationSettings = "'FILL' 1";
          } else {
            btn.classList.add('text-gray-300');
            btn.classList.remove('text-yellow-400');
            icon.style.fontVariationSettings = "'FILL' 0";
          }
        });
      }

      starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          selectedRating = parseInt(btn.dataset.star);
          updateStars(selectedRating);
          submitBtn.disabled = false;
        });

        btn.addEventListener('mouseenter', () => {
          updateStars(parseInt(btn.dataset.star));
        });

        btn.addEventListener('mouseleave', () => {
          updateStars(selectedRating);
        });
      });

      submitBtn.addEventListener('click', async () => {
        if (selectedRating < 1) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Đang gửi...';

        try {
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product._id,
              rating: selectedRating,
              comment: commentEl.value.trim()
            })
          });

          const data = await res.json();

          if (res.status === 409) {
            window.AppUtils.showToast('Bạn đã đánh giá giao dịch này rồi', 'warning');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi đánh giá';
            return;
          }

          if (res.status === 403) {
            window.AppUtils.showToast('Bạn không có quyền đánh giá sản phẩm này', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi đánh giá';
            return;
          }

          if (data.success) {
            ratingForm.classList.add('hidden');
            ratingSuccess.classList.remove('hidden');
          } else {
            window.AppUtils.showToast(data.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi đánh giá';
          }
        } catch (err) {
          window.AppUtils.showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gửi đánh giá';
        }
      });
    }

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

(function initLightbox() {
  let _imgs = [];
  let _cur = 0;

  window.openLightbox = function (index) {
    const product = window._currentProduct;
    if (!product || !product.images || !product.images.length) return;
    _imgs = product.images;
    _cur = index;
    show();
    document.getElementById('lightbox').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  function show() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    img.src = _imgs[_cur];
    if (counter) counter.textContent = `${_cur + 1} / ${_imgs.length}`;
    document.getElementById('lightbox-prev').style.display = _imgs.length <= 1 ? 'none' : 'flex';
    document.getElementById('lightbox-next').style.display = _imgs.length <= 1 ? 'none' : 'flex';
  }

  function close() {
    document.getElementById('lightbox').classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('lightbox-close')?.addEventListener('click', close);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => { _cur = (_cur - 1 + _imgs.length) % _imgs.length; show(); });
  document.getElementById('lightbox-next')?.addEventListener('click', () => { _cur = (_cur + 1) % _imgs.length; show(); });
  document.getElementById('lightbox')?.addEventListener('click', (e) => { if (e.target === document.getElementById('lightbox')) close(); });
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { _cur = (_cur - 1 + _imgs.length) % _imgs.length; show(); }
    if (e.key === 'ArrowRight') { _cur = (_cur + 1) % _imgs.length; show(); }
  });
})();

(function initLightbox() {
  let _imgs = [];
  let _cur = 0;

  window.openLightbox = function (index) {
    const product = window._currentProduct;
    if (!product || !product.images || !product.images.length) return;
    _imgs = product.images;
    _cur = index;
    show();
    document.getElementById('lightbox').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  function show() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    img.src = _imgs[_cur];
    if (counter) counter.textContent = `${_cur + 1} / ${_imgs.length}`;
    document.getElementById('lightbox-prev').style.display = _imgs.length <= 1 ? 'none' : 'flex';
    document.getElementById('lightbox-next').style.display = _imgs.length <= 1 ? 'none' : 'flex';
  }

  function close() {
    document.getElementById('lightbox').classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('lightbox-close')?.addEventListener('click', close);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => { _cur = (_cur - 1 + _imgs.length) % _imgs.length; show(); });
  document.getElementById('lightbox-next')?.addEventListener('click', () => { _cur = (_cur + 1) % _imgs.length; show(); });
  document.getElementById('lightbox')?.addEventListener('click', (e) => { if (e.target === document.getElementById('lightbox')) close(); });
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { _cur = (_cur - 1 + _imgs.length) % _imgs.length; show(); }
    if (e.key === 'ArrowRight') { _cur = (_cur + 1) % _imgs.length; show(); }
  });
})();
