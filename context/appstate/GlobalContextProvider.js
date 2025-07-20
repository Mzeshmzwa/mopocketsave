import React from "react";
import { AuthProvider } from "../appstate/AuthContext";
import { CustomThemeProvider } from "../appstate/CustomThemeProvider"; // Ensure correct import

const GlobalContextProvider = ({ children }) => {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </CustomThemeProvider>
  );
};

export default GlobalContextProvider;
