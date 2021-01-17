const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const createError = require('http-errors');
const methodOverride = require('method-override');
const parse_filepath = require('parse-filepath');
const logger = require(__loggerPath);
const useragent = require('express-useragent');
const Sequelize = require('Sequelize');

module.exports = {
    setMiddlewareConfig: function(app) {
        app.set('views', __rootPath);
        app.set('view engine', 'ejs');
        app.set('env', 'release');
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        app.use(cookieParser());
        app.use(methodOverride('_method'));
        app.use(morgan(function (tokens, req, res) {
            let url = tokens.url(req, res);
            if(parse_filepath(url).ext.length > 0) { return; }

            if(!forward.config.logger.global.weblog) { return; }

            logger.debug(`[${tokens.method(req, res)}] ${url} ${tokens.status(req, res)}`);
        }));

        app.use(useragent.express());

    },
    webIndexConfig: function(app) {
        app.all('/', function(req, res) { res.redirect(forward.config.web.link.index); });
        app.all('/favicon.ico', function(req, res) { res.redirect(forward.config.web.link.favicon); });  
    },
    setErrorHandler: function(app) {
        app.use(function(req, res, next) {
            next(createError(404));
        });
        
        app.use(function(err, req, res, next) {
            let errStatus = err.status || 500;
            let errorPage = forward.config.web.page.error.notFound;

            if(req.originalUrl.indexOf("/openapi/data") != -1){
                res.status(errStatus);
                res.json({status: errStatus, message: 'API SERVICE OCCURED ERROR. PLEASE TRY AGIN.'});
            } else {
                if(errStatus != 404) { 
                    logger.error(err.message, err.stack); 
                    errorPage = forward.config.web.page.error.exception;
                }
    
                res.status(errStatus);
                res.render(errorPage, { status: errStatus, message: err.message, stack: err.stack });
            }
        });
    },
    registModel: function(currentApplication) {
        let modelCnt = 0;
        let modelPath = path.join(__rootPath, currentApplication.path, 'models');
        
        if(!fs.existsSync(modelPath)) { return; }
        fs.readdirSync(modelPath).forEach(function(modelEntry) {
            require(path.join(modelPath, modelEntry))(forward.database.sequelize, Sequelize.DataTypes);
            logger.debug(`${currentApplication.name} 애플리케이션의 ${parse_filepath(modelEntry).name} 모델을 등록하였습니다.`)
            modelCnt++;
        });

        return modelCnt;
    },
    registRouter: function(app, currentApplication) {
        let routerCnt = 0;
        let applicationRoutesPath = path.join(__rootPath, currentApplication.path, 'routes');
        if(!fs.existsSync(applicationRoutesPath) || currentApplication.url.path == null) { return; }

        currentApplication.url.list = new Array();
        fs.readdirSync(applicationRoutesPath).forEach(routerEntry => {
            if(fs.statSync(path.join(applicationRoutesPath, routerEntry)).isDirectory()) { return; }

            let url = `${forward.config.web.server.contextPath}${currentApplication.url.path}`.replace(/\/\//g, '/');
            let router = require(path.join(__rootPath, currentApplication.path, 'routes', routerEntry));
            app.use(url, router);

            function registRoutingURL(url) {
                currentApplication.url.list.push(url);
                logger.debug(`${currentApplication.name} 애플리케이션의 라우터 주소 ${url} 을 매핑하였습니다.`);
            }
            
            router.stack.forEach(function(routingUrl) {
                let routeUrl = routingUrl.route.path;
                if(Array.isArray(routeUrl)) {
                    routeUrl.forEach(function(routingUrlEntry) {
                        registRoutingURL((url+routingUrlEntry).replace(/\/\//g, '/'));
                    });
                } else {
                    registRoutingURL((url+routeUrl).replace(/\/\//g, '/'));
                }
            });

            routerCnt++;
        });

        return routerCnt;
    }
}