import userModel from "../models/user.model.js"
import adminModel from "../models/admin.model.js"
// import tagModel from '../models/tag.model.js'
import { upload } from "../middleware/multer.middleware.js"

const resources = [
    // {
    //     model: tagModel,
    //     multer: () => upload().none(),
    //     navigation: {
    //         name: 'Tags',
    //         icon: 'fa-solid fa-file-lines',
    //         model: tagModel,
    //     },
    //     options: {
    //         check: 'name',
    //         isVisible: { name: true, status: true },
    //         list: [
    //             { col: 'name', filter: 'search' },
    //             { col: 'status', filter: 'boolean' },
    //             {
    //                 col: 'actions',
    //                 actions: {
    //                     edit: true,
    //                     del: true,
    //                     view: true
    //                 }
    //             }
    //         ],
    //     },
    // },
    {
        model: userModel,
        options: {
            check: 'email',
            isVisible: { name: true, },
            list: [
                { col: 'name', filter: 'search' },
                { col: 'email', filter: 'search' },
                {
                    col: 'actions',
                    actions: {
                        edit: true,
                        del: true,
                        view: true
                    }
                }
            ],
        },
        select2: [
            {
                model: adminModel,
                searchField: 'name',
            }
        ],
        multer: () => upload('userImage').array('image', 2),
        navigation: {
            name: 'Peoples',
            icon: 'fas fa-users',
            subMenu: [
                { model: userModel }
            ]
        },
    },
]

const aggregation = {
    post: (req, res) => [],
    author: (req, res) => [],
    comment: (req, res) => []
}


export default resources