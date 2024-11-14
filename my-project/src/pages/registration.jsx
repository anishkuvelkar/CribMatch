import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender:'',
    email: '',
    yourgender:'',
    password: '',
    dailyRoutine: '',
    priorities: '',
    wakeUpTime: '',
    bedTime: '',
    homeSpaceUse: '',
    biggestStressors: '',
    worstHabit: '',
    dealBreakers: '',
    pets:'',
    neatnessPreference: '',
    overnightGuests: '',
    confrontationStyle: '',
    sundayNightActivity: '',
    roommateSelfAssessment: '',
    moveInDate: '',
    moveOutDate: '',
    country: '',
    state: '',
    city: '',
    images: [],
  });

  const [authToken, setAuthToken] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
 
   const fetchAuthToken = useCallback(async () => {
    try {
      const response = await axios.get('https://www.universal-tutorial.com/api/getaccesstoken', {
        headers: {
          'Accept': 'application/json',
          'api-token': 'N23P9B-RbQPW8KlO009zv2Vlc2NaXH-NBInmSqsBJHZmiYAzLW3-7FjGg3_O0UaEQks',
          'user-email': 'anishkuvelkar88@gmail.com',
        },
      });
      setAuthToken(response.data.auth_token);
    } catch (error) {
      console.error('Error fetching auth token:', error);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    if (!authToken) return;
    try {
      const response = await axios.get('https://www.universal-tutorial.com/api/countries', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  }, [authToken]);

  const fetchStates = useCallback(async (country) => {
    if (!authToken || !country) return;
    try {
      const response = await axios.get(`https://www.universal-tutorial.com/api/states/${country}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });
      setStates(response.data);
      setFormData((prevData) => ({ ...prevData, state: '', city: '' }));
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  }, [authToken]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    // Check for more than 2 images
    if (files.length + formData.images.length > 2) {
      setErrorMessages(['You can only upload a maximum of 2 images.']);
      return;
    }
  
    // Update the images array by concatenating new files
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...files],
    }));
  
    // Create image previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
  };

  useEffect(() => {
    // Clean up image previews on unmount
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const fetchCities = useCallback(async (state) => {
    if (!authToken || !state) return;
    try {
      const response = await axios.get(`https://www.universal-tutorial.com/api/cities/${state}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });
      setCities(response.data);
      setFormData((prevData) => ({ ...prevData, city: '' }));
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }, [authToken]);

  useEffect(() => {
    fetchAuthToken();
  }, [fetchAuthToken]);

  useEffect(() => {
    fetchCountries();
  }, [authToken, fetchCountries]);

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country, fetchStates]);

  useEffect(() => {
    if (formData.state) {
      fetchCities(formData.state);
    }
  }, [formData.state, fetchCities]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessages([]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Log form validity
    console.log("Form validation status:", isFormValid());
    if (!isFormValid()) {
      console.log("Form is invalid.");
      return;
    }
  
    setErrorMessages([]);
  
    try {
      // Log form data before sending
      console.log("Form data being submitted:", JSON.stringify(formData));
  
      // Make the POST request
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      // Log response status and details
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        setErrorMessages([errorData.message || 'Failed to submit form']);
        return;
      }
  
      const responseData = await response.json();
      console.log('Form submitted successfully:', responseData);
  
      // Reset form and previews after successful submission
      setFormData({
        name: '',
        age: '',
        email: '',
        password: '',
        dailyRoutine: '',
        yourgender:'',
        gender: '',
        priorities: '',
        wakeUpTime: '',
        bedTime: '',
        homeSpaceUse: '',
        biggestStressors: '',
        worstHabit: '',
        dealBreakers: '',
        neatnessPreference: '',
        pets: '',
        overnightGuests: '',
        confrontationStyle: '',
        sundayNightActivity: '',
        roommateSelfAssessment: '',
        moveInDate: '',
        moveOutDate: '',
        country: '',
        state: '',
        city: '',
        images: [],
      });
      setImagePreviews([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessages(['An error occurred while submitting the form.']);
    }
  };
  
  

  const isFormValid = () => {
    const errors = [];
    if (formData.images.length === 0) {
      errors.push('At least one image is required.');
    }
    if (!formData.name) {
      errors.push('First name is required.');
    }
    if (formData.age < 18) {
      errors.push('You must be at least 18 years old.');
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address.');
    }
    if (formData.password.length < 6 || !/\d/.test(formData.password)) {
      errors.push('Password must be at least 6 characters long and include numbers.');
    }
    const minLengthFields = [
      'dailyRoutine', 'priorities', 'homeSpaceUse', 
      'biggestStressors', 'worstHabit', 'dealBreakers', 
      'confrontationStyle', 'sundayNightActivity', 'roommateSelfAssessment'
    ];

    minLengthFields.forEach((field) => {
      if (!formData[field] || formData[field].length < 30) {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} must be at least 30 characters long.`);
      }
    });
    if (!formData.wakeUpTime) {
      errors.push('Wake up time is required.');
    }
    if (!formData.bedTime) {
      errors.push('Bed time is required.');
    }
    if (!formData.moveInDate) {
      errors.push('Move in date is required.');
    }
    if (!formData.moveOutDate) {
      errors.push('Move out date is required.');
    }
    if (formData.moveInDate && formData.moveOutDate && new Date(formData.moveInDate) >= new Date(formData.moveOutDate)) {
      errors.push('Move out date must be after move in date.');
    }
    const neatnessOptions = ['Very Neat', 'Neat', 'Somewhat Neat', 'Messy'];
    if (!neatnessOptions.includes(formData.neatnessPreference)) {
      errors.push('Please select a valid neatness preference.');
    }
    const petsallowed = ['Yes', 'No'];
    if (!petsallowed.includes(formData.pets)) {
      errors.push('Please select a pet preference.');
    }
    const genderpref = ['Male', 'Female','Any'];
    if (!genderpref.includes(formData.gender)) {
      errors.push('Please select a gender preference.');
    }
    const yoursex = ['Male', 'Female'];
    if (!yoursex.includes(formData.yourgender)) {
      errors.push('Please select your gender .');
    }
    const guestOptions = ['Yes', 'No', 'Sometimes'];
    if (!guestOptions.includes(formData.overnightGuests)) {
      errors.push('Please select a valid option for overnight guests.');
    }
    if (!formData.country) {
      errors.push('Country is required.');
    }
    if (!formData.state) {
      errors.push('State is required.');
    }
    if (!formData.city) {
      errors.push('City is required.');
    }

    setErrorMessages(errors);
    return errors.length === 0;
  };

  return (
    <div className="max-w-lg mx-auto p-5 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Registration Form</h1>
      {errorMessages.length > 0 && (
        <div className="text-red-500 mb-4">
          {errorMessages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">

        <label className="block">
          <span className="text-gray-700">Country</span>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select a country</option>
            {countries.map(country => (
              <option key={country.country_name} value={country.country_name}>
                {country.country_name}
              </option>
            ))}
          </select>
        </label>
        
        <label className="block">
          <span className="text-gray-700">State</span>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state.state_name} value={state.state_name}>
                {state.state_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">City</span>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select a city</option>
            {cities.map(city => (
              <option key={city.city_name} value={city.city_name}>
                {city.city_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Age</span>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            min="18"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            minLength="6"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Daily Routine</span>
          <textarea
            name="dailyRoutine"
            value={formData.dailyRoutine}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Priorities</span>
          <textarea
            name="priorities"
            value={formData.priorities}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Wake Up Time</span>
          <input
            type="time"
            name="wakeUpTime"
            value={formData.wakeUpTime}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Bed Time</span>
          <input
            type="time"
            name="bedTime"
            value={formData.bedTime}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Home Space Use</span>
          <textarea
            name="homeSpaceUse"
            value={formData.homeSpaceUse}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Biggest Stressors</span>
          <textarea
            name="biggestStressors"
            value={formData.biggestStressors}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Worst Habit</span>
          <textarea
            name="worstHabit"
            value={formData.worstHabit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Deal Breakers</span>
          <textarea
            name="dealBreakers"
            value={formData.dealBreakers}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Neatness Preference</span>
          <select
            name="neatnessPreference"
            value={formData.neatnessPreference}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select neatness preference</option>
            <option value="Very Neat">Very Neat</option>
            <option value="Neat">Neat</option>
            <option value="Somewhat Neat">Somewhat Neat</option>
            <option value="Messy">Messy</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Pet Preference</span>
          <select
            name="pets"
            value={formData.pets}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select neatness preference</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        
        <label className="block">
          <span className="text-gray-700">Gender Preference</span>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select gender preference</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Any">Any</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Your Gender </span>
          <select
            name="yourgender"
            value={formData.yourgender}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select your gender </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Overnight Guests</span>
          <select
            name="overnightGuests"
            value={formData.overnightGuests}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Sometimes">Sometimes</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Confrontation Style</span>
          <textarea
            name="confrontationStyle"
            value={formData.confrontationStyle}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Sunday Night Activity</span>
          <textarea
            name="sundayNightActivity"
            value={formData.sundayNightActivity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Roommate Self-Assessment</span>
          <textarea
            name="roommateSelfAssessment"
            value={formData.roommateSelfAssessment}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            minLength="30"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-gray-700">Move In Date</span>
          <input
            type="date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Move Out Date</span>
          <input
            type="date"
            name="moveOutDate"
            value={formData.moveOutDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </label>

  <label className="block">
  <span className="text-gray-700">Upload Images (max 2)</span>
  <input
    type="file"
    multiple
    accept=".jpg, .jpeg"
    onChange={handleImageChange}
    className="hidden" // Hide the default input
    required
    id="file-upload"
  />
  <button
    type="button"
    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-left"
    onClick={() => document.getElementById('file-upload').click()} // Trigger file selection
  >
    Choose Files
  </button>
</label>

{/* Image Previews */}
<div className="flex space-x-4 mt-4">
  {imagePreviews.map((preview, index) => (
    <div key={index} className="w-1/2">
      <img
        src={preview}
        alt={`Preview ${index + 1}`}
        className="w-full h-auto rounded-md border"
      />
    </div>
  ))}
</div>



        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
