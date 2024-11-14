import React, { useEffect, useState } from "react";
import UserSimilarityCard from "./cards"; // Import your user card component
import { useSwipeable } from "react-swipeable"; // Import the swipeable hook
import { jwtDecode } from "jwt-decode";

// Component for handling swipeable user cards with buttons
const UserCardWithSwipe = ({ user, onSwipe }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe(user, 'no'), // Handle left swipe (No)
    onSwipedRight: () => onSwipe(user, 'yes'), // Handle right swipe (Yes)
  });

  return (
    <div className="relative w-150 m-4 bg-white rounded-lg shadow-lg overflow-hidden">
      <div {...handlers} className="w-full h-full cursor-pointer">
        <UserSimilarityCard user={user} /> {/* Render user similarity card */}
      </div>
      {/* Separate rectangular div for buttons */}
      <div className="flex justify-between p-2 bg-gray-200 rounded-md mt-2">
        <button
          className="w-full py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
          onClick={() => onSwipe(user, 'no')}
        >
          No
        </button>
        <button
          className="w-full py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
          onClick={() => onSwipe(user, 'yes')}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

// Main Profile component
const Profile = () => {
  const [similarUsers, setSimilarUsers] = useState([]); // State for similar users
  const [currentIndex, setCurrentIndex] = useState(0); // State for tracking the current card index
  const [error, setError] = useState(null); // State for error handling

  const handleSwipe = (user, decision) => {
    if (decision === 'no') {
      // If decision is "no", simply move to the next card
      setCurrentIndex((prevIndex) => prevIndex + 1);
      return;
    }

    const token = localStorage.getItem("token");

    // Check if token exists and is not expired
    if (!token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        setError("Session expired. Please log in again.");
        return;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Invalid token. Please log in.");
      return;
    }

    const swipedByEmail = localStorage.getItem("userEmail");

    const requestData = {
      swiped_user_email: user.email,
      decision: decision,
      swiped_by_email: swipedByEmail,
    };

    fetch("http://localhost:8000/api/searchview/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            console.error("Response status:", response.status);
            console.error("Response error data:", errData);
            throw new Error(
              `Network response was not ok: ${errData.message || "Unknown error"}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Swipe logged:", data);
        setCurrentIndex((prevIndex) => prevIndex + 1); // Move to the next user card
      })
      .catch((err) => {
        console.error("Error logging swipe:", err.message);
        setError("An error occurred while logging the swipe. Please try again.");
      });
  };

  // Fetch similar users from the API
  useEffect(() => {
    const fetchSimilarUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/search/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched similar users:", data); // Log response to debug

        setSimilarUsers(data.similar_users); // Set similar users from response
      } catch (err) {
        console.error("Error fetching similar users:", err);
        setError("Error fetching similar users. Please try again.");
      }
    };

    fetchSimilarUsers(); // Call the function to fetch similar users
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      {error && <p className="text-red-500">{error}</p>} {/* Display error if exists */}
      {similarUsers.length > 0 ? (
        currentIndex < similarUsers.length ? (
          <UserCardWithSwipe
            user={similarUsers[currentIndex]}
            onSwipe={handleSwipe}
          /> // Render only the current card
        ) : (
          <p>You've viewed all similar users.</p> // Message when no more users are left
        )
      ) : (
        <p>No similar users found.</p> // Message if no users found
      )}
    </div>
  );
};

export default Profile; // Export Profile component
