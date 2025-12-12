/**
 * Movescrow Restaurant Dashboard
 * Main application logic
 */

// Supabase Configuration
const SUPABASE_URL = window.SUPABASE_URL || 'https://jgtvavugofqxlovakswb.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndHZhdnVnb2ZxeGxvdmFrc3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDY2NjQsImV4cCI6MjA4MDk4MjY2NH0.3j6Rc54_82NgJicQhbvfVlCtVG0nyFSoW24FJvg2rM8';

// Initialize Supabase Client
let supabase;
try {
  if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your-anon-key') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  } else {
    console.warn('Supabase not initialized - check SUPABASE_URL and SUPABASE_ANON_KEY');
    console.warn('URL:', SUPABASE_URL);
    console.warn('Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING');
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

// Helper: Safe timeout wrapper for async operations
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// Initialize App immediately
let initializationStarted = false;
let loginScreenShown = false;

function initializeApp() {
  if (initializationStarted) return;
  initializationStarted = true;
  
  console.log('Initializing app...');
  
  // Start initialization immediately
  initApp().catch(error => {
    console.error('Critical initialization error:', error);
    // Force show login screen on critical error
    forceShowLogin();
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Immediate fallback: Show login after 500ms if still loading
setTimeout(() => {
  if (!loginScreenShown) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      console.warn('Immediate timeout (500ms) - showing login screen');
      forceShowLogin();
    }
  }
}, 500);

// Quick fallback: If app doesn't initialize within 1 second, show login
setTimeout(() => {
  if (!loginScreenShown) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      console.warn('Quick timeout (1s) - showing login screen');
      forceShowLogin();
    }
  }
}, 1000);

// Ultimate fallback: If still loading after 2 seconds, force show login
setTimeout(() => {
  if (!loginScreenShown) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      console.error('Ultimate timeout (2s) - forcing login screen');
      forceShowLogin();
    }
  }
}, 2000);

// Force show login screen (used by timeouts)
function forceShowLogin() {
  if (loginScreenShown) return; // Already shown
  loginScreenShown = true;
  
  try {
    console.log('Force showing login screen...');
    
    const loadingScreen = document.getElementById('loading-screen');
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    // Hide loading screen
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      loadingScreen.style.display = 'none'; // Force hide
    }
    
    // Show login screen
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      loginScreen.style.display = 'block'; // Force show
    }
    
    // Hide dashboard
    if (dashboard) {
      dashboard.classList.add('hidden');
      dashboard.style.display = 'none'; // Force hide
    }
    
    // Try to setup listeners, but don't fail if it doesn't work
    try {
      setupLoginListeners();
      console.log('Login screen shown and listeners set up');
    } catch (e) {
      console.warn('Could not setup login listeners:', e);
    }
  } catch (error) {
    console.error('Error forcing login screen:', error);
    // Last resort: try to show login screen via inline styles
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.style.cssText = 'display: block !important; visibility: visible !important;';
    }
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.cssText = 'display: none !important; visibility: hidden !important;';
    }
  }
}

async function initApp() {
  try {
    console.log('initApp() started');
    
    // Check for order ID in URL (from magic link redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');

    // Check if user is logged in via session token (from magic link)
    const sessionToken = localStorage.getItem('restaurant_session_token');
    if (sessionToken) {
      console.log('Found session token, verifying...');
      try {
        // Verify session with timeout (max 1.5 seconds)
        const isValid = await withTimeout(
          verifySessionToken(sessionToken),
          1500,
          'Session verification timeout'
        );
        
        if (isValid) {
          console.log('Session valid, loading dashboard...');
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
          console.log('Session invalid, clearing...');
          // Invalid session, clear and show login
          localStorage.removeItem('restaurant_session_token');
          localStorage.removeItem('restaurant_id');
          localStorage.removeItem('restaurant_name');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        // Clear invalid session and show login
        localStorage.removeItem('restaurant_session_token');
        localStorage.removeItem('restaurant_id');
        localStorage.removeItem('restaurant_name');
      }
    } else {
      console.log('No session token found');
    }

    // Check if user is logged in via Supabase auth (with timeout)
    if (supabase) {
      console.log('Checking Supabase session...');
      try {
        const session = await withTimeout(
          supabase.auth.getSession(),
          1500,
          'Supabase session check timeout'
        );
        
        if (session?.data?.session) {
          console.log('Supabase session found, loading dashboard...');
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
          return;
        } else {
          console.log('No Supabase session');
        }
      } catch (error) {
        console.warn('Supabase session check failed (this is OK if Supabase not configured):', error.message);
        // Continue to login screen
      }
    } else {
      console.log('Supabase not initialized (this is OK)');
    }

    // No valid session found - show login screen immediately
    console.log('No valid session, showing login screen...');
    showLogin();
    setupLoginListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    // Always show login on error
    showLogin();
    try {
      setupLoginListeners();
    } catch (e) {
      console.error('Error setting up login listeners:', e);
      // Last resort: force show login via DOM manipulation
      forceShowLogin();
    }
  }
}

// Export for potential use from inline scripts (not really needed but doesn't hurt)
if (typeof window !== 'undefined') {
  window.forceShowLogin = forceShowLogin;
}

// Verify session token from magic link
async function verifySessionToken(token) {
  try {
    // Add AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token?token=${encodeURIComponent(token)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      if (data.success) {
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('Session verification timeout');
      }
      throw fetchError;
    }
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

  // Handle form submission (prevent default)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, true); // Use capture phase
  }

  // Handle Send OTP button click (preferred method)
  if (sendOtpBtn) {
    console.log('Setting up Send OTP button click handler');
    sendOtpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Send OTP button clicked!');
      
      const phoneInput = document.getElementById('phone');
      if (!phoneInput) {
        console.error('Phone input not found');
        showError('Phone input not found');
        return;
      }
      
      const phone = phoneInput.value.trim();
      console.log('Phone value from input:', phone);
      
      if (!phone) {
        console.warn('No phone number entered');
        showError('Please enter a phone number');
        return;
      }
      
      console.log('Calling sendOTP with phone:', phone);
      await sendOTP(phone);
      console.log('sendOTP completed');
    });
    console.log('Send OTP button handler attached');
  } else {
    console.error('Send OTP button not found!');
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const phoneInput = document.getElementById('phone');
      const otpInput = document.getElementById('otp');
      
      if (!phoneInput || !otpInput) {
        showError('Phone or OTP input not found');
        return;
      }
      
      const phone = phoneInput.value.trim();
      const otp = otpInput.value.trim();
      
      if (!phone || !otp) {
        showError('Please enter both phone number and OTP');
        return;
      }
      
      await verifyOTP(phone, otp);
    });
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const phoneInput = document.getElementById('phone');
      if (!phoneInput) {
        console.error('Phone input not found');
        return;
      }
      
      const phone = phoneInput.value.trim();
      if (!phone) {
        showError('Phone number is required');
        return;
      }
      
      await sendOTP(phone);
    });
  }
}

async function sendOTP(phone) {
  console.log('sendOTP called with phone:', phone);
  
  if (!phone || !phone.trim()) {
    console.error('No phone number provided');
    showError('Please enter a phone number');
    return;
  }

  try {
    console.log('Showing loading...');
    showLoading(true);
    
    const apiUrl = `${API_BASE_URL}/auth/send-otp`;
    console.log('Calling API:', apiUrl);
    console.log('Request body:', { phone });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() })
    });

    console.log('Response status:', response.status);
    
    // Read response as text first, then parse as JSON
    // This allows us to read error messages if JSON parsing fails
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log('Response data:', data);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      console.error('Response text:', responseText);
      showError(`Server error: ${responseText.substring(0, 100)}`);
      showLoading(false);
      return;
    }

    if (response.ok && data.success) {
      console.log('OTP sent successfully, showing OTP section...');
      
      // Show OTP input
      const otpSection = document.getElementById('otp-section');
      const sendOtpBtn = document.getElementById('send-otp-btn');
      const phoneInput = document.getElementById('phone');
      
      console.log('OTP section element:', otpSection);
      console.log('Send OTP button:', sendOtpBtn);
      console.log('Phone input:', phoneInput);
      
      if (otpSection) {
        otpSection.classList.remove('hidden');
        // Remove any inline styles that might be blocking
        otpSection.style.removeProperty('display');
        otpSection.style.removeProperty('visibility');
        otpSection.style.removeProperty('opacity');
        // Set display to block with !important via style attribute
        otpSection.style.setProperty('display', 'block', 'important');
        otpSection.style.setProperty('visibility', 'visible', 'important');
        otpSection.style.setProperty('opacity', '1', 'important');
        console.log('OTP section shown - classes:', otpSection.classList.toString());
        console.log('OTP section style:', otpSection.style.cssText);
        console.log('OTP section computed display:', window.getComputedStyle(otpSection).display);
      } else {
        console.error('OTP section element not found!');
        showError('Error: OTP section not found in page');
        showLoading(false);
        return;
      }
      
      if (sendOtpBtn) {
        sendOtpBtn.textContent = 'OTP Sent!';
        sendOtpBtn.disabled = true;
        console.log('Send OTP button updated');
      }
      
      // Disable phone input
      if (phoneInput) {
        phoneInput.disabled = true;
        console.log('Phone input disabled');
      }
      
      // Show test OTP hint if in test mode OR if OTP is returned in response (DB save failed)
      const testOtpHint = document.getElementById('test-otp-hint');
      const otpInput = document.getElementById('otp');
      
      if (testOtpHint) {
        if (data.testMode) {
          // Test mode - show standard test OTP hint
          testOtpHint.innerHTML = '💡 <strong>Test Mode:</strong> Use OTP <strong>123456</strong> for testing';
          testOtpHint.style.background = 'rgba(255, 107, 53, 0.1)';
          testOtpHint.style.borderLeftColor = '#FF6B35';
          testOtpHint.style.color = '#FF6B35';
          testOtpHint.classList.remove('hidden');
          testOtpHint.style.setProperty('display', 'block', 'important');
          testOtpHint.style.setProperty('visibility', 'visible', 'important');
          console.log('Test OTP hint shown');
        } else if (data.otp) {
          // OTP returned in response because DB save failed
          testOtpHint.innerHTML = `⚠️ <strong>Database Save Failed:</strong> Use OTP <strong>${data.otp}</strong> (check Vercel logs)`;
          testOtpHint.style.background = 'rgba(255, 193, 7, 0.1)';
          testOtpHint.style.borderLeftColor = '#FFC107';
          testOtpHint.style.color = '#856404';
          testOtpHint.classList.remove('hidden');
          testOtpHint.style.setProperty('display', 'block', 'important');
          testOtpHint.style.setProperty('visibility', 'visible', 'important');
          console.log('Database save failed - showing OTP from response:', data.otp);
          
          // Auto-fill OTP if available
          if (otpInput) {
            otpInput.value = data.otp;
          }
        } else {
          testOtpHint.classList.add('hidden');
          testOtpHint.style.setProperty('display', 'none', 'important');
        }
      } else {
        console.warn('Test OTP hint element not found');
      }
      
      // Log debug info
      if (data.debug) {
        console.log('Debug info:', data.debug);
        if (data.debug.supabaseError) {
          console.error('Supabase error details:', data.debug.supabaseError);
        }
      }
      
      // Focus on OTP input
      if (otpInput) {
        setTimeout(() => {
          otpInput.focus();
          console.log('OTP input focused');
        }, 100);
      } else {
        console.warn('OTP input element not found');
      }
      
      startOTPTimer();
      console.log('OTP sent successfully, OTP section should be visible');
    } else {
      const errorMsg = data.error || 'Failed to send OTP';
      console.error('OTP send error:', errorMsg, data);
      showError(errorMsg);
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Error stack:', error.stack);
    showError('Network error. Please check console for details.');
  } finally {
    console.log('Hiding loading...');
    showLoading(false);
  }
}

async function verifyOTP(phone, otp) {
  try {
    if (!otp || otp.length !== 6) {
      showError('Please enter a 6-digit OTP');
      return;
    }

    showLoading(true);
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Login successful
      console.log('OTP verified successfully');
      
      // Store session token if provided
      if (data.token) {
        localStorage.setItem('restaurant_session_token', data.token);
      }
      if (data.restaurant) {
        localStorage.setItem('restaurant_id', data.restaurant.id);
        localStorage.setItem('restaurant_name', data.restaurant.name || phone);
      }
      
      currentRestaurant = data.restaurant;
      await loadRestaurantData();
      showDashboard();
      setupEventListeners();
      subscribeToOrders();
    } else {
      const errorMsg = data.error || 'Invalid OTP';
      console.error('OTP verification error:', errorMsg);
      showError(errorMsg);
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
  loginScreenShown = true;
  
  const loadingScreen = document.getElementById('loading-screen');
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    loadingScreen.style.display = 'none';
  }
  if (loginScreen) {
    loginScreen.classList.remove('hidden');
    loginScreen.style.display = 'block';
  }
  if (dashboard) {
    dashboard.classList.add('hidden');
    dashboard.style.display = 'none';
  }
  
  console.log('Login screen shown');
}

function showDashboard() {
  const loadingScreen = document.getElementById('loading-screen');
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  
  if (loadingScreen) loadingScreen.classList.add('hidden');
  if (loginScreen) loginScreen.classList.add('hidden');
  if (dashboard) dashboard.classList.remove('hidden');
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
  // If we already have restaurant data from token, use it
  if (currentRestaurant && currentRestaurant.id && !supabase) {
    updateRestaurantUI();
    return;
  }

  if (!supabase || !currentRestaurant) return;

  try {
    // Load restaurant profile
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', currentRestaurant.id || currentRestaurant.phone)
      .single();

    if (data) {
      currentRestaurant = { ...currentRestaurant, ...data };
      updateRestaurantUI();
    }
  } catch (error) {
    console.error('Error loading restaurant data:', error);
    // Continue even if loading fails - use existing data
    if (currentRestaurant) {
      updateRestaurantUI();
    }
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
  if (!currentRestaurant || !currentRestaurant.id) {
    renderOrders([]);
    updateOrdersBadge(0);
    return;
  }

  // If Supabase not available, show empty state
  if (!supabase) {
    console.warn('Supabase not available - cannot load orders');
    renderOrders([]);
    updateOrdersBadge(0);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .in('status', ['pending', 'paid', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      renderOrders([]);
      updateOrdersBadge(0);
      return;
    }

    renderOrders(data || []);
    updateOrdersBadge(data?.length || 0);
  } catch (error) {
    console.error('Error loading orders:', error);
    renderOrders([]);
    updateOrdersBadge(0);
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
  // Only subscribe if Supabase is available and Realtime is enabled
  if (!supabase || !currentRestaurant || !currentRestaurant.id) {
    // Still try to load orders manually
    loadOrders();
    return;
  }

  try {
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
  } catch (error) {
    console.warn('Realtime subscription failed, using polling:', error);
    // Fallback to manual loading
    loadOrders();
  }
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



