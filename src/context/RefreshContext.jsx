import { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext({ key: 0, lastChange: null, refresh: () => {} });

export function RefreshProvider({ children }) {
  const [key, setKey] = useState(0);
  const [lastChange, setLastChange] = useState(null);

  // change: { action: 'add'|'delete'|'edit', type, amount, date, old? }
  const refresh = useCallback((change = null) => {
    setLastChange(change);
    setKey((k) => k + 1);
  }, []);

  return (
    <RefreshContext.Provider value={{ key, lastChange, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => useContext(RefreshContext);
