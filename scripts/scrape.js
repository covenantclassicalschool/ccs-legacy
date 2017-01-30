var lib = require('./_shared'),
    fs = require('fs-extra'),
    path = require('path'),
    URI = require('urijs'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Promise = require('bluebird'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    
    urls = {};

var domain = new URI(lib.urls.site).domain().toLowerCase();

var processHtmlFile = function(output, processedUrlData) {
  
    if(!output.data || output.data.length == 0) return processedUrlData;
    
    var uri = new URI(output.url)
    var $ = cheerio.load(output.data);
    processedUrlData.page = {};
    processedUrlData.page.title = $('title').text()
    processedUrlData.page.description = $('meta[description]').text()
    processedUrlData.page.keywords = $('meta[keywords]').text().split(',').map(s => s.trim())
    processedUrlData.page.slug = lib.slugify(processedUrlData.page.title.split('|')[0].trim())
    
    // get hrefs
    processedUrlData.page.links = []
    _.each($('a[href]'), function(el, idx) {
        var $el = $(el)
        var href = $el.attr('href')
        var hrefText = $el.text().trim()
        var hrefUri = new URI(href)
        
        // make url absolute
        if(hrefUri.is('relative')) {
            hrefUri = hrefUri.absoluteTo(output.url)
            href = hrefUri.toString()
            $el.attr('href', href)
        }
        
        if(_.startsWith(href, 'http')) {
            if(!_.find(processedUrlData.page.links, { href: href })) {
                processedUrlData.page.links.push({ href: href, text: hrefText, external: (hrefUri.domain().toLowerCase() !== uri.domain().toLowerCase()) })
            }
        }
    })
    
    // get styles
    processedUrlData.page.styles = []
    _.each($("link[rel='stylesheet']"), function(el, idx) {
        var $el = $(el)
        var href = $el.attr('href')
        var hrefText = $el.text().trim()
        var hrefUri = new URI(href)
        
        // make url absolute
        if(hrefUri.is('relative')) {
            hrefUri = hrefUri.absoluteTo(output.url)
            href = hrefUri.toString()
            $el.attr('href', href)
        }
        
        if(_.startsWith(href, 'http')) {
            if(!_.find(processedUrlData.page.styles, { href: href })) {
                processedUrlData.page.styles.push({ href: href, external: (hrefUri.domain().toLowerCase() !== uri.domain().toLowerCase()) })
            }
        }
    })
    
    // get scripts
    processedUrlData.page.scripts = []
    _.each($("script[src]"), function(el, idx) {
        var $el = $(el)
        var href = $el.attr('src')
        var hrefText = $el.text().trim()
        var hrefUri = new URI(href)
        
        // make url absolute
        if(hrefUri.is('relative')) {
            hrefUri = hrefUri.absoluteTo(output.url)
            href = hrefUri.toString()
            $el.attr('src', href)
        }
        
        if(_.startsWith(href, 'http')) {
            if(!_.find(processedUrlData.page.scripts, { src: href })) {
                processedUrlData.page.scripts.push({ src: href, external: (hrefUri.domain().toLowerCase() !== uri.domain().toLowerCase()) })
            }
        }
    })
    
    // get media
    processedUrlData.page.media = []
    _.each($("embed[src], img[src]"), function(el, idx) {
        var $el = $(el)
        var href = $el.attr('src')
        var hrefText = $el.text().trim()
        var hrefUri = new URI(href)
        var alt = $el.attr('alt')
        if(!alt || alt.length == 0) alt = $el.attr('title')
        
        // make url absolute
        if(hrefUri.is('relative')) {
            hrefUri = hrefUri.absoluteTo(output.url)
            href = hrefUri.toString()
            $el.attr('src', href)
        }
        
        if(_.startsWith(href, 'http')) {
            if(!_.find(processedUrlData.page.media, { src: href })) {
                processedUrlData.page.media.push({ src: href, external: (hrefUri.domain().toLowerCase() !== uri.domain().toLowerCase()), alt: alt })
            }
        }
    })
    
    // replace the data and the file with the updated html
    output.data = $.html()
    fs.writeFileSync(output.file, output.data, 'utf8')
    
    return processedUrlData;
}


var recurseAsync = async (function (url, depth, baseDir, relativeFilePath) {
    
    // if the url has already been processed, return it
    if(urls[url]) {
        return;
    }
    
    // conform to max depth constraint
    if(lib.maxDepth < depth) {
        //console.log('Url could not be processed due to max depth (' + depth + '): ' + url) 
        return;
    }
    
    var uri = new URI(url);
    
    // only download the root once
    if(depth > 0 && (uri.pathname() === '/' || uri.pathname() === '')) {
        return;
    }
    
    // only download internal urls
    if(uri.domain().toLowerCase() !== domain) {
        urls[url] = { type: 'html', title: url, url: url, href: url, depth: depth, external: true }
        return;
    }
    
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
    var output = await (lib.downloadUrlToFileAsync(url, path.resolve(baseDir, relativeFilePath)));
    
    var processedUrlData = { url: output.url, statusCode: output.statusCode, error: output.error || null };
    
    //processedUrls[url] = processedUrlData;
    
    if(processedUrlData.error) return processedUrlData;
    
    processedUrlData.contentType = output.contentType;
    processedUrlData.contentLength = output.contentLength; 
    processedUrlData.file = path.relative(baseDir, output.file);
    
    // before we continue, we want to move the file to an appropriate directory
    if(output.contentType.indexOf('text/html') >= 0) {
      processedUrlData = processHtmlFile(output, processedUrlData)
      
      var newFilePath = path.resolve(baseDir, '../pages/', processedUrlData.page.slug, 'index.html'); var nfp = 1;
      while(fs.existsSync(newFilePath)) { newFilePath = path.resolve(baseDir, '../pages/', processedUrlData.page.slug + '_' + nfp++, 'index.html') }
      lib.ensureDirectoryExists(newFilePath)
      fs.writeFileSync(newFilePath, output.data, 'utf8')
      fs.writeFileSync(newFilePath.replace('.html', '.json'), JSON.stringify(processedUrlData, null, '  '), 'utf8')
      var pidx = newFilePath.indexOf('/pages/') + 1
      var pl = newFilePath.lastIndexOf('/') + 1
      urls[output.url] = { 
        type: 'html',
        depth: depth,
        url: output.url, 
        href: newFilePath.substring(pidx, pl),
        title: processedUrlData.page.title.split('|')[0].trim(),
        slug: processedUrlData.page.slug,
        external: false
      }
      
      // process styles
      _.each(processedUrlData.page.styles || [], function(style, styleIndex) {
          if(!urls[style.href] && !style.external) {
              var relativePath = _.trimStart(new URI(style.href).pathname(), '/')
              if(!_.endsWith(relativePath, '.css')) relativePath += '.css'
              var styleOutput = await (lib.downloadUrlToFileAsync(style.href, path.resolve(baseDir, '../assets/css/', relativePath)));
              urls[style.href] = { 
                type: 'css',
                url: style.href,
                href: 'assets/css/' + relativePath
              }
          }
      })
      
      // process scripts
      _.each(processedUrlData.page.scripts || [], function(script, scriptIndex) {
          if(!urls[script.src] && !script.external) {
              var relativePath = _.trimStart(new URI(script.src).pathname(), '/')
              if(!_.endsWith(relativePath, '.js')) relativePath += '.js'
              var styleOutput = await (lib.downloadUrlToFileAsync(script.src, path.resolve(baseDir, '../assets/js/', relativePath)));
              urls[script.src] = { 
                type: 'js',
                url: script.src,
                href: 'assets/js/' + relativePath
              }
          }
      })
      
      // process media.
      _.each(processedUrlData.page.media || [], function(media, scriptIndex) {
          if(!urls[media.src] && !media.external) {
              var relativePath = _.trimStart(new URI(media.src).pathname(), '/')
              var styleOutput = await (lib.downloadUrlToFileAsync(media.src, path.resolve(baseDir, '../assets/media/', relativePath)));
              urls[media.src] = { 
                type: 'media',
                url: media.src,
                href: 'assets/media/' + relativePath,
                alt: media.alt
              }
          }
      })
    
      // process links
      _.each(processedUrlData.page.links || [], function(link, linkIndex) {
          if(!urls[link.href]) {
              if(link.external) {
                  urls[link.href] = { type: 'html', title: link.text, url: link.href, external: true }
              } else {
                  var linkUri = new URI(link.href)
                  var uname = _.trimStart(linkUri.pathname(), '/') + (linkUri.search() || '')
                  await (recurseAsync(link.href, depth + 1, lib.dirs.temp, uname));
              }
          }
      })
    }
    
    return processedUrlData;
  
});

recurseAsync(lib.urls.site, 0, lib.dirs.temp, 'index.html')
  .then(function(){
    var urlValues = _.values(urls);
    var pages = _.map(_.filter(urlValues, { type: 'html' }), function(e) { return { slug: e.slug, title: e.title, url: e.url, href: e.href, depth: e.depth } })
    var index = {
      site: lib.urls.site,
      root: _.find(pages, { depth: 0 }),
      pages: pages,
      css: _.map(_.filter(urlValues, { type: 'css' }), function(e) { return { url: e.url, href: e.href } }),
      js: _.map(_.filter(urlValues, { type: 'js' }), function(e) { return { url: e.url, href: e.href } }),
      media: _.map(_.filter(urlValues, { type: 'media' }), function(e) { return { url: e.url, href: e.href, alt: e.alt } })
    };
    fs.writeFileSync(path.resolve(lib.dirs.content, 'index.json'), JSON.stringify(index, null, '  '), 'utf8');
    
    var readme = '# ' + index.root.title + '\n\n';
    readme += 'Index of links for ' + index.site + '\n\n'
    readme += '## Pages\n\n'
    _.each(index.pages, function(p) {
        if(!p.external && p.title && p.href)
          readme += '-    [' + p.title + '](' + p.href + ') [[web](' + p.url + '), [html](' + p.href + 'index.html), [json](' + p.href + 'index.json)]\n'    
    })
    _.each(index.pages, function(p) {
        if(p.external && p.title)
          readme += '-    [**' + p.title + '](' + p.url + ') \n'    
    })
    readme += '\n\n'    
    readme += '## Media\n\n'
    _.each(index.media, function(p) {
        readme += '-    [' + (p.alt && p.alt.length > 0 ? p.alt: p.href) + '](' + p.href + ') \n'    
    })
    readme += '\n\n'    
    readme += '## Styles\n\n'
    _.each(index.css, function(p) {
        readme += '-    [' + p.href + '](' + p.href + ') \n'    
    })
    readme += '\n\n'    
    readme += '## Scripts\n\n'
    _.each(index.js, function(p) {
        readme += '-    [' + p.href + '](' + p.href + ') \n'   
    })
    readme += '\n\n'    
    fs.writeFileSync(path.resolve(lib.dirs.content, 'readme.md'), readme, 'utf8')
    
    console.log("Done!!!")
  })
