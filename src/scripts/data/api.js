import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GENERATE_MOLECULE: `${CONFIG.MOLECULE_API_URL}/generate`,
  HEALTH_CHECK: `${CONFIG.MOLECULE_API_URL}/health`,
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
    background: #181818;
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
    color: #fff;
  `;
  titleElement.textContent = title;

  const bodyElement = document.createElement('p');
  bodyElement.style.cssText = `
    margin: 0;
    font-size: 0.95rem;
    color: #fff;
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

// Groq AI integration for generating justifications (fallback)
async function generateJustificationWithGroq(compound, criteria) {
  try {
    const prompt = `You are a chemistry expert. Provide a brief 2-3 sentence scientific justification for why this chemical compound matches the given criteria.

Compound: ${compound.name}
Formula (SMILES): ${compound.formula}
Properties:
- Dipole Moment (μ): ${compound.mu.toFixed(2)} Debye
- Polarizability (α): ${compound.alpha.toFixed(2)} Ų
- HOMO-LUMO Gap: ${compound.gap.toFixed(2)} eV
- Heat Capacity (Cv): ${compound.cv.toFixed(2)} cal/mol·K

Target Criteria:
- Target Dipole Moment (μ): ${criteria.mu} Debye
- Target Polarizability (α): ${criteria.alpha} Ų
- Target HOMO-LUMO Gap: ${criteria.gap} eV
- Target Heat Capacity (Cv): ${criteria.cv} cal/mol·K

Provide a concise scientific justification.`;

    const response = await fetch(CONFIG.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
    
    return JUSTIFICATIONS[Math.floor(Math.random() * JUSTIFICATIONS.length)];
  } catch (error) {
    console.error('Error generating justification with Groq:', error);
    return JUSTIFICATIONS[Math.floor(Math.random() * JUSTIFICATIONS.length)];
  }
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

// Chemical discovery functions (using real HuggingFace API)
export async function generateCompounds(token, criteria) {
  try {
    console.log('🧪 Calling molecule generation API with criteria:', criteria);
    console.log('⏱️ Note: Model may take several minutes, especially on first run (cold start)');
    
    // Call the real HuggingFace API
    const response = await fetch(ENDPOINTS.GENERATE_MOLECULE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boiling_point: criteria.boilingPoint,
        viscosity: criteria.viscosity,
        stability: criteria.stability,
        solubility: criteria.solubility,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Molecule API error:', errorText);
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Received molecules from API:', data);

    // Transform API response to match our app's format
    const predictions = data.predictions || [];
    const smiles = data.topk || [];
    const explanations = data.explanations || [];
    
    console.log('🔍 Predictions:', predictions.length, 'SMILES:', smiles.length, 'Explanations:', explanations.length);
    
    // Combine predictions with SMILES and explanations
    const moleculeCount = Math.min(predictions.length, smiles.length);
    const compounds = [];
    
    // Check if API explanations failed
    const apiExplanationsFailed = explanations.every(exp => 
      exp && (exp.includes('failed') || exp.includes('Error'))
    );
    
    if (apiExplanationsFailed && explanations.length > 0) {
      console.warn('⚠️ API explanations failed. Switching to Groq AI for justifications...');
      sendNotification('Switching to Groq AI 🤖', {
        body: 'API explanations unavailable. Using Groq AI to generate justifications.',
        tag: 'groq-fallback',
      });
    }
    
    for (let i = 0; i < moleculeCount; i++) {
      const pred = predictions[i];
      const smile = smiles[i];
      const explanation = explanations[i];
      
      compounds.push({
        id: `compound-${Date.now()}-${i}`,
        name: `Molecule ${i + 1}`,
        formula: smile?.smiles || 'N/A',
        mu: pred.mu || 0,
        alpha: pred.alpha || 0,
        gap: pred.gap || 0,
        cv: pred.Cv || pred.cv || 0,
        justification: null, // Will be filled below
      });
    }

    // Generate justifications
    if (apiExplanationsFailed || explanations.length === 0) {
      // Use Groq AI for all justifications
      console.log('🤖 Generating justifications with Groq AI...');
      for (let i = 0; i < compounds.length; i++) {
        const compound = compounds[i];
        const justification = await generateJustificationWithGroq(compound, criteria);
        compound.justification = justification;
      }
    } else {
      // Use API explanations
      console.log('✅ Using API explanations');
      for (let i = 0; i < compounds.length; i++) {
        const explanation = explanations[i];
        if (explanation && !explanation.includes('failed') && !explanation.includes('Error')) {
          compounds[i].justification = explanation;
        } else {
          // Fallback to Groq for this specific molecule
          compounds[i].justification = await generateJustificationWithGroq(compounds[i], criteria);
        }
      }
    }

    const count = compounds.length;

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
        apiUsed: 'HuggingFace Space - dahyunn-asah',
      },
    };
  } catch (error) {
    console.error('❌ Error generating compounds:', error);
    return {
      error: true,
      message: error.message,
      compounds: [],
    };
  }
}

// Health check for molecule API
export async function checkMoleculeAPIHealth() {
  try {
    console.log('🏥 Checking molecule API health...');
    const response = await fetch(ENDPOINTS.HEALTH_CHECK, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Health Check:', data);
    return {
      error: false,
      status: 'healthy',
      data,
    };
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return {
      error: true,
      status: 'unhealthy',
      message: error.message,
    };
  }
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
