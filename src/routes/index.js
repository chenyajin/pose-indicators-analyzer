// import BaseController from '../controllers/base'
// import IndicatorsController from '../controllers/indicators'
const IndicatorsController = require('../controllers/indicators')

module.exports = function (app) {
  // app.use(BaseController)
  app.use('/indicators', IndicatorsController)
}
