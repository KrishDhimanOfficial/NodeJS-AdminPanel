import { upload } from "../middleware/multer.middleware.js";

const multerUploader = (config) => {
    switch (config.type) {
        case 'single':
            return upload(config.folder, { field: config.field_name, size: config.size, count: config.count })
                .single(config.field_name)
        case 'fields':
            return upload(config.folder, { fields: config.fields })
                .fields(config.fields)
        case 'multi':
            return upload(config.folder, { field: config.field_name, size: config.size, count: config.count })
                .array(config.field_name, config.count)
        default:
            return upload().none()
    }
}

export default multerUploader