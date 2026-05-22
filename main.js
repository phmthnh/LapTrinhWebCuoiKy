import './script.js'
// ============================
// STICKY HEADER
// ============================

const header =
  document.getElementById("mainHeader");

window.addEventListener("scroll", () => {

  if(window.scrollY > 50){
    header.classList.add("scrolled");
  }
  else{
    header.classList.remove("scrolled");
  }

});

// ============================
// MOBILE MENU
// ============================

const menuToggle =
  document.getElementById("menuToggle");

const navbar =
  document.getElementById("navbar");

menuToggle.addEventListener("click", () => {

  navbar.classList.toggle("show");

});

// ============================
// ACTIVE NAV SECTION
// ============================

const sections =
  document.querySelectorAll("section");

const navLinks =
  document.querySelectorAll(".nav-item");

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach(section => {

    const sectionTop =
      section.offsetTop - 150;

    if(window.scrollY >= sectionTop){
      current = section.getAttribute("id");
    }

  });

  navLinks.forEach(link => {

    link.classList.remove("active");

    if(
      link.getAttribute("href")
      === `#${current}`
    ){
      link.classList.add("active");
    }

  });

});

// ============================
// SEARCH REALTIME
// ============================

const searchInput =
  document.querySelector(".search-container input");

const productCards =
  document.querySelectorAll(".product-card");

searchInput.addEventListener("keyup", () => {

  const value =
    searchInput.value.toLowerCase();

  productCards.forEach(card => {

    const productName =
      card.dataset.name.toLowerCase();

    if(productName.includes(value)){
      card.style.display = "block";
    }
    else{
      card.style.display = "none";
    }

  });

});

// ============================
// ADD TO CART
// ============================

const cartBadge =
  document.querySelector(".cart-badge");

const addCartButtons =
  document.querySelectorAll(".add-cart-btn");

let cartCount = 0;

addCartButtons.forEach(button => {

  button.addEventListener("click", () => {

    cartCount++;

    cartBadge.innerText = cartCount;

    cartBadge.classList.add("bump");

    setTimeout(() => {
      cartBadge.classList.remove("bump");
    }, 300);

  });

});

// Quản lý dữ liệu giỏ hàng (Lấy từ localStorage nếu có, hoặc tạo mảng rỗng)
let cart = JSON.parse(localStorage.getItem('smarthome_cart')) || [];

// Lấy các phần tử giao diện cần xử lý
const cartBadge = document.querySelector('.cart-badge');
const cartEmptyState = document.querySelector('.cart-empty-state');
const cartItemsContainer = document.querySelector('.cart-items-container');
const cartItemsList = document.querySelector('.cart-items-list');
const cartTotalPrice = document.querySelector('.cart-total-price');

// Hàm cập nhật hiển thị giỏ hàng ra màn hình
function updateCartUI() {
  // 1. Cập nhật số lượng trên Badge quả cầu đỏ/đen
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalQty;

  // 2. Kiểm tra giỏ hàng trống hay có đồ
  if (cart.length === 0) {
    if (cartEmptyState) cartEmptyState.style.display = 'flex';
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
  } else {
    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';

    // Xóa danh sách cũ đi để vẽ lại
    cartItemsList.innerHTML = '';
    let totalMoney = 0;

    // Duyệt qua từng món hàng trong giỏ để tạo HTML
    cart.forEach(item => {
      const priceNumeric = parseInt(item.price.replace(/[^0-0-9]/g, ''));
      totalMoney += priceNumeric * item.quantity;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-qty-price">${item.quantity} x ${item.price}</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      cartItemsList.appendChild(itemRow);
    });

    // Cập nhật tổng tiền hiển thị
    if (cartTotalPrice) cartTotalPrice.textContent = totalMoney.toLocaleString('vi-VN') + 'đ';
  }

  // Lưu lại vào bộ nhớ trình duyệt để F5 không bị mất
  localStorage.setItem('smarthome_cart', JSON.stringify(cart));
}

// Hàm thêm sản phẩm vào giỏ hàng
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const id = card.getAttribute('data-id');
    const name = card.querySelector('.prod-title').textContent;
    const price = card.querySelector('.prod-price').textContent;
    const image = card.querySelector('.prod-img').src;

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1; // Có rồi thì tăng số lượng
    } else {
      cart.push({ id, name, price, image, quantity: 1 }); // Chưa có thì thêm mới
    }

    updateCartUI();
  });
});

// Hàm xóa sản phẩm khỏi giỏ hàng
window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

// Chạy cập nhật giỏ hàng ngay khi tải trang lần đầu
document.addEventListener('DOMContentLoaded', updateCartUI);