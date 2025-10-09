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
│  |_ sturcture.model.js
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
|  |- createModeFile.tool.js
│  ├─ generateRoutes.utils.js
│  ├─ handlepagination.utils.js
│  ├─ handleRemoveRecord.utils.js
│  ├─ registerModel.utils.js
│  └─ removeFile.utils.js Punjabi
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
├─ uploads/ 
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
└─ node_modules/
```

### 📦 Multer Usage Guide (Detailed)

Your Multer helpers live in `middleware/multer.middleware.js`.

- `upload(folder?)` → configured disk storage under `uploads/<folder>`
- `uploadHandler(config)` → wrapper for single/array/fields
- `checkSizeLimits(rules)` → per-field size checks (KB) + auto-delete if too large
- `handlemulterError` / `rendermulterError` → normalize errors (JSON vs redirect)

#### 1) Single file example
```js
import { upload, handlemulterError } from './middleware/multer.middleware.js'

app.post('/profile',
  upload('admin').single('profile'),
  handlemulterError,
  (req, res) => res.json({ file: req.file })
)
```

#### 2) Multiple files (array)
```js
import { upload, handlemulterError } from './middleware/multer.middleware.js'

app.post('/gallery',
  upload('post').array('images', 5),
  handlemulterError,
  (req, res) => res.json({ files: req.files })
)
```

#### 3) Multiple named fields
```js
import { upload, handlemulterError } from './middleware/multer.middleware.js'

app.post('/compose',
  upload('post').fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 8 }
  ]),
  handlemulterError,
  (req, res) => res.json({ cover: req.files?.cover?.[0], gallery: req.files?.gallery })
)
```

#### 4) Enforce size limits per field
```js
import { upload, handlemulterError, checkSizeLimits } from './middleware/multer.middleware.js'

app.post('/submit',
  upload('post').fields([
    { name: 'thumb', maxCount: 1 },
    { name: 'attachments', maxCount: 10 }
  ]),
  checkSizeLimits([
    { field_name: 'thumb', size: 30 },        // 30 * 10 = 300KB
    { field_name: 'attachments', size: 100 }  // 100 * 10 = 1MB
  ]),
  handlemulterError,
  (req, res) => res.json({ success: true })
)
```

#### 5) Allowed file types
Controlled via `config.allowedExtensions` in `config/config.js`.
```js
allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
```
If the extension is not allowed, the middleware responds with `400 Invalid File Format`.

#### 6) Error handling patterns
- API endpoints: use `handlemulterError` (returns JSON with 400 status)
- Form endpoints: use `rendermulterError` (sets `req.session.errors` then redirects)

```js
import { upload, rendermulterError } from './middleware/multer.middleware.js'
app.post('/form', upload('post').single('image'), rendermulterError, (req, res) => res.redirect('/form/success'))
```

#### 7) Storage & production note
- Files are stored in `uploads/<folder>`; directories are created automatically.
- On serverless (Vercel), disk is ephemeral. For production, switch to external storage (S3/Cloudinary). Replace `multer.diskStorage` with an adapter, then store returned URLs in MongoDB.