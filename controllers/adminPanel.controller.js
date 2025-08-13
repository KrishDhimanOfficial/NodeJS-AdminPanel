import bcrypt from 'bcrypt'
import adminModel from "../models/admin.model.js"
import validate from "../services/validate.service.js";
import { deleteFile } from "../utils/removeFile.utils.js";

const adminPanelController = {
    renderAdminProfile: async (req, res) => {
        try {
            const response = await adminModel.findById({ _id: req.user._id })
            return res.render('Admin_profile/profile', {
                title: 'Admin Profile',
                api: req.originalUrl,
                active: true ? 'active' : '',
                updatapassword: `${req.baseUrl}/update/password`,
                admin: response,
            })
        } catch (error) {
            console.log('renderAdminProfile : ' + error.message)
        }
    },
    updateAdminProfile: async (req, res) => {
        try {
            if (req.file?.filename) req.body[req.file.fieldname] = req.file.path;
            const response = await adminModel.findByIdAndUpdate(
                { _id: req.user._id },
                { $set: req.body },
                { runValidators: true }
            )

            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            if (req.file?.filename) await deleteFile(response[req.file.fieldname])

            return res.status(200).json({ success: 'profile updated successfully.' })
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            if (req.file?.filename) await deleteFile(req.file.path)
            console.log('updateAdminProfile : ' + error.message)
        }
    },
    updateAdminPassword: async (req, res) => {
        try {
            const admin = await adminModel.findById({ _id: req.user._id })

            const isMatch = await bcrypt.compare(req.body.oldpassword, admin.password)
            if (!isMatch) return res.status(400).render('Admin_profile/profile', {
                title: 'Admin Profile',
                api: req.originalUrl,
                admin,
                pactive: true ? 'active' : '',
                error: 'Password does not match.',
                updatapassword: `${req.baseUrl}/update/password`
            })

            const response = await adminModel.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { password: await bcrypt.hash(req.body.password, 10) } },
                { new: true, runValidators: true }
            )
            if (!response) return res.status(200).render('Admin_profile/profile', {
                title: 'Admin Profile',
                api: req.originalUrl,
                admin,
                pactive: true ? 'active' : '',
                error: 'Something went wrong, please try again later.',
                updatapassword: `${req.baseUrl}/update/password`
            })
            return res.status(200).redirect(`${req.baseUrl}/profile`)
        } catch (error) {
            console.log('updateAdminPassword : ' + error.message)
        }
    },
}

export default adminPanelController