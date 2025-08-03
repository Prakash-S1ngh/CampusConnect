# Director Panel - CampusConnect

## Overview
The Director Panel is a comprehensive management system for campus directors to oversee their campus operations, communicate with faculty and other directors, and manage campus members.

## Features

### 🔐 Authentication & Registration
- **Director Signup**: Complete registration form with profile image upload
- **Role-based Access**: Directors have elevated permissions within their campus
- **Secure Authentication**: JWT-based authentication with role verification

### 📊 Dashboard & Analytics
- **Campus Statistics**: Real-time overview of campus population
  - Total Students count
  - Total Faculty count  
  - Total Alumni count
  - Total Directors count
  - Online Users count
- **Visual Analytics**: Clean, modern dashboard with color-coded metrics

### 👥 User Management
- **Campus User Overview**: Complete list of all users in the campus
- **User Removal**: Directors can remove students, faculty, and alumni from their campus
- **Role-based Restrictions**: Directors cannot remove other directors
- **Campus Boundary**: Directors can only manage users within their own campus
- **Bulk Operations**: Select multiple users for batch operations

### 💬 Communication System
- **Campus Messaging**: Send messages to multiple campus members simultaneously
- **Direct Connections**: View and connect with other directors and faculty in the same campus
- **Message History**: Track all campus-wide communications
- **Recipient Selection**: Choose specific users or send to all campus members

### 👤 Profile Management
- **Comprehensive Profile**: Detailed director information including:
  - Personal details (name, email, profile image)
  - Professional information (title, department, director role)
  - Academic credentials (expertise, research interests, publications)
  - Administrative details (office location, office hours, managed departments)
  - Student guidance statistics (PhD, M.Tech, B.Tech students guided)
  - Achievements and accomplishments
- **Profile Editing**: In-place editing with real-time updates
- **Image Upload**: Profile picture management with cloud storage

## API Endpoints

### Director Management
```
POST   /director/v2/signup          - Create new director account
GET    /director/v2/info            - Get director information
PUT    /director/v2/update          - Update director profile
```

### Campus Management
```
GET    /director/v2/connections     - Get campus connections (directors & faculty)
GET    /director/v2/campus-users    - Get all users in campus
DELETE /director/v2/remove-user     - Remove user from campus
GET    /director/v2/analytics       - Get campus analytics
```

### Communication
```
POST   /director/v2/send-campus-message - Send message to campus members
```

## Database Schema

### Director Model
```javascript
{
  title: String,                    // Director, Associate Director, etc.
  department: String,               // Department name
  expertise: [String],              // Areas of expertise
  officeLocation: String,           // Office location
  contactEmail: String,             // Contact email
  researchInterests: [String],      // Research areas
  publications: [{                  // Publication details
    title: String,
    journal: String,
    year: Number,
    link: String
  }],
  teachingSubjects: [String],       // Subjects taught
  officeHours: {                    // Office hours
    from: String,
    to: String
  },
  achievements: [String],           // Achievements list
  guidance: {                       // Students guided
    phd: Number,
    mtech: Number,
    btech: Number
  },
  directorRole: String,             // Campus Director, Department Director, etc.
  permissions: {                    // Administrative permissions
    canRemoveFaculty: Boolean,
    canRemoveStudents: Boolean,
    canRemoveAlumni: Boolean,
    canManageCampus: Boolean,
    canViewAnalytics: Boolean
  },
  managedDepartments: [String],     // Departments managed
  reportingTo: ObjectId             // Hierarchical reporting structure
}
```

### User Model Updates
- Added `Director` role to the enum
- Added `directorDetails` field referencing Director model

## Frontend Components

### DirectorPanel.jsx
Main dashboard component with four main sections:
1. **Dashboard**: Analytics overview with key metrics
2. **Connections**: View campus directors and faculty
3. **User Management**: Manage campus users with removal capabilities
4. **Messaging**: Send campus-wide messages

### DirectorProfile.jsx
Comprehensive profile management component with:
- Editable profile fields
- Image upload functionality
- Real-time form validation
- Professional information management

### DirectorSignup.jsx
Registration component with:
- Complete signup form
- Image upload
- Role selection
- College/department information

## Security Features

### Permission System
- **Campus Isolation**: Directors can only manage their own campus
- **Role-based Access**: Different permissions for different director roles
- **Hierarchical Structure**: Support for reporting relationships
- **Audit Trail**: All administrative actions are logged

### Data Protection
- **Input Validation**: Comprehensive form validation
- **File Upload Security**: Secure image upload with validation
- **API Protection**: JWT-based authentication for all endpoints
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Usage Examples

### Creating a Director Account
```javascript
const directorData = {
  name: "Dr. John Smith",
  email: "john.smith@university.edu",
  password: "securepassword",
  college: "University of Technology",
  directorRole: "Campus Director",
  department: "Computer Science"
};
```

### Sending Campus Message
```javascript
const messageData = {
  recipients: ["user1_id", "user2_id", "user3_id"],
  message: "Important campus announcement",
  messageType: "text"
};
```

### Removing User from Campus
```javascript
const removalData = {
  userId: "user_to_remove_id",
  reason: "Policy violation"
};
```

## Installation & Setup

1. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   # Add director routes to index.js
   # Update User model with Director role
   ```

2. **Frontend Setup**:
   ```bash
   cd NewFrontend
   npm install
   # Import and use Director components
   ```

3. **Database Migration**:
   - Update existing User documents to include Director role
   - Create Director collection with proper indexes

## Future Enhancements

- **Advanced Analytics**: Detailed reporting and insights
- **Notification System**: Real-time notifications for directors
- **Bulk Operations**: Enhanced batch processing capabilities
- **Audit Logging**: Comprehensive action tracking
- **Mobile Support**: Responsive design for mobile devices
- **Integration**: Connect with external campus management systems

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 