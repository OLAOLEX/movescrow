/**
 * Movescrow Restaurant Dashboard
 * Main application logic
 */

// Supabase Configuration
// These can be set via environment variables or hardcoded for now
const SUPABASE_URL = window.SUPABASE_URL || 'https://jgtvavugofqxlovakswb.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize Supabase Client
let supabase;
try {
  if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase not initialized - check SUPABASE_URL and SUPABASE_ANON_KEY');
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
}

// API Base URL
const API_BASE_URL = window.API_BASE_URL || '/api';

// State
let currentRestaurant = null;
let currentOrder = null;
let ordersSubscription = null;
let chatSubscription = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Check for order ID in URL (from magic link redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');

  // Check if user is logged in via session token (from magic link)
  const sessionToken = localStorage.getItem('restaurant_session_token');
  if (sessionToken) {
    // Verify session is still valid
    const isValid = await verifySessionToken(sessionToken);
    if (isValid) {
      await loadRestaurantData();
      showDashboard();
      setupEventListeners();
      subscribeToOrders();
      // If orderId in URL, open that order's chat
      if (orderId) {
        setTimeout(() => openOrderChat(orderId), 500);
      }
      return;
    } else {
      // Invalid session, clear and show login
      localStorage.removeItem('restaurant_session_token');
      localStorage.removeItem('restaurant_id');
      localStorage.removeItem('restaurant_name');
    }
  }

  // Check if user is logged in via Supabase auth
  const session = await supabase?.auth.getSession();
  
  if (session?.data?.session) {
    // User is logged in, load dashboard
    currentRestaurant = session.data.session.user;
    await loadRestaurantData();
    showDashboard();
    setupEventListeners();
    subscribeToOrders();
    // If orderId in URL, open that order's chat
    if (orderId) {
      setTimeout(() => openOrderChat(orderId), 500);
    }
  } else {
    // Show login screen
    showLogin();
    setupLoginListeners();
  }
}

// Verify session token from magic link
async function verifySessionToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token?token=${encodeURIComponent(token)}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Set current restaurant from token data
      currentRestaurant = {
        id: data.restaurant.id,
        name: data.restaurant.name,
        phone: data.restaurant.phone,
        whatsapp_phone: data.restaurant.whatsapp_phone,
        address: data.restaurant.address
      };
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return false;
  }
}

// Open order chat modal
async function openOrderChat(orderId) {
  if (!orderId) return;
  
  // Load order details
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (order) {
      currentOrder = order;
      // Show chat modal
      const chatModal = document.getElementById('chat-modal');
      if (chatModal) {
        chatModal.classList.remove('hidden');
        updateChatHeader(order);
        loadChatMessages(orderId);
        subscribeToChat(orderId);
      }
    }
  } catch (error) {
    console.error('Error loading order:', error);
    // Fallback: try using the openChat function
    if (typeof openChat === 'function') {
      openChat(orderId);
    }
  }
}

// ============================================
// AUTHENTICATION
// ============================================

function setupLoginListeners() {
  const loginForm = document.getElementById('login-form');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const otpSection = document.getElementById('otp-section');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const resendOtpBtn = document.getElementById('resend-otp-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('phone').value;
      await sendOTP(phone);
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async () => {
      const phone = document.getElementById('phone').value;
      const otp = document.getElementById('otp').value;
      await verifyOTP(phone, otp);
    });
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async () => {
      const phone = document.getElementById('phone').value;
      await sendOTP(phone);
    });
  }
}

async function sendOTP(phone) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (response.ok) {
      // Show OTP input
      document.getElementById('otp-section').classList.remove('hidden');
      document.getElementById('send-otp-btn').textContent = 'OTP Sent!';
      startOTPTimer();
    } else {
      showError(data.error || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    showError('Network error. Please try again.');
  } finally {
    showLoading(false);
  }
}

async function verifyOTP(phone, otp) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      currentRestaurant = data.restaurant;
      await loadRestaurantData();
      showDashboard();
      setupEventListeners();
      subscribeToOrders();
    } else {
      showError(data.error || 'Invalid OTP');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    showError('Network error. Please try again.');
  } finally {
    showLoading(false);
  }
}

function startOTPTimer() {
  const timerEl = document.getElementById('otp-timer');
  const resendBtn = document.getElementById('resend-otp-btn');
  let seconds = 60;

  const interval = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(interval);
      if (resendBtn) resendBtn.disabled = false;
      if (timerEl) timerEl.parentElement.classList.add('hidden');
    }
  }, 1000);
}

// ============================================
// UI HELPERS
// ============================================

function showLoading(show) {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.toggle('hidden', !show);
  }
}

function showLogin() {
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

function showError(message) {
  const errorEl = document.getElementById('login-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 5000);
  }
}

// ============================================
// DASHBOARD SETUP
// ============================================

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      switchView(view);
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase?.auth.signOut();
      showLogin();
    });
  }

  // Refresh orders
  const refreshBtn = document.getElementById('refresh-orders-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadOrders());
  }

  // Chat
  setupChatListeners();
}

function switchView(viewName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Show/hide views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === `${viewName}-view`);
  });
}

// ============================================
// LOAD DATA
// ============================================

async function loadRestaurantData() {
  if (!supabase || !currentRestaurant) return;

  try {
    // Load restaurant profile
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('phone', currentRestaurant.phone)
      .single();

    if (data) {
      currentRestaurant = { ...currentRestaurant, ...data };
      updateRestaurantUI();
    }
  } catch (error) {
    console.error('Error loading restaurant data:', error);
  }
}

function updateRestaurantUI() {
  const nameEl = document.getElementById('restaurant-name');
  const phoneEl = document.getElementById('restaurant-phone');

  if (nameEl && currentRestaurant.name) {
    nameEl.textContent = currentRestaurant.name;
  }
  if (phoneEl && currentRestaurant.phone) {
    phoneEl.textContent = currentRestaurant.phone;
  }
}

// ============================================
// ORDERS
// ============================================

async function loadOrders() {
  if (!supabase || !currentRestaurant) return;

  try {
    showLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .in('status', ['pending', 'paid', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderOrders(data || []);
    updateOrdersBadge(data?.length || 0);
  } catch (error) {
    console.error('Error loading orders:', error);
  } finally {
    showLoading(false);
  }
}

function renderOrders(orders) {
  const ordersList = document.getElementById('orders-list');

  if (!ordersList) return;

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <h3>No orders yet</h3>
        <p>Orders will appear here when customers place orders</p>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-card-header">
        <span class="order-number">${order.order_number}</span>
        <span class="status-badge ${order.status.replace('_', '-')}">${order.status}</span>
      </div>
      <div class="order-info">
        <div class="order-info-item">
          <span>Customer:</span>
          <strong>${order.customer_whatsapp || 'N/A'}</strong>
        </div>
        <div class="order-info-item">
          <span>Amount:</span>
          <strong>₦${parseFloat(order.total_amount || 0).toLocaleString()}</strong>
        </div>
        <div class="order-info-item">
          <span>Time:</span>
          <span>${formatTime(order.created_at)}</span>
        </div>
      </div>
      <div class="order-actions">
        <button class="btn btn-primary" onclick="openChat('${order.id}')">View Chat</button>
        <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id}')">Update Status</button>
      </div>
    </div>
  `).join('');
}

function updateOrdersBadge(count) {
  const badge = document.getElementById('orders-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

function subscribeToOrders() {
  if (!supabase || !currentRestaurant) return;

  // Subscribe to real-time order updates
  ordersSubscription = supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${currentRestaurant.id}`
      },
      (payload) => {
        console.log('Order update:', payload);
        loadOrders(); // Reload orders on any change
      }
    )
    .subscribe();
}

// ============================================
// CHAT
// ============================================

function setupChatListeners() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-message-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');

  if (chatInput && sendBtn) {
    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message && currentOrder) {
        sendChatMessage(message);
        chatInput.value = '';
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
      closeChat();
    });
  }
}

async function openChat(orderId) {
  if (!supabase) return;

  try {
    // Load order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    currentOrder = order;

    // Show chat modal
    const chatModal = document.getElementById('chat-modal');
    if (chatModal) {
      chatModal.classList.remove('hidden');
      updateChatHeader(order);
      loadChatMessages(orderId);
      subscribeToChat(orderId);
    }
  } catch (error) {
    console.error('Error opening chat:', error);
  }
}

function closeChat() {
  const chatModal = document.getElementById('chat-modal');
  if (chatModal) {
    chatModal.classList.add('hidden');
  }
  currentOrder = null;
  
  // Unsubscribe from chat
  if (chatSubscription) {
    supabase?.removeChannel(chatSubscription);
    chatSubscription = null;
  }
}

function updateChatHeader(order) {
  const orderNumberEl = document.getElementById('chat-order-number');
  const customerCodeEl = document.getElementById('chat-customer-code');
  const statusEl = document.getElementById('chat-order-status');

  if (orderNumberEl) orderNumberEl.textContent = order.order_number;
  if (customerCodeEl) customerCodeEl.textContent = `Customer: ${order.customer_whatsapp || 'N/A'}`;
  if (statusEl) {
    statusEl.textContent = order.status;
    statusEl.className = `status-badge ${order.status.replace('_', '-')}`;
  }
}

async function loadChatMessages(orderId) {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    renderChatMessages(data || []);
  } catch (error) {
    console.error('Error loading chat messages:', error);
  }
}

function renderChatMessages(messages) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  chatMessages.innerHTML = messages.map(msg => {
    const isRestaurant = msg.direction === 'outbound';
    const isSystem = msg.message_type === 'system';
    
    return `
      <div class="message ${isRestaurant ? 'restaurant' : isSystem ? 'system' : 'customer'}">
        <div class="message-bubble">${escapeHtml(msg.message_text)}</div>
        <div class="message-time">${formatTime(msg.created_at)}</div>
      </div>
    `;
  }).join('');

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage(messageText) {
  if (!supabase || !currentOrder || !currentRestaurant) return;

  try {
    // Save message to database
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        order_id: currentOrder.id,
        from_number: currentRestaurant.whatsapp_phone || currentRestaurant.phone,
        to_number: currentOrder.customer_whatsapp,
        message_text: messageText,
        direction: 'outbound',
        message_type: 'text'
      });

    if (error) throw error;

    // Send via WhatsApp API
    await fetch(`${API_BASE_URL}/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: currentOrder.customer_whatsapp,
        message: messageText,
        orderId: currentOrder.id
      })
    });

    // Reload messages
    loadChatMessages(currentOrder.id);
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}

function subscribeToChat(orderId) {
  if (!supabase) return;

  chatSubscription = supabase
    .channel(`chat_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        console.log('New message:', payload);
        loadChatMessages(orderId);
      }
    )
    .subscribe();
}

// ============================================
// UTILITIES
// ============================================

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
window.openChat = openChat;
window.closeChat = closeChat;
window.updateOrderStatus = async (orderId) => {
  // TODO: Implement status update modal
  console.log('Update status for order:', orderId);
};


