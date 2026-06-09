const USERS_KEY = 'smarthome_users_v1';
const SESSION_KEY = 'smarthome_session_v1';
const GUEST_CART_KEY = 'smarthome_cart_guest';
const LEGACY_CART_KEY = 'smarthome_cart';
const LEGACY_ORDERS_KEY = 'smarthome_orders';

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getUsers() {
  return readJson(USERS_KEY, []);
}

export function getCurrentUser() {
  const session = readJson(SESSION_KEY, null);
  if (!session?.userId) return null;
  return getUsers().find(user => user.id === session.userId) || null;
}

export function setCurrentUser(user) {
  writeJson(SESSION_KEY, {
    userId: user.id,
    signedInAt: new Date().toISOString()
  });
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUserProfile(userId, updates) {
  const users = getUsers();
  const user = users.find(item => item.id === userId);
  if (!user) throw new Error('Không tìm thấy tài khoản.');

  const name = String(updates.name || '').trim();
  const phone = normalizePhone(updates.phone);
  if (name.length < 2) throw new Error('Họ tên cần có ít nhất 2 ký tự.');
  if (phone && !/^\d{9,11}$/.test(phone)) {
    throw new Error('Số điện thoại cần có từ 9 đến 11 chữ số.');
  }

  user.name = name;
  user.phone = phone;
  user.address = {
    line: String(updates.addressLine || '').trim(),
    ward: String(updates.ward || '').trim(),
    district: String(updates.district || '').trim(),
    city: String(updates.city || '').trim(),
    note: String(updates.addressNote || '').trim()
  };
  user.updatedAt = new Date().toISOString();
  writeJson(USERS_KEY, users);
  return user;
}

export function getCartStorageKey(user = getCurrentUser()) {
  return user?.id ? `smarthome_cart_user_${user.id}` : GUEST_CART_KEY;
}

export function getOrdersStorageKey(user = getCurrentUser()) {
  return user?.id ? `smarthome_orders_user_${user.id}` : 'smarthome_orders_guest';
}

export function getRecentProductsStorageKey(user = getCurrentUser()) {
  return user?.id ? `smarthome_recent_user_${user.id}` : 'smarthome_recent_guest';
}

export function migrateLegacyCart() {
  if (localStorage.getItem(GUEST_CART_KEY) !== null) return;
  const legacyCart = readJson(LEGACY_CART_KEY, []);
  if (legacyCart.length) writeJson(GUEST_CART_KEY, legacyCart);
  localStorage.removeItem(LEGACY_CART_KEY);
}

export function migrateLegacyOrders(user = getCurrentUser()) {
  const targetKey = getOrdersStorageKey(user);
  if (localStorage.getItem(targetKey) !== null) return;
  const legacyOrders = readJson(LEGACY_ORDERS_KEY, []);
  if (legacyOrders.length) writeJson(targetKey, legacyOrders);
  localStorage.removeItem(LEGACY_ORDERS_KEY);
}

export function mergeGuestCartIntoUser(user) {
  const guestCart = readJson(GUEST_CART_KEY, []);
  if (!guestCart.length) return;

  const userCartKey = getCartStorageKey(user);
  const userCart = readJson(userCartKey, []);
  guestCart.forEach(guestItem => {
    const existing = userCart.find(item => item.id === guestItem.id);
    if (existing) existing.quantity += Number(guestItem.quantity) || 1;
    else userCart.push({ ...guestItem, quantity: Number(guestItem.quantity) || 1 });
  });

  writeJson(userCartKey, userCart);
  localStorage.removeItem(GUEST_CART_KEY);
}

export async function registerUser({ name, email, phone, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const users = getUsers();

  if (name.trim().length < 2) throw new Error('Họ tên cần có ít nhất 2 ký tự.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Email không hợp lệ.');
  }
  if (normalizedPhone && !/^\d{9,11}$/.test(normalizedPhone)) {
    throw new Error('Số điện thoại cần có từ 9 đến 11 chữ số.');
  }
  if (password.length < 6) throw new Error('Mật khẩu cần có ít nhất 6 ký tự.');
  if (users.some(user => user.email === normalizedEmail)) {
    throw new Error('Email này đã được sử dụng.');
  }
  if (normalizedPhone && users.some(user => user.phone === normalizedPhone)) {
    throw new Error('Số điện thoại này đã được sử dụng.');
  }

  const salt = createId();
  const user = {
    id: createId(),
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeJson(USERS_KEY, users);
  setCurrentUser(user);
  mergeGuestCartIntoUser(user);
  return user;
}

export async function authenticateUser(identifier, password) {
  const normalizedIdentifier = normalizeEmail(identifier);
  const normalizedPhone = normalizePhone(identifier);
  const user = getUsers().find(item =>
    item.email === normalizedIdentifier
    || (normalizedPhone && item.phone === normalizedPhone)
  );

  if (!user) throw new Error('Không tìm thấy tài khoản phù hợp.');
  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) throw new Error('Mật khẩu không chính xác.');

  setCurrentUser(user);
  mergeGuestCartIntoUser(user);
  return user;
}

export async function resetUserPassword(identifier, newPassword) {
  if (newPassword.length < 6) throw new Error('Mật khẩu mới cần có ít nhất 6 ký tự.');

  const normalizedIdentifier = normalizeEmail(identifier);
  const normalizedPhone = normalizePhone(identifier);
  const users = getUsers();
  const user = users.find(item =>
    item.email === normalizedIdentifier
    || (normalizedPhone && item.phone === normalizedPhone)
  );

  if (!user) throw new Error('Không tìm thấy tài khoản phù hợp.');
  user.salt = createId();
  user.passwordHash = await hashPassword(newPassword, user.salt);
  user.updatedAt = new Date().toISOString();
  writeJson(USERS_KEY, users);
  return user;
}
