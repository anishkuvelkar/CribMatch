import React from "react";

const UserSimilarityCard = ({ user }) => {
  return (
    <div className="w-full max-w-[350px] p-4 bg-white rounded-lg shadow-md border border-gray-300 mb-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
      <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
      <p className="text-gray-700"><strong>Age:</strong> {user.age}</p>
      <p className="text-gray-700"><strong>Daily Routine:</strong> {user.dailyRoutine}</p>
      <p className="text-gray-700"><strong>Priorities:</strong> {user.priorities}</p>
      <p className="text-gray-700"><strong>Gender:</strong> {user.gender}</p>
      <p className="text-gray-700"><strong>Wake Up Time:</strong> {user.wakeUpTime}</p>
      <p className="text-gray-700"><strong>Bed Time:</strong> {user.bedTime}</p>
      <p className="text-gray-700"><strong>Neatness Preference:</strong> {user.neatnessPreference}</p>
      <p className="text-gray-700"><strong>Pets:</strong> {user.pets}</p>
      <p className="text-gray-700"><strong>Overnight Guests:</strong> {user.overnightGuests}</p>
      <p className="text-gray-700"><strong>Move In Date:</strong> {user.moveInDate || 'N/A'}</p>
      <p className="text-gray-700"><strong>Move Out Date:</strong> {user.moveOutDate || 'N/A'}</p>
      <p className="text-gray-700"><strong>Country:</strong> {user.country}</p>
      <p className="text-gray-700"><strong>State:</strong> {user.state}</p>
      <p className="text-gray-700"><strong>City:</strong> {user.city}</p>
      {/* <p className="text-gray-700"><strong>Similarity Score:</strong> {user.similarity.toFixed(2)}</p> */}
      <div>
        <p className="font-semibold text-gray-700">Images:</p>
        {user.images && user.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {user.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`User Image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg shadow-sm"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No images available.</p>
        )}
      </div>
    </div>
  );
};

export default UserSimilarityCard;
