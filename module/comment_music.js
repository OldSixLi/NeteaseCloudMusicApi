// 歌曲评论
const crypto = require('crypto')

module.exports = (query, request) => {
    query.cookie.os = 'pc'
    const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0
    }
    return request(
        'POST', `https://music.163.com/weapi/v1/resource/comments/R_SO_4_${query.id}`, data,
        { crypto: 'weapi', cookie: query.cookie, proxy: query.proxy }
    )
}

// /app/nodejs/apps/musicApi/module
// dffe743c5850f74bfcfc2c4c253609918b65ba19bc8d7267613b70c0b5385e307bcf1171124cb2b54d7e9be72e08e9c78fd28a8d65b08553
// dffe743c5850f74bfcfc2c4c2536099119607d5eacb9ee5a37940f0897f023d6aa3dfc43eea21e98b2e42a914071f23a8fd28a8d65b08553
// dffe743c5850f74bfcfc2c4c25360991f36f810c277b481d0bfbcbc2ca2cd04e853d8d495d9184bb86b2938dd2cf0dd7bc719b33bb4f842b