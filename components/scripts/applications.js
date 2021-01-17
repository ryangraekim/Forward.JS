const fs = require('fs');
const path = require('path');
const express = require('express');
const parse_filepath = require('parse-filepath');
const logger = require(__loggerPath);
const webConfig = require('./webConfig');
const CoreHelper = require('../helpers/CoreHelper');

const compression = require('compression');

module.exports = {
    getApplicationInfo: function(applicationName) {
        let applicationInfo = null;
        let applicationInfoFilePath = `${__rootPath}/applications/${applicationName}/_application.json`;
        if(!fs.existsSync(applicationInfoFilePath)) { 
            logger.warn(`${applicationName} 애플리케이션 정보 파일이 존재하지 않습니다. 애플리케이션 등록을 건너뜁니다.`);
            return; 
        }

        try {
            applicationInfo = JSON.parse(fs.readFileSync(applicationInfoFilePath));
        } catch(e) {
            CoreHelper.forceProcessKill(`${applicationName} 애플리케이션 정보 파일 분석 중 오류가 발생하였습니다.`, e);
        }

        return applicationInfo;
    },
    registApplication: function(app) {
        app.use(compression());

        forward.applications = new Array();
        let registeredApplicationCnt = {app: 0, model: 0, router: 0};
        logger.info("애플리케이션 등록을 시작합니다.");

        app.use('/assets', express.static(path.join(__rootPath, 'assets')));
        app.use('/upload', express.static(path.join(__rootPath, 'data', 'upload')));
        fs.readdirSync(`${__rootPath}/applications/`).forEach(entry => {
            let applicationInfo = this.getApplicationInfo(entry);
            let applicationPath = `/applications/${entry}`;
            if(applicationInfo == null || !applicationInfo.use) { return; }

            currentApplication = new Object();
            currentApplication.url = new Object();
            currentApplication.name = applicationInfo.name;
            currentApplication.url.path = applicationInfo.path;
            currentApplication.path = applicationPath;
    
            logger.debug(`${applicationInfo.name} [${applicationInfo.version}] 애플리케이션 등록합니다.`);

            // 모델 등록
            let modelCnt = webConfig.registModel(currentApplication);
            if(modelCnt != null && typeof modelCnt == 'number') { registeredApplicationCnt.model += modelCnt; }

            // 라우터 등록
            let routerCnt = webConfig.registRouter(app, currentApplication);
            if(routerCnt != null && typeof routerCnt == 'number') { registeredApplicationCnt.router += routerCnt; }

            registeredApplicationCnt.app++;
            forward.applications.push(currentApplication);
            logger.debug(`${applicationInfo.name} [${applicationInfo.version}] 애플리케이션을 등록하였습니다.`);
        });

        logger.info(`총 ${registeredApplicationCnt.app}개의 애플리케이션 (모델: ${registeredApplicationCnt.model}개, 라우터: ${registeredApplicationCnt.router}개 포함)을 등록하였습니다.`);
    },
    syncDatabase: function() {
        const defaultDatabase = forward.config.database.defaultDatabase;
        const dataFolder = path.join(__rootPath, forward.config.global.dataPath);
        if(fs.existsSync(dataFolder)) { return; }
        
        logger.info('데이터 폴더가 없습니다. 데이터베이스와 동기화 합니다.');
        forward.database.sequelize.sync({force: true}).then(function() {
            logger.info(`${defaultDatabase} 데이터베이스와 동기화되었습니다.`);
            fs.mkdirSync(dataFolder);
        }).catch(function(e) {
            CoreHelper.forceProcessKill(`${defaultDatabase} 데이터베이스와 동기화에 실패하였습니다.\n`, e);
        });
    }
};
