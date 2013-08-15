/**
 * 我的订阅 和 订阅全部内容 的数据展示
 * @author allexwang (allexwang@tencent.com)
 */

//global
var newslistId = 0;
var locked = false;
var ismysub = false;
var Mu = Mustache;
var hash_array = [ '#!/type/mySubscribe', '#!/type/allSubscribe'];
var PAGE_COUNT = 0;
var ismy = 1;
var subscribeList = TQ.getEl('ul[node-type=subscribeList]');
var mySubscribeList = TQ.getEl('ul[node-type=mySubscribeList]');
var loading = TQ.getEl('[node-type=loading]');

//get hash
var getHash = function(){
    var hash = location.hash;
    if ( TQ.inArray( hash, hash_array ) === -1 ) {
        if(!Passport.check()){
            hash = hash_array[1];
        }else{
             hash = hash_array[0];
        }
        window.location.hash = hash;
    }
    return hash;
};

var hash = getHash();

//get hash index
var getHashIndex = function(hash){
    var index =TQ.inArray( hash, hash_array );
    return index === -1 ? 0 : index;
};


//The scroll load Data
var rolling = function(el) {
    var offsetY;
    var scrollTop;
    var pageHeight;
    var offset = 10;
    var b = document.body;
    var e = document.documentElement;
    offsetY = Math.min(e.clientHeight, b.clientHeight);
    pageHeight = Math.max(Math.max(b.scrollHeight, e.scrollHeight), Math.max(b.clientHeight, e.clientHeight));
    scrollTop = e.scrollTop || b.scrollTop;
    if (scrollTop + offsetY >= pageHeight - offset) {
        //allSubscribe Recommend Template
        TQ.setStyle(loading, 'display', '');
        if (!locked) {
            locked = true;
            isMySubscribe();
        }
    }
};

//rendering all media content is onscroll
var allSubscribe = function(json) {
    var html = showNewsList(json) || '';
    var content = TQ.builder(html);
    //subscribe Template  
    subscribeList.appendChild(content.box);
    TQ.setStyle(loading, 'display', 'none');
    locked = false;
};

//my subscribe and all subscribe
var subscribe = function(json) {
    var html = showNewsList(json) || '';
    //subscribe Template  
    subscribeList.innerHTML = html;
    TQ.setStyle(loading, 'display', 'none');
};

//rendering my media content is onscroll
var myOnscrollSub = function(json) {
    var html = showNewsList(json) || '';
    var content = TQ.builder(html);
    //subscribe Template  
    mySubscribeList.appendChild(content.box);
    TQ.setStyle(loading, 'display', 'none');
    locked = false;
};

//my subscribe
var mySubscribe = function(json) {
    if(!Passport.check()){Passport.login('http://dy.qq.com/#!/type/mySubscribe');return false;}
    var html = showNewsList(json) || '';
    mySubscribeList.innerHTML =  html;
    TQ.setStyle(loading, 'display', 'none');
};

//
var isMySubscribe = function() {
    if (!ismysub) {
        Jsonp.request(Common.host + 'getSubWebAllNews?id=' + newslistId + '&count=10', {
            "callback": "allSubscribe",
            "t": new Date().getTime()
        });
    } else {
        Jsonp.request(Common.host + 'getSubWebUserNews?id=' + newslistId + '&count=10', {
            "callback": "myOnscrollSub",
            "t": new Date().getTime()
        });
    }
};

//show newslist html
var showNewsList = function(json) {
    if(json){
        var ret = json.ret;
        if ( ret == -1) Passport.login();

        if (ret == 0) {
            var subscribeTemplate = TQ.getEl('#S_subscribeList').innerHTML;
            var dy_locbox_w = TQ.getEl('div[node-type=dy_locbox_w]');
            var winSize = TQ.getSize(window);
            var list = json.newslist || json.mediaInfos;
            var len = list.length;
            var total = json.total || 0;
            var html = [];
            var i = 0;
            var data = {};

            if(list.length > 0){
                for (; i < len; i++) {
                    data = {
                        chlid: list[i].chlid,
                        id: list[i].id,
                        thumbnails_qqnews: list[i].thumbnails_qqnews.length > 0 ? '<img src="'+ list[i].thumbnails_qqnews[0] +'"' : '',
                        chlname: list[i].chlname,
                        chlsicon: list[i].chlsicon,
                        url: list[i].url,
                        timestamp: Common.convertTime(list[i].timestamp, true),
                        chlSubCount: list[i].chlSubCount,
                        chlDesc: list[i].chlDesc,
                        abstract: list[i].title,
                        catId: list[i].catId,
                        catName: list[i].catName,
                        subFlag:list[i].subFlag == 0 ? '<a href="#" istxt="0" action-data="chlid='+list[i].chlid+'" action-type="subscribe" title="\u8BA2\u9605" class="fl dy_s" bosszone="subBtn1"></a>':'<a href="#" action-data="chlid='+list[i].chlid+'" istxt="0" action-type="unSubscribe" title="\u53D6\u6D88\u8BA2\u9605" class="fl qx_s" bosszone="subBtn1"></a>'
                    };
                    html.push(Mu.render(subscribeTemplate, data));
                }

                newslistId = list[len - 1].id;
                PAGE_COUNT +=10;

                if(PAGE_COUNT>=total){
                    TQ.removeEvent(window, 'scroll', rolling);
                }else{
                    TQ.removeEvent(window, 'scroll', rolling);
                    if(total>20){
                        TQ.addEvent(window, 'scroll', rolling);
                    }
                }

                return html.join('');

            }else{
                //没有订阅
                TQ.getEl('[node-type=more]').innerText = '\u60A8\u8FD8\u6CA1\u6709\u8BA2\u9605';
                TQ.setStyle(TQ.getEl('[node-type=loading]'), 'display', '');
                //
                
                //判断是否是登录状态，如果没有登陆就弹窗登陆，登录了没有订阅就弹订阅引导
                if(!Passport.check()){
                    Passport.login('http://dy.qq.com/#!/type/mySubscribe');return false;
                }else{
                    pop(dy_locbox_w);
                    TQ.setStyle(dy_locbox_w, 'display', '');
                    TQ.setStyles(TQ.E('loginBg'), {width:winSize.width+'px',height:winSize.height+'px',display:'block'});

                    if(SubPlugin){
                        SubPlugin.guidePage();
                    }
                }
                
            }

        }else{
            //alert('数据加载失败');
        }
    }
};

//init Subscribe
var subscribeEvent = new Subscribe({
    outer: TQ.getEl('div[node-type=mainWrapTop]'),
    sub: Sizzle('a[action-type=subscribe]'),
    unsub: Sizzle('a[action-type=unSubscribe]'),
    subClassName: 'qx_b',
    unsubClassName: 'dy_b'
});

//Tab
var Tab = TQ.getEl('div[node-type=wrapTab]');
var wrapTab = TQ.delegatedEvent(Tab);
wrapTab.add('subscribeContent', 'click', function(e) {
    TQ.preventDefault(e);
    var el = e.el;
    var cls = 'cur';
    var crt = TQ.hasClassName(el, 'cur');
    var data = e.data;
    ismy = parseInt(el.getAttribute('ismy'), 10);

    var clear = function() {
        subscribeList.innerHTML = '';
        mySubscribeList.innerHTML = '';
        TQ.setStyle(loading, 'display', '');
    };

    if (!crt) {
        if(!Passport.check()){Passport.login('http://dy.qq.com/#!/type/mySubscribe');return false;}
        TQ.setStyle(subscribeList,'display','none');
        TQ.setStyle(mySubscribeList,'display','none');
        clear();
        PAGE_COUNT = 0;
        TQ.getEl('[node-type=more]').innerText = '\u8BF7\u7A0D\u5019\uFF0C\u6B63\u5728\u52AA\u529B\u52A0\u8F7D\u4E2D...';

        if (ismy == 0) {
            ismysub = true;
            TQ.setStyle(mySubscribeList,'display','');
            Jsonp.request(Common.host + "getSubWebUserNews?id=0&count=10", {
                "callback": "mySubscribe",
                "t": new Date().getTime()
            });
        } else if (ismy == 1) {
            TQ.setStyle(subscribeList,'display','');
            ismysub = false;
            Jsonp.request(Common.host + "getSubWebAllNews?id=0&count=10", {
                "callback": "subscribe",
                "t": new Date().getTime()
            });
        }

        TQ.removeClassName(Sizzle('li', Tab), 'cur');
        TQ.addClassName(el, 'cur');
    }
});

//pop
var pop = function(elemt) {
    var elemt = TQ.getEl(elemt);
    var scrollPos = TQ.scrollPos();
    var winTop = scrollPos.top;
    var winLeft = scrollPos.left;
    var size = TQ.getSize(elemt);
    var winSize = TQ.getSize(window);
    var winWidth = winSize.width;
    var winHeight = winSize.height;
    var width = size.width;
    var height = size.height;

    var top = (winHeight - height) / 2 + winTop + 'px',
    left = (winWidth - width) / 2 + winLeft + 'px';
    TQ.setStyles(elemt, {
        position: 'absolute',
        top: top,
        left: left,
        zIndex:9999
    });
};

//media Recommend Template
mediaRecommendData.setData(Common.host + 'getSubWebRecommendMedia');

//初始化页面
var initSubscribeHtml = function(){
    TQ.removeClassName(Sizzle('li', Tab), 'cur');
    TQ.addClassName(Sizzle('li:eq('+getHashIndex( hash )+')', Tab)[0], 'cur');

    //allSubscribe Recommend Template
    if( hash == '#!/type/allSubscribe'){
        TQ.setStyle(subscribeList,'display','');
        Jsonp.request(Common.host + "getSubWebAllNews?id=0&count=10", {
            "callback": "subscribe",
            "t": new Date().getTime()
        });
        ismysub = false;
    }else{
        TQ.setStyle(mySubscribeList,'display','');
        //mySubscribe Recommend Template
        Jsonp.request(Common.host + "getSubWebUserNews?id=0&count=10", {
            "callback": "mySubscribe",
            "t": new Date().getTime()
        });
        ismysub = true;
    }
};

//判断页面是否是登陆状态
if(!Passport.check()){
    hash = '#!/type/allSubscribe';
    window.location.href = '#!/type/allSubscribe';
    initSubscribeHtml();
}else{
    //hash = '#!/type/mySubscribe';
    initSubscribeHtml();
}
/*  |xGv00|fd7d7fa33de267534b5b3838d3360fa6 */