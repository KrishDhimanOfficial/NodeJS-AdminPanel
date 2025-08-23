import JsonWebToken from "jsonwebtoken"
import config from "../config/config.js"

const jwt = {
    generateToken: (payload) => {
        if (!payload || typeof payload !== 'object') throw new Error('Payload must be an object')
        return JsonWebToken.sign(payload, config.jwt_key, {
            algorithm: 'HS256',
            expiresIn: '4h'
        })
    },

    refreshToken: (payload) => {
        if (!payload || typeof payload !== 'object') throw new Error('Payload must be an object')
        return JsonWebToken.sign(payload, config.jwt_key, {
            algorithm: 'HS256',
            expiresIn: '7d'
        })
    },

    verifyToken: (token) => {
        return JsonWebToken.verify(token, config.jwt_key)
    }
}

export default jwt