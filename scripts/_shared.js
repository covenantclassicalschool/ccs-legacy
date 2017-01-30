var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
//var fs = Promise.promisifyAll(require('fs-extra')); // adds Async() versions that return promises
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var request = require('request-promise');
var isBinaryFile = require('isbinaryfile');

/*
    Exportable variables
 */

/*
    Exportable functions
 */
var ensureDirectoryExists = function (filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

var downloadUrlToFileAsync = (function (url, dest) {
    
    return new Promise(function(resolve, reject) {
        var output = { url: url }
        request({
            method: 'GET',
            uri: url,
            headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19' },
            followRedirect: true
        })
        .on('response', function(response) {
            
            Object.assign(output, {
                      statusCode: response.statusCode, 
                      contentType: response.headers['content-type'], 
                      contentLength: response.headers['content-length']})
                      
            if(dest) {
                ensureDirectoryExists(dest);
                var fsw = fs.createWriteStream( dest );
                fsw.on('finish', function () {
                    output.file = dest
                    if(!isBinaryFile.sync(dest)) output.data = fs.readFileSync(dest, 'utf-8')
                    resolve(output)
                });
                fsw.on('error', function(err) {
                    output.error = err.message
                    resolve(output)
                })
                response.pipe( fsw );
            }
            
        })
        .then(function(data) {
            if(!dest) {
                output.data = data
                resolve(output)
            }
        })
        .catch(function(err) {
            output.error = err.message
            resolve(output)
        })
    })
    
})

var output = {
    downloadUrlToFileAsync: downloadUrlToFileAsync,
    ensureDirectoryExists: ensureDirectoryExists,
    slugify: function (text) {
                return text.toString().toLowerCase()
                    .replace(/\s+/g, '-')           // Replace spaces with -
                    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                    .replace(/^-+/, '')             // Trim - from start of text
                    .replace(/-+$/, '');            // Trim - from end of text
             }
}

Object.assign(output, require('../site.js'))

module.exports = output 