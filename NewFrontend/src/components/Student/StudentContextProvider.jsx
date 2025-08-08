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
        // Try to get user info from student endpoint first
        let response;
        try {
          response = await axios.get(`${url}/student/v2/getInfo`, {
            withCredentials: true,
            credentials: "include",
          });
        } catch (studentError) {
          console.log("Student endpoint failed, trying director...");
          // If student endpoint fails, try director endpoint
          try {
            response = await axios.get(`${url}/director/v2/info`, {
              withCredentials: true,
            });
            console.log("Director response:", response.data);
            // Transform director response to match user format
            response.data.user = response.data.director;
          } catch (directorError) {
            console.log("Director endpoint failed, trying faculty...");
            // If both fail, try faculty endpoint
            try {
              response = await axios.get(`${url}/faculty/v2/getinfo`, {
                withCredentials: true,
              });
            } catch (facultyError) {
              console.log("Faculty endpoint failed, trying alumni...");
              // If all fail, try alumni endpoint
              response = await axios.get(`${url}/alumni/v2/getinfo`, {
                withCredentials: true,
              });
            }
          }
        }
        
        setUser(response.data.user);
        setLoggedIn(true);
        console.log("User fetched:", response.data.user);
        
        // Notify backend that user is online 
        socket.emit("userOnline", response.data.user._id.toString());
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

  useEffect(() => {
    if (socket && user?.college) {
        socket.emit("joinCollegeRoom", user.college.toString());
    }
}, [socket, user]);

  const logout = async () => {
    try {
      // Try to logout from the appropriate endpoint based on user role
      if (user?.role === 'Director') {
        await axios.post(`${url}/director/v2/logout`, {}, { withCredentials: true });
      } else if (user?.role === 'Faculty') {
        await axios.post(`${url}/faculty/v2/logout`, {}, { withCredentials: true });
      } else if (user?.role === 'Alumni') {
        await axios.post(`${url}/alumni/v2/logout`, {}, { withCredentials: true });
      } else {
        await axios.post(`${url}/student/v2/logout`, {}, { withCredentials: true });
      }
      
      setUser(null);
      setLoggedIn(false);
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.clear(); // Flush local storage
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setLoggedIn(false);
      localStorage.clear();
    }
  };

  return (
    <StudentContext.Provider value={{ user, setUser, loading, loggedIn, logout, activeTab, setActiveTab ,socket }}>
      {children}
    </StudentContext.Provider>
  );
};

export { StudentContext, StudentContextProvider };
