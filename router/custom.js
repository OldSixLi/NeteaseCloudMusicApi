const express = require('express');
let router = express.Router();
const crypto = require('crypto');
const request = require('./../util/request');
// 获取歌曲评论
let _getMusicComment = require('./../module/comment_music');
// 获取歌单详情
let _getPlayListDetail = require('./../module/playlist_detail');

/*
'########:::'#######::'##::::'##:'########:'########:'########::
 ##.... ##:'##.... ##: ##:::: ##:... ##..:: ##.....:: ##.... ##:
 ##:::: ##: ##:::: ##: ##:::: ##:::: ##:::: ##::::::: ##:::: ##:
 ########:: ##:::: ##: ##:::: ##:::: ##:::: ######::: ########::
 ##.. ##::: ##:::: ##: ##:::: ##:::: ##:::: ##...:::: ##.. ##:::
 ##::. ##:: ##:::: ##: ##:::: ##:::: ##:::: ##::::::: ##::. ##::
 ##:::. ##:. #######::. #######::::: ##:::: ########: ##:::. ##:
..:::::..:::.......::::.......::::::..:::::........::..:::::..::
*/

/**
 * 获取某个歌曲的评论量 
 * @returns 
 */
router.all('/comment/music', (req, res) => {
    let query = Object.assign({}, req.query, req.body, { cookie: req.cookies });
    if (!('MUSIC_U' in query.cookie)) query.cookie._ntes_nuid = crypto.randomBytes(16).toString("hex")
    _getMusicComment(query, request).then(
        ans => {
            res.append('Set-Cookie', ans.cookie);
            res.status(ans.status).send({ "total": ans.body.total });
        }
    )
});

/**
 * 获取歌单内容  包含歌曲评论 
 * @returns 
 */
router.all('/playlist/detail', (req, res) => {
    let query = Object.assign({}, req.query, req.body, { cookie: req.cookies })
    _getPlayListDetail(query, request).then(async resResult => {
        let result = {};
        try {
            result = await handleMusicList(resResult, req);
        } catch (error) {
            console.log(error);
        }
        res.status(resResult.status).send(result);
    },
        err => {
            // console.log("■■■■■■■■■■歌单出错内容■■■■■■■■■■■■■■");
            console.log(err);
            res.status(err.status).send(err.body);
        }
    ).catch(error => {
        res.status(200).send({});
        console.log('获取歌单出错', error);
    });
});


/*
'########:'##::::'##:'##::: ##::'######::'########:'####::'#######::'##::: ##:
 ##.....:: ##:::: ##: ###:: ##:'##... ##:... ##..::. ##::'##.... ##: ###:: ##:
 ##::::::: ##:::: ##: ####: ##: ##:::..::::: ##::::: ##:: ##:::: ##: ####: ##:
 ######::: ##:::: ##: ## ## ##: ##:::::::::: ##::::: ##:: ##:::: ##: ## ## ##:
 ##...:::: ##:::: ##: ##. ####: ##:::::::::: ##::::: ##:: ##:::: ##: ##. ####:
 ##::::::: ##:::: ##: ##:. ###: ##::: ##:::: ##::::: ##:: ##:::: ##: ##:. ###:
 ##:::::::. #######:: ##::. ##:. ######::::: ##::::'####:. #######:: ##::. ##:
..:::::::::.......:::..::::..:::......::::::..:::::....:::.......:::..::::..::
*/

/**
 * 处理歌单中歌曲的评论量
 * @param {*} musicListRes 
 * @param {*} req
 * @returns
 */
async function handleMusicList(musicListRes, req) {
    let beforeMusicListArr = (musicListRes.body.playlist && musicListRes.body.playlist.tracks) || [];
    // 处理后的歌单列表
    let afterMusicListArr = [];
    return new Promise(async resolve => {
        // 先获取到所有歌曲的评论量
        let musicsComment = {};
        try {
            musicsComment = await getMusicListComment(100, beforeMusicListArr, req);
        } catch (error) {
            console.log(error);
        }
        for (let index = 0; index < beforeMusicListArr.length; index++) {
            const x = beforeMusicListArr[index];
            let musicObj = {
                name: x.name,
                author: x && x.ar && x.ar[0] && x.ar[0].name || "",
                id: x.id,
                al: x.al,
                commentNum: musicsComment.get(x.id) || 0
            };
            afterMusicListArr.push(musicObj);
        }
        resolve({ name: musicListRes.body.playlist.name, id: musicListRes.body.playlist.name, musicList: afterMusicListArr });
    }).catch(error => console.log('caught', error));
}

/**
 * 多条数据 分批进行请求
 *
 * @param {*} num 每次同时进行多少请求
 * @param {*} musicArr 所有的数据
 * @param {*} req 通用Request
 * @returns
 */
function getMusicListComment(num, musicArr, req) {
    return new Promise(async resolve => {
        let musicsCommentMap = new Map();
        for (let index = 0; index < musicArr.length; index += num) {
            let arr = [];
            for (let i = 0; i < num; i++) {
                let obj = musicArr[index + i];
                if (obj) {
                    arr.push(getComment(obj.id, req));
                }
            }

            //循环执行
            try {
                await Promise.all(arr).then(data => {
                    data.forEach(x => {
                        // Object.assign(musicsCommentNum, x);
                        musicsCommentMap.set(x[0], x[1]);
                    })
                }, err => console.log(err)).catch(error => console.log('caught', error));
            } catch (error) {
                console.log(error);
            }

            await sleepTime(100);
        }
        console.log(`当前歌单内评论量`, musicsCommentMap);
        resolve(musicsCommentMap);
    }).catch(error => console.log('caught', error));
}

/**
 * 获取某个歌曲的评论量
 * @param {*} musicId 歌曲主键ID
 * @param {*} req Request 请求对象
 * @returns
 */
function getComment(musicId, req) {
    console.log(`处理歌曲${musicId}`);
    // 处理歌曲ID
    req.query.id = musicId.toString();
    req.query.limit = '1'
    return new Promise((resolve) => {
        let query = Object.assign({}, req.query, req.body, { cookie: req.cookies });
        query.cookie._ntes_nuid = crypto.randomBytes(16).toString("hex");
        _getMusicComment(query, request).then(
            ans => {
                resolve([musicId, ans.body.total]);
            },
            () => {
                resolve([musicId, 0]);
            }
        ).catch(error => console.log('caught', error))
    });
}

/**
 * 批量请求间隔
 * @param {*} ms
 * @returns
 */
function sleepTime(ms) {
    console.log(`休息${ms}ms`);
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    }).catch(error => console.log('caught', error));
}

module.exports = router;