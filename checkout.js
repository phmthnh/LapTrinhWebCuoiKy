import {
  getCartStorageKey,
  getCurrentUser,
  getOrdersStorageKey,
  updateUserProfile
} from './auth.js';

const shippingMethods = {
  standard: { label: 'Giao hàng tiêu chuẩn', time: '3-5 ngày làm việc', fee: 0 },
  express: { label: 'Giao hàng nhanh', time: '1-2 ngày làm việc', fee: 8 },
  scheduled: { label: 'Giao theo lịch hẹn', time: 'Theo thời gian đã hẹn', fee: 12 }
};

const paymentMethods = {
  cod: { label: 'Thanh toán khi nhận hàng', status: 'Chưa thanh toán' },
  bank: { label: 'Chuyển khoản ngân hàng', status: 'Chờ chuyển khoản' },
  card: { label: 'Thẻ tín dụng / ghi nợ', status: 'Đã ghi nhận thanh toán demo' }
};

function readJson(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function money(value) {
  return `$${Number(value).toLocaleString('en-US')}`;
}

function numericPrice(price) {
  return Number(String(price).replace(/[^0-9]/g, '')) || 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const user = getCurrentUser();
if (!user) {
  sessionStorage.setItem('smarthome_auth_return', 'checkout.html');
  window.location.replace(`login.html?return=${encodeURIComponent('checkout.html')}`);
} else {
  const cartKey = getCartStorageKey(user);
  const ordersKey = getOrdersStorageKey(user);
  let cart = readJson(cartKey);

  if (!cart.length) {
    document.getElementById('checkoutContent').innerHTML = `
      <section class="checkout-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <h1>Giỏ hàng đang trống</h1>
        <p>Hãy chọn sản phẩm trước khi tiếp tục thanh toán.</p>
        <a class="auth-submit" href="all-products.html">Khám phá sản phẩm</a>
      </section>
    `;
  } else {
    const fields = {
      name: document.getElementById('checkoutPageName'),
      phone: document.getElementById('checkoutPagePhone'),
      email: document.getElementById('checkoutPageEmail'),
      addressLine: document.getElementById('checkoutAddressLine'),
      ward: document.getElementById('checkoutWard'),
      district: document.getElementById('checkoutDistrict'),
      city: document.getElementById('checkoutCity'),
      note: document.getElementById('checkoutAddressNote')
    };

    fields.name.value = user.name || '';
    fields.phone.value = user.phone || '';
    fields.email.value = user.email || '';
    fields.addressLine.value = user.address?.line || '';
    fields.ward.value = user.address?.ward || '';
    fields.district.value = user.address?.district || '';
    fields.city.value = user.address?.city || '';
    fields.note.value = user.address?.note || '';
    document.getElementById('checkoutBankReference').textContent =
      `SMARTHOME ${fields.phone.value.replace(/\D/g, '') || user.id.slice(0, 8).toUpperCase()}`;

    function subtotal() {
      return cart.reduce(
        (total, item) => total + numericPrice(item.price) * (Number(item.quantity) || 1),
        0
      );
    }

    function selectedShipping() {
      return shippingMethods[document.querySelector('[name="shipping"]:checked').value];
    }

    function renderItems() {
      document.getElementById('checkoutOrderItems').innerHTML = cart.map(item => `
        <article class="checkout-order-item" data-checkout-item="${escapeHtml(item.id)}">
          <img src="${escapeHtml(item.image)}" data-fallback="${escapeHtml(item.fallbackImage || '/images/home/space-devices.jpg')}"
            alt="${escapeHtml(item.name)}" />
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <span>${escapeHtml(item.price)}</span>
            <div class="checkout-item-quantity">
              <button type="button" data-checkout-action="decrease" aria-label="Giảm số lượng">−</button>
              <b>${Number(item.quantity) || 1}</b>
              <button type="button" data-checkout-action="increase" aria-label="Tăng số lượng">+</button>
              <button type="button" data-checkout-action="remove">Xóa</button>
            </div>
          </div>
          <strong>${money(numericPrice(item.price) * (Number(item.quantity) || 1))}</strong>
        </article>
      `).join('');
      updateTotals();
    }

    function updateTotals() {
      const shipping = selectedShipping();
      const subtotalValue = subtotal();
      document.getElementById('checkoutSubtotal').textContent = money(subtotalValue);
      document.getElementById('checkoutShippingFee').textContent =
        shipping.fee ? money(shipping.fee) : 'Miễn phí';
      document.getElementById('checkoutGrandTotal').textContent = money(subtotalValue + shipping.fee);
    }

    function updatePaymentPanel(paymentId) {
      const bankDetails = document.getElementById('checkoutBankDetails');
      const cardFields = document.getElementById('checkoutCardFields');
      const showBank = paymentId === 'bank';
      const showCard = paymentId === 'card';

      bankDetails.hidden = !showBank;
      cardFields.hidden = !showCard;

      ['checkoutCardNumber', 'checkoutCardExpiry', 'checkoutCardCvv'].forEach(id => {
        const field = document.getElementById(id);
        field.required = showCard;
        field.disabled = !showCard;
      });
    }

    document.querySelectorAll('.checkout-option input').forEach(input => {
      input.addEventListener('change', () => {
        document.querySelectorAll(`input[name="${input.name}"]`).forEach(groupInput => {
          groupInput.closest('.checkout-option').classList.toggle('active', groupInput.checked);
        });
        if (input.name === 'shipping') updateTotals();
        if (input.name === 'payment') updatePaymentPanel(input.value);
      });
    });

    document.querySelectorAll('[data-copy-target]').forEach(button => {
      button.addEventListener('click', async () => {
        const value = document.getElementById(button.dataset.copyTarget)?.textContent.trim();
        if (!value) return;

        try {
          await navigator.clipboard.writeText(value);
          const originalContent = button.innerHTML;
          button.innerHTML = '<i class="fa-solid fa-check"></i> Đã chép';
          setTimeout(() => {
            button.innerHTML = originalContent;
          }, 1400);
        } catch {
          alert(`Vui lòng sao chép: ${value}`);
        }
      });
    });

    document.getElementById('checkoutOrderItems').addEventListener('click', event => {
      const button = event.target.closest('[data-checkout-action]');
      const itemElement = event.target.closest('[data-checkout-item]');
      if (!button || !itemElement) return;
      const item = cart.find(product => product.id === itemElement.dataset.checkoutItem);
      if (!item) return;

      if (button.dataset.checkoutAction === 'increase') item.quantity += 1;
      if (button.dataset.checkoutAction === 'decrease') item.quantity -= 1;
      if (button.dataset.checkoutAction === 'remove' || item.quantity <= 0) {
        cart = cart.filter(product => product.id !== item.id);
      }
      localStorage.setItem(cartKey, JSON.stringify(cart));
      if (!cart.length) window.location.reload();
      else renderItems();
    });

    document.getElementById('checkoutPageForm').addEventListener('submit', event => {
      event.preventDefault();
      const paymentId = document.querySelector('[name="payment"]:checked').value;
      const shippingId = document.querySelector('[name="shipping"]:checked').value;

      if (paymentId === 'card') {
        const cardNumber = document.getElementById('checkoutCardNumber').value.replace(/\D/g, '');
        const expiry = document.getElementById('checkoutCardExpiry').value.trim();
        const cvv = document.getElementById('checkoutCardCvv').value.replace(/\D/g, '');
        if (cardNumber.length < 12 || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length < 3) {
          alert('Vui lòng nhập đầy đủ thông tin thẻ hợp lệ.');
          return;
        }
      }

      const shipping = shippingMethods[shippingId];
      const payment = paymentMethods[paymentId];
      const subtotalValue = subtotal();
      const customer = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.replace(/\D/g, ''),
        email: fields.email.value.trim(),
        address: {
          line: fields.addressLine.value.trim(),
          ward: fields.ward.value.trim(),
          district: fields.district.value.trim(),
          city: fields.city.value.trim(),
          note: fields.note.value.trim()
        }
      };

      if (document.getElementById('checkoutSaveProfile').checked) {
        updateUserProfile(user.id, {
          name: customer.name,
          phone: customer.phone,
          addressLine: customer.address.line,
          ward: customer.address.ward,
          district: customer.address.district,
          city: customer.address.city,
          addressNote: customer.address.note
        });
      }

      const order = {
        id: `SH-${Date.now()}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        status: 'Đang xác nhận',
        customer,
        shipping: { id: shippingId, ...shipping },
        payment: { id: paymentId, ...payment },
        items: cart.map(item => ({ ...item })),
        subtotal: subtotalValue,
        shippingFee: shipping.fee,
        total: subtotalValue + shipping.fee
      };

      const orders = readJson(ordersKey);
      orders.unshift(order);
      localStorage.setItem(ordersKey, JSON.stringify(orders));
      localStorage.setItem(cartKey, '[]');

      document.getElementById('checkoutContent').hidden = true;
      const success = document.getElementById('checkoutSuccess');
      success.hidden = false;
      document.getElementById('checkoutSuccessDetails').innerHTML = `
        <div><span>Mã đơn hàng</span><strong>${order.id}</strong></div>
        <div><span>Người nhận</span><strong>${escapeHtml(customer.name)}</strong></div>
        <div><span>Giao hàng</span><strong>${escapeHtml(shipping.label)}</strong></div>
        <div><span>Thanh toán</span><strong>${escapeHtml(payment.label)}</strong></div>
        <div><span>Tổng tiền</span><strong>${money(order.total)}</strong></div>
      `;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('checkoutCardNumber').addEventListener('input', event => {
      event.target.value = event.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    });

    document.getElementById('checkoutCardExpiry').addEventListener('input', event => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
      event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });

    updatePaymentPanel(document.querySelector('[name="payment"]:checked').value);
    renderItems();
  }
}
