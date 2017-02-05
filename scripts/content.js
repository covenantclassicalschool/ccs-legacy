var fs = require('fs-extra'),
    path = require('path'),
    _ = require('lodash'),
    toMarkdown = require('to-markdown'),
    cheerio = require('cheerio')
    ;

var externalLinks = [];

var processUrls = function(index, dir) {
    var contentTypes = {};
    _.each(index, function(data, url) {
      if(data.external) {
        externalLinks.push(url);
        return true;
      }
      
      if(!contentTypes[data.contentType]) contentTypes[data.contentType] = [];
      var ct = contentTypes[data.contentType];
      var ci = {
          title: data.url,
          url: data.url,
          size: data.contentLength,
          local: data.file,
      };
      if(data.page) {
        ci.title = data.page.title,
        ci.slug = data.page.slug,
        ci.json = data.file + '.json',
        ci.md = data.file + '.md'
        
        // create the md file
        var mdPath = (fs.existsSync(data.file) ? data.file: path.resolve(dir, data.file)) + '.md';
        var $ = cheerio.load(data.page.html);
        var $content = $('div#content');
        var md = toMarkdown($content.html(), {
            gfm: true,
            converters: [
                    {
                        filter: ['script', 'meta' ],
                        replacement: function(content) {
                            return '';
                        }
                    },
                    {
                        filter: 'span',
                        replacement: function(content) {
                            return '<span>' + content + '</span>';
                        }
                    },
                    {
                        filter: 'div',
                        replacement: function(content) {
                            return content;
                        }
                    }
                ]
        });
        fs.writeFileSync(mdPath, md, 'utf8');
        
      }
      ct.push(ci);
    });
    
    createReadMe(contentTypes, dir);
}

module.exports = processUrls;

var createReadMe = function (cts, dir) {
    
    var str = '';
    str += '# Contents';
    str += '\n\n';
    str += 'Generated on: ' + new Date();
    str += '\n\n';
    _.each(cts, function(v, k) {
       str += '## ' + k;
       str += '\n\n';
       var cis = _.orderBy(v, [ 'title' ]);
        _.each(cis, function(ci) {
           str += '-   [' + ci.title.split('|')[0] + '](' + ci.url + ')';
           str += ' ([src](' + ci.local + ')';
           if(ci.json) str += ', [json](' + ci.json + ')';
           if(ci.md) str += ', [body](' + ci.md + ')';
           str += ', ' + ci.size + ' bytes)'
           str += '\n';
       });
       str += '\n\n';
    });
    str += '## External Links';
    str += '\n\n';
    _.each(externalLinks.sort(), function(l) {
        str += '-   [' + l + '](' + l + ')\n';
    })
    
    fs.writeFileSync(path.resolve(dir, 'README.md'), str, 'utf8');
    
}
