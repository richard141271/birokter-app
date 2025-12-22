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
            
            // Initialize Repository after Supabase is ready
            if (window.REPO) {
                window.REPO.init();
            }
          } catch(e) {
              console.log("Supabase init pending/failed", e);
          }
      };
      document.head.appendChild(script);
  }

  // 2b. Inject Repository
  if (!document.querySelector('script[src="repository.js"]')) {
      const script = document.createElement('script');
      script.src = 'repository.js';
      document.head.appendChild(script);
  }

  // 3. Render Header
  const headerContainer = document.getElementById('app-header');
  if (headerContainer) {
      renderHeader(headerContainer);
  }

  // 4. Render Footer
  const footerContainer = document.getElementById('app-footer');
  if (footerContainer) {
      renderFooter(footerContainer);
  } else {
      // If no footer container exists, check if we should add one automatically
      // Only for authenticated pages
      const path = window.location.pathname;
      const page = path.split('/').pop();
      const isAuthPage = page !== 'index.html' && page !== 'login.html' && page !== 'reset.html' && page !== '';
      
      if (isAuthPage) {
          // Attempt to find the main card to append footer to
          const mainCard = document.querySelector('.app-viewport') || document.querySelector('.bg-white.rounded-xl') || document.body.firstElementChild;
          if (mainCard) {
              const footer = document.createElement('div');
              footer.id = 'app-footer';
              mainCard.appendChild(footer);
              renderFooter(footer);
          }
      }
  }
}

function renderHeader(container) {
  container.innerHTML = '';
  container.className = ''; // Reset, handled by #app-header in style.css

  const isAuth = localStorage.getItem('auth') === 'true';
  const path = window.location.pathname;
  const page = path.split('/').pop();
  const isHome = page === 'index.html' || page === 'dashboard.html' || page === '' || page === 'login.html';

  // --- 1. YELLOW TOP BAR ---
  const topBar = document.createElement('div');
  topBar.className = 'header-top-bar bg-[#FFD700]'; // Added Tailwind class as backup

  // Grid layout for Top Bar to ensure centering
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 items-center w-full';

  // Left: Logo (Always show logo)
  const leftCol = document.createElement('div');
  leftCol.className = 'flex justify-start items-center pl-1'; // Added padding
  
  const logo = document.createElement('img');
  logo.src = 'assets/logo.png';
  logo.alt = 'Logo';
  logo.className = 'h-14 w-auto object-contain'; // Increased size, prevent stretching
  leftCol.appendChild(logo);

  grid.appendChild(leftCol);

  // Center: Title
  const centerCol = document.createElement('div');
  centerCol.className = 'flex flex-col items-center text-center';
  const title = document.createElement('span');
  title.className = 'text-black font-bold text-xl leading-tight whitespace-nowrap';
  title.textContent = 'Birøkter Registeret';
  centerCol.appendChild(title);
  
  // Optional Name
  let data = null;
  try { data = JSON.parse(localStorage.getItem('beekeeper') || 'null'); } catch (e) {}
  if (data && data.name) {
      const nameEl = document.createElement('span');
      nameEl.className = 'text-black text-xs font-medium truncate opacity-80 mt-0.5'; 
      nameEl.textContent = data.name;
      centerCol.appendChild(nameEl);
  }
  grid.appendChild(centerCol);

  // Right: Empty (for balance)
  const rightCol = document.createElement('div');
  rightCol.className = 'flex justify-end';
  grid.appendChild(rightCol);

  topBar.appendChild(grid);
  container.appendChild(topBar);

  // --- 2. LOGOUT BAR (Below Yellow Header) ---
  if (isAuth) {
      const logoutBar = document.createElement('div');
      logoutBar.className = 'header-logout-bar bg-black flex justify-end items-center'; // Added Tailwind classes
      
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'text-xs bg-[#FFD700] text-black font-bold px-4 py-1.5 rounded hover:bg-yellow-400 transition-colors uppercase tracking-wider';
      logoutBtn.textContent = 'LOGG UT';
      logoutBtn.onclick = () => { localStorage.removeItem('auth'); window.location.href = 'index.html'; };
      
      logoutBar.appendChild(logoutBtn);
      container.appendChild(logoutBar);
  }
}

function renderFooter(container) {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    // Don't render footer on login/index
    if (page === 'index.html' || page === 'login.html' || page === 'reset.html') return;

    container.innerHTML = '';
    container.className = 'app-nav-footer';

    const navItems = [
        { name: 'Oversikt', url: 'dashboard.html', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>' },
        { name: 'Bigårder', url: 'bigard.html', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>' },
        { name: 'Bikuber', url: 'bikuber.html', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>' },
        { name: 'Profil', url: 'profil.html', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>' }
    ];

    navItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'nav-item';
        // Check active state (simple contains check, can be refined)
        if (page === item.url || (item.url === 'dashboard.html' && page === '')) {
            link.classList.add('active');
        }
        
        // Special case: if we are in sub-pages (like inspeksjoner.html), maybe highlight Bikuber?
        if (page === 'inspeksjoner.html' && item.name === 'Bikuber') link.classList.add('active');
        if (page === 'inspeksjon.html' && item.name === 'Bikuber') link.classList.add('active');
        if (page === 'ny-bigard.html' && item.name === 'Bigårder') link.classList.add('active');
        if (page === 'profil-rediger.html' && item.name === 'Profil') link.classList.add('active');
        if (page === 'innstillinger.html' && item.name === 'Profil') link.classList.add('active');

        link.innerHTML = `${item.icon}<span>${item.name}</span>`;
        container.appendChild(link);
    });
}

// Auto-inject on load
document.addEventListener('DOMContentLoaded', injectHeader);
