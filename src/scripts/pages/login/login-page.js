import { loginUser } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1>Login</h1>
          <p class="auth-subtitle">Access the Chemical Discovery Portal</p>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required />
            </div>
            
            <div id="error-message" class="error-message" style="display: none;"></div>
            
            <button type="submit" class="btn-primary">Login</button>
          </form>
          
          <p class="auth-footer">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </div>
      </div>
    `;
  }

showAuthLoader(show = true) {
  if (show) {
    const oldLoader = document.getElementById('fullscreen-loader');
    if (oldLoader) oldLoader.remove();
    
    // Create new loader
    const loader = document.createElement('div');
    loader.id = 'fullscreen-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    const form = document.querySelector('#login-form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Logging in...';
    }
  } else {
    const loader = document.getElementById('fullscreen-loader');
    if (loader) loader.remove();
    document.body.style.overflow = ''; // Restore scrolling

    const form = document.querySelector('#login-form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Login';
    }
  }
}

  async afterRender() {
    const form = document.querySelector('#login-form');
    const errorMessage = document.querySelector('#error-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.showAuthLoader(true);

      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await loginUser({ email, password });
        
        if (response.error) {
          errorMessage.textContent = response.message;
          errorMessage.style.display = 'block';
          this.showAuthLoader(false);
          return;
        }

        // Store auth token and user info
        sessionStorage.setItem('authToken', response.loginResult.token);
        sessionStorage.setItem('userName', response.loginResult.name);

        // Redirect to discovery page
        window.location.hash = '#/discovery';
        window.location.reload();
      } catch (error) {
        errorMessage.textContent = 'Login failed. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Login error:', error);
        this.showAuthLoader(false);
      }
    });
  }
}