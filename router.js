var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('router:plus');
var util = require('util');

function RouterPlus(directory){
    // Looks in default "controller" directory at lib 
    this.directory = directory || './lib/controller';
    this.router = require('koa-router')();
    if (!(this instanceof RouterPlus)) {
        return new RouterPlus(directory);
    }
};

RouterPlus.prototype.routes = function(){
    return this.router.routes();
};

// Return promise consisting of object built from contents of files
RouterPlus.prototype.buildControllers = function(){
    return new Promise(function (resolve, reject) {
        var directory = this.directory;
        var controllers = {};
        fs.readdir(directory, function (err, files) {
            if (err) return reject(err);
            async.each(files, function(item, callback){
                var controllerName = path.basename(item, '.js');
                controllers[controllerName] = require('../.'+directory+'/'+item);
                callback();
            }, function(err){
                if (err) reject(err);
                resolve(controllers);
            });
        });
    });
};

// Calls buildControllers to build controller object
// and to assign object to the Koa context and to the controller object
RouterPlus.prototype.initialize = function(){
    var RouterPlus = this;
    return function* (next){
        ctx = this;
        ctx.controllers = RouterPlus.ctrl = yield RouterPlus.buildControllers();
        yield* next;
    };
};

RouterPlus.prototype.functionExists = function(funcName) {
    debug("Controller info: "+ util.inspect(this.ctrl));
    debug("Function name: "+funcName);
    var funcParts = funcName.split('.');
    var funcTmp = ''
    for(var i in funcParts) {
        if(funcTmp=='') {
            funcTmp += funcParts[i];
        } else {
            funcTmp += '.'+funcParts[i];
        }
        if( typeof eval("this.ctrl."+funcTmp) === 'undefined' ) {
            return false;
        }
    }
    return typeof eval("this.ctrl."+funcName) === 'function';
}

RouterPlus.prototype.initialCtrl = function() {
    var RouterPlus=this;
    this.router.get("*", function *(next){
        var ctx=this;
        var urlPat=/\/([^/?#.]+)/g;
        var funcName='';
        while((funcTmp=urlPat.exec(ctx.request.url))!=null) {
            if(funcName=='') {
                funcName += funcTmp[1];
            } else {
                funcName += '.'+funcTmp[1];
            }
        }
        // default
        funcName=funcName||"index.index";
        if (RouterPlus.functionExists(funcName)) {
            eval("RouterPlus.ctrl."+funcName)(ctx);
        } else if(RouterPlus.functionExists(funcName+".index")) {
            eval("RouterPlus.ctrl."+funcName+".index")(ctx);
        } else {
            // 404
        }
    })
    return this.initialize();
}

module.exports=function(directory) {
    return RouterPlus(directory);
}
