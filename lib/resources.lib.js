import userModel from "../models/user.model.js"
import adminModel from "../models/admin.model.js"
// import tagModel from '../models/tag.model.js'
import { upload } from "../middleware/multer.middleware.js"

 export const aggregation = {
    post: (req, res) => [],
    author: (req, res) => [],
    comment: (req, res) => []
}

const resources = [
//     {
//         model: userModel,
//         options: {
//             check: 'email',
//             isVisible: { name: true, },
//             list: [
//                 { col: 'name', filter: 'search' },
//                 { col: 'email', filter: 'search' },
//                 {
//                     col: 'actions',
//                     actions: {
//                         edit: true,
//                         del: true,
//                         view: true
//                     }
//                 }
//             ],
//         },
//         select2: [
//             {
//                 model: adminModel,
//                 searchField: 'name',
//             }
//         ],
//         multer: () => upload('userImage').array('image', 2),
//         navigation: {
//             name: 'Peoples',
//             icon: 'fas fa-users',
//             subMenu: [
//                 { model: userModel }
//             ]
//         },
//     },
]

export default resources