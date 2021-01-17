const fs = require('fs');
const path = require('path');
const parse_filepath = require('parse-filepath');
const logger = require(__loggerPath);

module.exports = {
    registConfig: function() {
        logger.info("설정파일 등록을 시작합니다.");
        const CONFIG_PATH = `${__rootPath}/resources/config/`;
        let configFileCnt = 0;
        fs.readdirSync(CONFIG_PATH).forEach(function(configEntry) {
            let name = parse_filepath(configEntry).name;
            try {
                forward.config[name] = JSON.parse(fs.readFileSync(CONFIG_PATH + configEntry));
                logger.debug(`${name} 설정 파일 등록이 완료되었습니다.`);
                configFileCnt++;
            } catch(e) {
                logger.error(`${name} 설정 파일 등록 중 오류가 발생하였습니다.`);
                logger.error(e);
            }
        });

        logger.info(`총 ${configFileCnt}개의 설정파일을 등록하였습니다.`);
    },
    connectDatabase: function() {
        forward.database = new Object();
        // Sequelize 실행
        require('./sequelize');
    }
}