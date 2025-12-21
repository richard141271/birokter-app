// Global Configuration and Utilities

// Supabase Configuration
const SUPABASE_URL = 'https://qxhcklowjjtkupvnhfhr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dkAK99yyWC-uE6zERP-5Gw_xEs3grqv'; // User provided

// Make client globally available
window.supabase = null;

// Tailwind Configuration Injection
function configureTailwind() {
    if (window.tailwind) {
        window.tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            yellow: 'var(--brand-yellow)',
                            black: 'var(--brand-black)',
                            bg: 'var(--brand-bg)',
                            text: 'var(--brand-text)',
                        }
                    }
                }
            }
        };
    }
}

function injectHeader() {
  // 0. Configure Tailwind
  configureTailwind();

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
}

function renderHeader(container) {
  // Clear existing (prevent duplicates)
  container.innerHTML = '';
  
  // Apply standard classes to container to ensure background color
  // We use inline style or class that references the variable
  container.className = 'w-full py-3 px-3 flex items-center justify-between shadow-sm bg-brand-yellow';
  // Note: bg-brand-yellow works because we configured Tailwind. 
  // If Tailwind hasn't re-scanned, this might fail initially. 
  // But style.css also sets #app-header background-color.
  
  const isAuth = localStorage.getItem('auth') === 'true';
  const path = window.location.pathname;
  const page = path.split('/').pop();
  const isHome = page === 'index.html' || page === 'dashboard.html' || page === '' || page === 'login.html';
  
  // Wrapper for sticky layout content
  const wrapper = document.createElement('div');
  wrapper.className = 'grid grid-cols-3 items-center w-full';
  
  // 1. LEFT COLUMN (Back Button)
  const leftCol = document.createElement('div');
  leftCol.className = 'flex justify-start';
  
  if (!isHome) {
      const backBtn = document.createElement('button');
      backBtn.className = 'text-brand-black p-2 hover:bg-black/10 rounded-full transition-colors';
      backBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>`;
      backBtn.onclick = () => {
          if (document.referrer && document.referrer.includes(window.location.host)) {
              history.back();
          } else {
              window.location.href = 'dashboard.html';
          }
      };
      leftCol.appendChild(backBtn);
  }
  wrapper.appendChild(leftCol);

  // 2. CENTER COLUMN (Title + Name)
  const centerCol = document.createElement('div');
  centerCol.className = 'flex flex-col items-center text-center';
  
  const title = document.createElement('span');
  title.className = 'text-brand-black font-bold text-xl leading-tight whitespace-nowrap';
  title.textContent = 'Birøkter Registeret';
  centerCol.appendChild(title);

  let data = null;
  try { data = JSON.parse(localStorage.getItem('beekeeper') || 'null'); } catch (e) {}
  if (data && data.name) {
      const nameEl = document.createElement('span');
      nameEl.className = 'text-brand-black text-xs font-medium truncate opacity-80 mt-0.5'; 
      nameEl.textContent = data.name;
      centerCol.appendChild(nameEl);
  }
  wrapper.appendChild(centerCol);

  // 3. RIGHT COLUMN (Logout)
  const rightCol = document.createElement('div');
  rightCol.className = 'flex justify-end';
  
  if (isAuth) {
    const logout = document.createElement('button');
    logout.className = 'text-xs bg-brand-black text-brand-yellow font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider';
    logout.textContent = 'Logg ut';
    logout.onclick = () => { localStorage.removeItem('auth'); window.location.href = 'index.html'; };
    rightCol.appendChild(logout);
  }
  wrapper.appendChild(rightCol);

  container.appendChild(wrapper);
}

// Auto-inject on load
document.addEventListener('DOMContentLoaded', injectHeader);
