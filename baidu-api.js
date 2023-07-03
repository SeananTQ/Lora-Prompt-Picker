var appid = '';
var key = '';
var hasApiKey = false;

try {
    appid = baiduAPI.appid;
    key = baiduAPI.key;
    hasApiKey = true;
} catch (error) {
    hasApiKey = false;
    alert("请使用浏览器自带的翻译功能! \n未读取到翻译API,当前采用无API模式. ");
}




function translateNetWork(query, callback) {
    var salt = (new Date).getTime();


    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'en';
    var to = 'zh';
    var str1 = appid + query + salt + key;



    var sign = MD5(str1);
    $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
            console.log(data);
            var translation = data.trans_result[0].dst; // 解析翻译结果
            callback(translation);
        },
        error: function () {
            alert('翻译失败'); // 处理翻译失败的情况
        }
    });
}