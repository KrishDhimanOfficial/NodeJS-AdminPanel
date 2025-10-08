# NodeJS Admin Panel

![alt text](<Screenshot 2025-10-08 at 7.37.27 PM.png>)

A powerful, dynamic CRUD (Create, Read, Update, Delete) admin panel built with Node.js, Express, MongoDB, and EJS templating. This project features automatic model generation, dynamic route creation, and a modern admin interface.

## 🚀 To Create Project
```bash
 npx create-admin-panel your-project-name 
```

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

## 📁 Folder Structure

```text
/ (project root)
├─ app.js
├─ index.js
├─ package.json
├─ package-lock.json
├─ README.md
├─ sample.env
├─ bin/
│  └─ www
├─ config/
│  ├─ auth.strategy.js
│  ├─ config.js
│  └─ connectDB.js
├─ controllers/
│  ├─ adminPanel.controller.js
│  ├─ auth.controller.js
│  └─ crud.controller.js
├─ middleware/
│  ├─ auth.middleware.js
│  ├─ multer.middleware.js
│  └─ setUniversalData.middleware.js
├─ models/
│  ├─ admin.model.js
│  ├─ author.model.js
│  ├─ category.model.js
│  ├─ post.model.js
│  ├─ sturcture.model.js
│  ├─ subcategory.model.js
│  └─ tag.model.js
├─ routes/
│  ├─ server.routes.js   # Admin routes (mounted at /admin)
│  └─ site.routes.js     # Public/site routes
├─ services/
│  ├─ generateJWT.service.js
│  ├─ initadmin.js
│  ├─ transport.service.js
│  └─ validate.service.js
├─ utils/
│  ├─ crudGenerator.utils.js
│  ├─ generateRoutes.utils.js
│  ├─ handlepagination.utils.js
│  ├─ handleRemoveRecord.utils.js
│  ├─ registerModel.utils.js
│  └─ removeFile.utils.js
├─ tools/
│  └─ createModeFile.tool.js
├─ assets/
│  ├─ css/
│  │  ├─ all.min.css
│  │  └─ app.css
│  ├─ images/
│  │  ├─ default.png
│  │  └─ user.png
│  ├─ js/
│  │  ├─ Fetch.js
│  │  ├─ main.js
│  │  └─ variable.js
│  └─ vendor/
│     ├─ adminlte/
│     │  ├─ adminlte.min.css
│     │  └─ adminlte.min.js
│     ├─ bootstrap/
│     │  ├─ css/bootstrap.min.css
│     │  └─ js/{bootstrap.bundle.min.js, bootstrap.min.js}
│     ├─ iconpicker/
│     │  ├─ fontawesome-iconpicker.min.css
│     │  └─ fontawesome-iconpicker.min.js
│     ├─ jquery/
│     │  └─ jquery.min.js
│     ├─ notify/
│     │  ├─ notify.css
│     │  └─ notify.js
│     ├─ pace-progress/
│     │  ├─ pace-theme-flat-top.css
│     │  └─ pace.min.js
│     ├─ select2/
│     │  ├─ css/select2.min.css
│     │  └─ js/{select2.full.min.js, select2.min.js}
│     ├─ summernote/
│     │  ├─ summernote.min.css
│     │  └─ summernote.min.js
│     └─ tabulator/
│        ├─ css/{tabulator.min.css, tabulator_semanticui.min.css}
│        └─ js/{tabulator.min.js, tabulator.js, xlsx.min.js, jspdf.min.js, autotable.min.js}
├─ uploads/                 # Local uploads (non-persistent on serverless)
│  ├─ admin/
│  └─ post/
├─ views/
│  ├─ layout.ejs
│  ├─ dashboard.ejs
│  ├─ error.ejs
│  ├─ login.ejs
│  ├─ emailTemplate.html
│  ├─ rate-limit.html
│  ├─ partials/
│  │  ├─ 404.ejs
│  │  ├─ alert.ejs
│  │  ├─ dangermodal.ejs
│  │  ├─ footer.ejs
│  │  ├─ sidebar.ejs
│  │  └─ table.script.ejs
│  ├─ Admin_profile/profile.ejs
│  ├─ author/{create.ejs, update.ejs, view.ejs}
│  ├─ category/{create.ejs, update.ejs}
│  ├─ post/{create.ejs, update.ejs}
│  ├─ subcategory/
│  ├─ tag/{create.ejs, update.ejs}
│  └─ user/{create.ejs, update.ejs, view.ejs}
└─ node_modules/
```