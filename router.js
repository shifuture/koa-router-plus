'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('router:plus');
var util = require('util');

function RouterPlus(directory){
    if (!(this instanceof RouterPlus)) {
        return new RouterPlus(directory);
    }
    // Looks in default "controller" directory at lib 
    this.directory = directory || './lib/controller';
    this.router = require('koa-router')();
    this.ctrl = {}
};

RouterPlus.prototype.routes = function(){
    return this.router.routes();
};

// Built contents of files
RouterPlus.prototype.buildControllers = function(controllers, directory, resolve, reject){
    RouterPlus = this;
    debug(directory);
    fs.readdir(directory, function (err, files) {
        if (err) return reject(err);
        debug(files);
        async.each(files, function(item, callback){
            fs.stat(directory+'/'+item, function(err, stats){
                if (err) reject(err);
                if ( stats.isFile() ) {
                    var controllerName = path.basename(item, '.js');
                    controllers[controllerName] = require('../.'+directory+'/'+item);
                    callback();
                } else if ( stats.isDirectory() ) {
                    controllers[item] = {};
                    RouterPlus.buildControllers(controllers[item], directory+"/"+item, resolve, reject);
                }
                debug(RouterPlus.controllers);
            })
        }, function(err){
            if (err) reject(err);
            resolve(controllers);
        });
    });
};

// Return promise consisting of object
RouterPlus.prototype.buildControllersWrapper = function(directory){
    RouterPlus = this;
    RouterPlus.controllers = {}
    return new Promise(function (resolve, reject) {
        RouterPlus.buildControllers(RouterPlus.controllers, directory, resolve, reject);
    });
};

// Calls buildControllers to build controller object
// and to assign object to the Koa context and to the controller object
RouterPlus.prototype.initialCtrl = function(){
    var RouterPlus = this;
    return function* (next) {
        var ctx = this;
        yield RouterPlus.buildControllersWrapper(RouterPlus.directory);
        ctx.controllers = RouterPlus.ctrl = RouterPlus.controllers;
        yield* next;
    };
};

// Check if function exists
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

// Inital Router and map controller 
RouterPlus.prototype.initialize = function() {
    var RouterPlus=this;
    this.router.get("*", function *(next){
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
        if (RouterPlus.functionExists(funcName)) {
            eval("RouterPlus.ctrl."+funcName)(ctx);
        } else if(RouterPlus.functionExists(funcName+".index")) {
            eval("RouterPlus.ctrl."+funcName+".index")(ctx);
        } else {
            // 404
        }
    })
    return this.initialCtrl();
}

module.exports=function(directory) {
    return RouterPlus(directory);
}
