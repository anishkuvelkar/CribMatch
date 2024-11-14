import React, { useEffect, useState } from "react";

function Profile() {
  const [userData, setUserData] = useState(null); // State to store user data
  const [error, setError] = useState(null); // State for error messages

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      if (!token) {
        // Redirect to login if token is not available
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/user/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Throw an error for bad responses
        }

        const data = await response.json(); // Parse the JSON response
        setUserData(data); // Set the user data
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data. Please try again."); // Set error message
      }
    };

    fetchUserData(); // Call the function to fetch user data
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
  <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">User Profile</h1>
  {error && <p className="text-red-500 text-center font-medium">{error}</p>} {/* Display error messages */}
  {userData ? (
    <div className="space-y-6">
      {[
        { label: 'Name', value: userData.name },
        { label: 'Email', value: userData.email },
        { label: 'Age', value: userData.age },
        { label: 'Daily Routine', value: userData.dailyRoutine },
        { label: 'Priorities', value: userData.priorities },
        { label: 'Wake Up Time', value: userData.wakeUpTime },
        { label: 'Bed Time', value: userData.bedTime },
        { label: 'Home Space Use', value: userData.homeSpaceUse },
        { label: 'Biggest Stressors', value: userData.biggestStressors },
        { label: 'Worst Habit', value: userData.worstHabit },
        { label: 'Deal Breakers', value: userData.dealBreakers },
        { label: 'Neatness Preference', value: userData.neatnessPreference },
        { label: 'Overnight Guests', value: userData.overnightGuests },
        { label: 'Confrontation Style', value: userData.confrontationStyle },
        { label: 'Pets', value: userData.pets },
        { label: 'Sunday Night Activity', value: userData.sundayNightActivity },
        { label: 'Roommate Self-Assessment', value: userData.roommateSelfAssessment },
        { label: 'Move In Date', value: userData.moveInDate },
        { label: 'Move Out Date', value: userData.moveOutDate },
        { label: 'Country', value: userData.country },
        { label: 'State', value: userData.state },
        { label: 'City', value: userData.city },
      ].map((item, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-300 w-full max-h-40 overflow-auto"
        >
          <p className="font-semibold text-gray-700">{item.label}:</p>
          <p className="text-gray-600 whitespace-normal">{item.value}</p>
        </div>
      ))}
      <div>
        <p className="font-semibold text-gray-700">Images:</p>
        {userData.images && userData.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {userData.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`User Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-sm"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No images available.</p>
        )}
      </div>
    </div>
  ) : (
    <p className="text-center text-gray-500">Loading...</p> // Show loading state
  )}
</div>

  );  
}

export default Profile;
