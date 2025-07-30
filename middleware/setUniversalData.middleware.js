import config from '../config/config.js'
import resources from '../lib/resources.lib.js'

const setUniversalData = (req, res, next) => {
    res.locals.baseUrl = req.baseUrl
    res.locals.crudURL = config.crud_url
    res.locals.admin = req.user
    res.locals.navigation = resources
        .filter(resource => resource.navigation !== undefined)
        .map(resource => resource.navigation)
    next()
}

export default setUniversalData