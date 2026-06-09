import {
  authenticateUser,
  getCartStorageKey,
  getCurrentUser,
  getOrdersStorageKey,
  logoutUser,
  registerUser,
  resetUserPassword,
  updateUserProfile
} from './auth.js';

function readJson(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function getSafeReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('return') || sessionStorage.getItem('smarthome_auth_return');
  if (!requested) return 'all-products.html';

  try {
    const url = new URL(requested, window.location.href);
    return url.origin === window.location.origin
      ? `${url.pathname.split('/').pop() || 'index.html'}${url.search}${url.hash}`
      : 'all-products.html';
  } catch {
    return 'all-products.html';
  }
}

function setMessage(message, type = 'error') {
  const element = document.getElementById('authMessage');
  element.textContent = message;
  element.className = `auth-message ${type}`;
  element.hidden = !message;
}

function setLoading(form, loading) {
  const button = form.querySelector('[type="submit"]');
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
}

function showAuthView(view) {
  document.querySelectorAll('[data-auth-form]').forEach(form => {
    form.classList.toggle('active', form.dataset.authForm === view);
  });
  document.querySelectorAll('.auth-tabs [data-auth-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.authView === view);
  });
  document.querySelector('.auth-tabs').hidden = view === 'reset';
  document.getElementById('authFormTitle').textContent = {
    login: 'Đăng nhập tài khoản',
    register: 'Tạo tài khoản mới',
    reset: 'Đặt lại mật khẩu'
  }[view];
  setMessage('');
}

function showProfile(user) {
  document.body.classList.add('is-authenticated');
  document.getElementById('authFormsCard').hidden = true;
  const profileCard = document.getElementById('authProfileCard');
  profileCard.hidden = false;
  document.getElementById('authProfileName').textContent = user.name;
  document.getElementById('authProfileEmail').textContent = user.email;
  document.getElementById('authProfilePhone').textContent = user.phone || '';
  document.getElementById('authProfilePhoneWrap').hidden = !user.phone;
  const memberDate = user.createdAt ? new Date(user.createdAt) : null;
  document.getElementById('authMemberSince').textContent =
    memberDate && !Number.isNaN(memberDate.getTime())
      ? `Thành viên từ ${memberDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`
      : 'Thành viên SmartHome';
  document.getElementById('authProfileAvatar').textContent = user.name
    .split(/\s+/)
    .slice(-2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const cart = readJson(getCartStorageKey(user));
  const orders = readJson(getOrdersStorageKey(user));
  document.getElementById('authCartCount').textContent = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );
  document.getElementById('authOrderCount').textContent = orders.length;
  document.getElementById('authOrderTotal').textContent = `$${orders
    .reduce((total, order) => total + (Number(order.total) || 0), 0)
    .toLocaleString('en-US')}`;
  document.getElementById('authContinueLink').href = getSafeReturnUrl();
  document.getElementById('accountGreetingName').textContent = user.name.split(/\s+/).pop();

  const address = user.address || {};
  document.getElementById('accountDefaultAddress').textContent =
    [address.line, address.ward, address.district, address.city].filter(Boolean).join(', ')
    || 'Chưa cập nhật';
  document.getElementById('accountLatestOrder').textContent = orders[0]
    ? `${orders[0].id} · ${orders[0].status || 'Đang xác nhận'}`
    : 'Chưa có đơn hàng';

  document.getElementById('accountName').value = user.name || '';
  document.getElementById('accountEmail').value = user.email || '';
  document.getElementById('accountPhone').value = user.phone || '';
  document.getElementById('accountAddressLine').value = address.line || '';
  document.getElementById('accountWard').value = address.ward || '';
  document.getElementById('accountDistrict').value = address.district || '';
  document.getElementById('accountCity').value = address.city || '';
  document.getElementById('accountAddressNote').value = address.note || '';

  renderAccountCart(cart);
  renderAccountOrders(orders);

  const initialView = window.location.hash === '#orders' ? 'orders' : 'overview';
  showAccountView(initialView);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function numericPrice(value) {
  return Number(String(value || '').replace(/[^0-9]/g, '')) || 0;
}

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
}

function orderAddress(order) {
  const address = order.customer?.address || {};
  return [address.line, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(', ') || 'Chưa cập nhật địa chỉ nhận hàng';
}

function showAccountView(view) {
  document.querySelectorAll('[data-account-section]').forEach(section => {
    section.classList.toggle('active', section.dataset.accountSection === view);
  });
  document.querySelectorAll('.account-dashboard-nav [data-account-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.accountView === view);
  });
  if (view === 'orders') history.replaceState({}, '', `${location.pathname}${location.search}#orders`);
  else if (location.hash) history.replaceState({}, '', `${location.pathname}${location.search}`);
}

function renderAccountCart(cart) {
  const container = document.getElementById('accountCartItems');
  if (!cart.length) {
    container.innerHTML = `
      <div class="account-empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <h4>Giỏ hàng đang trống</h4>
        <p>Khám phá sản phẩm và lưu những mặt hàng bạn quan tâm.</p>
        <a href="all-products.html">Xem sản phẩm</a>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <article class="account-product-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
      <div><h4>${escapeHtml(item.name)}</h4><span>Số lượng: ${Number(item.quantity) || 1}</span></div>
      <strong>${escapeHtml(item.price)}</strong>
    </article>
  `).join('');
}

function renderAccountOrders(orders) {
  const recentContainer = document.getElementById('accountRecentOrders');
  const orderContainer = document.getElementById('accountOrderItems');
  if (!orders.length) {
    const empty = `
      <div class="account-empty-state">
        <i class="fa-solid fa-receipt"></i>
        <h4>Chưa có đơn hàng</h4>
        <p>Các đơn hàng đã xác nhận sẽ xuất hiện tại đây.</p>
        <a href="all-products.html">Bắt đầu mua sắm</a>
      </div>
    `;
    recentContainer.innerHTML = empty;
    orderContainer.innerHTML = empty;
    return;
  }

  const orderMarkup = order => `
    <article class="account-order-item">
      <div class="account-order-topline">
        <div><small>Mã đơn</small><strong>${escapeHtml(order.id)}</strong></div>
        <span>${escapeHtml(order.status || 'Đang xác nhận')}</span>
      </div>
      <div class="account-order-products">
        ${(order.items || []).slice(0, 3).map(item => `
          <img src="${escapeHtml(item.image || '/images/home/space-devices.jpg')}"
            title="${escapeHtml(item.name)}" alt="${escapeHtml(item.name)}" />
        `).join('')}
        <p>${(order.items || []).length} mặt hàng · ${formatOrderDate(order.createdAt)}</p>
      </div>
      <div class="account-order-meta">
        <span><i class="fa-solid fa-truck"></i> ${escapeHtml(order.shipping?.label || 'Giao hàng tiêu chuẩn')}</span>
        <span><i class="fa-regular fa-credit-card"></i> ${escapeHtml(order.payment?.label || 'Thanh toán khi nhận hàng')}</span>
        <button class="account-order-toggle" type="button" data-order-toggle aria-expanded="false">
          Xem chi tiết <i class="fa-solid fa-chevron-down"></i>
        </button>
        <strong>${formatMoney(order.total)}</strong>
      </div>
      <div class="account-order-details" data-order-details hidden>
        <div class="account-order-detail-heading">
          <div><small>Chi tiết đơn hàng</small><h4>${escapeHtml(order.id)}</h4></div>
          <span>Đặt ngày ${formatOrderDate(order.createdAt)}</span>
        </div>
        <div class="account-order-detail-layout">
          <section class="account-order-detail-products">
            <h5>Sản phẩm</h5>
            ${(order.items || []).map(item => {
              const quantity = Number(item.quantity) || 1;
              const unitPrice = numericPrice(item.price);
              return `
                <article>
                  <img src="${escapeHtml(item.image || '/images/home/space-devices.jpg')}"
                    alt="${escapeHtml(item.name)}" />
                  <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>Số lượng: ${quantity} · Đơn giá: ${formatMoney(unitPrice)}</span>
                  </div>
                  <b>${formatMoney(unitPrice * quantity)}</b>
                </article>
              `;
            }).join('')}
          </section>
          <section class="account-order-detail-info">
            <div>
              <span><i class="fa-regular fa-user"></i></span>
              <p><small>Người nhận</small><strong>${escapeHtml(order.customer?.name || 'Chưa cập nhật')}</strong>
                <em>${escapeHtml(order.customer?.phone || '')}</em></p>
            </div>
            <div>
              <span><i class="fa-solid fa-location-dot"></i></span>
              <p><small>Địa chỉ giao hàng</small><strong>${escapeHtml(orderAddress(order))}</strong>
                ${order.customer?.address?.note ? `<em>${escapeHtml(order.customer.address.note)}</em>` : ''}</p>
            </div>
            <div>
              <span><i class="fa-solid fa-truck-fast"></i></span>
              <p><small>Vận chuyển</small><strong>${escapeHtml(order.shipping?.label || 'Giao hàng tiêu chuẩn')}</strong>
                <em>${escapeHtml(order.shipping?.time || '')}</em></p>
            </div>
            <div>
              <span><i class="fa-regular fa-credit-card"></i></span>
              <p><small>Thanh toán</small><strong>${escapeHtml(order.payment?.label || 'Thanh toán khi nhận hàng')}</strong>
                <em>${escapeHtml(order.payment?.status || '')}</em></p>
            </div>
          </section>
        </div>
        <div class="account-order-cost">
          <div><span>Tạm tính</span><strong>${formatMoney(order.subtotal)}</strong></div>
          <div><span>Phí vận chuyển</span><strong>${order.shippingFee ? formatMoney(order.shippingFee) : 'Miễn phí'}</strong></div>
          <div><span>Tổng thanh toán</span><strong>${formatMoney(order.total)}</strong></div>
        </div>
      </div>
    </article>
  `;

  recentContainer.innerHTML = orders.slice(0, 2).map(orderMarkup).join('');
  orderContainer.innerHTML = orders.map(orderMarkup).join('');
}

document.querySelectorAll('[data-auth-view]').forEach(button => {
  button.addEventListener('click', () => showAuthView(button.dataset.authView));
});

document.querySelectorAll('[data-account-view]').forEach(button => {
  button.addEventListener('click', () => showAccountView(button.dataset.accountView));
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-order-toggle]');
  if (!button) return;
  const order = button.closest('.account-order-item');
  const details = order?.querySelector('[data-order-details]');
  if (!details) return;

  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  button.innerHTML = `${expanded ? 'Xem chi tiết' : 'Thu gọn'} <i class="fa-solid fa-chevron-down"></i>`;
  details.hidden = expanded;
  order.classList.toggle('expanded', !expanded);
});

document.querySelectorAll('[data-password-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.innerHTML = `<i class="fa-regular fa-eye${show ? '-slash' : ''}"></i>`;
    button.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
});

document.getElementById('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  setLoading(form, true);
  setMessage('');
  try {
    await authenticateUser(
      document.getElementById('loginIdentifier').value,
      document.getElementById('loginPassword').value
    );
    setMessage('Đăng nhập thành công. Đang chuyển trang...', 'success');
    sessionStorage.removeItem('smarthome_auth_return');
    setTimeout(() => {
      window.location.href = getSafeReturnUrl();
    }, 500);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(form, false);
  }
});

document.getElementById('registerForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const password = document.getElementById('registerPassword').value;
  if (password !== document.getElementById('registerConfirmPassword').value) {
    setMessage('Mật khẩu xác nhận chưa khớp.');
    return;
  }

  setLoading(form, true);
  setMessage('');
  try {
    await registerUser({
      name: document.getElementById('registerName').value,
      email: document.getElementById('registerEmail').value,
      phone: document.getElementById('registerPhone').value,
      password
    });
    setMessage('Tạo tài khoản thành công. Đang chuyển trang...', 'success');
    sessionStorage.removeItem('smarthome_auth_return');
    setTimeout(() => {
      window.location.href = getSafeReturnUrl();
    }, 500);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(form, false);
  }
});

document.getElementById('resetForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  setLoading(form, true);
  setMessage('');
  try {
    await resetUserPassword(
      document.getElementById('resetIdentifier').value,
      document.getElementById('resetPassword').value
    );
    showAuthView('login');
    setMessage('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập.', 'success');
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(form, false);
  }
});

document.getElementById('authLogoutButton').addEventListener('click', () => {
  logoutUser();
  window.location.reload();
});

document.getElementById('accountProfileForm').addEventListener('submit', event => {
  event.preventDefault();
  const message = document.getElementById('accountProfileMessage');
  try {
    const updatedUser = updateUserProfile(getCurrentUser().id, {
      name: document.getElementById('accountName').value,
      phone: document.getElementById('accountPhone').value,
      addressLine: document.getElementById('accountAddressLine').value,
      ward: document.getElementById('accountWard').value,
      district: document.getElementById('accountDistrict').value,
      city: document.getElementById('accountCity').value,
      addressNote: document.getElementById('accountAddressNote').value
    });
    message.textContent = 'Thông tin tài khoản đã được cập nhật.';
    message.className = 'auth-message success';
    message.hidden = false;
    document.getElementById('authProfileName').textContent = updatedUser.name;
    document.getElementById('authProfilePhone').textContent = updatedUser.phone || '';
    document.getElementById('authProfilePhoneWrap').hidden = !updatedUser.phone;
    document.getElementById('accountDefaultAddress').textContent =
      [
        updatedUser.address?.line,
        updatedUser.address?.ward,
        updatedUser.address?.district,
        updatedUser.address?.city
      ].filter(Boolean).join(', ') || 'Chưa cập nhật';
  } catch (error) {
    message.textContent = error.message;
    message.className = 'auth-message';
    message.hidden = false;
  }
});

const currentUser = getCurrentUser();
if (currentUser) {
  showProfile(currentUser);
} else {
  const requestedView = new URLSearchParams(window.location.search).get('view');
  showAuthView(['login', 'register', 'reset'].includes(requestedView) ? requestedView : 'login');
}
