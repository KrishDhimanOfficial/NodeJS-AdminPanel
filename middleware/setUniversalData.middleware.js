import config from '../config/config.js'
import sturctureModel from '../models/sturcture.model.js'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60 }) // 1 min cache

const setUniversalData = async (req, res, next) => {
    const cache_Key = 'navigation';
    let cachedNavigation = cache.get(cache_Key)

    // console.log(config.crud_url, process.env.CRUD_URL);

    if (!cachedNavigation) {
        const data = await sturctureModel.find({}, { navigation: 1, _id: 0 }).lean()
        cache.set(cache_Key, data); // store in cache
        cachedNavigation = data;    // keep actual value
    }

    res.locals.activePage = req.url.split('/')
    res.locals.baseUrl = req.baseUrl
    res.locals.crudURL = config.crud_url
    res.locals.admin = req.user
    res.locals.navigation = cachedNavigation
    next()
}

export default setUniversalData