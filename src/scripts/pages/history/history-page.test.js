import '@testing-library/jest-dom';

// Mock idb-helper
jest.mock('../../data/idb-helper', () => ({
  getAllDiscoveryRuns: jest.fn(),
  deleteDiscoveryRun: jest.fn(),
}));

import HistoryPage from './history-page';
import { getAllDiscoveryRuns } from '../../data/idb-helper';

describe('HistoryPage', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="root"></div>';
    
    // Mock sessionStorage
    sessionStorage.setItem('authToken', 'dummy-token');
    
    // Reset mock
    getAllDiscoveryRuns.mockResolvedValue([]);
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('should render empty state if no history', async () => {
    const page = new HistoryPage();
    
    // Render HTML dulu
    const html = await page.render();
    document.getElementById('root').innerHTML = html;
    
    // Jalankan afterRender untuk load data
    await page.afterRender();

    // Cek empty state
    const historyList = document.querySelector('#history-list');
    expect(historyList).toHaveTextContent('No Discovery Sessions Yet');
    expect(historyList).toHaveTextContent('Your discovery history will appear here.');
  });

  it('should display history items when data exists', async () => {
    // Mock data
    const mockRuns = [
      {
        id: 1,
        timestamp: Date.now(),
        criteria: {
          boilingPoint: 100,
          viscosity: 50,
          stability: 'High',
          solubility: 'Water'
        },
        results: [
          { name: 'Compound A', score: 95 },
          { name: 'Compound B', score: 87 }
        ]
      }
    ];
    
    getAllDiscoveryRuns.mockResolvedValue(mockRuns);
    
    const page = new HistoryPage();
    const html = await page.render();
    document.getElementById('root').innerHTML = html;
    await page.afterRender();

    expect(document.body).toHaveTextContent('Discovery Session #1');
    expect(document.body).toHaveTextContent('Results: 2 compounds');
    expect(document.body).toHaveTextContent('Compound A');
  });
});