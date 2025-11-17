import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

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
  'This compound exhibits optimal balance between stability and reactivity, making it ideal for your specified criteria.',
  'Strong molecular bonds and favorable thermodynamic properties align perfectly with your requirements.',
  'This candidate demonstrates excellent solubility characteristics while maintaining the desired boiling point range.',
  'AI analysis indicates high synthesis feasibility with predicted yield above 85%.',
  'Molecular structure suggests superior performance in target applications with minimal side reactions.',
  'This compound shows exceptional stability under standard conditions with low environmental impact.',
];

function generateMockCompound(index, criteria) {
  const template = COMPOUND_TEMPLATES[index % COMPOUND_TEMPLATES.length];
  const variance = Math.floor(Math.random() * 5) + 1;
  
  return {
    id: `compound-${Date.now()}-${index}`,
    name: `${template.prefix} Derivative ${index + 1}`,
    formula: `${template.baseFormula}${5 + variance}O${variance}`,
    score: Math.floor(95 - index * 3 - Math.random() * 5),
    stability: criteria.stability,
    solubility: criteria.solubility,
    synthesisComplexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    boilingPoint: criteria.boilingPoint + (Math.random() * 20 - 10),
    viscosity: criteria.viscosity + (Math.random() * 10 - 5),
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
