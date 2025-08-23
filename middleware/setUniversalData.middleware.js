import config from '../config/config.js'
import sturctureModel from '../models/sturcture.model.js'
import NodeCache from 'node-cache'
// import cache from '../services/cache.service.js'

const cache_Key = 'navigation';
const cache = new NodeCache({ stdTTL: 60 * 60 })

const setUniversalData = async (req, res, next) => {
    let cachedNavigation = cache.get(cache_Key)
    // console.log('cachedNavigation :', cachedNavigation);

    if (!cachedNavigation) {
        const data = await sturctureModel.find({}, { navigation: 1, _id: 0 }).lean()
        // console.log('cahe :', data);
        cache.set(cache_Key, data); // store in cache
        cachedNavigation = data;    // keep actual value
    }
    console.log(config.crud_url, process.env.CRUD_URL);

    res.locals.activePage = req.url.split('/')
    res.locals.baseUrl = req.baseUrl
    res.locals.crudURL = config.crud_url
    res.locals.admin = req.user
    res.locals.navigation = cachedNavigation
    next()
}

export default setUniversalData