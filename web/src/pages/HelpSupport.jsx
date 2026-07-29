import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, Package, Settings, ShieldAlert, MessageSquare, Mail, ChevronRight, MessageCircle } from 'lucide-react';
import './HelpSupport.css';

export default function HelpSupport() {
  const navigate = useNavigate();

  const topics = [
    { icon: User, label: 'Account & Profile', color: '#22c55e' },
    { icon: Package, label: 'Sharing & Items', color: '#22c55e' },
  ];

  const issues = [
    { icon: Settings, label: 'Technical Issue', desc: 'App bugs, crashes, or glitches', color: '#f0fdf4', iconColor: '#22c55e' },
    { icon: ShieldAlert, label: 'Safety Concern', desc: 'Report suspicious user or activity', color: '#fef2f2', iconColor: '#ef4444' },
    { icon: MessageSquare, label: 'Feedback', desc: 'Suggest features or share thoughts', color: '#eff6ff', iconColor: '#3b82f6' },
  ];

  return (
    <div className="help-page">
      <div className="header-nav px-4 pt-6 pb-2">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="nav-title">Help & Support</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="help-content">
        <h2 className="help-heading">How can we help?</h2>

        <div className="search-bar-wrapper">
          <Search size={20} color="#9ca3af" />
          <input type="text" placeholder="Search FAQs..." className="faq-search-input" />
        </div>

        <div className="quick-topics-section">
          <h4 className="section-subtitle">QUICK TOPICS</h4>
          <div className="topics-grid">
            {topics.map((topic, idx) => (
              <div key={idx} className="topic-card">
                <div className="topic-icon-circle">
                  <topic.icon size={24} color={topic.color} />
                </div>
                <span className="topic-label">{topic.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-issue-section">
          <h4 className="section-subtitle">REPORT AN ISSUE</h4>
          <div className="issues-list">
            {issues.map((issue, idx) => (
              <div key={idx} className="issue-item">
                <div className="issue-left">
                  <div className="issue-icon-bg" style={{ backgroundColor: issue.color }}>
                    <issue.icon size={20} color={issue.iconColor} />
                  </div>
                  <div className="issue-text">
                    <span className="issue-label">{issue.label}</span>
                    <span className="issue-desc">{issue.desc}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#9ca3af" />
              </div>
            ))}
          </div>
        </div>

        <div className="still-need-help">
          <h4 className="still-help-text">Still need help?</h4>
          <div className="help-actions">
            <button className="live-chat-btn">
              <MessageCircle size={20} fill="white" />
              Start Live Chat
            </button>
            <button className="email-support-btn">
              <Mail size={20} />
              Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
