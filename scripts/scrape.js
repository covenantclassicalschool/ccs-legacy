var lib = require('./_shared'),
    fs = require('fs-extra'),
    path = require('path'),
    URI = require('urijs'),
    
    content = require('./content'),
    
    urls = {}, // list of processed urls
    dest = lib.dirs.content;

var indexJson = path.resolve(dest, 'index.json');
if(!fs.existsSync(indexJson)) {
    lib.scrape( urls, 
                lib.urls.site, 
                lib.urls.variants,
                lib.maxDepth,
                lib.urls.site,
                0,
                dest,
                'index.html' )
        .then(function() {
            fs.writeFileSync(indexJson, JSON.stringify(urls, null, '  '), 'utf8');
            content(urls, dest);
            console.log('DONE!!');
        });
} else {
    content(require(indexJson), dest);
    console.log('DONE!!');
}