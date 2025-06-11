import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useBookings from '../../hooks/useBookings';

const CreateReview = ({ onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { rateExistingBooking } = useBookings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await rateExistingBooking(bookingId, rating, comment);

    if (result) {
      onClose?.();
      navigate('/bookings');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transform transition-all duration-300 hover:scale-[1.02] border border-indigo-100">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 transform transition-all duration-300 hover:translate-x-2">Write a Review</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="transform transition-all duration-300 hover:translate-y-[-4px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-400 py-3"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? 'Star' : 'Stars'}
              </option>
            ))}
          </select>
        </div>

        <div className="transform transition-all duration-300 hover:translate-y-[-4px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-lg border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-400 resize-none"
            placeholder="Share your experience..."
            required
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transform transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:rotate-1"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReview;