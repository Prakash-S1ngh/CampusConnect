# Director Authentication Guide - CampusConnect

## Overview
This guide explains how directors can register and authenticate in the CampusConnect system, including both signup and login processes.

## 🔐 **Director Registration (Signup)**

### **Method 1: Through Main Signup Form**
Directors can register using the main signup form with the following steps:

1. **Navigate to Signup Page**: Go to `/signup`
2. **Fill Basic Information**:
   - Full Name
   - Email Address
   - Password
   - College Name
   - Profile Image (optional)
3. **Select Role**: Choose "Director" from the role dropdown
4. **Additional Director Fields** (appear when Director role is selected):
   - **Director Role**: Select from:
     - Campus Director
     - Department Director
     - Academic Director
     - Administrative Director
   - **Department**: Enter department name
5. **Submit**: Click "Sign Up" to create the account

### **Method 2: Direct Director Signup**
Directors can also use the dedicated director signup component at `/director-signup` which includes:
- Director-specific styling
- Pre-selected director role options
- Enhanced form validation
- Professional appearance

### **Backend Process**
When a director signs up:
1. **User Creation**: A new user is created with `role: 'Director'`
2. **Director Details**: A separate Director document is created with:
   - Director role and permissions
   - Department information
   - Administrative capabilities
3. **College Association**: Director is linked to their campus
4. **Profile Setup**: Basic profile information is stored

## 🔑 **Director Login**

### **Method 1: Universal Login**
Directors can login through the main login page at `/Login`:
- The system automatically detects the user role
- Directors are redirected to `/director-panel` after successful login
- Other users (students, faculty, alumni) go to `/DashBoard`

### **Method 2: Dedicated Director Login**
Directors can use the dedicated login page at `/director-login`:
- Professional director-themed interface
- Direct access to director panel
- Enhanced security features
- Role-specific styling

### **Login Flow**
1. **Email/Password**: Enter credentials
2. **Role Detection**: System identifies user as director
3. **Authentication**: Backend validates credentials
4. **Session Creation**: JWT token or session is created
5. **Redirect**: User is taken to Director Panel

## 🛡️ **Security Features**

### **Role-Based Access Control**
- Directors can only access director-specific endpoints
- Campus isolation: Directors can only manage their own campus
- Permission-based actions (remove users, view analytics, etc.)

### **Authentication Validation**
- Email/password verification
- Role verification on each request
- Session management
- Secure token handling

### **Data Protection**
- Encrypted password storage (bcrypt)
- Secure API endpoints
- Input validation and sanitization
- CORS protection

## 📱 **User Interface Features**

### **Signup Form Enhancements**
- Dynamic form fields based on role selection
- Real-time validation
- Image upload with preview
- Professional styling

### **Login Interface**
- Universal login with role detection
- Dedicated director login page
- Loading states and error handling
- Responsive design

### **Navigation**
- Role-based redirects after login
- Protected routes for directors
- Seamless integration with existing system

## 🔧 **Technical Implementation**

### **Frontend Components**
```javascript
// Signup with Director support
- Signup.jsx (updated with Director role)
- DirectorSignup.jsx (dedicated component)
- DirectorLogin.jsx (dedicated login)

// Authentication handling
- LoginPage.jsx (universal login)
- Role-based redirects
- Context integration
```

### **Backend Endpoints**
```javascript
// Director authentication
POST /director/v2/signup - Create director account
POST /director/v2/login - Director login

// Director management
GET /director/v2/info - Get director profile
PUT /director/v2/update - Update director info
```

### **Database Schema**
```javascript
// User model (updated)
{
  role: 'Director', // New role option
  directorDetails: ObjectId, // Reference to Director model
  // ... other user fields
}

// Director model (new)
{
  directorRole: String, // Campus Director, etc.
  permissions: Object, // Administrative permissions
  managedDepartments: [String],
  // ... other director-specific fields
}
```

## 🚀 **Getting Started**

### **For New Directors**
1. **Registration**: Use signup form or contact administration
2. **Account Setup**: Complete profile information
3. **Access Panel**: Login and access director dashboard
4. **Campus Management**: Start managing campus operations

### **For Existing Directors**
1. **Login**: Use email/password to authenticate
2. **Dashboard Access**: Navigate to director panel
3. **Feature Usage**: Utilize all director capabilities

### **For Administrators**
1. **Create Director Accounts**: Use signup form or API
2. **Assign Permissions**: Set appropriate director roles
3. **Monitor Access**: Track director activities
4. **Manage Campus**: Oversee multiple campuses

## 🔄 **Integration with Existing System**

### **Seamless Integration**
- Directors use the same authentication system
- Compatible with existing user management
- Integrates with current campus structure
- Maintains data consistency

### **Role Compatibility**
- Directors can interact with all user types
- Maintains existing permissions structure
- Supports hierarchical campus management
- Enables cross-role communication

## 📋 **Troubleshooting**

### **Common Issues**
1. **Login Failures**: Check email/password combination
2. **Role Detection**: Ensure user has Director role
3. **Permission Errors**: Verify director permissions
4. **Campus Access**: Confirm campus association

### **Support**
- Check authentication logs
- Verify database records
- Test API endpoints
- Contact system administrator

## 🔮 **Future Enhancements**

### **Planned Features**
- Two-factor authentication for directors
- Advanced permission management
- Audit logging for all actions
- Multi-campus director support
- Mobile app integration

### **Security Improvements**
- Enhanced encryption
- Session timeout management
- IP-based access control
- Advanced threat detection

---

This authentication system provides directors with secure, role-based access to campus management features while maintaining compatibility with the existing CampusConnect platform. 