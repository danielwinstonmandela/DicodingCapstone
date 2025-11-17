import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import DiscoveryPage from '../pages/discovery/discovery-page';
import HistoryPage from '../pages/history/history-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/discovery': new DiscoveryPage(),
  '/history': new HistoryPage(),
};

export default routes;
