import { createContext, useContext, useState } from "react";

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [vaultSettings, setVaultSettings] = useState({
    interestRate: 0.05,
    earlyWithdrawalPenalty: 0.1,
    lockPeriods: [30, 60, 90], // days
  });

  const [allVaultUsers, setAllVaultUsers] = useState([]);
  const [adminActivityLog, setAdminActivityLog] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  const value = {
    vaultSettings,
    setVaultSettings,
    allVaultUsers,
    setAllVaultUsers,
    adminActivityLog,
    setAdminActivityLog,
    systemStats,
    setSystemStats,
    revenueData,
    setRevenueData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext };