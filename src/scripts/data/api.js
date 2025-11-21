import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

// Notification helper functions
export async function requestNotificationPermission() {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  // Check current permission
  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
    return true;
  }

  // If permission is denied, don't ask again
  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  // Request permission (only works on user action)
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function sendNotification(title, options = {}) {
  // Check if notifications are supported and permitted
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    showCustomNotification(title, options);
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted. Current permission:', Notification.permission);
    // Show custom notification as fallback
    showCustomNotification(title, options);
    return;
  }

  try {
    // Try to use service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: {
          // Don't use icons if they don't exist - just send notification without them
          ...options,
          tag: 'discovery-notification',
        },
      });
      console.log('Notification sent via service worker');
      // Also show custom notification for better UX
      showCustomNotification(title, options);
    } else {
      // Fallback to standard notification API
      const notification = new Notification(title, {
        // Simple notification without icons
        ...options,
      });
      
      // Handle notification click
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
      });
      
      console.log('Notification sent via standard API');
      // Also show custom notification
      showCustomNotification(title, options);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    // Show custom notification as fallback
    showCustomNotification(title, options);
  }
}

function showCustomNotification(title, options = {}) {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.95) 100%);
    color: #0a0a0a;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    margin-bottom: 12px;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid #10a37f;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `;

  const titleElement = document.createElement('h3');
  titleElement.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #0a0a0a;
  `;
  titleElement.textContent = title;

  const bodyElement = document.createElement('p');
  bodyElement.style.cssText = `
    margin: 0;
    font-size: 0.95rem;
    color: #666;
    line-height: 1.5;
  `;
  bodyElement.textContent = options.body || '';

  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', () => {
    notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
    setTimeout(() => notification.remove(), 300);
  });

  notification.style.position = 'relative';
  notification.appendChild(titleElement);
  if (options.body) {
    notification.appendChild(bodyElement);
  }
  notification.appendChild(closeButton);

  notificationContainer.appendChild(notification);

  // Auto-dismiss after 6 seconds
  const autoCloseTimer = setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => notification.remove(), 300);
    }
  }, 6000);

  // Clear timer if user closes manually
  closeButton.addEventListener('click', () => {
    clearTimeout(autoCloseTimer);
  });

  console.log('Custom notification displayed:', title);
}

// Mock data generators for chemical compounds
const COMPOUND_TEMPLATES = [
  { prefix: 'Benzene', baseFormula: 'C6H' },
  { prefix: 'Ethanol', baseFormula: 'C2H' },
  { prefix: 'Acetone', baseFormula: 'C3H' },
  { prefix: 'Methane', baseFormula: 'CH' },
  { prefix: 'Propanol', baseFormula: 'C3H' },
  { prefix: 'Toluene', baseFormula: 'C7H' },
  { prefix: 'Hexane', baseFormula: 'C6H' },
];

const JUSTIFICATIONS = [
  'This compound exhibits optimal balance between dipole moment and HOMO-LUMO gap, making it ideal for your specified criteria.',
  'Strong molecular bonds and favorable quantum properties align perfectly with your requirements.',
  'This candidate demonstrates excellent polarizability characteristics while maintaining the desired dipole moment range.',
  'AI analysis indicates high synthesis feasibility with predicted quantum efficiency above 85%.',
  'Molecular structure suggests superior performance in quantum applications with minimal electronic instability.',
  'This compound shows exceptional electronic properties under standard conditions with optimal heat capacity.',
];

function generateMockCompound(index, criteria) {
  const template = COMPOUND_TEMPLATES[index % COMPOUND_TEMPLATES.length];
  const variance = Math.floor(Math.random() * 5) + 1;
  
  return {
    id: `compound-${Date.now()}-${index}`,
    name: `${template.prefix} Derivative ${index + 1}`,
    formula: `${template.baseFormula}${5 + variance}O${variance}`,
    mu: parseFloat((Math.random() * 4.5 + 0.5).toFixed(2)), // Dipole moment: 0.5 - 5.0
    alpha: parseFloat((Math.random() * 40 + 50).toFixed(2)), // Polarizability: 50.0 - 90.0
    gap: parseFloat((Math.random() * 9.9 + 0.1).toFixed(2)), // HOMO-LUMO gap: 0.1 - 10.0
    cv: parseFloat((Math.random() * 20 + 20).toFixed(2)), // Heat capacity: 20.0 - 40.0
    justification: JUSTIFICATIONS[Math.floor(Math.random() * JUSTIFICATIONS.length)],
  };
}

// User authentication functions (using real API)
export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
}

// Chemical discovery functions (mocked for prototype)
export async function generateCompounds(token, criteria) {
  // Simulate API delay for realistic AI processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Generate 5-8 mock compounds based on criteria
  const count = Math.floor(Math.random() * 4) + 5;
  const compounds = [];
  
  for (let i = 0; i < count; i++) {
    compounds.push(generateMockCompound(i, criteria));
  }

  // Sort by score descending
  compounds.sort((a, b) => b.score - a.score);

  // Send notification when discovery is complete
  console.log('Attempting to send notification...');
  console.log('Notification permission:', Notification.permission);
  
  sendNotification('Discovery Complete! 🧬', {
    body: `${count} new compounds found matching your criteria.`,
    tag: 'discovery-complete',
    requireInteraction: false,
  });

  return {
    error: false,
    compounds,
    metadata: {
      generatedAt: new Date().toISOString(),
      criteria,
      agentsUsed: ['Generative', 'Predictive', 'Evaluation'],
    },
  };
}

export async function predictProperties(token, formula) {
  // Mock property prediction
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    error: false,
    properties: {
      molecularWeight: Math.random() * 300 + 50,
      density: Math.random() * 2 + 0.5,
      meltingPoint: Math.random() * 200 - 50,
      boilingPoint: Math.random() * 300 + 50,
      solubility: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    },
  };
}
