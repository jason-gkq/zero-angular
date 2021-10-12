const webpack = require('webpack');
module.exports = {
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //         minSize: 30000,
    //         maxSize: 0,
    //         minChunks: 1,
    //         maxAsyncRequests: 5,
    //         maxInitialRequests: 3,
    //         automaticNameDelimiter: '~',
    //         name: true,
    //         cacheGroups: {
    //             vendors: {
    //                 test: /[\\/]node_modules[\\/]/,
    //                 priority: -10,
    //                 name: 'lib'
    //             },
    //             default: {
    //                 minSize: 0,
    //                 minChunks: 2,
    //                 priority: -20,
    //                 reuseExistingChunk: true,
    //                 name: 'utils'
    //             }
    //         }
    //     }
    // },
    externals: {
        "quill": "Quill",
        "moment": "moment",
        "echarts": "echarts",
        "rxjs": "rxjs",
        "qiniu-js": "qiniu"
    },
}

