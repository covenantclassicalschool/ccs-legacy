var path = require('path')

module.exports = {
    
    dirs: {
        content: path.resolve(__dirname, './content')
    },
    
    urls: {
        site: 'http://www.covenantclassicalschool.org',
        variants: [ 'http://covenantclassicalschool.org' ]
    },
    
    maxDepth: 10000000
}
 