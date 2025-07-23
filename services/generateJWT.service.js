import { JsonWebToken } from "jsonwebtoken"
import config from "../config/config.js"

const jwt = {
    generateToken: (_id) => {
        return JsonWebToken.sign({ _id: _id }, config.jwt_key, {
            algorithm: 'HS256',
            expiresIn: '4h'
        })
    },

    verifyToken: (token) => {
        return JsonWebToken.verify(token, config.jwt_key)
    }
}

export default jwt