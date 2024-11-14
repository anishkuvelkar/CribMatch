import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/header';
import Chats from './pages/chats';
import Profile from './pages/profile';
import Search from './pages/search';
import Matches from './pages/matches';
import Login from './pages/login';
import Registration from './pages/registration';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); 

    const handleLogin = (status) => {
        setIsAuthenticated(status);
    };

    return (
        <Router>
            {isAuthenticated ? (
                <>
                    <Header />
                    <div className="p-4">
                        <Routes>
                            <Route path="/" element={<Profile />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/matches" element={<Matches />} />
                            <Route path="/chats" element={<Chats />} />
                            <Route path="/login" element={<Navigate to="/" replace />} />
                            {/* Add registration route here if authenticated */}
                        </Routes>
                    </div>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Registration />} /> 
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            )}
        </Router>
    );
}

export default App;
