const applicationInfo = require('../_application.json');
const path = require('path');
const logger = require(__loggerPath);
const express = require('express');
const router = express.Router();
const PageHelper = require('../../../components/helpers/PageHelper');

router.get('/home', async function(req, res, next) {
  logger.debug("Hello Forward.JS");
  PageHelper.getPageWithLayout(req, res, "home", path.join(__dirname, '..', 'views', 'home.ejs'));
});

module.exports = router;
