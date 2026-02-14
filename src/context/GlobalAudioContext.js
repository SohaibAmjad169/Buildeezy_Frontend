// contexts/GlobalAudioContext.js
import React, { createContext, useContext, useState } from 'react';

const GlobalAudioContext = createContext();

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};

export const GlobalAudioProvider = ({ children }) => {
  const [isGloballyMuted, setIsGloballyMuted] = useState(true); // Default muted like Instagram

  const toggleGlobalAudio = () => {
    setIsGloballyMuted(prev => !prev);
  };

  return (
    <GlobalAudioContext.Provider 
      value={{ 
        isGloballyMuted, 
        toggleGlobalAudio 
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
};