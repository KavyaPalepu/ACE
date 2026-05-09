ACE (Active Community Events) – AI Enabled College Communication, Events & Collaboration Platform
Overview

ACE is an advanced AI-enabled mobile application designed for colleges to manage communication, events, clubs, collaboration, student engagement, and academic notifications in a centralized platform.

The application provides:

Secure authentication for Admin and Students
Department-based communication groups
Intelligent event management system
Club participation and slot booking
QR-based event entry system
AI chatbot assistance and smart summarization
Event reminders and notifications
Resource request management
Exam notifications and announcements
Real-time communication groups
User-friendly modern mobile UI

The project is built using:

React Native (Mobile App)
React.js (Admin Panel)
Node.js
Express.js
MongoDB
REST APIs
Firebase Notifications
Socket.IO
JWT Authentication
QR Code Generator
OpenAI/Gemini/Claude APIs for AI Features
Project Goals

The ACE platform aims to:

Improve communication between students, clubs, faculty, and administration
Simplify event registration and management
Provide centralized access to announcements and resources
Automate department grouping and event eligibility
Improve student engagement through clubs and communities
Use AI for smart communication and summaries
Reduce manual event verification using QR-based entry systems
Core Features
1. User Registration and Authentication
    Roles
    Admin
    Student/User
    Features
    Secure signup/login
    JWT authentication
    Password hashing using bcrypt
    Role-based access
    Forgot password functionality
    Email verification
    Profile management
    Student Registration Fields
    Name
    Roll Number
    Department
    Year
    Email
    Phone Number
    Password
    Admin Features
    Create events
    Manage clubs
    View registrations
    Approve requests
    Send notifications
    View analytics
2. Automatic Department Group Allocation

    After registration:
    
    Students are automatically assigned to department groups
    Example:
    CSE Group
    ECE Group
    IT Group
    Mechanical Group
    Benefits
    Simplified communication
    Department announcements
    Department event filtering
    Academic coordination
3. Home Page Dashboard

    The home page contains:
    
    Upcoming events
    Notifications
    Club highlights
    Event banners
    Exam updates
    Attendance alerts
    AI assistant shortcut
    Recent announcements
    Trending clubs
    Quick navigation cards
    UI Features
    Modern card layout
    Dark/light mode
    Gradient colors
    Smooth animations
    Bottom tab navigation
    Responsive design
4. Intelligent Event Eligibility System

    The system automatically checks eligibility based on:
    
    Department
    Year
    CGPA
    Event category
    Club membership
    Registration limits
    Example
    
    Hackathon eligibility:
    
    CSE/IT students only
    2nd year and above
    Minimum CGPA 7.0
    Advantages
    Prevents invalid registrations
    Saves admin time
    Improves event organization
5. Event Registration Process
    Student Flow
    View event
    Click details
    Check eligibility
    Register for event
    Receive confirmation
    QR code generated
    Admin Flow
    Create event
    Add slots
    Set eligibility
    Monitor registrations
    Manage attendance
6. QR Code Generation for Event Entry

    Each registered participant receives:
    
    Unique QR code
    Event ID
    Registration confirmation
    Event Entry Process
    Admin scans QR code
    Attendance recorded automatically
    Duplicate entries prevented
    Technologies
    react-native-qrcode-svg
    QR scanner integration
7. Structured Communication & Resource Request System
    Features
    Student resource requests
    Complaint system
    Lab request system
    Event approvals
    Faculty communication
    Example Requests
    Seminar hall booking
    Projector request
    Lab access request
    Technical support
8. Event Communication Groups

    After joining an event:
    
    Student added to event discussion group
    Real-time communication enabled
    Event announcements shared
    Reminder notifications sent
    Technologies
    Socket.IO
    Firebase Cloud Messaging
9. AI Chatbot and Smart Summarization System
    AI Features
    Event information assistant
    FAQ chatbot
    Club recommendations
    Smart summaries
    Announcement summarization
    Personalized notifications
    AI Integrations
    OpenAI ChatGPT API
    Gemini API
    Claude API
    Perplexity AI
    Example Questions
    “What events are happening this week?”
    “Summarize tomorrow’s hackathon.”
    “Which clubs are available for CSE students?”
10. Clubs Management System
    Clubs Page
    
    Displays:
    
    All clubs
    Club banners
    Club descriptions
    Member count
    Upcoming activities
    User Flow
    Open clubs page
    View club cards
    Click More Details
    View complete club information
    Click Join
    Select available slot
    Book slot
    Join club group chat
    Receive reminders and updates
    Club Features
    Technical clubs
    Cultural clubs
    Sports clubs
    Photography clubs
    Innovation clubs
    Group Chat Features
    Real-time messaging
    Event reminders
    File sharing
    Polls and announcements
11. Notification & Exam Information System
    Notifications
    Event reminders
    Registration confirmations
    Club updates
    Emergency alerts
    Exam schedules
    Placement notifications
    Exam Information
    Timetables
    Hall ticket updates
    Exam reminders
    Result notifications
    Technology
    Firebase Push Notifications
