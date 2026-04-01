// ===== Chợ UEH - Post Ad (Image Upload + AJAX) =====

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('post-ad-form');
  if (!form) return;

  const user = window.AppUtils.getUser() || await window.AppUtils.syncCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  const imageInput = document.getElementById('image-input');
  const previewContainer = document.getElementById('image-preview');
  const priceGroup = document.getElementById('sell-price-group');
  const wantedBudgetGroup = document.getElementById('wanted-budget-group');
  const conditionGroup = document.getElementById('condition-group');
  const imageHelperText = document.getElementById('image-helper-text');
  let selectedFiles = [];

  function getListingType() {
    return document.querySelector('input[name="listingType"]:checked')?.value || 'sell';
  }

  function syncListingTypeUI() {
    const listingType = getListingType();
    const priceInput = document.getElementById('ad-price');

    if (listingType === 'wanted') {
      priceGroup.classList.add('hidden');
      wantedBudgetGroup.classList.remove('hidden');
      conditionGroup.classList.add('hidden');
      priceInput.required = false;
      imageHelperText.textContent = 'Ảnh minh họa là tùy chọn. Bài “Đang cần” sẽ hiển thị dạng bảng nhu cầu với nút “Tôi có món này”.';
    } else {
      priceGroup.classList.remove('hidden');
      wantedBudgetGroup.classList.add('hidden');
      conditionGroup.classList.remove('hidden');
      priceInput.required = true;
      imageHelperText.textContent = 'Bạn có thể thêm ảnh thật của món đồ hoặc ảnh minh họa nhu cầu cần tìm.';
    }
  }

  imageInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length > 6) {
      window.AppUtils.showToast('Tối đa 6 ảnh', 'error');
      return;
    }

    selectedFiles = [...selectedFiles, ...files].slice(0, 6);
    renderPreviews();
  });

  function renderPreviews() {
    previewContainer.innerHTML = selectedFiles.map((file, index) => `
      <div class="aspect-square rounded-lg overflow-hidden relative group">
        <img class="w-full h-full object-cover" src="${URL.createObjectURL(file)}" alt="Preview"/>
        <button type="button" onclick="removeImage(${index})" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
      </div>
    `).join('');
  }

  window.removeImage = function removeImage(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
  };

  document.querySelectorAll('input[name="listingType"]').forEach((input) => {
    input.addEventListener('change', syncListingTypeUI);
  });

  syncListingTypeUI();

  // Character counter for description
  const descriptionTextarea = document.getElementById('ad-description');
  const descriptionCounter = document.getElementById('description-counter');
  if (descriptionTextarea && descriptionCounter) {
    descriptionTextarea.addEventListener('input', () => {
      const len = descriptionTextarea.value.length;
      descriptionCounter.textContent = `${len} / 2000 ký tự`;
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById('submit-btn');
    const errorDiv = document.getElementById('post-error');
    const listingType = getListingType();
    const title = document.getElementById('ad-title').value.trim();
    const category = document.getElementById('ad-category').value;
    const price = document.getElementById('ad-price').value;
    const budgetMin = document.getElementById('ad-budget-min').value;
    const budgetMax = document.getElementById('ad-budget-max').value;
    const urgency = document.getElementById('ad-urgency').value;
    const condition = document.querySelector('input[name="condition"]:checked')?.value || 'used';
    const description = document.getElementById('ad-description').value.trim();
    const location = document.getElementById('ad-location').value;
    const courseCode = document.getElementById('ad-course-code').value.trim().toUpperCase();
    const courseName = document.getElementById('ad-course-name').value.trim();
    const faculty = document.getElementById('ad-faculty').value;
    const academicYear = document.getElementById('ad-academic-year').value.trim();
    const semester = document.getElementById('ad-semester').value;
    const suitableYears = Array.from(document.querySelectorAll('input[name="ad-suitable-year"]:checked')).map((input) => input.value);
    const meetingPoints = Array.from(document.querySelectorAll('input[name="ad-meeting-point"]:checked')).map((input) => input.value);
    const preferredTimeSlots = Array.from(document.querySelectorAll('input[name="ad-preferred-time-slot"]:checked')).map((input) => input.value);

    if (!title || !category || !description) {
      errorDiv.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (listingType === 'sell' && (!price || Number(price) <= 0)) {
      errorDiv.textContent = 'Vui lòng nhập giá bán';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (listingType === 'wanted' && !budgetMin && !budgetMax) {
      errorDiv.textContent = 'Vui lòng nhập ít nhất một mốc ngân sách mong muốn';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      errorDiv.textContent = 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu';
      errorDiv.classList.remove('hidden');
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Đang đăng bài...';
    errorDiv.classList.add('hidden');

    try {
      const formData = new FormData();
      formData.append('listingType', listingType);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('budgetMin', budgetMin);
      formData.append('budgetMax', budgetMax);
      formData.append('urgency', urgency);
      formData.append('condition', condition);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('courseCode', courseCode);
      formData.append('courseName', courseName);
      formData.append('faculty', faculty);
      formData.append('academicYear', academicYear);
      formData.append('semester', semester);
      formData.append('suitableForYear', '');
      suitableYears.forEach((year) => formData.append('suitableForYear', year));
      formData.append('meetingPoints', '');
      meetingPoints.forEach((meetingPoint) => formData.append('meetingPoints', meetingPoint));
      formData.append('preferredTimeSlots', '');
      preferredTimeSlots.forEach((timeSlot) => formData.append('preferredTimeSlots', timeSlot));

      selectedFiles.forEach((file) => formData.append('images', file));

      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        window.AppUtils.showToast(listingType === 'wanted' ? 'Đăng nhu cầu thành công!' : 'Đăng tin thành công!', 'success');
        setTimeout(() => {
          window.location.href = '/products';
        }, 1000);
      } else {
        errorDiv.textContent = data.message || 'Đăng bài thất bại';
        errorDiv.classList.remove('hidden');
      }
    } catch (error) {
      errorDiv.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
      errorDiv.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = '<span>Đăng bài ngay</span><span class="material-symbols-outlined">rocket_launch</span>';
    }
  });
});
