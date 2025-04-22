import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // try {
      //   const userToken = localStorage.getItem('userToken');
      //   let response;
    
      //   if (userToken) {
      //     response = await axios.get('http://localhost:5000/check-auth', {
      //       headers: {
      //         Authorization: `Bearer ${userToken}`,
      //       },
      //       withCredentials: true,
      //     });
      //   } else {
      //     response = await axios.get('http://localhost:5000/check-auth', { withCredentials: true });
      //     // console.log('ressss', response)
      //   }
    
      //   // Check if the response indicates the user is authenticated
      //   if (response) {
      //     setUser(response.data.user);
      //     setIsAuthenticated(true);
      //   } else {
      //     setUser(null);
      //     setIsAuthenticated(false);
      //   }
      // } catch (error) {
      //   // console.error('Error checking authentication status:', error);
      //   setUser(null);
      //   setIsAuthenticated(false);
      // }
    };
    
  
    const checkDoctorAuthStatus = async () => {
      const doctorToken = localStorage.getItem('doctorToken');
      if (doctorToken) {
        try {
          const response = await axios.get('http://localhost:5000/check-doc-auth', {
            headers: {
              Authorization: `Bearer ${doctorToken}`,
            },
            withCredentials: true,
          });
          if (response.data.isAuthenticated) {
            setDoctor(response.data.user);
            setIsDoctorAuthenticated(true);
          } else {
            setDoctor(null);
            setIsDoctorAuthenticated(false);
          }
        } catch (error) {
          // If there's an error, clear the authentication status
          setDoctor(null);
          setIsDoctorAuthenticated(false);
        }
      } else {
        setDoctor(null);
        setIsDoctorAuthenticated(false);
      }
    };
  
    checkAuthStatus();
    checkDoctorAuthStatus();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, doctor, isDoctorAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
