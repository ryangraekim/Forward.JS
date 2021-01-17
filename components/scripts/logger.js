const log4js = require("log4js");
const log4js_extend = require("log4js-extend");
const logger = log4js.getLogger();

let configuration = forward.config.logger;
configuration.extend.path = __rootPath;

log4js.configure(configuration.log4js);
log4js_extend(log4js, configuration.extend);

module.exports = logger;
