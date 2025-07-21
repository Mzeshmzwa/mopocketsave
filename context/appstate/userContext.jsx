import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userVaults, setUserVaults] = useState([]);
  const [activeVault, setActiveVault] = useState(null);
  const [depositInProgress, setDepositInProgress] = useState(false);
  const [withdrawalRequest, setWithdrawalRequest] = useState(null);
  const [vaultInfo, setVaultInfo] = useState(null);
  const [withdrawableDeposits, setWithdrawableDeposits] = useState([]);

  const value = {
    userVaults,
    setUserVaults,
    activeVault,
    setActiveVault,
    depositInProgress,
    setDepositInProgress,
    withdrawalRequest,
    setWithdrawalRequest,
    vaultInfo,
    setVaultInfo,
    withdrawableDeposits,
    setWithdrawableDeposits,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };