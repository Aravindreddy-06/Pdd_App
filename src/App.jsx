import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ItemProvider } from './context/ItemContext';
import { NotificationProvider } from './context/NotificationContext';
import { RequestProvider } from './context/RequestContext';
import Navbar from './components/Navbar';
import Splash from './pages/Splash';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Impact from './pages/Impact';
import MyItems from './pages/MyItems';
import AddItem from './pages/AddItem';
import LocationAccess from './pages/LocationAccess';
import Category from './pages/Category';
import ItemDetails from './pages/ItemDetails';
import BorrowRequest from './pages/BorrowRequest';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import HelpSupport from './pages/HelpSupport';
import CommunityTrust from './pages/CommunityTrust';
import RateExperience from './pages/RateExperience';
import Requests from './pages/Requests';
import Circles from './pages/Circles';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminForgotPassword from './pages/AdminForgotPassword';
import SupabaseGuide from './pages/SupabaseGuide';
import './App.css';

// Pages that do NOT show sidebar/bottom-nav (standalone flows)
const STANDALONE_PATHS = ['/', '/signup', '/login', '/verify-email', '/forgot-password', '/terms', '/location-access', '/rate-experience', '/community-trust', '/admin/login', '/admin/signup', '/admin/forgot-password'];

function AppShell() {
  const location = useLocation();
  const isStandalone = STANDALONE_PATHS.includes(location.pathname);

  return (
    <>
      {location.pathname !== '/' && (
        <div className="global-bg-particles">
          <div className="particle" style={{ width: '100px', height: '100px', top: '10%', left: '5%' }}></div>
          <div className="particle" style={{ width: '150px', height: '150px', bottom: '15%', right: '10%', animationDelay: '-5s' }}></div>
          <div className="particle" style={{ width: '80px', height: '80px', top: '40%', right: '20%', animationDelay: '-12s' }}></div>
        </div>
      )}
      <div className={isStandalone ? 'app-standalone' : 'app-layout'}>
      {!isStandalone && <Navbar />}
      <div className={isStandalone ? '' : 'app-content'}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/circles" element={<Circles />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/perks" element={<Circles />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/location-access" element={<LocationAccess />} />
          <Route path="/category" element={<Category />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/borrow-request/:id" element={<BorrowRequest />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/help-support" element={<HelpSupport />} />
          <Route path="/community-trust" element={<CommunityTrust />} />
          <Route path="/rate-experience" element={<RateExperience />} />
          <Route path="/supabase-guide" element={<SupabaseGuide />} />
        </Routes>
      </div>
      </div>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <ItemProvider>
        <NotificationProvider>
          <RequestProvider>
            <Router>
              <AppShell />
            </Router>
          </RequestProvider>
        </NotificationProvider>
      </ItemProvider>
    </UserProvider>
  );
}

export default App;
