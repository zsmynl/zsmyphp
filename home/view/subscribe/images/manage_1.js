/**
 * 我的媒体库 和 全部媒体库
 * @author allexwang (allexwang@tencent.com)
 */

//global
var Mu = Mustache;
var manageTemplate = TQ.getEl('#manageTemplate').innerHTML;
var userWrap = TQ.getEl('div[node-type=userWrap]');
var main = TQ.getEl('div[node-type=main]');
var myUserWrap = TQ.getEl('div[node-type=myUserWrap]');
var dEvt = TQ.delegatedEvent(userWrap);
var hash_array = ['#!/type/allMediaLibrary','#!/type/myMediaLibrary'];
var locked = false;
var ismy = 1;

/**
 * [ description]
 * @param  {[type]} str [description]
 * @param  {[type]} obj [description]
 * @replaceHelper('<div>{@test}</div>',{xx:xx})
 */
var replaceHelper = function(str, obj) {
    return str.replace(/{@(\w+)}/g,function($all,$1){
        return obj[$1] === 0?0:(obj[$1]||'');
    });
};

//getHash
var getHash = function() {
    var hash = location.hash;
    if (TQ.inArray(hash, hash_array) === -1) {
        hash = hash_array[1];
        window.location.hash = hash;
    }
    return hash;
};

var hash = getHash();

//get hash index
var getHashIndex = function(hash) {
    var index = TQ.inArray(hash, hash_array);
    return index === -1 ? 0 : index;
};

//creat my media html
var myManageMedia = function(json){
    if(!Passport.check()){Passport.login('http://dy.qq.com/manage.htm#!/type/myMediaLibrary');return false;}
    var html = manageMedia(json);
    myUserWrap.innerHTML = html || '';
};
//creat all media html
var allManageMedia = function(json){
    var html = manageMedia(json);
    userWrap.innerHTML = html || '';
};

//rendering all media html
var manageMedia = function(json) {
    if (json && json.cats) {
        var ret = json.ret;
        if ( ret == -1) Passport.login();

        var cats = json.cats;
        var len = cats.length;
        var html = '';
        var total = (json.totalMediaNum || json.userMediaNum) || 0;

        var node = '<li>' + '<div class="avatar_s"><a href="{@link}" target="_blank" bosszone="media"><img src="{@icon}" width="55" height="55"></a></div>' + '<div class="txt">' + '<div class="name fY"><a href="{@link}" target="_blank" title="{@chlnamet}" bosszone="media">{@chlname}</a></div>' + '<div class="count"><span>{@subCount}</span>\u4EBA\u8BA2\u9605</div>' + '</div>' + '{@subFlag}' + '</li>';
        var subMsg = '<div style="text-align: center;height: 40px;line-height: 40px;" node-type="loading">\u60A8\u8FD8\u6CA1\u6709\u8BA2\u9605\u5A92\u4F53</div>';

        var nodeList = function(data) {
            if (data.length == 0 ) return;

            var html = [];
            var parm = {};
            var i = 0;
            for (; i < data.length; i++) {
                parm = {
                    chlid: data[i].chlid,
                    chlnamet: data[i].chlname,
                    chlname: data[i].chlname.cutString(16,'...'),
                    icon: data[i].icon,
                    subCount: data[i].subCount,
                    link: './list-user.htm?chlid='+data[i].chlid,
                    recommend: data[i].recommend,
                    subFlag: data[i].subFlag == 0 ? '<a href="#" class="dy_b" action-data="chlid=' + data[i].chlid + '" istxt="1" action-type="subscribe" bosszone="button">\u8BA2\u9605</a>': '<a href="#" class="qx_b" istxt="1" action-data="chlid=' + data[i].chlid + '" action-type="unSubscribe" bosszone="button">\u53D6\u6D88</a>'
                };
                html.push(replaceHelper(node, parm));
            };
            return html.join('');
        };

        if (ret == 0) {
            if (len > 0) {
                var html = [];
                var i = 0;
                var data = {};
                for (; i < len; i++) {
                    data = {
                        catId: cats[i].catId,
                        mediaNum: cats[i].mediaNum,
                        catName: cats[i].catName,
                        list: nodeList(cats[i].channels || 0)
                    };
                    html.push(Mu.render(manageTemplate, data));
                }

                //Recommend Template
                html = html.join('');
            }else{
                html = subMsg;
            }

            TQ.getEl('em[node-type=myMedia]').innerHTML = '('+ total + ')';
            return html;
        } else {
            //error
            html = subMsg;
            return html;
        }
    }
};

//Classification of the media
var classData = {
    1 : 'news',
    2 : 'ent',
    3 : 'sports',
    4 : 'tech',
    5 : 'finance',
    6 : 'pic',
    7 : 'idea',
    8 : 'video',
    9 : 'fashion',
    10 : 'humanity'
};

//subscribeNav data
var subscribeNav = function(json) {
    if (json && json.cats) {
        var ret = json.ret;
        if ( ret == -1) Passport.login();

        var rolling = null;
        var list = json.cats;
        var len = list.length;
        var total = json.totalMediaNum;
        var subscribeTemplate = TQ.getEl('#subscribeNav').innerHTML;
        var html = [];
        var i = 0;
        var data = {};

        if (ret == 0) {
            if (len > 0) {
                html.push('<li class="cur"><a href="#TAG_ALL" class="all" bosszone="Suball"><em></em><span class="name fY">\u5168\u90E8</span><span class="count">' + (total > 99 ? 99 : total) + '</span></a></li>');
                for (; i < len; i++) {
                    data = {
                        catName: list[i].catName,
                        recommend: list[i].recommend,
                        className: classData[list[i].catId],
                        mediaNum: (list[i].mediaNum > 99 ? 99 : list[i].mediaNum),
                        catId: list[i].catId
                    };
                    html.push(Mu.render(subscribeTemplate, data));
                };
                //subscribeNav Template  
                TQ.getEl('ul[node-type=subscribeNav]').innerHTML = html.join('');
            }
        }
    }

    // HarleyWang Add
    var container = document.getElementById('subCategory');
    Common.subCategory('subCategory', container.children[0]);
};

//Tab
var Tab = TQ.getEl('div[node-type=wrapTab]');
var wrapTab = TQ.delegatedEvent(Tab);
wrapTab.add('subscribeContent', 'click',function(e) {
    var el = e.el;
    var cls = 'cur';
    var crt = TQ.hasClassName(el, 'cur');
    var data = e.data;
    var msg = '<div style="text-align: center;height: 40px;line-height: 40px;" node-type="loading">\u8BF7\u7A0D\u5019\uFF0C\u6B63\u5728\u52AA\u529B\u52A0\u8F7D\u4E2D...</div>'
    var clear = function() {
        userWrap.innerHTML = '';
        myUserWrap.innerHTML = '';
    };

    if (!crt) {
        ismy = parseInt(el.getAttribute('ismy'), 10);

        TQ.setStyle(userWrap,'display','none');
        TQ.setStyle(myUserWrap,'display','none');

        if (ismy == 0) {
            Jsonp.request(Common.host + "getSubWebUserSubList", {
                "callback": "myManageMedia",
                "t": new Date().getTime()
            });

            if(!Passport.check()){
                TQ.preventDefault(e.evt);
                TQ.setStyle(userWrap,'display','');
            }else{
                TQ.setStyle(myUserWrap,'display','');

                userWrap.innerHTML = msg;
                myUserWrap.innerHTML = msg;
                TQ.removeClassName(Sizzle('li', Tab), 'cur');
                TQ.addClassName(el, 'cur');
            }

        } else if (ismy == 1) {
            TQ.setStyle(myUserWrap,'display','none');
            TQ.setStyle(userWrap,'display','');
            //init all media data
            Jsonp.request(Common.host + 'getSubWebCatMedia', {
                "callback": "allManageMedia",
                "t": new Date().getTime()
            });

            userWrap.innerHTML = msg;
            myUserWrap.innerHTML = msg;
            TQ.removeClassName(Sizzle('li', Tab), 'cur');
            TQ.addClassName(el, 'cur');
        }
        
    }
});

//init data
if (hash == '#!/type/allMediaLibrary') {
    TQ.setStyle(userWrap,'display','');
    //init all media data
    Jsonp.request(Common.host + "getSubWebCatMedia", {
        "callback": "allManageMedia",
        "t": new Date().getTime()
    });
} else {
    TQ.setStyle(myUserWrap,'display','');
    //init my media data
    Jsonp.request(Common.host + "getSubWebUserSubList", {
        "callback": "myManageMedia",
        "t": new Date().getTime()
    });
};

TQ.removeClassName(Sizzle('li', Tab), 'cur');
TQ.addClassName(Sizzle('li:eq(' + getHashIndex(hash) + ')', Tab)[0], 'cur');

//init subscribeNav data
Jsonp.request(Common.host + 'getSubWebCatListOnly', {
    "callback": "subscribeNav",
    "t": new Date().getTime()
});

//set subscribe count
var setCount = function(el){
    //
    var getCount = function(element){
        return parseInt(element.innerHTML.replace(/[^\d]+/,'')) || 0;
    };

    var perv = el.previousSibling;
    var oncls = 'dy_b';
    var countStr = perv.lastChild;
    var countStr2 = TQ.getEl('em[node-type=myMedia]');
    var isLike = TQ.hasClassName(el, oncls);
    var count = getCount(countStr);
    var count2 = getCount(countStr2);
    count = Math.max(count + (isLike ? -1 : 1),0);
    count2 = Math.max(count2 + (isLike ? -1 : 1),0);
    countStr.innerHTML = '<span>'+ (count > 0 ? count : 0) +'</span>\u4EBA\u8BA2\u9605';
    countStr2.innerHTML = count2 > 0 ? '('+count2+')' : '';
};

//init Subscribe
var subscribeEvent = new Subscribe({
    outer: main,
    sub: Sizzle('a[action-type=subscribe]'),
    unsub: Sizzle('a[action-type=unSubscribe]'),
    subClassName: 'qx_b',
    unsubClassName: 'dy_b',
    callback:setCount
});/*  |xGv00|5f77b44561e40171c6d25b9129399c49 */