import multer from 'multer'
import path from 'path'
import fs from 'fs'

const DEFAULT_SIZES = {
    image: 1 * 1024 * 1024, // 1MB
    file: 5 * 1024 * 1024  // 5MB
}

const createStorage = (dir) => {
    const uploadPath = path.join('uploads', dir)
    // Ensure the folder exists
    if (!fs.existsSync(uploadPath)) fs.mkdir(uploadPath, { recursive: true });

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `./uploads/${dir}`)
        },
        filename: (req, file, cb) => {
            const randomNo = Math.round(Math.random() * 10)
            const newFileName = `${Date.now()}${randomNo}${path.extname(file.originalname)}`;
            cb(null, newFileName)
        }
    })
}

const imageFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()

    if (!allowedExtensions.includes(ext)) { // Check file extension
        return cb(new Error('only jpg, png, webp, files are allowed'), false)
    }
    cb(null, true)
}

const fileFilter = (req, file, cb) => {
    file.stream?.on('data', chunk => {
        file._size = (file._size || 0) + chunk.length;

        const checkDocs = (file.fieldname === 'image' && file._size > imageMaxSize) ||
            (file.fieldname === 'resume' && file._size > resumeMaxSize)
        if (checkDocs) {
            return cb(
                new multer.MulterError('LIMIT_FILE_SIZE', `${file.fieldname} exceeds size limit`),
                false
            )
        }
    })
    cb(null, true) // Accept initially — we'll check as data streams in
}

export const handlemulterError = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.json({ error: err.message })
    } else if (err) {
        // Custom error occurred when uploading.
        return res.json({ error: err.message })
    } else {
        next()
    }
} // Error handling middleware

export const rendermulterError = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        req.session.errors = { image: { message: err.message } }
        return res.redirect(req.originalUrl)
    } else if (err) {
        // Custom error occurred when uploading.
        req.session.errors = { image: { message: err.message } }
        return res.redirect(req.originalUrl)
    } else {
        next()
    }
} // Error handling middleware

export const upload = (folderName = '',
    sizeOptions = { imageSIZE: DEFAULT_SIZES.image, fileSIZE: DEFAULT_SIZES.file },
    options = { image: true, file: false }
) => {
    return multer({
        storage: createStorage(folderName),
        limits: {
            fileSize: Math.max(
                options.image ? sizeOptions.imageSIZE || DEFAULT_SIZES.image : 0,
                options.file ? sizeOptions.fileSIZE || DEFAULT_SIZES.file : 0
            )
        },
        fileFilter: options.image ? imageFilter : fileFilter
    })
}