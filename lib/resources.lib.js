/**
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */

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
                        del: true,
                        view: true
                    }
                }
            ],
            // isVisible: { name: true }
        },
        multer: () => upload('userImage').array('image', 2),
        navigation: {
            name: 'Peoples',
            icon: 'fas fa-users',
            subMenu: [
                { model: userModel.modelName }
            ]
        },
        // aggregate: (req, res) => [
        //     {
        //         $match: {
        //            email:req.query.email
        //         }
        //     }
        // ]
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