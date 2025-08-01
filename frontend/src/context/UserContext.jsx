import React, { createContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { data } from 'react-router-dom';

// Step 1: Create Context
export const UserDataContext = createContext();

// Step 2: Provide Context
export default function UserContext({ children }) {
  const serverUrl = "https://virtualassistant-backend-3akh.onrender.com";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const handleCurrentUser = async () => {
    try {
      console.log("Calling /api/user/current...");
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      console.log("Current user result:", result.data);
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.log(
        "Error fetching current user:",
        error.response?.data || error.message
      );
    }
  };
  
//this triggers the backend controller for fetching remini response of the user command
  const getGeminiResponse = async (command)=>{
    try{
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
      return result.data;
    }catch(error){
      console.log(error);
    }
  }



  useEffect(() => {
    console.log("🟡 useEffect running in UserContext");
    handleCurrentUser();
  }, []);
  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}
