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

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AdminPanel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp sample.env .env
   ```

4. **Configure environment variables**
   ```env
   PORT=4000
   SERVER_URL=http://localhost:4000
   NODE_ENV=development
   DB_NAME=adminPanel
   MONGODB_URL=mongodb://localhost:27017/adminPanel
   SECURITY_KEY=your-secret-key
   JWT_KEY=your-jwt-key
   MOGO_STORE_SECRET_KEY=your-mongo-store-key
   CRUD_URL=true
   
   # SMTP configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_SERVICE=gmail
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the admin panel**
   ```
   http://localhost:4000/admin
   ```

### **Default Login Credentials**
- **Email**: `admin@gmail.com`
- **Password**: `admin`

## 📖 Usage

### **1. Dashboard**
- Access overview of your system
- View recent activities
- Quick navigation to CRUD operations

### **2. CRUD Management**
- **Create CRUD**: Go to `/admin/crud` to generate new models
- **Manage Data**: Use the generated interfaces to manage your data
- **API Access**: RESTful APIs available for each model

### **3. User Management**
- **Create Users**: Add new users with role-based access
- **Manage Profiles**: Update user information and avatars
- **Role Assignment**: Assign admin or super admin roles

### **4. File Management**
- **Upload Files**: Support for images, documents, and other files
- **Image Preview**: Automatic image preview functionality
- **File Validation**: Size and type validation

### **5. Data Operations**
- **Search**: Advanced search across all fields
- **Filter**: Filter data by various criteria
- **Export**: Export data to PDF or Excel
- **Bulk Operations**: Mass delete and status updates

## 🔌 API Endpoints

### **Authentication**
- `POST /admin/login` - User login
- `GET /admin/logout` - User logout

### **CRUD Operations**
- `GET /admin/resources/:model` - List all records
- `POST /admin/resources/:model` - Create new record
- `PUT /admin/resources/:model/:id` - Update record
- `DELETE /admin/resources/:model/:id` - Delete record
- `PATCH /admin/resources/:model/:id` - Update status

### **API Data**
- `GET /admin/resources/api/:model` - Get JSON data for tables
- `GET /admin/resources/select/api/:model` - Get data for select dropdowns

## 🛠️ Customization

### **Adding New Models**
1. Go to `/admin/crud`
2. Fill out the form with your model details
3. Submit to generate the model and views
4. Access your new CRUD at `/admin/resources/yourmodel`

### **Customizing Views**
- Edit generated EJS templates in `views/[modelname]/`
- Modify layout in `views/layout.ejs`
- Update styles in `assets/css/app.css`

### **Adding Custom Logic**
- Extend controllers in `controllers/`
- Add middleware in `middleware/`
- Create utilities in `utils/`

## 🔒 Security Features

### **Authentication & Authorization**
- Session-based authentication
- Role-based access control
- CSRF protection
- Secure password hashing

### **Data Protection**
- Input sanitization
- MongoDB injection prevention
- File upload validation
- Rate limiting

### **Security Headers**
- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- XSS protection

## 📊 Performance Features

### **Optimization**
- Response compression
- Static file caching
- Database connection pooling
- Efficient pagination

### **Monitoring**
- Request logging
- Error tracking
- Performance metrics
- Database query optimization

## 🧪 Testing

### **Manual Testing**
1. Start the server: `npm run dev`
2. Access: `http://localhost:4000/admin`
3. Test CRUD operations
4. Verify file uploads
5. Check authentication

### **API Testing**
```bash
# Test login
curl -X POST http://localhost:4000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"password"}'

# Test CRUD API
curl http://localhost:4000/admin/resources/api/users
```

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection URL in `.env`
   - Verify database name

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process on port 4000

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check file type restrictions

4. **Authentication Problems**
   - Clear browser cookies
   - Check session configuration
   - Verify admin credentials

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📈 Deployment

### **Production Setup**
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up PM2 for process management

### **Environment Variables**
```env
NODE_ENV=production
PORT=4000
MONGODB_URL=mongodb://your-production-db
SECURITY_KEY=your-production-secret
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **AdminLTE** - Admin dashboard theme
- **Bootstrap** - CSS framework
- **Tabulator.js** - Data table library
- **Summernote** - Rich text editor
- **Font Awesome** - Icon library

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

**Built with ❤️ using Node.js, Express, MongoDB, and modern web technologies.**