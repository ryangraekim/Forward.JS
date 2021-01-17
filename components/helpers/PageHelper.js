const fs = require("fs");

module.exports = {
    getAbsolutePath: function(path) {
        return `${__rootPath}/${path}`;
    },
    getPageWithLayout: function(request, response, layoutName, viewPath, params) {
        let layoutPath = `${__rootPath}/resources/views/layout/${layoutName}/page.ejs`;
        
        if(!fs.existsSync(layoutPath)) {  this.throwPageWithAlertMessage(response, '', '', `${layoutName} 레이아웃이 없습니다.`); return; }
        if(!fs.existsSync(viewPath)) { response.status(404); this.throwPageWithAlertMessage(response, '', '', '뷰 페이지가 없습니다.'); return; }
        
        response.render(layoutPath, {
            displayPath: __rootPath,
            displayLayoutName: layoutName,
            displayViewPath: viewPath,
            params: params
        });
    },
    throwPageWithAlertMessage: function(response, url, target, message, params) {
        response.render(forward.config.web.page.alert, Object.assign({url, target, message, method: 'get'}, params));
    }
}