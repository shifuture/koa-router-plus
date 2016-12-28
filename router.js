'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('router:plus');
var util = require('util');
var ctrls = {};

function RouterPlus(directory){
    if (!(this instanceof RouterPlus)) {
        return new RouterPlus(directory);
    }
    // Looks in default "controller" directory at lib 
    this.directory = directory || './lib/controller';
    this.router = require('koa-router')();
    ctrls = this.buildControllersSync(directory);
};

RouterPlus.prototype.routes = function(){
    return this.router.routes();
};

RouterPlus.prototype.buildControllersSync = function(directory){
    var RouterPlus = this;
    var controllers = {};
    var files = fs.readdirSync(directory);
    files.forEach(function(item){
        var stats = fs.statSync(directory+'/'+item); 
        if ( stats.isFile() ) {
            var controllerName = path.basename(item, '.js');
            controllers[controllerName] = require('../.'+directory+'/'+item);
        } else if ( stats.isDirectory() ) {
            controllers[item] = RouterPlus.buildControllersSync(directory+"/"+item);
        }
    });
    return controllers;
}

// Calls buildControllers to build controller object
// and to assign object to the Koa context and to the controller object
RouterPlus.prototype.initialCtrl = function(){
    var RouterPlus = this;
    return function* (next) {
        var ctx = this;
        ctx.controllers = ctrls;
        yield* next;
    };
};

// Check if function exists
RouterPlus.functionExists = function(funcName) {
    debug("Controller info: "+ util.inspect(this.ctrl));
    debug("Function name: "+funcName);
    try {
        return typeof eval("ctrls."+funcName) === 'function';
    } catch(err) {
        debug(err);
        return false;
    }
}

var actionDispatcher  = function *(next){
    var ctx=this;
    var urlPat=/\/([^/?#.]+)/g;
    var funcName='', funcTmp;
    while((funcTmp=urlPat.exec(ctx.request.url))!=null) {
        if(funcName=='') {
            funcName += funcTmp[1];
        } else {
            funcName += '.'+funcTmp[1];
        }
    }
    // default
    funcName=funcName||"index.index";
    var func=null;
    if (RouterPlus.functionExists(funcName)) {
        func=eval("ctrls."+funcName)(ctx);
    } else if(RouterPlus.functionExists(funcName+".index")) {
        func=eval("ctrls."+funcName+".index")(ctx);
    } else {
        // 404
    }     
    if(typeof(func)==='function' && func.constructor.name === 'GeneratorFunction') {
        yield func;
    }
}


// Inital Router and map controller 
RouterPlus.prototype.initialize = function() {
    var RouterPlus=this;
    this.router.get("*", actionDispatcher)
    this.router.post("*", actionDispatcher)
    return this.initialCtrl();
}

module.exports=function(directory) {
    return RouterPlus(directory);
}
