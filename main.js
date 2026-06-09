import './script.js'
import {
  getCartStorageKey,
  getCurrentUser,
  getOrdersStorageKey,
  getRecentProductsStorageKey,
  logoutUser,
  mergeGuestCartIntoUser,
  migrateLegacyCart,
  migrateLegacyOrders
} from './auth.js';

// ============================
// STICKY HEADER
// ============================
const header = document.getElementById("mainHeader");
if (header) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// ============================
// MOBILE MENU
// ============================
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
if (menuToggle && navbar) {
  menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("show");
    if (!navbar.classList.contains("show")) {
      setHomeProductsMenu(false);
    }
  });
}

// ============================
// HOMEPAGE PRODUCTS MEGA MENU
// ============================
const homeProductsMenu = document.getElementById("homeProductsMenu");
const homeProductsTrigger = document.getElementById("homeProductsTrigger");
const homeMegaMenu = document.getElementById("homeMegaMenu");

function setHomeProductsMenu(open) {
  if (!homeProductsMenu || !homeProductsTrigger) return;
  homeProductsMenu.classList.toggle("is-open", open);
  homeProductsTrigger.setAttribute("aria-expanded", String(open));
}

if (homeProductsMenu && homeProductsTrigger && homeMegaMenu) {
  homeProductsTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setHomeProductsMenu(!homeProductsMenu.classList.contains("is-open"));
  });

  homeProductsMenu.addEventListener("mouseenter", () => {
    if (!window.matchMedia("(max-width: 900px)").matches) {
      homeProductsTrigger.setAttribute("aria-expanded", "true");
    }
  });

  homeProductsMenu.addEventListener("mouseleave", () => {
    if (!window.matchMedia("(max-width: 900px)").matches) {
      homeProductsTrigger.setAttribute("aria-expanded", "false");
    }
  });

  homeMegaMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      setHomeProductsMenu(false);
      if (navbar) navbar.classList.remove("show");
    });
  });

  document.addEventListener("click", (event) => {
    if (!homeProductsMenu.contains(event.target)) {
      setHomeProductsMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setHomeProductsMenu(false);
      homeProductsTrigger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 900px)").matches) {
      setHomeProductsMenu(false);
    }
  });
}

// ============================
// ACTIVE NAV SECTION
// ============================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".home-nav .nav-item");
const isHomepage = document.querySelector(".hero") !== null;

if (isHomepage && sections.length > 0 && navLinks.length > 0) {
  const navTargets = Array.from(navLinks)
    .map(link => link.getAttribute("data-nav-target")
      || link.getAttribute("href")?.split("#")[1])
    .filter(Boolean);
  const trackedSections = Array.from(sections)
    .filter(section => navTargets.includes(section.id));
  let activeNavFrame = null;

  function setActiveNav(current) {
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      const navTarget = link.getAttribute("data-nav-target");
      const active = Boolean(
        current
        && ((href && href.endsWith(`#${current}`)) || navTarget === current)
      );
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function updateActiveNavSection() {
    activeNavFrame = null;
    const documentBottom = document.documentElement.scrollHeight - window.innerHeight;
    const atPageBottom = window.scrollY >= documentBottom - 4;
    const probePosition = window.scrollY + Math.min(window.innerHeight * 0.42, 380);
    let current = trackedSections[0]?.id || "";

    trackedSections.forEach(section => {
      if (section.offsetTop <= probePosition) current = section.id;
    });

    if (atPageBottom && trackedSections.length) {
      current = trackedSections.at(-1).id;
    }

    setActiveNav(current);
  }

  function scheduleActiveNavUpdate() {
    if (activeNavFrame !== null) return;
    activeNavFrame = window.requestAnimationFrame(updateActiveNavSection);
  }

  window.addEventListener("scroll", scheduleActiveNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveNavUpdate);
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-nav-target")
        || link.getAttribute("href")?.split("#")[1];
      if (target) setActiveNav(target);
    });
  });
  updateActiveNavSection();
}

// ============================
// SEARCH, PRODUCT DETAILS & CART
// ============================
const productIndex = new Map();
let productCatalogPromise = null;
let cart = [];
const currentUser = getCurrentUser();
const cartStorageKey = getCartStorageKey(currentUser);
const ordersStorageKey = getOrdersStorageKey(currentUser);

migrateLegacyCart();
if (currentUser) mergeGuestCartIntoUser(currentUser);
migrateLegacyOrders(currentUser);

try {
  cart = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
} catch {
  cart = [];
}

function getNumericPrice(price) {
  return parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
}

function normalizeSearchText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getProductFallbackImage(category = '', name = '') {
  const searchable = normalizeSearchText(`${category} ${name}`);
  if (searchable.includes('nha bep')) return '/images/home/product-airfryer.jpg';
  if (searchable.includes('chieu sang') || searchable.includes('den')) {
    return '/images/home/space-bedroom.jpg';
  }
  if (searchable.includes('phong khach') || searchable.includes('robot')) {
    return '/images/home/product-vacuum.jpg';
  }
  if (searchable.includes('an ninh') || searchable.includes('camera') || searchable.includes('khoa')) {
    return '/images/home/space-devices.jpg';
  }
  return '/images/home/product-airpurifier.jpg';
}

function productFromCard(card, baseUrl = window.location.href) {
  const imageElement = card.querySelector('img');
  const imageSource = imageElement?.getAttribute('src') || '';
  const name = card.querySelector('.pcard-title, .prod-title')?.textContent.trim()
    || 'Sản phẩm SmartHome';
  const category = card.querySelector('.pcard-cat')?.textContent.trim() || 'SmartHome';

  return {
    id: card.dataset.id || `product-${productIndex.size + 1}`,
    name,
    category,
    description: card.querySelector('.pcard-desc')?.textContent.trim()
      || 'Thiết bị thông minh giúp nâng cao sự tiện nghi cho không gian sống.',
    price: card.querySelector('.pcard-price, .prod-price')?.textContent.trim() || '$0',
    oldPrice: card.querySelector('.pcard-old-price')?.textContent.trim() || '',
    image: imageSource ? new URL(imageSource, baseUrl).href : '',
    fallbackImage: getProductFallbackImage(category, name)
  };
}

function registerProduct(product) {
  productIndex.set(product.id, product);
  return product;
}

function getProductDetailUrl(product) {
  const url = new URL('product-detail.html', window.location.href);
  const params = {
    id: product.id,
    title: product.name,
    category: product.category,
    price: product.price,
    oldPrice: product.oldPrice,
    img: product.image,
    desc: product.description
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.href;
}

function goToProductDetail(product) {
  registerProduct(product);
  rememberViewedProduct(product);
  window.location.href = getProductDetailUrl(product);
}

function rememberViewedProduct(product) {
  const key = getRecentProductsStorageKey(currentUser);
  let recentProducts = [];
  try {
    recentProducts = JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    recentProducts = [];
  }
  recentProducts = [
    { ...product, viewedAt: new Date().toISOString() },
    ...recentProducts.filter(item => item.id !== product.id)
  ].slice(0, 12);
  localStorage.setItem(key, JSON.stringify(recentProducts));
}

function collectProducts(root = document, baseUrl = window.location.href) {
  return Array.from(root.querySelectorAll('.premium-card'))
    .map(card => registerProduct(productFromCard(card, baseUrl)));
}

async function loadProductCatalog() {
  if (productCatalogPromise) return productCatalogPromise;

  productCatalogPromise = (async () => {
    const currentProducts = collectProducts();
    if (currentProducts.length >= 30) return currentProducts;

    try {
      const catalogUrl = new URL('all-products.html', window.location.href);
      const response = await fetch(catalogUrl);
      if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm');

      const html = await response.text();
      const catalogDocument = new DOMParser().parseFromString(html, 'text/html');
      collectProducts(catalogDocument, catalogUrl.href);
    } catch (error) {
      console.warn(error);
    }

    return Array.from(productIndex.values());
  })();

  return productCatalogPromise;
}

function ensureStorefrontUI() {
  const headerActions = document.querySelector('.home-header-actions');
  const searchControl = document.querySelector('.home-search');
  const accountControl = headerActions?.querySelector('.home-start-button');

  if (searchControl) {
    searchControl.setAttribute('href', 'all-products.html?search=1');
    searchControl.setAttribute('role', 'button');
    searchControl.setAttribute('aria-haspopup', 'dialog');
    searchControl.setAttribute('aria-controls', 'productSearchOverlay');
  }

  if (headerActions && !document.getElementById('homeCartButton')) {
    const cartButton = document.createElement('button');
    cartButton.id = 'homeCartButton';
    cartButton.className = 'home-cart-button';
    cartButton.type = 'button';
    cartButton.setAttribute('aria-label', 'Mở giỏ hàng');
    cartButton.setAttribute('aria-controls', 'storeCartDrawer');
    cartButton.innerHTML = `
      <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
      <span class="cart-badge" aria-label="Số sản phẩm trong giỏ">0</span>
    `;
    headerActions.insertBefore(cartButton, headerActions.querySelector('.home-start-button'));
  }

  if (accountControl && currentUser) {
    const firstName = currentUser.name.trim().split(/\s+/).pop();
    accountControl.href = '#account';
    accountControl.classList.add('home-account-button');
    accountControl.setAttribute('aria-expanded', 'false');
    accountControl.setAttribute('aria-controls', 'homeAccountPopover');
    accountControl.innerHTML = `<i class="fa-regular fa-user"></i><span>${escapeHtml(firstName)}</span>`;

    if (!document.getElementById('homeAccountPopover')) {
      headerActions.insertAdjacentHTML('beforeend', `
        <aside class="home-account-popover" id="homeAccountPopover" aria-hidden="true">
          <div class="home-account-heading">
            <span class="home-account-avatar">${escapeHtml(currentUser.name
              .split(/\s+/)
              .slice(-2)
              .map(part => part[0])
              .join('')
              .toUpperCase())}</span>
            <div>
              <strong>${escapeHtml(currentUser.name)}</strong>
              <small>${escapeHtml(currentUser.email)}</small>
            </div>
          </div>
          <div class="home-account-stats">
            <div><strong data-account-cart-count>0</strong><span>Trong giỏ</span></div>
            <div><strong data-account-order-count>0</strong><span>Đơn hàng</span></div>
          </div>
          <a href="login.html" class="home-account-link">
            <i class="fa-regular fa-address-card"></i> Quản lý tài khoản
          </a>
          <button type="button" class="home-account-logout" data-account-logout>
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
          </button>
        </aside>
      `);
    }
  }

  if (!document.getElementById('productSearchOverlay')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="store-modal-overlay product-search-overlay" id="productSearchOverlay" aria-hidden="true">
        <section class="product-search-dialog" role="dialog" aria-modal="true" aria-labelledby="productSearchTitle">
          <div class="store-dialog-header">
            <div>
              <p class="store-dialog-eyebrow">SmartHome Catalog</p>
              <h2 id="productSearchTitle">Tìm kiếm sản phẩm</h2>
            </div>
            <button class="store-icon-button" type="button" data-close-search aria-label="Đóng tìm kiếm">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <label class="product-search-field">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input id="productSearchInput" type="search" autocomplete="off"
              placeholder="Nhập tên sản phẩm, ví dụ: robot hút bụi..." />
          </label>
          <div class="product-search-status" id="productSearchStatus">Đang tải sản phẩm...</div>
          <div class="product-search-results" id="productSearchResults"></div>
        </section>
      </div>
    `);
  }

  if (!document.getElementById('storeCartDrawer')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="store-drawer-backdrop" id="storeCartBackdrop"></div>
      <aside class="store-cart-drawer" id="storeCartDrawer" aria-hidden="true" aria-labelledby="storeCartTitle">
        <div class="store-cart-header">
          <div>
            <p class="store-dialog-eyebrow">Đơn hàng của bạn</p>
            <h2 id="storeCartTitle">Giỏ hàng</h2>
          </div>
          <button class="store-icon-button" type="button" data-close-cart aria-label="Đóng giỏ hàng">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="store-cart-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <h3>Giỏ hàng đang trống</h3>
          <p>Thêm sản phẩm bạn quan tâm để bắt đầu đặt hàng.</p>
          <button type="button" class="store-secondary-button" data-open-search>Tìm sản phẩm</button>
        </div>
        <div class="store-cart-content">
          <div class="store-cart-items"></div>
          <div class="store-cart-summary">
            <div><span>Tạm tính</span><strong class="cart-total-price">$0</strong></div>
            <p>Phí vận chuyển sẽ được xác nhận khi đặt hàng.</p>
            <button class="store-checkout-button" type="button" id="storeCheckoutButton">
              Đặt hàng ngay
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>
    `);
  }

  if (!document.getElementById('productDetailOverlay')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="store-modal-overlay product-detail-overlay" id="productDetailOverlay" aria-hidden="true">
        <section class="product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="productDetailTitle">
          <button class="store-icon-button product-detail-close" type="button" data-close-detail aria-label="Đóng chi tiết">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="product-detail-media">
            <img id="productDetailImage" src="" alt="" />
          </div>
          <div class="product-detail-content">
            <p class="store-dialog-eyebrow" id="productDetailCategory">SmartHome</p>
            <h2 id="productDetailTitle">Sản phẩm SmartHome</h2>
            <div class="product-detail-price">
              <strong id="productDetailPrice">$0</strong>
              <span id="productDetailOldPrice"></span>
            </div>
            <p id="productDetailDescription"></p>
            <ul class="product-detail-features">
              <li><i class="fa-solid fa-wifi"></i> Kết nối và điều khiển qua ứng dụng SmartHome</li>
              <li><i class="fa-solid fa-shield-halved"></i> Bảo hành chính hãng và hỗ trợ kỹ thuật</li>
              <li><i class="fa-solid fa-bolt"></i> Tối ưu năng lượng bằng công nghệ thông minh</li>
            </ul>
            <button class="store-checkout-button" type="button" id="detailAddToCartButton">
              Thêm vào giỏ
              <i class="fa-solid fa-bag-shopping"></i>
            </button>
          </div>
        </section>
      </div>
    `);
  }

  if (!document.getElementById('storeToast')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="store-toast" id="storeToast" role="status"></div>');
  }
}

function showStoreToast(message) {
  const toast = document.getElementById('storeToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showStoreToast.timer);
  showStoreToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function setOverlayState(overlay, open) {
  if (!overlay) return;
  overlay.classList.toggle('is-active', open);
  overlay.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('store-overlay-open',
    document.querySelectorAll('.store-modal-overlay.is-active, .store-cart-drawer.is-active').length > 0);
}

function isAllProductsPage() {
  return window.location.pathname.toLowerCase().endsWith('/all-products.html');
}

function goToProductSearchPage() {
  closeCartDrawer();
  closeProductSearch();

  if (isAllProductsPage()) {
    const input = document.getElementById('catalogSearchInput');
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => input?.focus(), 350);
    return;
  }

  window.location.href = 'all-products.html?search=1';
}

async function renderSearchResults(query = '') {
  const resultsElement = document.getElementById('productSearchResults');
  const statusElement = document.getElementById('productSearchStatus');
  if (!resultsElement || !statusElement) return;

  const products = await loadProductCatalog();
  const normalizedQuery = normalizeSearchText(query);
  const matches = products.filter(product => {
    const searchable = normalizeSearchText(
      `${product.name} ${product.category} ${product.description}`
    );
    return !normalizedQuery || searchable.includes(normalizedQuery);
  }).slice(0, 12);

  statusElement.textContent = normalizedQuery
    ? `${matches.length} kết quả phù hợp`
    : 'Sản phẩm được quan tâm';

  if (matches.length === 0) {
    resultsElement.innerHTML = `
      <div class="product-search-empty">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác.</p>
      </div>
    `;
    return;
  }

  resultsElement.innerHTML = matches.map(product => `
    <article class="product-search-result" data-product-id="${product.id}">
      <img src="${product.image}" data-fallback="${product.fallbackImage}" alt="${product.name}" />
      <div class="product-search-result-copy">
        <span>${product.category}</span>
        <h3>${product.name}</h3>
        <strong>${product.price}</strong>
      </div>
      <div class="product-search-result-actions">
        <button type="button" data-search-detail="${product.id}">Chi tiết</button>
        <button type="button" data-search-add="${product.id}" aria-label="Thêm ${product.name} vào giỏ">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </article>
  `).join('');
}

async function openProductSearch() {
  closeCartDrawer();
  const overlay = document.getElementById('productSearchOverlay');
  const input = document.getElementById('productSearchInput');
  setOverlayState(overlay, true);
  await renderSearchResults(input?.value || '');
  setTimeout(() => input?.focus(), 50);
}

function closeProductSearch() {
  setOverlayState(document.getElementById('productSearchOverlay'), false);
}

function openCartDrawer() {
  closeProductSearch();
  const drawer = document.getElementById('storeCartDrawer');
  const backdrop = document.getElementById('storeCartBackdrop');
  drawer?.classList.add('is-active');
  drawer?.setAttribute('aria-hidden', 'false');
  backdrop?.classList.add('is-active');
  document.body.classList.add('store-overlay-open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('storeCartDrawer');
  const backdrop = document.getElementById('storeCartBackdrop');
  drawer?.classList.remove('is-active');
  drawer?.setAttribute('aria-hidden', 'true');
  backdrop?.classList.remove('is-active');
  if (!document.querySelector('.store-modal-overlay.is-active')) {
    document.body.classList.remove('store-overlay-open');
  }
}

function showProductDetail(product) {
  registerProduct(product);
  const overlay = document.getElementById('productDetailOverlay');
  const image = document.getElementById('productDetailImage');
  image.src = product.image;
  image.dataset.fallback = product.fallbackImage;
  image.dataset.fallbackApplied = 'false';
  image.alt = product.name;
  document.getElementById('productDetailCategory').textContent = product.category;
  document.getElementById('productDetailTitle').textContent = product.name;
  document.getElementById('productDetailPrice').textContent = product.price;
  const oldPrice = document.getElementById('productDetailOldPrice');
  oldPrice.textContent = product.oldPrice;
  oldPrice.hidden = !product.oldPrice;
  document.getElementById('productDetailDescription').textContent = product.description;
  document.getElementById('detailAddToCartButton').dataset.productId = product.id;
  setOverlayState(overlay, true);
}

function closeProductDetail() {
  setOverlayState(document.getElementById('productDetailOverlay'), false);
}

function enhanceProductCards() {
  document.querySelectorAll('.premium-card').forEach(card => {
    const product = registerProduct(productFromCard(card));
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `Xem chi tiết ${product.name}`);
    card.dataset.detailUrl = getProductDetailUrl(product);
    const image = card.querySelector('img');
    if (image) {
      image.dataset.fallback = product.fallbackImage;
      if (image.complete && image.naturalWidth === 0) image.src = product.fallbackImage;
    }
    const footer = card.querySelector('.pcard-footer');
    const addButton = card.querySelector('.add-to-cart-btn');
    if (!footer || !addButton || footer.querySelector('.product-detail-btn')) return;

    const actions = document.createElement('div');
    actions.className = 'pcard-actions';
    const detailButton = document.createElement('button');
    detailButton.className = 'product-detail-btn';
    detailButton.type = 'button';
    detailButton.dataset.productId = product.id;
    detailButton.innerHTML = 'Chi tiết <i class="fa-solid fa-arrow-up-right-from-square"></i>';
    footer.appendChild(actions);
    actions.append(detailButton, addButton);
  });
}

function addProductToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      fallbackImage: product.fallbackImage,
      quantity: 1
    });
  }
  updateCartUI();
  const badge = document.querySelector('.cart-badge');
  badge?.classList.add('bump');
  setTimeout(() => badge?.classList.remove('bump'), 300);
  showStoreToast(`Đã thêm “${product.name}” vào giỏ`);
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalMoney = cart.reduce(
    (sum, item) => sum + getNumericPrice(item.price) * item.quantity,
    0
  );
  const badge = document.querySelector('.cart-badge');
  const drawer = document.getElementById('storeCartDrawer');
  const emptyState = drawer?.querySelector('.store-cart-empty');
  const content = drawer?.querySelector('.store-cart-content');
  const itemsList = drawer?.querySelector('.store-cart-items');
  const totalElement = drawer?.querySelector('.cart-total-price');

  if (badge) {
    badge.textContent = totalQty;
    badge.classList.toggle('is-empty', totalQty === 0);
  }
  emptyState?.classList.toggle('is-hidden', cart.length > 0);
  content?.classList.toggle('is-visible', cart.length > 0);
  if (totalElement) totalElement.textContent = `$${totalMoney.toLocaleString('en-US')}`;

  if (itemsList) {
    itemsList.innerHTML = cart.map(item => `
      <article class="store-cart-item" data-cart-id="${item.id}">
        <img src="${item.image}" data-fallback="${item.fallbackImage || '/images/home/space-devices.jpg'}" alt="${item.name}" />
        <div class="store-cart-item-copy">
          <h3>${item.name}</h3>
          <strong>${item.price}</strong>
          <div class="store-cart-quantity">
            <button type="button" data-cart-action="decrease" aria-label="Giảm số lượng">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" aria-label="Tăng số lượng">+</button>
          </div>
        </div>
        <button class="store-cart-remove" type="button" data-cart-action="remove" aria-label="Xóa sản phẩm">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </article>
    `).join('');
  }

  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateAccountSummary();
}

function getStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem(ordersStorageKey)) || [];
  } catch {
    return [];
  }
}

function updateAccountSummary() {
  const cartCount = document.querySelector('[data-account-cart-count]');
  const orderCount = document.querySelector('[data-account-order-count]');
  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (total, item) => total + (Number(item.quantity) || 1),
      0
    );
  }
  if (orderCount) orderCount.textContent = String(getStoredOrders().length);
}

function setAccountPopover(open) {
  const popover = document.getElementById('homeAccountPopover');
  const control = document.querySelector('.home-account-button');
  if (!popover || !control) return;
  popover.classList.toggle('is-open', open);
  popover.setAttribute('aria-hidden', String(!open));
  control.setAttribute('aria-expanded', String(open));
}

function initializeStorefront() {
  ensureStorefrontUI();
  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === 'true') return;
    image.dataset.fallbackApplied = 'true';
    image.src = image.dataset.fallback || '/images/home/space-devices.jpg';
  }, true);
  enhanceProductCards();
  collectProducts();
  updateCartUI();

  document.querySelector('.home-search')?.addEventListener('click', event => {
    event.preventDefault();
    goToProductSearchPage();
  });
  document.getElementById('homeCartButton')?.addEventListener('click', openCartDrawer);
  document.querySelector('.home-account-button')?.addEventListener('click', event => {
    event.preventDefault();
    const popover = document.getElementById('homeAccountPopover');
    setAccountPopover(!popover?.classList.contains('is-open'));
  });
  document.querySelector('[data-account-logout]')?.addEventListener('click', () => {
    logoutUser();
    window.location.href = 'index.html';
  });
  document.addEventListener('click', event => {
    const popover = document.getElementById('homeAccountPopover');
    const control = document.querySelector('.home-account-button');
    if (popover && control && !popover.contains(event.target) && !control.contains(event.target)) {
      setAccountPopover(false);
    }
  });
  document.querySelector('[data-close-search]')?.addEventListener('click', closeProductSearch);
  document.querySelector('[data-close-cart]')?.addEventListener('click', closeCartDrawer);
  document.querySelector('[data-close-detail]')?.addEventListener('click', closeProductDetail);
  document.querySelector('[data-open-search]')?.addEventListener('click', goToProductSearchPage);
  document.getElementById('storeCartBackdrop')?.addEventListener('click', closeCartDrawer);

  const searchOverlay = document.getElementById('productSearchOverlay');
  searchOverlay?.addEventListener('click', event => {
    if (event.target === searchOverlay) closeProductSearch();
  });
  const detailOverlay = document.getElementById('productDetailOverlay');
  detailOverlay?.addEventListener('click', event => {
    if (event.target === detailOverlay) closeProductDetail();
  });

  document.getElementById('productSearchInput')?.addEventListener('input', event => {
    renderSearchResults(event.target.value);
  });

  document.getElementById('productSearchResults')?.addEventListener('click', event => {
    const detailButton = event.target.closest('[data-search-detail]');
    const addButton = event.target.closest('[data-search-add]');
    const productId = detailButton?.dataset.searchDetail || addButton?.dataset.searchAdd;
    const product = productIndex.get(productId);
    if (!product) return;

    if (detailButton) {
      closeProductSearch();
      goToProductDetail(product);
    } else {
      addProductToCart(product);
    }
  });

  document.getElementById('storeCartDrawer')?.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-cart-action]');
    if (!actionButton) return;
    const itemElement = actionButton.closest('[data-cart-id]');
    const item = cart.find(cartItem => cartItem.id === itemElement?.dataset.cartId);
    if (!item) return;

    if (actionButton.dataset.cartAction === 'increase') item.quantity += 1;
    if (actionButton.dataset.cartAction === 'decrease') item.quantity -= 1;
    if (actionButton.dataset.cartAction === 'remove' || item.quantity <= 0) {
      cart = cart.filter(cartItem => cartItem.id !== item.id);
    }
    updateCartUI();
  });

  document.getElementById('storeCheckoutButton')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showStoreToast('Giỏ hàng đang trống');
      return;
    }
    closeCartDrawer();
    if (!currentUser) {
      sessionStorage.setItem('smarthome_auth_return', 'checkout.html');
      window.location.href = `login.html?return=${encodeURIComponent('checkout.html')}`;
      return;
    }
    window.location.href = 'checkout.html';
  });

  document.getElementById('detailAddToCartButton')?.addEventListener('click', event => {
    const product = productIndex.get(event.currentTarget.dataset.productId);
    if (product) addProductToCart(product);
  });

  document.addEventListener('click', event => {
    const detailButton = event.target.closest('.product-detail-btn');
    if (detailButton) {
      const product = productIndex.get(detailButton.dataset.productId);
      if (product) goToProductDetail(product);
      return;
    }

    const addButton = event.target.closest('.add-to-cart-btn');
    if (addButton) {
      const card = addButton.closest('.premium-card, .card');
      if (card) addProductToCart(registerProduct(productFromCard(card)));
      return;
    }

    const card = event.target.closest('.premium-card');
    if (!card || event.target.closest('button, a, input, select, textarea')) return;
    goToProductDetail(registerProduct(productFromCard(card)));
  });

  document.addEventListener('smarthome:add-product', event => {
    if (!event.detail?.product) return;
    addProductToCart(registerProduct(event.detail.product));
    if (event.detail.openCart) openCartDrawer();
  });

  document.addEventListener('keydown', event => {
    const card = event.target.closest('.premium-card');
    if (!card || event.target !== card || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    goToProductDetail(registerProduct(productFromCard(card)));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeProductSearch();
    closeProductDetail();
    closeCartDrawer();
  });

  queueMicrotask(initializeCatalogControls);
}

initializeStorefront();

// Social login alerts
const facebookBtn = document.getElementById("facebookLogin");
const googleBtn = document.getElementById("googleLogin");
if (facebookBtn) {
  facebookBtn.addEventListener("click", () => {
    alert("Chức năng đăng nhập Facebook đang được phát triển!");
  });
}
if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    alert("Chức năng đăng nhập Google đang được phát triển!");
  });
}

// Homepage slider track
const track = document.querySelector(".product-track");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
if (track && nextBtn && prevBtn) {
  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: 330, behavior: "smooth" });
  });
  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -330, behavior: "smooth" });
  });
}

// ============================
// SIDEBAR INTERACTIVITY & FILTERS
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Custom Price Slider Logic
  const tracks = document.querySelectorAll('.price-track');
  tracks.forEach(track => {
    const handle = track.querySelector('.price-handle');
    const fill = track.querySelector('.price-fill');
    const labels = track.parentElement.querySelector('.price-labels');
    const priceText = labels ? labels.querySelectorAll('span')[1] : null;

    if (!handle || !fill || !priceText) return;

    let isDragging = false;

    const updateSlider = (clientX) => {
      const rect = track.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      const percentage = (x / rect.width) * 100;
      handle.style.left = percentage + '%';
      fill.style.width = percentage + '%';
      
      const val = Math.round((percentage / 100) * 1000);
      if (val >= 1000) {
        priceText.textContent = '$1,000+';
      } else {
        priceText.textContent = '$' + val;
      }
    };

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSlider(e.clientX);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    track.addEventListener('click', (e) => {
      if (e.target !== handle) {
        updateSlider(e.clientX);
      }
    });
  });

});

const catalogSearchIntentGroups = [
  ['robot', 'hút bụi', 'máy hút bụi', 'lau nhà', 'dọn nhà', 'vacuum'],
  ['camera', 'giám sát', 'an ninh', 'bảo mật', 'chống trộm'],
  ['đèn', 'chiếu sáng', 'bóng đèn', 'light'],
  ['nhà bếp', 'bếp', 'nấu ăn', 'nồi chiên', 'lò nướng', 'kitchen'],
  ['lọc không khí', 'máy lọc', 'khử khuẩn', 'air purifier'],
  ['khóa cửa', 'vân tay', 'nhận diện khuôn mặt']
].map(group => group.map(normalizeSearchText));

let catalogFilterTimer;
const catalogCardOrigins = new Map();
const CATALOG_PAGE_SIZE = 16;

function getCardSearchScore(card, query) {
  if (!query) return 1;

  const name = normalizeSearchText(card.querySelector('.pcard-title')?.textContent || '');
  const category = normalizeSearchText(card.querySelector('.pcard-cat')?.textContent || '');
  const description = normalizeSearchText(card.querySelector('.pcard-desc')?.textContent || '');
  const fullText = `${name} ${category} ${description}`;
  const variants = new Set([query]);

  catalogSearchIntentGroups.forEach(group => {
    if (group.includes(query)) {
      group.forEach(term => variants.add(term));
    }
  });

  let bestScore = 0;
  variants.forEach(variant => {
    const tokens = variant.split(/\s+/).filter(Boolean);
    if (!tokens.length || !tokens.every(token => fullText.includes(token))) return;

    let score = 30;
    if (name === variant) score = 120;
    else if (name.startsWith(variant)) score = 100;
    else if (name.includes(variant)) score = 85;
    else if (tokens.every(token => name.includes(token))) score = 70;
    else if (tokens.every(token => category.includes(token))) score = 55;
    bestScore = Math.max(bestScore, score);
  });

  return bestScore;
}

function getCatalogFilterState() {
  return {
    query: normalizeSearchText(document.getElementById('catalogSearchInput')?.value || ''),
    rawQuery: document.getElementById('catalogSearchInput')?.value.trim() || '',
    maxPrice: parseInt(document.querySelector('.price-range-input')?.value || '1000', 10),
    tag: document.querySelector('[data-product-tag].active')?.dataset.productTag || 'all',
    category: document.querySelector('[data-category-filter].active')?.dataset.categoryFilter || 'all',
    sort: document.querySelector('.catalog-sort select')?.value || 'featured'
  };
}

function isCatalogFilterActive(state) {
  return Boolean(
    state.query
    || state.maxPrice < 1000
    || state.tag !== 'all'
    || state.category !== 'all'
    || state.sort !== 'featured'
  );
}

function getPrice(card) {
  const text = card.querySelector('.pcard-price')?.textContent || '';
  return parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
}

function getProductTagWeight(card) {
  if (card.querySelector('.badge-premium')) return 2;
  if (card.querySelector('.badge-sale')) return 1;
  return 0;
}

function compareCatalogCards(first, second, state) {
  if (state.query) {
    const scoreDifference = Number(second.dataset.searchScore) - Number(first.dataset.searchScore);
    if (scoreDifference) return scoreDifference;
  }
  if (state.sort === 'price-asc') return getPrice(first) - getPrice(second);
  if (state.sort === 'price-desc') return getPrice(second) - getPrice(first);
  if (state.sort === 'name-asc') {
    const firstName = first.querySelector('.pcard-title')?.textContent || '';
    const secondName = second.querySelector('.pcard-title')?.textContent || '';
    return firstName.localeCompare(secondName, 'vi');
  }
  const tagDifference = getProductTagWeight(second) - getProductTagWeight(first);
  if (tagDifference) return tagDifference;
  return Number(first.dataset.originalOrder) - Number(second.dataset.originalOrder);
}

function restoreCatalogCardOrigins() {
  catalogCardOrigins.forEach(({ grid }, card) => {
    grid.appendChild(card);
    card.style.display = 'flex';
  });
  document.querySelectorAll('.catalog-section:not(.catalog-unified-results)').forEach(section => {
    section.hidden = false;
  });
  const unifiedSection = document.querySelector('.catalog-unified-results');
  if (unifiedSection) unifiedSection.hidden = true;
}

function ensureUnifiedCatalogResults() {
  let section = document.querySelector('.catalog-unified-results');
  if (section) return section;

  const firstSection = document.querySelector('.catalog-section');
  if (!firstSection) return null;
  section = document.createElement('section');
  section.className = 'catalog-section catalog-unified-results';
  section.hidden = true;
  section.innerHTML = `
    <h2>Kết quả phù hợp</h2>
    <div class="premium-grid catalog-unified-grid"></div>
  `;
  firstSection.insertAdjacentElement('beforebegin', section);
  return section;
}

function renderCatalogPagination(totalItems, currentPage) {
  const pagination = document.querySelector('.catalog-pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(totalItems / CATALOG_PAGE_SIZE);
  pagination.hidden = totalPages <= 1;

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `
      <button
        type="button"
        class="page-btn${page === currentPage ? ' active' : ''}"
        data-catalog-page="${page}"
        aria-label="Trang ${page}"
        ${page === currentPage ? 'aria-current="page"' : ''}
      >${page}</button>
    `;
  }).join('');

  pagination.innerHTML = `
    <button
      type="button"
      class="page-btn page-btn-arrow"
      data-catalog-page="${currentPage - 1}"
      aria-label="Trang trước"
      ${currentPage === 1 ? 'disabled' : ''}
    ><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
    ${pageButtons}
    <button
      type="button"
      class="page-btn page-btn-arrow"
      data-catalog-page="${currentPage + 1}"
      aria-label="Trang sau"
      ${currentPage === totalPages ? 'disabled' : ''}
    ><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
  `;
}

function filterProducts({
  updateUrl = true,
  requestedPage = 1,
  scrollToResults = false
} = {}) {
  const state = getCatalogFilterState();
  restoreCatalogCardOrigins();
  const allCards = Array.from(catalogCardOrigins.keys());

  allCards.forEach((card, index) => {
    if (!card.dataset.originalOrder) card.dataset.originalOrder = String(index);
    card.dataset.searchScore = String(getCardSearchScore(card, state.query));
  });

  const cardMatchesFilters = card => {
    const category = normalizeSearchText(card.querySelector('.pcard-cat')?.textContent || '');
    const searchScore = parseInt(card.dataset.searchScore || '0', 10);
    const matchesCategory = state.category === 'all' || category.includes(state.category);
    const matchesTag = state.tag === 'all'
      || (state.tag === 'premium' && Boolean(card.querySelector('.badge-premium')))
      || (state.tag === 'sale' && Boolean(card.querySelector('.badge-sale')));
    return getPrice(card) <= state.maxPrice
      && matchesCategory
      && matchesTag
      && (!state.query || searchScore > 0);
  };

  const useUnifiedResults = isAllProductsPage() && isCatalogFilterActive(state);
  let matchingCards = [];

  if (useUnifiedResults) {
    const unifiedSection = ensureUnifiedCatalogResults();
    const unifiedGrid = unifiedSection?.querySelector('.catalog-unified-grid');
    matchingCards = allCards
      .filter(cardMatchesFilters)
      .sort((first, second) => compareCatalogCards(first, second, state));
    const totalPages = Math.max(1, Math.ceil(matchingCards.length / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const pageStart = (currentPage - 1) * CATALOG_PAGE_SIZE;
    const pageCards = matchingCards.slice(pageStart, pageStart + CATALOG_PAGE_SIZE);

    document.querySelectorAll('.catalog-section:not(.catalog-unified-results)').forEach(section => {
      section.hidden = true;
    });
    allCards.forEach(card => {
      card.style.display = 'none';
    });
    pageCards.forEach(card => {
      card.style.display = 'flex';
      unifiedGrid?.appendChild(card);
    });
    if (unifiedSection) unifiedSection.hidden = matchingCards.length === 0;

    renderCatalogPagination(matchingCards.length, currentPage);
    updateCatalogSearchFeedback(matchingCards.length, allCards.length, state, {
      currentPage,
      totalPages,
      pageStart,
      visibleOnPage: pageCards.length
    });
    if (updateUrl) syncCatalogFilterUrl(state, currentPage);
  } else {
    const grids = Array.from(new Set(
      Array.from(catalogCardOrigins.values()).map(({ grid }) => grid)
    ));

    grids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.premium-card'))
        .sort((first, second) => compareCatalogCards(first, second, state));
      cards.forEach(card => grid.appendChild(card));
      matchingCards.push(...cards.filter(cardMatchesFilters));
    });

    const totalPages = Math.max(1, Math.ceil(matchingCards.length / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const pageStart = (currentPage - 1) * CATALOG_PAGE_SIZE;
    const pageCards = matchingCards.slice(pageStart, pageStart + CATALOG_PAGE_SIZE);
    const pageCardSet = new Set(pageCards);

    grids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.premium-card'));
      let visibleInGrid = 0;

      cards.forEach(card => {
        const show = pageCardSet.has(card);
        card.style.display = show ? 'flex' : 'none';
        if (show) visibleInGrid += 1;
      });

      const catalogSection = grid.closest('.catalog-section');
      if (catalogSection) catalogSection.hidden = visibleInGrid === 0;
    });

    renderCatalogPagination(matchingCards.length, currentPage);
    updateCatalogSearchFeedback(matchingCards.length, allCards.length, state, {
      currentPage,
      totalPages,
      pageStart,
      visibleOnPage: pageCards.length
    });
    if (updateUrl) syncCatalogFilterUrl(state, currentPage);
  }

  if (scrollToResults) {
    document.querySelector('.catalog-header')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  return matchingCards.length;
}

function updateCatalogSearchFeedback(resultCount, totalCount, state, pageState) {
  const status = document.getElementById('catalogSearchStatus');
  const clearButton = document.getElementById('catalogSearchClear');
  const catalogMain = document.querySelector('.catalog-main');
  let emptyState = document.getElementById('catalogSearchEmpty');

  if (!status || !clearButton) return;

  const active = isCatalogFilterActive(state);
  const querySuffix = state.rawQuery ? ` cho “${state.rawQuery}”` : '';
  if (pageState.totalPages > 1 && resultCount > 0) {
    const firstVisible = pageState.pageStart + 1;
    const lastVisible = pageState.pageStart + pageState.visibleOnPage;
    status.textContent = `Đang hiển thị ${firstVisible}-${lastVisible} trong ${resultCount} sản phẩm phù hợp${querySuffix}`;
  } else {
    status.textContent = `${resultCount}/${totalCount} sản phẩm phù hợp${querySuffix}`;
  }
  clearButton.hidden = !active;
  const activeFilterCount = [
    state.maxPrice < 1000,
    state.tag !== 'all',
    state.category !== 'all',
    state.sort !== 'featured'
  ].filter(Boolean).length;
  const mobileFilterCount = document.querySelector('.catalog-filter-toggle-count');
  if (mobileFilterCount) {
    mobileFilterCount.textContent = String(activeFilterCount);
    mobileFilterCount.hidden = activeFilterCount === 0;
  }

  renderCatalogFilterChips(state);

  if (!emptyState && catalogMain) {
    emptyState = document.createElement('div');
    emptyState.id = 'catalogSearchEmpty';
    emptyState.className = 'catalog-search-empty-state';
    emptyState.innerHTML = `
      <i class="fa-solid fa-magnifying-glass"></i>
      <h2>Không tìm thấy sản phẩm</h2>
      <p>Hãy thử tên sản phẩm, danh mục hoặc từ khóa khác.</p>
    `;
    catalogMain.insertBefore(emptyState, document.querySelector('.catalog-pagination'));
  }

  if (emptyState) emptyState.hidden = !active || resultCount > 0;
}

function ensureCatalogFeedback() {
  if (document.getElementById('catalogSearchStatus')) return;
  const catalogHeader = document.querySelector('.catalog-header');
  if (!catalogHeader) return;
  catalogHeader.insertAdjacentHTML('beforebegin', `
    <div class="catalog-search-feedback catalog-filter-feedback">
      <p id="catalogSearchStatus">Đang tải sản phẩm...</p>
      <button id="catalogSearchClear" type="button" hidden>
        Xóa bộ lọc <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `);
}

function ensureCatalogFilterToggle() {
  const sidebar = document.querySelector('.catalog-sidebar');
  if (!sidebar || document.querySelector('.catalog-filter-toggle')) return;
  const toggle = document.createElement('button');
  toggle.className = 'catalog-filter-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = `
    <span><i class="fa-solid fa-sliders"></i> Bộ lọc</span>
    <span class="catalog-filter-toggle-meta">
      <strong class="catalog-filter-toggle-count" hidden>0</strong>
      <i class="fa-solid fa-chevron-down"></i>
    </span>
  `;
  sidebar.insertAdjacentElement('beforebegin', toggle);
  toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function renderCatalogFilterChips(state) {
  const feedback = document.querySelector('.catalog-search-feedback');
  if (!feedback) return;
  let container = document.getElementById('catalogActiveFilters');
  if (!container) {
    container = document.createElement('div');
    container.id = 'catalogActiveFilters';
    container.className = 'catalog-active-filters';
    feedback.insertAdjacentElement('afterend', container);
  }

  const chips = [];
  if (state.category !== 'all') {
    const label = document.querySelector(`[data-category-filter="${state.category}"]`)?.textContent.trim();
    if (label) chips.push(['category', label.replace(/\d+$/, '').trim()]);
  }
  if (state.maxPrice < 1000) chips.push(['price', `Tối đa $${state.maxPrice}`]);
  if (state.tag === 'premium') chips.push(['tag', 'Nổi bật']);
  if (state.tag === 'sale') chips.push(['tag', 'Giảm giá']);
  if (state.sort !== 'featured') {
    const label = document.querySelector('.catalog-sort select option:checked')?.textContent;
    if (label) chips.push(['sort', label]);
  }

  container.innerHTML = chips.map(([filter, label]) => `
    <button type="button" data-clear-catalog-filter="${filter}">
      ${label} <i class="fa-solid fa-xmark"></i>
    </button>
  `).join('');
  container.hidden = chips.length === 0;
}

function syncCatalogFilterUrl(state, currentPage = 1) {
  const nextUrl = new URL(window.location.href);
  const setOrDelete = (key, value, defaultValue) => {
    if (value !== defaultValue && value !== '') nextUrl.searchParams.set(key, value);
    else nextUrl.searchParams.delete(key);
  };

  setOrDelete('q', state.rawQuery, '');
  setOrDelete('max', String(state.maxPrice), '1000');
  setOrDelete('tag', state.tag, 'all');
  setOrDelete('category', state.category, 'all');
  setOrDelete('sort', state.sort, 'featured');
  setOrDelete('page', String(currentPage), '1');
  nextUrl.searchParams.delete('search');
  window.history.replaceState({}, '', nextUrl);
}

function updatePriceControl(rangeInput) {
  if (!rangeInput) return;
  const value = Number(rangeInput.value);
  const percentage = (value / Number(rangeInput.max)) * 100;
  const maxLabel = rangeInput.closest('.price-slider-container')?.querySelector('.price-labels span:last-child');
  rangeInput.style.setProperty('--val', `${percentage}%`);
  if (maxLabel) maxLabel.textContent = value >= 1000 ? '$1,000+' : `$${value.toLocaleString()}`;
  document.querySelectorAll('[data-max-price]').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.maxPrice) === value);
  });
}

function resetCatalogFilters() {
  const input = document.getElementById('catalogSearchInput');
  const rangeInput = document.querySelector('.price-range-input');
  const sortSelect = document.querySelector('.catalog-sort select');
  if (input) input.value = '';
  if (rangeInput) rangeInput.value = '1000';
  if (sortSelect) sortSelect.value = 'featured';
  document.querySelectorAll('[data-product-tag]').forEach(button => {
    button.classList.toggle('active', button.dataset.productTag === 'all');
  });
  document.querySelectorAll('[data-category-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.categoryFilter === 'all');
  });
  updatePriceControl(rangeInput);
  filterProducts();
}

function initializeCatalogControls() {
  if (!document.querySelector('.premium-grid')) return;

  ensureCatalogFilterToggle();
  ensureCatalogFeedback();
  document.querySelectorAll('.premium-grid .premium-card').forEach((card, index) => {
    card.dataset.originalOrder = String(index);
    catalogCardOrigins.set(card, { grid: card.parentElement });
  });
  const form = document.getElementById('catalogSearchForm');
  const input = document.getElementById('catalogSearchInput');
  const clearButton = document.getElementById('catalogSearchClear');
  const params = new URLSearchParams(window.location.search);
  const rangeInput = document.querySelector('.price-range-input');
  const sortSelect = document.querySelector('.catalog-sort select');
  const requestedMax = Math.min(1000, Math.max(0, Number(params.get('max')) || 1000));

  if (input) input.value = params.get('q') || '';
  if (rangeInput) rangeInput.value = String(requestedMax);
  if (sortSelect && params.get('sort')) sortSelect.value = params.get('sort');

  const requestedTag = params.get('tag') || 'all';
  document.querySelectorAll('[data-product-tag]').forEach(button => {
    button.classList.toggle('active', button.dataset.productTag === requestedTag);
  });
  if (!document.querySelector('[data-product-tag].active')) {
    document.querySelector('[data-product-tag="all"]')?.classList.add('active');
  }

  const requestedCategory = params.get('category') || 'all';
  document.querySelectorAll('[data-category-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.categoryFilter === requestedCategory);
  });
  if (!document.querySelector('[data-category-filter].active')) {
    document.querySelector('[data-category-filter="all"]')?.classList.add('active');
  }

  updatePriceControl(rangeInput);

  const applySoon = () => {
    clearTimeout(catalogFilterTimer);
    catalogFilterTimer = setTimeout(() => filterProducts(), 100);
  };

  form?.addEventListener('submit', event => {
    event.preventDefault();
    filterProducts();
  });

  input?.addEventListener('input', applySoon);

  rangeInput?.addEventListener('input', () => {
    updatePriceControl(rangeInput);
    applySoon();
  });

  document.querySelectorAll('[data-max-price]').forEach(button => {
    button.addEventListener('click', () => {
      rangeInput.value = button.dataset.maxPrice;
      updatePriceControl(rangeInput);
      filterProducts();
    });
  });

  document.querySelectorAll('[data-product-tag]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-product-tag]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });

  document.querySelectorAll('[data-category-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-category-filter]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });

  sortSelect?.addEventListener('change', () => filterProducts());

  clearButton?.addEventListener('click', () => {
    resetCatalogFilters();
    input?.focus();
  });

  document.querySelector('.btn-reset')?.addEventListener('click', resetCatalogFilters);
  document.querySelector('.btn-apply')?.addEventListener('click', () => {
    filterProducts();
    document.querySelector('.catalog-sidebar')?.classList.remove('is-open');
    const filterToggle = document.querySelector('.catalog-filter-toggle');
    filterToggle?.classList.remove('is-open');
    filterToggle?.setAttribute('aria-expanded', 'false');
    document.querySelector('.catalog-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelector('.catalog-main')?.addEventListener('click', event => {
    const pageButton = event.target.closest('[data-catalog-page]');
    if (pageButton && !pageButton.disabled) {
      filterProducts({
        requestedPage: Number(pageButton.dataset.catalogPage),
        scrollToResults: true
      });
      return;
    }

    const chip = event.target.closest('[data-clear-catalog-filter]');
    if (!chip) return;
    const filter = chip.dataset.clearCatalogFilter;
    if (filter === 'price' && rangeInput) {
      rangeInput.value = '1000';
      updatePriceControl(rangeInput);
    }
    if (filter === 'tag') {
      document.querySelectorAll('[data-product-tag]').forEach(button => {
        button.classList.toggle('active', button.dataset.productTag === 'all');
      });
    }
    if (filter === 'category') {
      document.querySelectorAll('[data-category-filter]').forEach(button => {
        button.classList.toggle('active', button.dataset.categoryFilter === 'all');
      });
    }
    if (filter === 'sort' && sortSelect) sortSelect.value = 'featured';
    filterProducts();
  });

  filterProducts({
    updateUrl: false,
    requestedPage: Number(params.get('page')) || 1
  });

  if ((params.has('search') || input?.value) && input) {
    input.scrollIntoView({ block: 'center' });
    setTimeout(() => input.focus(), 100);
  }
}
// ========================================================
// MODERN SEARCH BAR, MEGA MENU & DYNAMIC CHECKOUT MODAL LOGIC
// ========================================================

// Expandable Search Bar Interactivity
document.addEventListener('DOMContentLoaded', () => {
  const searchWrapper = document.querySelector('.lv-search-wrapper');
  const searchIcon = document.querySelector('.lv-search-icon');
  const searchInput = document.querySelector('.lv-search-input');
  
  if (searchIcon && searchWrapper && searchInput) {
    searchIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      searchWrapper.classList.toggle('is-active');
      if (searchWrapper.classList.contains('is-active')) {
        searchInput.focus();
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!searchWrapper.contains(e.target)) {
        searchWrapper.classList.remove('is-active');
      }
    });

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase().trim();
      
      // If we are on subpages (with category grids), trigger catalog filter
      if (document.querySelector('.premium-grid')) {
        filterProducts();
      } else {
        // If we are on the homepage, filter the product slider cards
        const cards = document.querySelectorAll('.premium-card, .card');
        cards.forEach(card => {
          const titleEl = card.querySelector('.pcard-title') || card.querySelector('.prod-title');
          const productName = titleEl ? titleEl.textContent.toLowerCase() : '';
          if (productName.includes(val)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  }
});

// Checkout is handled on checkout.html.
