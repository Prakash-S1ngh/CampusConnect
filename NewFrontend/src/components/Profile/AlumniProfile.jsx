import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { url } from '../../lib/PostUrl';

// Mock data to ensure rendering without API


const AlumniProfile = () => {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/alumni/v2/getAlumni`, {
          withCredentials: true,
        });
        const data = await response.data.data;
        console.log("data from backend", data);
        setAlumni(data);
        setFormData(data);
        console.log("profile of alumni ", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(alumni); // Reset form data to original data
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);


    // Uncomment for real API integration:
    try {
      const payload = {
        ...formData,
        ...formData.user,  // bring user.name, user.email to top level
      };

      delete payload.user; // remove nested user object
      // console.log("payload",formData);
      const response = await axios.post(`${url}/alumni/v2/updateprofile`, formData,
        {
          withCredentials: true,
        }
      );
      console.log("response from backend", response);

      if (response.status == 200) {
        alert('Profile updated successfully');
      }

      const updatedData = await response.data.user;
      console.log("updated data", updatedData);
      setAlumni(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() !== "") {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, index) => index !== indexToRemove)
    });
  };

  const addProject = () => {
    if (newProject.trim() !== "") {
      setFormData({
        ...formData,
        projects: [...formData.projects, newProject.trim()]
      });
      setNewProject("");
    }
  };

  const removeProject = (indexToRemove) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, index) => index !== indexToRemove)
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '15px', color: '#4b5563', fontWeight: '500' }}>Loading profile...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const renderEditButtons = () => {
    if (isEditing) {
      return (
        <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            style={{
              background: "white",
              color: "#4b5563",
              border: "1px solid #e5e7eb",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleEdit}
        style={{
          background: "#4f46e5",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          fontWeight: "500",
          cursor: "pointer",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
        }}
      >
        Edit Profile
      </button>
    );
  };

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>
      {/* Navigation */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
      }}>
        <button
          onClick={handleBack}
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            color: "#4f46e5",
            fontWeight: "500",
            fontSize: "15px",
            transition: "all 0.2s ease"
          }}
        >
          ← Go Back
        </button>

        {renderEditButtons()}
      </div>

      {/* Profile Header */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        overflow: "hidden",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "linear-gradient(to right, #4f46e5, #6366f1)",
          height: "140px"
        }}></div>
        <div style={{ padding: "24px", position: "relative" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {/* Profile Image */}
            <div style={{ marginTop: "-80px", marginRight: "30px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "5px solid white",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}>
                  <img
                    src={formData.user?.profileImage || "https://via.placeholder.com/300/e5e7eb/4f46e5?text=AJ"}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
                <span style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  height: "18px",
                  width: "18px",
                  borderRadius: "50%",
                  background: formData.user?.isOnline ? "#10b981" : "#9ca3af",
                  border: "3px solid white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                }}></span>
              </div>
            </div>

            {/* User Info */}
            <div style={{ flexGrow: 1, paddingTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="user.name"
                      value={formData.user?.name || ''}
                      onChange={handleChange}
                      style={{
                        fontSize: "26px",
                        fontWeight: "700",
                        marginBottom: "6px",
                        padding: "5px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        width: "100%"
                      }}
                    />
                  ) : (
                    <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "6px", color: "#111827" }}>
                      {formData.user?.name}
                    </h1>
                  )}

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px"
                  }}>
                    <span style={{ marginRight: "10px" }}>Class of</span>
                    {isEditing ? (
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear || ''}
                        onChange={handleChange}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          width: "80px"
                        }}
                      />
                    ) : (
                      <span style={{
                        background: "#f3f4f6",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "14px",
                        color: "#4b5563"
                      }}>
                        {formData.graduationYear}
                      </span>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    marginTop: "5px"
                  }}>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", marginTop: "15px" }}>
                <div style={{ marginRight: "24px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="user.email"
                      value={formData.user?.email || ''}
                      onChange={handleChange}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        width: "100%"
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", color: "#4b5563" }}>
                      <span style={{ marginRight: "6px" }}>✉️</span>
                      {formData.user?.email}
                    </div>
                  )}
                </div>
                <div style={{ marginRight: "24px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Job Title</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={handleChange}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        width: "100%"
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", color: "#4b5563" }}>
                      <span style={{ marginRight: "6px" }}>💼</span>
                      {formData.jobTitle || "Not specified"}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Company</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleChange}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        width: "100%"
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", color: "#4b5563" }}>
                      <span style={{ marginRight: "6px" }}>🏢</span>
                      {formData.company || "Not specified"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        marginBottom: "30px"
      }}>
        {/* Left Column */}
        <div>
          {/* Bio Section */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "24px",
            marginBottom: "24px"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ marginRight: "8px" }}>👤</span> About Me
            </h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows="5"
                style={{
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: "1.6"
                }}
              />
            ) : (
              <p style={{ color: "#4b5563", lineHeight: "1.6" }}>{formData.bio || "No bio available."}</p>
            )}
          </div>

          {/* Projects Section */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "24px"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ marginRight: "8px" }}>📂</span> Projects
            </h2>

            {isEditing && (
              <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px"
              }}>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="Add a new project"
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    flexGrow: 1
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                />
                <button
                  onClick={addProject}
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {formData.projects && formData.projects.length > 0 ? (
              <div>
                {formData.projects.map((project, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      borderLeft: "4px solid #4f46e5",
                    }}
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={project.title}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].title = e.target.value;
                            setFormData({ ...formData, projects: updatedProjects });
                          }}
                          style={{ ...inputStyle, marginBottom: "8px" }}
                        />
                        <textarea
                          placeholder="Description"
                          value={project.description}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].description = e.target.value;
                            setFormData({ ...formData, projects: updatedProjects });
                          }}
                          style={{ ...inputStyle, marginBottom: "8px" }}
                        />
                        <input
                          type="text"
                          placeholder="Project Link"
                          value={project.link}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].link = e.target.value;
                            setFormData({ ...formData, projects: updatedProjects });
                          }}
                          style={inputStyle}
                        />
                        <button
                          onClick={() => removeProject(index)}
                          style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "14px",
                            marginTop: "8px"
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div>
                        <h3 style={{ fontWeight: "600", color: "#111827" }}>{project.title}</h3>
                        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>{project.description}</p>
                        <a href={project.link} style={{ color: "#3b82f6", fontSize: "14px" }} target="_blank" rel="noopener noreferrer">
                          {project.link}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280" }}>No projects listed.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Skills Section */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "24px",
            marginBottom: "24px"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ marginRight: "8px" }}>🛠️</span> Skills
            </h2>

            {isEditing && (
              <div style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px"
              }}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    flexGrow: 1
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Add
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formData.skills?.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    background: "#eef2ff",
                    color: "#4f46e5",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        marginLeft: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px"
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "24px"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ marginRight: "8px" }}>📱</span> Contact & Info
            </h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Email</div>
                <div style={{ color: "#4b5563" }}>{formData.user?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Last Active</div>
                <div style={{ color: "#4b5563" }}>
                  {formData.user?.isOnline
                    ? "Currently Online"
                    : `Last seen: ${new Date(formData.user?.lastSeen).toLocaleDateString()}`
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>College</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="user.college"
                    value={formData.user?.college || ''}
                    onChange={handleChange}
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      width: "100%"
                    }}
                  />
                ) : (
                  <div style={{ color: "#4b5563" }}>{formData.user?.college || "Not specified"}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Graduation</div>
                <div style={{ color: "#4b5563" }}>Class of {formData.graduationYear}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;