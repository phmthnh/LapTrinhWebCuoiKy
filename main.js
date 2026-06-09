import './script.js'

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
  });
}

// ============================
// ACTIVE NAV SECTION
// ============================
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-item");
if (sections.length > 0 && navLinks.length > 0) {
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

// ============================
// SEARCH REALTIME
// ============================
const searchInput = document.querySelector(".search-container input");
if (searchInput) {
  searchInput.addEventListener("keyup", () => {
    const value = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".card, .premium-card");
    cards.forEach(card => {
      const titleEl = card.querySelector(".prod-title, .pcard-title");
      const productName = titleEl ? titleEl.textContent.toLowerCase() : "";
      if (productName.includes(value)) {
        card.style.display = card.classList.contains("premium-card") ? "flex" : "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ============================
// ADD TO CART & CART MANAGEMENT
// ============================
let cart = JSON.parse(localStorage.getItem('smarthome_cart')) || [];
const cartBadge = document.querySelector('.cart-badge');
const cartEmptyState = document.querySelector('.cart-empty-state');
const cartItemsContainer = document.querySelector('.cart-items-container');
const cartItemsList = document.querySelector('.cart-items-list');
const cartTotalPrice = document.querySelector('.cart-total-price');

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalQty;

  if (cart.length === 0) {
    if (cartEmptyState) cartEmptyState.style.display = 'flex';
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
  } else {
    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';

    if (cartItemsList) {
      cartItemsList.innerHTML = '';
      let totalMoney = 0;

      cart.forEach(item => {
        const priceNumeric = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
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

      if (cartTotalPrice) cartTotalPrice.textContent = '$' + totalMoney.toLocaleString('en-US');
    }
  }
  localStorage.setItem('smarthome_cart', JSON.stringify(cart));
}

// Add to Cart via event delegation
document.addEventListener('click', (e) => {
  const button = e.target.closest('.add-to-cart-btn');
  if (!button) return;

  const card = button.closest('.card') || button.closest('.premium-card');
  if (!card) return;

  const id = card.getAttribute('data-id') || 'u' + Math.floor(Math.random()*1000);
  const titleEl = card.querySelector('.prod-title') || card.querySelector('.pcard-title');
  const name = titleEl ? titleEl.textContent : 'Product';
  const priceEl = card.querySelector('.prod-price') || card.querySelector('.pcard-price');
  const price = priceEl ? priceEl.textContent : '$0';
  const imgEl = card.querySelector('.prod-img') || card.querySelector('img');
  const image = imgEl ? imgEl.src : '';

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }

  updateCartUI();

  if (cartBadge) {
    cartBadge.classList.add("bump");
    setTimeout(() => {
      cartBadge.classList.remove("bump");
    }, 300);
  }
});

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

document.addEventListener('DOMContentLoaded', updateCartUI);

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

  // Availability Pills
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const rangeInput = document.querySelector('.price-range-input');
  const priceLabels = document.querySelectorAll('.price-labels span');
  const maxLabel = priceLabels.length > 1 ? priceLabels[1] : null;
  
  if (rangeInput) {
    rangeInput.addEventListener('input', (e) => {
      const val = e.target.value;
      const percentage = (val / e.target.max) * 100;
      e.target.style.setProperty('--val', percentage + '%');
      if (maxLabel) {
        maxLabel.textContent = '$' + Number(val).toLocaleString() + (val == 1000 ? '+' : '');
      }
    });
    rangeInput.dispatchEvent(new Event('input'));
  }
  
  const btnApply = document.querySelector('.btn-apply');
  const btnReset = document.querySelector('.btn-reset');
  
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      triggerLoadingAndFilter();
    });
  }
  
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (rangeInput) {
        rangeInput.value = 1000;
        rangeInput.dispatchEvent(new Event('input'));
      }
      const pills = document.querySelectorAll('.pill');
      pills.forEach(p => p.classList.remove('active'));
      triggerLoadingAndFilter();
    });
  }
  
  const sortSelect = document.querySelector('.catalog-sort select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      triggerLoadingAndFilter();
    });
  }
});

function triggerLoadingAndFilter() {
  const overlays = document.querySelectorAll('.loading-overlay');
  overlays.forEach(o => o.classList.add('active'));
  
  setTimeout(() => {
    filterProducts();
    overlays.forEach(o => o.classList.remove('active'));
  }, 800);
}

function filterProducts() {
  const rangeInput = document.querySelector('.price-range-input');
  const maxPrice = rangeInput ? parseInt(rangeInput.value) : 1000;
  
  const inStockActive = document.querySelector('.pill:nth-child(1)')?.classList.contains('active');
  const newArrivalActive = document.querySelector('.pill:nth-child(2)')?.classList.contains('active');
  const sortVal = document.querySelector('.catalog-sort select')?.value || '';
  
  const grids = document.querySelectorAll('.premium-grid');
  
  grids.forEach(grid => {
    let cards = Array.from(grid.querySelectorAll('.premium-card'));
    
    cards.forEach(card => {
      const priceText = card.querySelector('.pcard-price').textContent;
      const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
      
      let show = true;
      if (price > maxPrice) {
        show = false;
      }
      
      const hasPremium = card.querySelector('.badge-premium') !== null;
      if (newArrivalActive && !hasPremium) {
        show = false;
      }
      
      card.style.display = show ? 'flex' : 'none';
    });
    
    if (sortVal.includes('Low to High')) {
      cards.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortVal.includes('High to Low')) {
      cards.sort((a, b) => getPrice(b) - getPrice(a));
    } else {
      cards.sort((a, b) => {
        const idA = a.getAttribute('data-id') || '';
        const idB = b.getAttribute('data-id') || '';
        return idA.localeCompare(idB);
      });
    }
    
    cards.forEach(card => grid.appendChild(card));
  });
}

function getPrice(card) {
  const text = card.querySelector('.pcard-price').textContent;
  return parseInt(text.replace(/[^0-9]/g, '')) || 0;
}