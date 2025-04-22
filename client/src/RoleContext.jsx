import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Create a context
const RoleContext = createContext();

// Create a provider component
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Extract role from query parameters when location changes
    const queryParams = new URLSearchParams(location.search);
    const roleFromQuery = queryParams.get('role');
    if (roleFromQuery) {
      setRole(roleFromQuery);
    }
  }, [location]);

  return (
    <RoleContext.Provider value={{ role }}>
      {children}
    </RoleContext.Provider>
  );
};

// Create a custom hook to use the RoleContext
export const useRole = () => {
  return useContext(RoleContext);
};
