var appKey = '0daca4a31349386f';
var key = '3RDtRIxcVhrc8w6p9vJToX0eSPhPxus0';//注意：暴露appSecret，有被盗用造成损失的风险

// var query = 'not text';
function translateText(query, callback) {
    var salt = (new Date).getTime();
    var curtime = Math.round(new Date().getTime() / 1000);

    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'en';
    var to = 'zh-CHS';
    var str1 = appKey + truncate(query) + salt + curtime + key;
    var vocabId = '您的用户词表ID';
    //console.log('---',str1);

    var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);




    $.ajax({
        url: 'https://openapi.youdao.com/api',
        type: 'post',
        dataType: 'jsonp',
        data: {
            q: query,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign,
            signType: "v3",
            curtime: curtime,
            vocabId: vocabId,
        },
        success: function (data) {
            console.log(data);
            var translation = data.translation[0]; // 解析翻译结果
            callback(translation);
        },
        error: function () {
            alert('翻译失败'); // 处理翻译失败的情况
        }
    });
}

function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}
