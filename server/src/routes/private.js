const services = require('../services');
const router = require('express').Router();
const AuthService = new services.Auth();
router.use(AuthService.authorize);
require('./sampleRoutes')(router);
require('./AuthRoutes')(router);
require('./ActivityRoutes')(router);
require('./TagRoutes')(router);
require('./TimeRoutes')(router);
require('./FriendRoutes')(router);
require('./GroupRoutes')(router);
require('./DeviceRoutes')(router);
require('./SubscriberRoutes')(router);
require('./SharedRoutes')(router);
require('./StatsRoutes')(router);
module.exports = router;
