/**
 * 文章正文页
 * @author allexwang (allexwang@tencent.com)
 */

//global
var locked = false;
var hash_array = [ '#!/type/mySubscribe', '#!/type/allSubscribe'];
var mediaShow = TQ.getEl('div[node-type=mediaShow]');
var mediaShowTemplate = TQ.getEl('#mediaShow').innerHTML;
var dEvt = TQ.delegatedEvent(mediaShow);
var Mu = Mustache;
var articleId = 1;
var aid;
var cid;

articleId = getRequest('id');

//create right media
var createMeidaShow = function(json){
    if(json){
        var data = {};
        data = {
            chlname: json.chlname,
            icon: json.icon,
            desc: json.desc,
            link: './list-user.htm?chlid='+json.chlid,
            subCount: json.subCount,
            subFlag: json.subFlag == 0 ? '<a href="#" class="dy2_b" istxt="3" action-data="chlid='+json.chlid+'" id="subscribe" action-type="subscribe" title="\u8BA2\u9605" bosszone="subBtn">\u8BA2\u9605</a>' : '<a href="#" class="qx2_b" istxt="3" id="subscribe" action-data="chlid='+json.chlid+'" action-type="unSubscribe" title="\u53D6\u6D88\u8BA2\u9605" bosszone="subBtn">\u53D6\u6D88</a>'
        };
        mediaShow.innerHTML = Mu.render(mediaShowTemplate, data);
        //name = "正文"
        NavManager.add([{name:json.catName, pathname:'/list-tag.htm?catid='+ json.catId +''},{name:json.chlname, pathname:'/list-user.htm?chlid='+ json.chlid +''},{name:'\u6B63\u6587', pathname:'/article.htm'}]);
    }
};

//show newslist html
var showArticle = function(json) {
    if(json && json.data){
        var ret = json.ret;
        if ( ret == -1) Passport.login();

        var item = json.data[0];
        var total = json.image_count;
        var list = item.content;
        var len = list.length;
        var html = [];
        var contentHtml = [];
        var i = 0;
        var data = {};

        function articleType(data) {
            var str = '';
            var img_url;
            var desc;
            var video;
            var vid;
            var vidImg;
            var img_width;
            var img_height;

            /**
             * video 视频类型
             * cnt_article 文字类型
             * img_url 图片类型
             */
            switch (data.type){
                case 'video':
                    str = '<p id="mod_player'+data.vid+'" action-data="vid='+data.vid+'" class="noind" action-type="mod_player"><img alt="\u64AD\u653E\u89C6\u9891" style="cursor:pointer;" title="\u64AD\u653E\u89C6\u9891" src="'+ data.img +'"></p>';
                break;
                case 'cnt_article':
                    desc = data.desc || '';
                    str = '<p>'+ desc +'</p>';
                break;
                case "img_url":
                    img_url = data.img_url || 'about:blank';
                    str = '<p class="noind"><img style="display:inline" src="'+ img_url +'"></p>';
                break;
                default:
                    //console.log('没有数据类型');
            }
            return str;
        }

        if(ret == 0){
            if(len > 0){

                for (; i < len; i++) {
                    contentHtml.push(articleType(list[i]));
                }

                var node = '<div class="title fY">\
                        <h2>'+ item.title +'</h2>\
                    </div>\
                    <div class="tool_bar clear">\
                        <span class="time">'+ item.fPubTime +'</span>\
                            <div class="shareBtn v-shareBtn pr" id="shareBtn" action-type="shareBtn" bosszone="shareBtn1">\
                            <a class="shareBtn-hd" style="cursor: pointer;">\u6211\u8981\u5206\u4EAB<i></i></a>\
                            <div class="shareBtn-bd" node-type="shareBtn_bd">\
                                <ul class="shareBtn16" node-type="shareBtn_list">\
                                    <li ><a href="javascript:void(0)" name="weibo" id="tmblogbt1" class="s_weibo">\u817E\u8BAF\u5FAE\u535A</a></li>\
                                    <li ><a href="javascript:void(0)" name="qzone" class="s_qzone" >QQ\u7A7A\u95F4</a></li>\
                                    <li ><a href="javascript:void(0)" name="qq" class="s_qq" >QQ\u597D\u53CB</a></li>\
                                    <li ><a href="javascript:void(0)" name="sina" class="s_sina" >\u65B0\u6D6A\u5FAE\u535A</a></li>\
                                </ul>\
                            </div>\
                        </div>\
                        <span class="count" bosszone="Ncomm"><a href="#commentsTag" id="oldcoralurl"><em id="cmtNum">0</em>\u6761\u8BC4\u8BBA</a></span>\
                    </div>\
                    <div class="cont">\
                        '+ contentHtml.join('') +'\
                    </div>';

                //subscribe Template
                TQ.getEl('div[node-type=articleContent]').innerHTML = node;
                document.title = item.title + "_\u8BA2\u9605_\u817E\u8BAF\u7F51";

                /*判断新老评论id-s*/
                var coralcid=item.cid;
                var webCoral=document.getElementById('webcoral');
                var oldCoralurl=document.getElementById('oldcoralurl');
                var oldNum=oldCoralurl.getElementsByTagName('em')[0];

                if(coralcid<100000000){

                    webCoral.style.display='none';
                    oldCoralurl.setAttribute("target", "_blank");
                    oldCoralurl.href='http://comment5.news.qq.com/comment.htm?site=&id='+coralcid;
                    var script=document.createElement('script');
                    script.type='text/javascript';
                    script.src='http://sum.comment.gtimg.com.cn/php_qqcom/gsum.php?site=&c_id='+coralcid+'&r='+Math.random();
                    document.getElementsByTagName('head')[0].appendChild(script);
                    window['_cbSum']  = function(){
                        oldNum.innerHTML=arguments[0];
                    };
                }
                /*判断新老评论id-e*/
            }

            createMeidaShow(json.cardinfo);
            //init The article comments function
            //
            /* ARTICLE_INFO = window.ARTICLE_INFO || {
              subName:{name:'',url:'', cname:''},
            };
            */
            cmt_site = '';
            cmt_id = parseInt(item.cid,10);
            cmt_is_group = 0;
            cmt_count_id = '';

            var script = document.createElement('script');
            script.type='text/javascript';
            script.src='http://mat1.gtimg.com/www/niuping2013/coral.min.js';
            document.getElementsByTagName('head')[0].appendChild(script);
        }else{

        }
    }
};


jQuery('div[node-type=shareBtn]').delegate('[action-type=shareBtn]','mouseenter',function(e){
    jQuery(this).addClass('hover');
    jQuery('div[node-type=shareBtn_bd]').show();
});
//
jQuery('div[node-type=shareBtn]').delegate('[action-type=shareBtn]','mouseleave',function(e){
    jQuery(this).removeClass('hover');
    jQuery('div[node-type=shareBtn_bd]').hide();
});

//init subscribeNav data
if( articleId !== '' ){
    Jsonp.request(Common.host + 'getSubWebContent?id='+ articleId+'', {
        "callback": "showArticle",
        "t": new Date().getTime()
    });
}else{
    //console.log('链接为空');
};

//set subscribe count
var setCount = function(){
    //
    var getCount = function(element){
        return parseInt(element.innerHTML.replace(/[^\d]+/,'')) || 0;
    };
    var oncls = 'dy2_b';
    var countStr = TQ.E('subCount');
    var parentStr = TQ.E('subscribe');
    var isLike = TQ.hasClassName(parentStr, oncls);
    var count = getCount(countStr);
    count = Math.max(count + (isLike ? -1 : 1),0);
    countStr.innerHTML = (count > 0 ? count+'\u4EBA\u5DF2\u8BA2\u9605':'');
};

//init Subscribe
var subscribeEvent = new Subscribe({
    outer: TQ.getEl('div[node-type=side]'),
    sub: Sizzle('a[action-type=subscribe]'),
    unsub: Sizzle('a[action-type=unSubscribe]'),
    subClassName: 'qx_b',
    unsubClassName: 'dy_b',
    callback:setCount
});

/*  |xGv00|8477235d28846da832a7477c38f887d3 */