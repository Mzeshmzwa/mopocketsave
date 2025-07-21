import React from 'react';
import { AuthProvider } from './appstate/AuthContext';
import { UserProvider } from './appstate/UserContext';
import { AdminProvider } from './appstate/AdminContext';

const GlobalContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default GlobalContextProvider;