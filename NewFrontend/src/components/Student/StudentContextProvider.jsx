import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../lib/PostUrl";
import { io } from "socket.io-client";

const socket = io(`${url}`);

const StudentContext = createContext();

const StudentContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  // const SOCKET_URL = `${url}`;
  // const socket = io(SOCKET_URL, { withCredentials: true });

  

  // Load activeTab from localStorage or set default
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "feed";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${url}/student/v2/getInfo`, {
          withCredentials: true,
        });
        setUser(response.data.user);
        setLoggedIn(true);
        console.log("User fetched:", response.data.user);
        // Set user online status

        // Notify backend that user is online 
        socket.emit("userOnline", response.data.user._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    console.log("Fetching user...");

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${url}/student/v2/logout`, {}, { withCredentials: true });
      setUser(null);
      setLoggedIn(false);
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear(); // Flush local storage
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <StudentContext.Provider value={{ user, setUser, loading, loggedIn, logout, activeTab, setActiveTab ,socket }}>
      {children}
    </StudentContext.Provider>
  );
};

export { StudentContext, StudentContextProvider };