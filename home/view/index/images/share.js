/**
 * @author allexwang
 */

//share
var iShare = function(){
	//get page x,y
	var page = function(){
		return{
			x:window.screen.width,
			y:window.screen.height
		}
	};
	
	//weixin callback
	var getScript = function(file, callback, charset){
		var _doc = document.getElementsByTagName('head')[0]; 
		var js = document.createElement('script'); 
		charset && js.setAttribute('charset', charset); 
		js.setAttribute('src', file); 
		_doc.appendChild(js); 
		if (!/*@cc_on!@*/0) { 
			js.onload = function () { 
			callback() 
			} 
		} else {
			js.onreadystatechange = function () { 
				if (js.readyState == 'loaded' || js.readyState == 'complete') { 
					js.onreadystatechange = null; callback && callback(); 
				} 
			} 
		} 
		return false; 
	};
	//share list
	var share = {
		weibo: function(a,imgUrl) {
			var b = "http://share.v.t.qq.com/index.php",
			c = [] || '',
			d = a || document.title,
			e = window.location.href,
			f = "lixiang0522",
			x = window.screen.width,
			y = window.screen.height,
			g = encodeURI("3eef3dc2a3254c5cb5b2506bc8f9765f"),
			h = "";
			jQuery("img").length > 0 && jQuery("img").each(function(b,a) {
				jQuery(a).width() > 150 && jQuery(a).height() > 150 && c.length !== 1 && c.push(jQuery(a).attr("src"))
			});
			h = b + "?c=share&a=index&f=q2&url=" + encodeURIComponent(e) + "&appkey=" + g + "&assname=" + f + "&title=" + d + "&pic=" + encodeURIComponent(c);
			window.open(h, "shareQQ", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
		},
		sina: function(a,imgUrl) {
			//"http://service.weibo.com/share/share.php?url=http%3A%2F%2Fopen.weibo.com%2Fsharebutton&appkey=&title=&pic=&ralateUid=1652709070&language=";
			var b = "http://v.t.sina.com.cn/share/share.php",
				c = [],
				e = window.location.href,
				d = a || document.title,
				f = "",
				g = "",
				x = window.screen.width,
				y = window.screen.height,
				h = "";
			jQuery("img").length > 0 && jQuery("img").each(function(b,a) {
				jQuery(a).width() > 150 && jQuery(a).height() > 150 && c.length !== 1 && c.push(jQuery(a).attr("src"))
			})
			h = b + "?url=" + encodeURIComponent(e) + "&appkey=" + g + "&title=" + d + "&pic=" + encodeURIComponent(c[0]) + "&ralateUid="+f+"&language=";
			window.open(h, "shareQQ", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
		},
		qzone: function(a ,imgUrl) {
			var b = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",
				c = [],
				d = a || document.title,
				e = window.location.href,
				f = "",
				x = window.screen.width,
				y = window.screen.height,
				g = "";
			jQuery("img").length > 0 && jQuery("img").each(function(b,a) {
				jQuery(a).width() > 150 && jQuery(a).height() > 150 && c.length !== 1 && c.push(jQuery(a).attr("src"))
			});
			f = b + "?to=qzone&url=" + encodeURIComponent(e) + "&title=" + encodeURIComponent(d) + "&pics=" + encodeURIComponent(c) + "&summary=" + encodeURIComponent(g);
			//window.open(f, "shareQQ", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
			window.open(f, "", "height = 540, width = 580, top = "+(y-540)/2 + ", left = " + (x-580)/2 + ", toolbar = no, menubar = no, resizable = yes, location = yes,status = no" );
		},
		qq:function(a ,imgUrl){
			var a = "http://connect.qq.com/widget/shareqq/index.html";
				d = window.location.href,
				m = document.title, 
				b = "",
				x = window.screen.width,
				y = window.screen.height,
				h = "", k = "", g = [];
				jQuery("img").length > 0 && jQuery("img").each(function(b,a) {
					jQuery(a).width() > 150 && jQuery(a).height() > 150 && g.length !== 1 && g.push(jQuery(a).attr("src"))
				});
				k = a + "?url=" + encodeURIComponent(d) + "&showcount=0&desc=" + encodeURIComponent(m) + "&summary=&title="+ encodeURIComponent(m) + "&pics=&style=203&width=19&height=22";
			//window.open(k, "shareQQ", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
			window.open(k, "", "height = 600, width = 780, top = "+(y-600)/2 + ", left = " + (x-780)/2 + ", toolbar = no, menubar = no, resizable = yes, location = yes,status = no" );
		},
		weixin:function(a ,url ,imgUrl){
			var opt= {
				"title": encodeURIComponent(a || document.title),//此处也可替换成相应的文章标题
				"imgsrc":imgUrl, //此处替换成相应的文章缩略图地址链接，若省略将显示为无图标链接
				"url": url || window.location.href, // 此处也可替换成对应网页的链接
				"appid":"wx66e51778a48681ad" // 此处替换为你在微信开放平台注册的appid，若省略将显示“来自二维码扫描”
			};
			getScript('http://mat1.gtimg.com/www/weixin/sharewx_v1.0.0.js', function(){
				sharewx(opt);
			}, 'utf-8');
		}
	};
	//init
	var obj = {
		init:function(){
			var self = this;
			jQuery('div[node-type=shareBtn]').delegate('ul[node-type=shareBtn_list] a','click',function(){
				var name = jQuery(this).attr('name') || '';
				var parent = jQuery(this).parent();
				var title = document.title
				share[name](title);	
			});
		}
	};
	
	if (iShare.instance) {
        return iShare.instance;
    }else{
        obj.init();
        return iShare.instance = obj;
    }
};
iShare();
/*  |xGv00|2ff0d8ae3f6cc1b2f8f6be11032becc6 */