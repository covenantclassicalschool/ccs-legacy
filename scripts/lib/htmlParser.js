/* adapted from 'npm pretty' */

'use strict';

var URI = require('urijs');
var _ = require('lodash');
var cheerio = require('cheerio'),
    slugify = require('./slugify');

/*
  returns an object of the form:

  {
    title: 
    description:
    keywords:
    slug: 
    links:  [{
              url:  // link
              text:  // text of the link
            }] 
    styles: [url ...] 
    scripts: [url ...]
    img:    [url ...]
    embed:  [url ...]
  }

*/
module.exports = function parse(html, options) {
  var output = { html: html };
  if(!html || html.length === 0) return output;
  
  return ocd(output, _.merge({
    url: 'https://www.bogus.com',
    variants: [],
    slugify: slugify
  }, options));
};

function ocd(output, options) {
    var $ = cheerio.load(output.html);
    var uri = new URI(options.url)
    var variants = _.map(options.variants, function(v) {
      return new URI(v);
    });

    output.title = $('title').text() || '';
    output.description = $('meta[description]').text() || '';
    output.keywords = [];
    _.each(($('meta[keywords]').text() || '').split(','), function (s) { 
      if(s.trim().length > 0)
        output.keywords.push(s.trim());
    });
    output.slug = options.slugify(output.title.split('|')[0]).trim();
    
    var absolutize = function(u) {
      if(!u || u.length === 0) 
        return '';
      var ur = new URI(u);
      if(ur.is('relative')) {
        ur = ur.absoluteTo(uri.toString());
      }
      if(ur.is('absolute')) {
        _.each(variants, function(v) {
          if(ur.origin().toLowerCase() === v.origin().toLowerCase()) {
            ur = new URI(uri.origin().toString() + ur.toString().substring(v.origin().length));
            return false; // exit iteration
          }
        })
      }
      return ur.toString();
    }
    
    parseLinksAndMakeAbsolute(output.links = [], $, absolutize);
    parseStylesAndMakeAbsolute(output.styles = [], $, absolutize);
    parseScriptsAndMakeAbsolute(output.scripts = [], $, absolutize);
    parseImagesAndMakeAbsolute(output.images = [], $, absolutize);
    parseMediaAndMakeAbsolute(output.media = [], $, absolutize);
    
    output.html = $.html();
    return output;
}

var parseLinksAndMakeAbsolute = function(links, $, absolutize) {
    _.each($('a[href]'), function(el, idx) {
        var $el = $(el);
        var url = absolutize($el.attr('href'));
        // ignore links without a valid url
        if(_.startsWith(url, 'http')) {
          $el.attr('href', url); // fix the url in the source
          links.push({ url: url, text: $el.text().trim() })
        }    
    });
}

var parseStylesAndMakeAbsolute = function(styles, $, absolutize) {
    _.each($("link[rel='stylesheet']"), function(el, idx) {
        var $el = $(el);
        var url = absolutize($el.attr('href'));
        // ignore links without a valid url
        if(_.startsWith(url, 'http')) {
          $el.attr('href', url); // fix the url in the source
          styles.push(url)
        }    
    });
}

var parseScriptsAndMakeAbsolute = function(scripts, $, absolutize) {
    _.each($("script[src]"), function(el, idx) {
        var $el = $(el);
        var url = absolutize($el.attr('src'));
        // ignore links without a valid url
        if(_.startsWith(url, 'http')) {
          $el.attr('src', url); // fix the url in the source
          scripts.push(url)
        }    
    });
}

var parseImagesAndMakeAbsolute = function(images, $, absolutize) {
    _.each($("img[src]"), function(el, idx) {
        var $el = $(el);
        var url = absolutize($el.attr('src'));
        // ignore links without a valid url
        if(_.startsWith(url, 'http')) {
          $el.attr('src', url); // fix the url in the source
          images.push(url)
        }    
    });
}

var parseMediaAndMakeAbsolute = function(media, $, absolutize) {
    _.each($("embed[src]"), function(el, idx) {
        var $el = $(el);
        var url = absolutize($el.attr('src'));
        // ignore links without a valid url
        if(_.startsWith(url, 'http')) {
          $el.attr('src', url); // fix the url in the source
          media.push(url)
        }    
    });
}