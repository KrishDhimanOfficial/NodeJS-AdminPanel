import userModel from "../models/user.model.js"
import adminModel from "../models/admin.model.js"

const resources = [
    {
        model: userModel,
        options: {
            check: 'email',
            list: [
                { col: 'name', filter: 'search' },
                { col: 'linksActions', filter: false }
            ],
            isVisible: { name: true }
        },
        multer: {
            folder: userModel.modelName,
            type: 'single',
            // options: {
            //     image: true,
            //     limits: { imageSize: 2 * 1024 * 1024 }
            // }
        },
        navigation: {
            name: 'Peoples',
            icon: 'fas fa-users',
            subMenu: [
                { model: adminModel.modelName },
                { model: userModel.modelName }
            ]
        },
        // aggregate: async () => {
        //     const response = await userModel.aggregate([
        //         {
        //             $match: {
        //                 email: 'krish@gmail.com '
        //             }
        //         }
        //     ])
        //     return response
        // }
    },
    {
        model: adminModel,
        options: {
            check: 'email',
            list: [
                { col: 'name', filter: 'search' },
                { col: 'linksActions', filter: false }
            ],
            isVisible: { name: true }
        },
    }
]

export default resources