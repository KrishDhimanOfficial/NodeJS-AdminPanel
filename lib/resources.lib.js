/**
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */

import userModel from "../models/user.model.js"
import adminModel from "../models/admin.model.js"
import postModel from "../models/post.model.js"
import categoryModel from "../models/category.model.js"
import { upload } from "../middleware/multer.middleware.js"

const resources = [
    {
        model: categoryModel,
        multer: () => upload().none(),
        options: {
            check: 'name',
            isVisible: { name: true, status: true },
            list: [
                { col: 'name', filter: 'search' },
                { col: 'status', filter: 'boolean' },
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
    },
    {
        model: postModel,
        multer: () => upload('postImage').single('image'),
        navigation: {
            name: 'Posts',
            icon: 'fa-solid fa-file-lines',
            subMenu: [
                { model: categoryModel },
                { model: postModel }
            ]
        },
        options: {
            check: 'name',
            isVisible: { name: true, slug: true, status: true },
            list: [
                { col: 'name', filter: 'search' },
                { col: 'slug', filter: 'search' },
                { col: 'status', filter: 'boolean' },
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
    },
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


export default resources