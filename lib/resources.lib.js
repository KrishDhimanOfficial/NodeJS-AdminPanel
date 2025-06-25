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
        navigation: {
            name: 'Users',
            icon: 'users',
            route: '/resources/users'
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
    }
]

export default resources