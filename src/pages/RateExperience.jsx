import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import './RateExperience.css';

export default function RateExperience() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState(['On time', 'Friendly']);
  const [feedback, setFeedback] = useState('Great experience borrowing from neighbor! Item worked perfectly.');

  const availableTags = ['On time', 'Great communication', 'Item as described', 'Friendly'];

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const currentRatingCount = Number(user?.ratingCount || 0);
      const currentRating = Number(user?.rating || 0);
      const newRatingCount = currentRatingCount + 1;
      const newRating = Number(((currentRating * currentRatingCount + rating) / newRatingCount).toFixed(1));
      
      await updateUser({
        rating: newRating,
        ratingCount: newRatingCount
      });
      alert(`Thank you for submitting your ${rating}-star rating!`);
      navigate(-1);
    } catch (e) {
      navigate(-1);
    }
  };

  return (
    <div className="rate-page">
      <div className="rate-header px-4 pt-6 pb-2">
        <button className="close-btn" onClick={() => navigate(-1)}>
          <X size={24} />
        </button>
        <h3 className="nav-title">Rate Experience</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="rate-content">
        <div className="rate-user-info">
          <div className="rate-avatar-wrapper">
            <img src="https://ui-avatars.com/api/?name=Alex+Johnson&background=84cc16&color=fff" alt="Alex Johnson" className="rate-avatar" />
          </div>
          <h2 className="rate-user-name">Alex Johnson</h2>
          <p className="rate-user-role">Borrower • Heavy Duty Power Drill</p>
        </div>

        <div className="rating-section">
          <h2 className="rating-heading">How was your experience?</h2>
          <p className="rating-subtext">
            Your feedback helps keep the ResourceShare community safe and reliable.
          </p>

          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="star-item" onClick={() => setRating(num)}>
                <div className={`star-circle ${rating >= num ? 'active' : ''}`}>
                  <Star 
                    size={24} 
                    fill={rating >= num ? "black" : "none"} 
                    color={rating >= num ? "black" : "#d1d5db"} 
                  />
                </div>
                <span className="star-num">{num}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tags-section">
          <h4 className="tags-heading">What went well?</h4>
          <div className="tags-grid">
            {availableTags.map((tag) => (
              <button 
                key={tag} 
                className={`tag-btn ${tags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-section">
          <h4 className="feedback-heading">Written Feedback</h4>
          <textarea 
            className="feedback-textarea" 
            placeholder="Tell us more about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="rate-actions">
          <button className="submit-review-btn" onClick={handleSubmitReview}>
            Submit Review
          </button>
          <button className="skip-review-btn" onClick={() => navigate(-1)}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
