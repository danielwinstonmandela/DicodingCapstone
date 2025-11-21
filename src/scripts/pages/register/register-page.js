import { registerUser } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container auth-page">
        <div class="auth-card">
          <div id="auth-loader" class="spinner" style="display: none;"></div>
          <h1>Register</h1>
          <p class="auth-subtitle">Create your researcher account</p>
          
          <form id="register-form" class="auth-form">
            <div class="field">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Dr. Jane Smith"
              />
            </div>

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
                minlength="8"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div id="error-message" class="error-message" style="display: none;"></div>
            <div id="success-message" class="success-message" style="display: none;"></div>

            <button type="submit" class="btn btn-primary large">Register</button>
          </form>

          <p class="auth-footer">
            Already have an account? <a href="#/login">Login here</a>
          </p>
        </div>
      </section>
    `;
  }

  showAuthLoader(show = true) {
    const loader = document.querySelector('#auth-loader');
    const form = document.querySelector('#register-form');
    if (show) {
      loader.style.display = 'block';
      Array.from(form.elements).forEach(el => el.disabled = true);
    } else{
      loader.style.display = 'none';
      Array.from(form.elements).forEach(el => el.disabled = false);
    }
  }

  async afterRender() {
    const form = document.querySelector('#register-form');
    const errorMessage = document.querySelector('#error-message');
    const successMessage = document.querySelector('#success-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;
      this.showAuthLoader(true);

      try {
        const response = await registerUser({ name, email, password });
        
        if (response.error) {
          errorMessage.textContent = response.message;
          errorMessage.style.display = 'block';
          successMessage.style.display = 'none';
          return;
        }

        // Show success message
        successMessage.textContent = 'Registration successful! Redirecting to login...';
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
      } catch (error) {
        errorMessage.textContent = 'Registration failed. Please try again.';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        console.error('Registration error:', error);
      } finally {
        this.showAuthLoader(false);
      }
    });
  }
}
