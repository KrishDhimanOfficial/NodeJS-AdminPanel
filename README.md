# NodeJS Admin Panel

![alt text](<Screenshot 2025-10-08 at 7.37.27 PM.png>)

A powerful, dynamic CRUD (Create, Read, Update, Delete) admin panel built with Node.js, Express, MongoDB, and EJS templating. This project features automatic model generation, dynamic route creation, and a modern admin interface.

<!-- ## 🚀 To Create Project
```bash
 npx create-admin-panel your-project-name 
``` -->
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

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 20+
- MongoDB (Atlas connection string recommended)
- npm

### 1) To Create Project
```bash
npx create-admin-panel your-project-name
cd  your-project-name
npm install
```

### 2) Configure environment variables
Copy `sample.env` to `.env` and fill the values:
```bash
cp sample.env .env
```
Required keys (adjust as needed):
- SERVER_URL = https://localhost:3000 (or your domain)
- NODE_ENV = development
- PORT = 3000
- MONGODB_URL = mongodb+srv://<user>:<pass>@<cluster>/<db>
- SECURITY_KEY = <random_string>            # express-session secret
- MOGO_STORE_SECRET_KEY = <random_string>   # connect-mongo crypto
- JWT_KEY = <random_string>
- JWT_REFRESH_KEY = <random_string>
- SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVICE (if sending email)
- CRUD_URL = true|false

### 3) Run locally (development)
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 4) Run in production on your server (PM2)
This repo includes an `ecosystem.config.js`. Typical commands:
```bash
npm start    # pm2 start ./bin/www
pm2 restart 
```

<!-- ### 5) Deploy on Vercel (serverless)
This project is pre-configured with `vercel.json` to run `app.js` as a serverless function.

Steps:
1. Push your repo to GitHub/GitLab
2. Import the project in Vercel Dashboard
3. Set Environment Variables (same as `.env`, at least: SERVER_URL, MONGODB_URL, SECURITY_KEY, MOGO_STORE_SECRET_KEY)
4. No custom build needed; a `vercel-build` script is provided
5. Deploy -->

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
<!-- - On serverless (Vercel), disk is ephemeral. For production, switch to external storage (S3/Cloudinary). Replace `multer.diskStorage` with an adapter, then store returned URLs in MongoDB. -->



## 🔢 Pagination (utils/handlepagination.utils.js)

`utils/handlepagination.utils.js` exposes `handleAggregatePagination(model, aggregation, query, filters)` to paginate any Mongoose model using an aggregation pipeline.

### Usage
```js
import handleAggregatePagination from './utils/handlepagination.utils.js'

// Controller example
export const listPosts = async (req, res) => {
   const query = {
                page: req.query.page,
                limit: req.query.size
            }
  const aggregation = [
    { $match: {} },
    { $sort: { createdAt: -1 } },
    // ... add more stages as needed
  ]

  // Optional UI-driven filters (see below)
  const filters = req.body?.filters || [] // tabulator filters

  const response = await handleAggregatePagination(PostModel, aggregation, query, filters)
  return res.status(200).json(resposne)
}
```

### Query params
- `page` (number, default 1)
- `size` (number, default 10)

### Response shape
```json
{
  "totalDocs": number,
  "totalPages": number,
  "page": number,
  "limit": number,
  "prevpage": boolean,
  "nextpage": boolean,
  "pageCounter": number,
  "collectionData": [/* docs */]
}
```

Notes:
- The helper injects filter stages into your provided aggregation pipeline.
- It relies on `mongoose-aggregate-paginate-v2`; ensure your schema is plugin-enabled if required by your setup, or the model supports `aggregatePaginate`.

## 🗑️ File Deletion Utilities (utils/removeFile.utils.js)

This module provides two helpers to manage files saved on disk (typically in `uploads/`).

### `deleteFile(relativePath)`
Deletes a file by its relative path from project root.

```js
import { deleteFile } from './utils/removeFile.utils.js'

// Example: remove a single file returned by multer
await deleteFile('uploads/post/1734567890.png')
```

Notes:
- `relativePath` should be the path you stored in the DB (e.g., `uploads/...`).
- The function is safe if the file is missing; it returns without throwing.

### `containsImage(document)`
Scans an object/document and detects fields that look like image/file paths based on `config.allowedExtensions`.

```js
import { containsImage } from './utils/removeFile.utils.js'

const doc = {
  name: 'User A',
  avatar: 'uploads/user.jpg',
  gallery: ['uploads/img1.png', 'uploads/img2.webp']
}

const { hasImage, fields } = containsImage(doc)
// hasImage === true
// fields = [
//   { field: 'avatar', type: 'single', value: 'uploads/user.jpg' },
//   { field: 'gallery', type: 'multiple', value: ['uploads/img1.png', 'uploads/img2.webp'] }
// ]
```

Typical usage: when deleting a DB record, first detect and remove any associated files.

```js
import { deleteFile, containsImage } from './utils/removeFile.utils.js'

export const removePost = async (req, res) => {
  const post = await PostModel.findById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Not found' })

  const { hasImage, fields } = containsImage(post.toObject())
  if (hasImage) {
    for (const f of fields) {
      if (f.type === 'single') await deleteFile(f.value)
      if (f.type === 'multiple') {
        for (const p of f.value) await deleteFile(p)
      }
    }
  }

  await post.deleteOne()
  return res.json({ success: true })
}
```

<!-- Serverless note:
- On Vercel, the filesystem is ephemeral. `deleteFile` is still safe to call, but uploaded files should be stored on external storage (S3/Cloudinary). In that case, replace `deleteFile` with the provider's delete API. -->