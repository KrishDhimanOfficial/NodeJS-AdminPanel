import userModel from "../models/user.model.js"
import adminModel from "../models/admin.model.js"
import { upload } from "../middleware/multer.middleware.js"


const resources = [
    {
        model: userModel,
        options: {
            check: 'email',
            list: [
                { col: 'name', filter: 'search' },
                {
                    col: 'actions', filter: false,
                    actions: {
                        edit: true,
                        delete: true,
                        view: true
                    }
                }
            ],
            isVisible: { name: true }
        },
        multer: () => upload().none(),
        navigation: {
            name: 'Peoples',
            icon: 'fas fa-users',
            subMenu: [
                { model: userModel.modelName }
            ]
        },
        aggregate: async () => {
            const response = await userModel.aggregate([
                {
                    $match: {
                        email: 'krish@gmail.com '
                    }
                }
            ])
            return response
        }
    },
    // {
    //     model: adminModel,
    //     options: {
    //         check: 'email',
    //         list: [
    //             { col: 'name', filter: 'search' },
    //             { col: 'linksActions', filter: false }
    //         ],
    //         isVisible: { name: true }
    //     },
    // }
]

export default resources