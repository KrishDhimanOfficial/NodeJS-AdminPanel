import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import config from '../config/config.js'
import { deleteFile } from '../services/removeFile.service.js'

const createStorage = (dir) => {
    const uploadPath = path.join('uploads', dir)

    // Ensure the folder exists
    fs.promises.mkdir(uploadPath, { recursive: true })

    return multer.diskStorage({
        destination: (req, file, cb) => { cb(null, uploadPath) },
        filename: (req, file, cb) => {
            const randomNo = Math.round(Math.random() * 10)
            const newFileName = `${Date.now()}${randomNo}${path.extname(file.originalname)}`;
            cb(null, newFileName)
        }
    })
}

const fileFilter = (req, file, cb) => {
    if (!file || !file.originalname) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Missing file name'), false);
    }

    const ext = path.extname(file.originalname);
    if (!config.allowedExtensions?.includes(ext)) { // Check file extension
        return cb(new Error('Invalid File Format'), false)
    }
    cb(null, true)
}

export const checkSizeLimits = (fieldRules) => async (req, res, next) => {
    try {
        const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules]

        for (const rule of rules) {
            const files = getFilesByField(rule.field_name, req)

            for (const file of files) {
                const limitInBytes = rule?.size * 1024;
                if (file?.size > limitInBytes) {
                    files.forEach(async file => await deleteFile(file.path))
                    return res.status(400).json({
                        error: `${rule.field_name} exceeds ${rule.size}KB size limit`
                    })
                }
            }
        }

        return next()
    } catch (error) {
        console.error('checkSizeLimits:', error.message)
        return res.status(500).json({ error: 'Internal server error during file size check' })
    }
}

// 🔹 Helper: Get matching files by field name
function getFilesByField(fieldName, req) {
    if (req.files?.[fieldName]) return req.files[fieldName]
    if (req.file?.fieldname === fieldName) return [req.file]
    if (Array.isArray(req.files)) {
        return req.files.filter(file => file.fieldname === fieldName)
    }
    return []
}

export const handlemulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
        // A Multer error occurred when uploading.
        return res.status(400).json({ error: 'Too many files.' })
    } else if (err) {
        // Custom error occurred when uploading.
        return res.status(400).json({ error: err.message })
    }
    else if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ error: err.message })
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

export const upload = (folder = '') => {
    return multer({
        storage: createStorage(folder),
        fileFilter
    })
}

export const multerUploader = (config) => {
    switch (config.type) {
        case 'single':
            return upload(config.folder).single(config.field_name)
        case 'fields':
            return upload(config.folder)
                .fields(config.fields?.map(item => ({ name: item.field_name, maxCount: item.count })))
        case 'multi':
            return upload(config.folder).array(config.field_name, config.count)
        default:
            return upload().none()
    }
}