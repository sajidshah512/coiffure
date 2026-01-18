// ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const themes = {
  light: { backgroundColor: '#FFFFFF', textColor: '#000000' },
  dark: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  system: { backgroundColor: '#F0F0F0', textColor: '#333333' },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('system');
  const [user, setUser] = useState({ name: '', email: '' });

  const value = {
    themeName,
    setThemeName,
    theme: themes[themeName],
    user,
    setUser,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
