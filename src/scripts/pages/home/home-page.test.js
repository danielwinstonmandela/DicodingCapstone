import '@testing-library/jest-dom';
import HomePage from './home-page';

describe('HomePage', () => {
  let page;

  beforeEach(async () => {
    page = new HomePage();
    document.body.innerHTML = await page.render();
    await page.afterRender();
  });

  it('renders the FAQ section', () => {
    expect(document.body).toHaveTextContent('Frequently asked questions');
    expect(document.body).toHaveTextContent('How does the AI work?');
    expect(document.body).toHaveTextContent('Is this data secure?');
    expect(document.body).toHaveTextContent('What is the output?');
  });

  it('renders the discovery portal button', () => {
    const btn = document.querySelector('.hero-cta .btn-primary');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Launch Discovery Portal');
  });

  it('accordion opens and closes on click', () => {
    const toggles = document.querySelectorAll('.accordion-toggle');
    const panels = document.querySelectorAll('.accordion-panel');
    expect(panels[0].style.maxHeight).toBe('');
    toggles[0].click();
    expect(panels[0].style.maxHeight).not.toBe('');
    toggles[0].click();
    expect(panels[0].style.maxHeight).toBe('');
  });
});