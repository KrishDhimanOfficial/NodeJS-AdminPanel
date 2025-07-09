import adminModel from "../models/admin.model.js"

const adminPanelController = {
    renderAdminProfile: async (req, res) => {
        try {
            return res.render('Admin_profile/profile', { layout: 'layout', title: 'Admin Profile' })
        } catch (error) {
            console.log('renderAdminProfile : ' + error.message)
        }
    },
    updateAdminProfile: async (req, res) => {
        try {
            const response = await adminModel.findOneAndUpdate(
                { _id: req.user._id },
                { $set: req.body },
                { new: true, runValidators: true }
            )

            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            return res.status(200).json({ success: 'profile updated successfully.' })
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            console.log('updateAdminProfile : ' + error.message)
        }
    },
}

export default adminPanelController