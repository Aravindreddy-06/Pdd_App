import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import './Logout.css';

export default function Logout() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = () => {
    // In a real app, clear auth state here
    navigate('/login');
  };

  return (
    <div className="logout-page">
      <div className="header-nav px-4 pt-6 pb-2">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">Settings</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="logout-container">
        <div className="logout-card">
          <div className="logout-icon-circle">
            <LogOut size={40} color="#84cc16" />
          </div>
          
          <h2 className="logout-heading">Are you sure you want to log out?</h2>
          
          <p className="logout-subtext">
            You will need to sign back in to access your ResourceShare account, community updates, and impact reports.
          </p>

          <div className="logout-actions">
            <button className="confirm-logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="cancel-logout-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>

        <div className="signed-in-info">
          Signed in as <span className="user-email-highlight">{user?.email || 'alex.neighbor@gmail.com'}</span>
        </div>
      </div>
    </div>
  );
}
