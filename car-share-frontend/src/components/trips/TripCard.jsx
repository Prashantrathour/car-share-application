import React from 'react';
import { Link } from 'react-router-dom';

const TripCard = ({ trip }) => {
  if (!trip) return null;
  
  const startDate = new Date(trip.startTime || Date.now());
  const endDate = new Date(trip.endTime || Date.now());
  
  // Format date and time
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg hover:shadow-md transition-shadow duration-300">
      <Link to={`/trips/${trip.id}`} className="block">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {trip.startLocation?.address?.split(',')[0] || 'Unknown'} to {trip.endLocation?.address?.split(',')[0] || 'Unknown'}
                </h3>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(startDate)} • {formatTime(startDate)} - {formatTime(endDate)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{trip.estimatedDuration || '0'} min • {trip.estimatedDistance || '0'} km</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between">
              <div className="text-lg font-medium text-indigo-600">
                ${Number(trip.pricePerSeat || 0).toFixed(2)}
              </div>
              
              <div className="flex items-center mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-gray-500">{trip.availableSeats || 0} seats available</span>
              </div>
            </div>
          </div>
          
          {trip.driver && (
            <div className="mt-4 flex items-center">
              <img 
                src={trip.driver.profileImage || trip.driver.avatar || `https://ui-avatars.com/api/?name=${trip.driver.firstName}+${trip.driver.lastName}&background=random`} 
                alt={`${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`}
                className="h-8 w-8 rounded-full mr-2"
              />
              <div>
                <span className="text-sm text-gray-700">
                  {trip.driver.firstName || ''} {trip.driver.lastName || ''}
                </span>
                {trip.driver.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-xs text-gray-500">{Number(trip.driver.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default TripCard; 