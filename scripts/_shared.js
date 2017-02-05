//var fs = Promise.promisifyAll(require('fs-extra')); // adds Async() versions that return promises
var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Promise = require('bluebird'),
    fs = require('fs-extra'),
    path = require('path'),
    _ = require('lodash'),
    URI = require('urijs'),
    request = require('request-promise'),
    isBinaryFile = require('isbinaryfile'),
    prettify = require('./lib/prettify'),
    htmlParser = require('./lib/htmlParser'),
    slugify = require('./lib/slugify'),
    toMarkdown = require('to-markdown');
    
var ensureDirectoryExists = function (filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
};

var downloadUrlToFileAsync = (function (url, dest) {
    
    return new Promise(function(resolve, reject) {
        var output = { url: url };
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
                      contentLength: response.headers['content-length']});
                      
            if(dest) {
                ensureDirectoryExists(dest);
                var fsw = fs.createWriteStream( dest );
                fsw.on('finish', function () {
                    output.file = dest;
                    if(!isBinaryFile.sync(dest)) output.data = fs.readFileSync(dest, 'utf-8');
                    resolve(output);
                });
                fsw.on('error', function(err) {
                    output.error = err.message;
                    resolve(output);
                });
                response.pipe( fsw );
            }
            
        })
        .then(function(data) {
            if(!dest) {
                output.data = data;
                resolve(output);
            }
        })
        .catch(function(err) {
            output.error = err.message;
            resolve(output);
        });
    });
    
});

/*
    urls: previously downloaded urls
    rootUrl: root url of the domain against which all relative urls should be normalized
    rootUrlVariants: variants of the root url that should be transformed to the rootUrl
    maxDepth: the maximum depth we are willing to recurse
    url: url to download
    depth: depth of the node based on the root url downloaded
    dir: root directory where content should be downloaded
    file: name of the file to download the url to relative to the dir (i.e.: assets/images/xyz.png, pages/about.html)
 */
/*  urls is populated as follows:
    urls = {
        'http://www.mycompany.com/abc/def.html': {
            url: 'http://www.mycompany.com/abc/def.html',
            external: false,
            contentType: 'text/html'
            contentLength:
            file: '/file/on/the/system',
            raw: // raw contents of the file if css/js/html
            
            page: {
                html: (improved html, prettified with links made absolute),
                title:
                description:
                keywords: [],
                slug: // a slug of the title (url ready)
                links: [
                    { 
                      url: 
                      text: 
                      file: 
                    }
                ],
                styles: []
                scripts: []
                images: []
                media: []
            }
        }
    }
 */
var scrape = async (function (urls, rootUrl, rootUrlVariants, maxDepth, url, depth, dir, file) {
    // if the url has already been processed, don't bother processing it again
    if(urls[url]) return;
    // conform to max depth constraint
    if(depth > maxDepth) { console.log('max depth reached (' + depth + ')'); return; }
    
    // add the url to the urls list
    var data = { url: url };
    urls[url] = data;
    var rootUri = new URI(rootUrl);
    var uri = new URI(url);
    
    // only download internal urls matching the root url domain
    data.external = (uri.origin().toLowerCase() !== rootUri.origin().toLowerCase());
    if(data.external) return;
    
    // DEBUG
    console.log('downloading ' + url);
    
    // the following is what we expect 'output to look like'
    /*
      { url: 'http://www.covenantclassicalschool.org',
        statusCode: 200,
        contentType: 'text/html',
        contentLength: '14950',
        file: '/home/ubuntu/workspace/content/html/index.html',
        data: ''
        error: '' }
     */
    var output = await (downloadUrlToFileAsync(url, path.resolve(dir, file)));
    if(output.error) { console.log('unable to download url ' + url + ': ' + output.error); return; }
    
    data.contentType = output.contentType;
    data.contentLength = output.contentLength;
    data.file = path.relative(dir, output.file);
        
    if(data.contentType.indexOf('text/html') >= 0 ||
       data.contentType.indexOf('text/css') >= 0 ||
       data.contentType.indexOf('text/javascript') >= 0 ||
       data.contentType.indexOf('application/javascript') >= 0) {
        data.raw = output.data;
    }
    if(data.contentType.indexOf('text/html') < 0) return;
    
    // prettify the html
    data.page = htmlParser(prettify(data.raw), {
        url: rootUrl, variants: rootUrlVariants
    });
    data.page.url = url;
    if(data.page.html && data.page.html.length > 0) {
        //data.page.html = prettify(data.page.html);
        fs.writeFileSync(output.file, data.page.html, 'utf8');
    }
    
    // DOWNLOAD ALL PAGE ASSETS
        
    _.each(data.page.styles || [], function(l) {
        var lf = path.resolve(dir, 'assets/css', _.trimStart(new URI(l).pathname(), '/'));
        await (scrape(urls, rootUrl, rootUrlVariants, maxDepth, l, depth + 1, dir, lf));                
    })
    
    _.each(data.page.scripts || [], function(l) {
        var lf = path.resolve(dir, 'assets/js', _.trimStart(new URI(l).pathname(), '/'));
        await (scrape(urls, rootUrl, rootUrlVariants, maxDepth, l, depth + 1, dir, lf));                
    })
    
    _.each(data.page.images || [], function(l) {
        var lf = path.resolve(dir, 'assets/img', _.trimStart(new URI(l).pathname(), '/'));
        await (scrape(urls, rootUrl, rootUrlVariants, maxDepth, l, depth + 1, dir, lf));                
    })
    
    _.each(data.page.media || [], function(l) {
        var lf = path.resolve(dir, 'assets/media', _.trimStart(new URI(l).pathname(), '/'));
        await (scrape(urls, rootUrl, rootUrlVariants, maxDepth, l, depth + 1, dir, lf));                
    })
    
    // NOW, DOWNLOAD SUB PAGES
    
    _.each(data.page.links || [], function (l, lidx) {
        if(l.url && l.url.startsWith('http') && l.text && l.text.length > 0) {
            var luri = new URI(l.url);
            var lparts = _.filter(luri.pathname().split('/'), function(p) {
               return p.length > 0;  
            })
            if(lparts.length > 0 && lparts[0].length > 0) {
                var uname = luri.pathname();
                if(luri.search() && luri.search().length > 0) {
                    var lparts = _.filter(luri.pathname().split('/'), function(p) {
                       return p.length > 0;  
                    })
                    if(luri.search() && luri.search().length > 0) {
                       lparts[lparts.length - 1] += luri.search();
                    }
                    var lparts = _.map(lparts, function(lpart) {
                        return slugify(lpart);
                    });
                    uname = lparts.join('/');
                };
                var acceptableExtensions = ['.pdf', '.html'];
                var pext = path.extname(uname);
                if(!pext || 
                    pext === '' || 
                    acceptableExtensions.indexOf(pext) === -1) {
                    if(_.endsWith(uname, '/')) uname += 'index';
                    uname += '.html';
                }
                l.file = 'html/' + uname;
                await (scrape(urls, rootUrl, rootUrlVariants, maxDepth, l.url, depth + 1, dir, path.resolve(dir, l.file)));  
            }              
        }
    })

    fs.writeFileSync(output.file + '.json', JSON.stringify(data.page, null, '  '), 'utf8');
});

var output = _.merge({
    scrape: scrape
}, require('../site.config.js'));

module.exports = output ;