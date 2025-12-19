function injectHeader() {
  const container = document.getElementById('app-header');
  if (!container) return;

  const isAuth = localStorage.getItem('auth') === 'true';

  // Clear existing
  container.innerHTML = '';
  
  // Apply standard classes if not present (to ensure consistency)
  // We assume the container has base colors, but we can enforce flex layout
  if (!container.className.includes('flex')) {
      container.className = 'bg-[#FFD700] w-full py-3 px-3 flex items-center justify-between shadow-sm';
  }

  // Left: Logo + Title
  const left = document.createElement('div');
  left.className = 'flex flex-col overflow-hidden';
  
  const topRow = document.createElement('div');
  topRow.className = 'flex items-center space-x-2';

  const img = document.createElement('img');
  img.src = 'assets/logo.png'; 
  img.alt = 'Logo'; 
  img.className = 'h-8 w-auto';
  topRow.appendChild(img);

  const title = document.createElement('span');
  title.className = 'text-black font-bold text-lg leading-tight truncate';
  title.textContent = 'Birøkter Registeret';
  topRow.appendChild(title);
  
  left.appendChild(topRow);

  // Beekeeper Name (User Name)
  let data = null;
  try { data = JSON.parse(localStorage.getItem('beekeeper') || 'null'); } catch (e) {}
  if (data && data.name) {
      const nameEl = document.createElement('span');
      nameEl.className = 'text-black text-xs font-medium truncate pl-10'; // Indent to align with text
      nameEl.textContent = data.name;
      left.appendChild(nameEl);
  }

  container.appendChild(left);

  // Right: Logout
  const right = document.createElement('div');
  right.className = 'flex items-center space-x-2 flex-shrink-0 ml-2';

  if (isAuth) {
    const logout = document.createElement('button');
    logout.className = 'text-xs bg-black text-[#FFD700] font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors';
    logout.textContent = 'Logg ut';
    logout.onclick = () => { localStorage.removeItem('auth'); window.location.href = 'index.html'; };
    right.appendChild(logout);
  } else {
    const login = document.createElement('button');
    login.className = 'text-xs bg-black text-[#FFD700] font-bold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors';
    login.textContent = 'Logg inn';
    login.onclick = () => { window.location.href = 'login.html'; };
    right.appendChild(login);
  }

  container.appendChild(right);
  
  // Inject or Update Footer
  const footerId = 'app-footer';
  let footer = document.getElementById(footerId);
  if (!footer) {
      footer = document.createElement('div');
      footer.id = footerId;
      // Append to the main card or body depending on structure
      const mainCard = document.querySelector('.bg-white.rounded-lg, .bg-white.rounded-xl, .bg-white.rounded-md');
      if (mainCard) {
           mainCard.appendChild(footer);
      } else {
           document.body.appendChild(footer);
      }
  }
  
  // Always update styles and content
  footer.className = 'w-full py-4 text-center text-xs text-gray-500 mt-auto';
  footer.textContent = 'Copyright 2025 © LEK-Honning';
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('sw.js');
    } catch (e) { console.log('SW fail', e); }
  }
}

document.addEventListener('DOMContentLoaded', injectHeader);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectHeader();
}
registerSW();
