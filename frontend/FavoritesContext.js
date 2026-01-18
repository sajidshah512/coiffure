// FavoritesContext.js
import React, { createContext, useState, useContext } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteLooks, setFavoriteLooks] = useState([]);

  const addFavorite = (look) => {
    setFavoriteLooks((prev) => [...prev, look]);
  };

  const removeFavorite = (index) => {
    setFavoriteLooks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <FavoritesContext.Provider value={{ favoriteLooks, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
