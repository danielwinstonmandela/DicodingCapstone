import { loginUser } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container auth-page">
        <div class="auth-card">
          <h1>Login</h1>
          <p class="auth-subtitle">Access the Chemical Discovery Portal</p>
          
          <form id="login-form" class="auth-form">
            <div class="field">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="researcher@example.com"
              />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Enter your password"
              />
            </div>

            <div id="error-message" class="error-message" style="display: none;"></div>

            <button type="submit" class="btn btn-primary large">Login</button>
          </form>

          <p class="auth-footer">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');
    const errorMessage = document.querySelector('#error-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await loginUser({ email, password });
        
        if (response.error) {
          errorMessage.textContent = response.message;
          errorMessage.style.display = 'block';
          return;
        }

        // Store auth token and user info
        sessionStorage.setItem('authToken', response.loginResult.token);
        sessionStorage.setItem('userName', response.loginResult.name);

        // Redirect to discovery page
        window.location.hash = '#/discovery';
        window.location.reload(); // Reload to update navigation
      } catch (error) {
        errorMessage.textContent = 'Login failed. Please try again.';
        errorMessage.style.display = 'block';
        console.error('Login error:', error);
      }
    });
  }
}
