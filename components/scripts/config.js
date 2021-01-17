const fs = require('fs');
const path = require('path');

forward = new Object();
forward.config = new Object();

forward.config.global = require('../../resources/config/global.json');
forward.config.logger = require('../../resources/config/logger.json');

__rootPath = forward.config.global.rootPath;
if(!fs.existsSync(__rootPath) || __dirname.toUpperCase() != path.join(__rootPath, 'components', 'scripts').toUpperCase()) { 
    console.error('[오류] /resources/config/global.json에서 올바른 프로젝트 경로를 설정하세요.');
    process.exit(-1);
}

__loggerPath = `${__rootPath}/components/scripts/logger`;
const logger = require(__loggerPath);
logger.info(`${forward.config.global.name} 프로젝트를 시작합니다.`);

const environment = require('./environment');

// 설정 파일 등록
environment.registConfig();

// 데이터베이스 연결
environment.connectDatabase();