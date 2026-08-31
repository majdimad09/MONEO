import React, { createContext, useContext } from 'react';

interface NavigationContextValue {
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({ goBack: () => {} });

export const NavigationProvider: React.FC<{ goBack: () => void; children: React.ReactNode }> = ({ goBack, children }) => (
  <NavigationContext.Provider value={{ goBack }}>{children}</NavigationContext.Provider>
);

export const useNavigation = () => useContext(NavigationContext);
