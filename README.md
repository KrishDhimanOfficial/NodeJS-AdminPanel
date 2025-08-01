# NodeJS Admin Panel

A powerful, dynamic CRUD (Create, Read, Update, Delete) admin panel built with Node.js, Express, MongoDB, and EJS templating. This project features automatic model generation, dynamic route creation, and a modern admin interface.

## 🚀 Features

### **Core Features**
- ✅ **Dynamic CRUD Generation** - Create database models and views on-the-fly
- ✅ **Authentication System** - Secure login with Passport.js and session management
- ✅ **File Upload Support** - Image and file handling with Multer
- ✅ **Responsive UI** - Modern admin interface with AdminLTE and Bootstrap
- ✅ **Data Tables** - Advanced data display with Tabulator.js
- ✅ **Rich Text Editor** - Content editing with Summernote
- ✅ **Search & Filter** - Advanced data filtering and search capabilities
- ✅ **Export Functionality** - PDF and Excel export options

### **Advanced Features**
- ✅ **Dynamic Model Creation** - Generate Mongoose schemas automatically
- ✅ **Auto-generated Views** - Create, update, and view pages generated dynamically
- ✅ **RESTful API** - Complete CRUD API endpoints for each model
- ✅ **Real-time Validation** - Form validation and error handling
- ✅ **Image Preview** - File upload with preview functionality
- ✅ **Pagination** - Efficient data pagination
- ✅ **Security** - CSRF protection, rate limiting, and input sanitization

## 🏗️ Architecture

### **Technology Stack**

#### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Compression** - Response compression

#### **Frontend**
- **EJS** - Template engine
- **AdminLTE** - Admin dashboard theme
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **Tabulator.js** - Data tables
- **Summernote** - Rich text editor
- **Select2** - Enhanced select dropdowns
- **jQuery** - DOM manipulation

### **Project Structure**
```
AdminPanel/
├── app.js                 # Main Express application
├── config/               # Configuration files
│   ├── config.js        # Environment variables
│   ├── auth.strategy.js # Passport authentication
│   └── connectDB.js     # MongoDB connection
├── controllers/          # Business logic
│   ├── auth.controller.js
│   ├── adminPanel.controller.js
│   └── crud.controller.js
├── middleware/           # Express middleware
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│   └── setUniversalData.middleware.js
├── models/              # Mongoose schemas
│   ├── admin.model.js
│   ├── user.model.js
│   ├── tag.model.js
│   └── sturcture.model.js
├── routes/              # Route definitions
│   └── server.routes.js
├── utils/               # Utility functions
│   ├── crudGenerator.utils.js
│   └── generateRoutes.utils.js
├── views/               # EJS templates
│   ├── layout.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   └── [dynamic views]
├── assets/              # Frontend assets
│   ├── css/
│   ├── js/
│   └── vendor/
└── uploads/             # File uploads
```