import React from 'react';

const StarRating = ({ rating, onRate, size = 28 }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => onRate && onRate(star)}
          style={{ fontSize: size, cursor: onRate ? 'pointer' : 'default' }}
        >
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;