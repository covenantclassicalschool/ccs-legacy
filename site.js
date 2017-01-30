var path = require('path')

module.exports = {
    
    dirs: {
        scripts: path.resolve(__dirname, './scripts'),
        temp: path.resolve(__dirname, './content/__temp'),
        content: path.resolve(__dirname, './content'),
        html: path.resolve(__dirname, 'content', 'html')
    },
    
    urls: {
        site: 'http://www.covenantclassicalschool.org'
    },
    
    maxDepth: 50
}
 