// Global Configuration and Utilities

// Supabase Configuration
const SUPABASE_URL = 'https://qxhcklowjjtkupvnhfhr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dkAK99yyWC-uE6zERP-5Gw_xEs3grqv'; // User provided

// Make client globally available
window.supabase = null;

function injectHeader() {
  // 1. Inject CSS (Global Styles)
  if (!document.querySelector('link[href="style.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'style.css';
      document.head.appendChild(link);
  }

  // 2. Inject Supabase SDK
  if (!document.querySelector('script[src*="supabase-js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
          // Initialize Supabase once library is loaded
          if (window.supabaseData && window.supabaseData.createClient) {
             // If using module version? No, CDN usually exposes 'supabase' or 'createClient'
             // The CDN @supabase/supabase-js@2 exposes 'supabase' global usually, or we need to check how it's exposed.
             // Usually it's window.supabase.createClient or just createClient.
          }
          try {
            const { createClient } = window.supabase;
            window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase connected");
          } catch(e) {
              console.log("Supabase init pending/failed", e);
          }
      };
      document.head.appendChild(script);
  }

  // 3. Render Header
  const container = document.getElementById('app-header');
  if (container) {
      renderHeader(container);
  }

  // 4. Render Footer (if element exists, though usually we just inject logic)
  // We don't have a specific footer container in most files, 
  // but we have sticky-footer-actions which are part of the page content.
}

function renderHeader(container) {
  // Clear existing (prevent duplicates)
  container.innerHTML = '';
  
  // Use 'sticky-header' class from style.css (already applied to #app-header)
  // But we need to ensure the inner content structure matches our design.
  
  const isAuth = localStorage.getItem('auth') === 'true';

  // Left: Back Button + Title Logic
  const left = document.createElement('div');
  left.className = 'flex items-center space-x-3 overflow-hidden'; 
  
  const path = window.location.pathname;
  const page = path.split('/').pop();
  const isHome = page === 'index.html' || page === 'dashboard.html' || page === '' || page === 'login.html';
  
  if (!isHome) {
      const backBtn = document.createElement('button');
      backBtn.className = 'text-black p-1 hover:bg-black/10 rounded-full transition-colors';
      backBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>`;
      backBtn.onclick = () => {
          if (document.referrer && document.referrer.includes(window.location.host)) {
              history.back();
          } else {
              window.location.href = 'dashboard.html';
          }
      };
      left.appendChild(backBtn);
  } else {
      const img = document.createElement('img');
      img.src = 'assets/logo.png'; 
      img.alt = 'Logo'; 
      img.className = 'h-8 w-auto';
      img.onerror = () => { img.style.display = 'none'; }; // Hide if missing
      left.appendChild(img);
  }

  // Title Column
  const titleCol = document.createElement('div');
  titleCol.className = 'flex flex-col';

  const title = document.createElement('span');
  title.className = 'text-black font-bold text-lg leading-tight truncate';
  title.textContent = 'Birøkter Registeret';
  titleCol.appendChild(title);
  
  // Beekeeper Name
  let data = null;
  try { data = JSON.parse(localStorage.getItem('beekeeper') || 'null'); } catch (e) {}
  if (data && data.name) {
      const nameEl = document.createElement('span');
      nameEl.className = 'text-black text-xs font-medium truncate opacity-80'; 
      nameEl.textContent = data.name;
      titleCol.appendChild(nameEl);
  }
  
  left.appendChild(titleCol);
  container.appendChild(left);

  // Right: Logout or Login
  const right = document.createElement('div');
  right.className = 'flex items-center space-x-2 flex-shrink-0 ml-2';

  if (isAuth) {
    const logout = document.createElement('button');
    logout.className = 'text-xs bg-black text-[#FFD700] font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider';
    logout.textContent = 'Logg ut';
    logout.onclick = () => { localStorage.removeItem('auth'); window.location.href = 'index.html'; };
    right.appendChild(logout);
  } else {
    if (!window.location.href.includes('login.html')) {
        const login = document.createElement('button');
        login.className = 'text-xs bg-black text-[#FFD700] font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider';
        login.textContent = 'Logg inn';
        login.onclick = () => { window.location.href = 'login.html'; };
        right.appendChild(login);
    }
  }

  container.appendChild(right);
}

// Auto-inject on load
document.addEventListener('DOMContentLoaded', injectHeader);
