// ===== Chợ UEH - Auth (Login & Register) =====

document.addEventListener('DOMContentLoaded', async () => {
  const existingUser = window.AppUtils.getUser() || await window.AppUtils.syncCurrentUser();
  if (existingUser) {
    const path = window.location.pathname;
    if (path === '/login' || path === '/register') {
      window.location.href = '/';
      return;
    }
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const errorDiv = document.getElementById('login-error');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        errorDiv.textContent = 'Vui lòng nhập đầy đủ thông tin';
        errorDiv.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang đăng nhập...';
      errorDiv.classList.add('hidden');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          window.AppUtils.saveAuth(data.user);
          window.AppUtils.showToast('Đăng nhập thành công!', 'success');
          setTimeout(() => window.location.href = '/', 500);
        } else {
          errorDiv.textContent = data.message;
          errorDiv.classList.remove('hidden');
        }
      } catch (err) {
        errorDiv.textContent = 'Lỗi kết nối server. Vui lòng thử lại.';
        errorDiv.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Đăng Nhập <span class="material-symbols-outlined">arrow_forward</span>';
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const errorDiv = document.getElementById('register-error');

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const studentId = document.getElementById('reg-studentId').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const department = document.getElementById('reg-department').value;
      const year = document.getElementById('reg-year').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;

      if (!name || !email || !studentId || !password) {
        errorDiv.textContent = 'Vui lòng điền các trường bắt buộc (*)';
        errorDiv.classList.remove('hidden');
        return;
      }

      if (password.length < 6) {
        errorDiv.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        errorDiv.classList.remove('hidden');
        return;
      }

      if (password !== confirm) {
        errorDiv.textContent = 'Mật khẩu xác nhận không khớp';
        errorDiv.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang đăng ký...';
      errorDiv.classList.add('hidden');

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, studentId, phone, department, year, password })
        });
        const data = await res.json();

        if (data.success) {
          window.AppUtils.saveAuth(data.user);
          window.AppUtils.showToast('Đăng ký thành công!', 'success');
          setTimeout(() => window.location.href = '/', 500);
        } else {
          errorDiv.textContent = data.message;
          errorDiv.classList.remove('hidden');
        }
      } catch (err) {
        errorDiv.textContent = 'Lỗi kết nối server. Vui lòng thử lại.';
        errorDiv.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Đăng Ký Ngay <span class="material-symbols-outlined">arrow_forward</span>';
      }
    });
  }
});
