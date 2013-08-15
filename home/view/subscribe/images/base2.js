/**
 * base.js
 * 
 * Release 1.0.0.0
 * @author <a href="mailto:harleywang@tencent.com">Harley Wang</a>
 * 通用功能处理
 */

var Common = {
        /**
         * 接口主机名
         */
        host:'http://dyapi.inews.qq.com/',
        /**
         * 转换时间戳为可读格式
         * @param  {Number}  timestamp     时间戳
         * @param  {Boolean} isContainTime 转换后的格式是否包含有时间
         * @return {String}                格式化后的日期时间
         */
        convertTime: function(timestamp, isContainTime){
                function longdata(num){
                        return parseInt(num)/9>1?num:'0'+num;
                }
                var datetime = new Date(parseInt(timestamp) * 1000);
                var date = [datetime.getFullYear()];
                date.push( longdata( datetime.getMonth()+1 ) );
                date.push( longdata( datetime.getDate() ) );

                var time = [ longdata(datetime.getHours()) ];
                time.push( longdata(datetime.getMinutes()) );
                time.push( longdata(datetime.getSeconds()) );

                if(isContainTime){
                        return date.join('-') + ' ' + time.join(':');
                }
                return date.join('-');
        },
        /**
         * 订阅分类事件绑定
         * @param  {String} id          容器ID
         * @param  {Element} currentEle 当前默认选中的元素
         */
        subCategory:function(id, currentEle){
                var container = document.getElementById(id);
                var currentBuffer = currentEle;

                container.onclick = function(e){
                        e = e||window.event;
                        var target = e.target||e.srcElement;

                        while('LI' !== target.nodeName){
                                target = target.parentNode;
                        }
                        if(currentBuffer == target){
                                return;
                        }

                        target.className = 'cur';
                        if(currentBuffer){
                                currentBuffer.className = '';
                        }
                        currentBuffer = target;
                }
        }
};

//////////////
/*getByClass*/
function getByclass(oParent,sClass)
        {
             var aTmp = [];
             var aEle = oParent.getElementsByTagName('*');
             for(var i=0;i<aEle.length;i++){
                 if(aEle[i].className == sClass){
                     aTmp.push(aEle[i]);
                 }
             }
            return aTmp;
        }
/*事件绑定*/
function addEvent(obj,type,fn)
{
    if(obj.attachEvent)
    {
        obj.attachEvent('on'+type,fn)
    }
    else if(obj.addEventListener)
    {
        obj.addEventListener(type,fn,false)
    }
}
/*解除事件绑定*/
function removeEvent(obj,type,fn)
{
    if(obj.detachEvent)
    {
        obj.detachEvent('on'+type,fn)
    }
    else if(obj.removeEventListener)
    {
        obj.removeEventListener(type,fn,false)
    }
}
/*tab切换*/
var tab={
    show:function(iType,iHdid,iCurrent,iBdid,num)
        { 
            
            var oTabHd=document.getElementById(iHdid);
            var oTabBd=document.getElementById(iBdid);
            var aTabHdList=oTabHd.children;
            var aTabBdList=oTabBd.children;
            if(!num)
            {
                num=1;
            };
            for (var i = 0; i < aTabHdList.length; i++)
            { 
                aTabBdList[i].style.display='none';
                aTabBdList[num-1].style.display='block';
                aTabHdList[num-1].className=iCurrent; 
                aTabHdList[i].index=i;
                aTabHdList[i]['on'+iType]=function()
                { 
                    for (var i = 0; i < aTabHdList.length; i++)
                    {
                        aTabBdList[i].style.display='none';
                        aTabHdList[i].className='';
                    };
                    this.className=iCurrent;
                    aTabBdList[this.index].style.display='block'
                }
            };
            
        }
}
function scrollfix(iTarget,iHead)
{
    var oTarget=document.getElementById(iTarget);
    var oHeadheight=document.getElementById(iHead).offsetHeight+25;
    
    //alert(oHeadheight)
 
                var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
                

                if(navigator.userAgent.indexOf('MSIE 6.0') != -1)
                {
                 
                    if(oTarget)
                    {   
                            clearTimeout(time)
                            var time=setTimeout(function(){
                                if(scrollTop>oHeadheight)
                                { 

                                    oTarget.style.position='absolute'
                                    oTarget.style.top=scrollTop+'px';
                                    //document.title=oTarget.style.top+oTarget.style.position;
                                    
                                }
                                else
                                { 
                                    oTarget.style.position='static'
                                    //document.title=oTarget.style.position;
                                    
                                }
                            },25)
                            
                    }
                }
                else
                {
                    if(oTarget)
                    {
                            if(scrollTop>oHeadheight)
                            { 
                                oTarget.style.position='fixed'
                                oTarget.style.top=0+'px';
                                
                            }
                            else
                            {
                                oTarget.style.position='static'
                                
                            }
                    }
                }
                
             
         
}



function scrollgtop(gobox,sClass)
{
    
        var oGoBbox=document.getElementById(gobox);
        var oGotop=getByclass(oGoBbox,sClass)[0]
        //console.log(oGotop)
        var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
        scrollTop>100?oGotop.style.display='block':oGotop.style.display='none';
        //console.log(111);
}

//////////////////////////
/**
 * @example Jsonp.request('http://www.example.com/action', {"callback":"func", "t":new Date().getTime()});
 */
var Jsonp={
        loadScript: function(url){
                var script = document.createElement("script");
                script.type = "text/javascript";
                if(script.readyState){
                        script.onreadystatechange = function(){
                             if(this.readyState == "loaded" || this.readyState == "complete"){   
                                        this.onreadystatechange = null; 
                                        document.body.removeChild(this);
                             }
                        };
                }else {
                        script.onload = function(){
                                document.body.removeChild(this);
                        };
                }
                script.setAttribute('src', url);
                document.body.appendChild(script);
        },
        encodeParameters: function(arg,parameters){
                var paras = [];
                for (parameter in parameters){
                        paras.push(escape(parameter) + "=" + escape(parameters[parameter]));
                }
                return paras.length > 0? (arg == -1 ? '?':'&')+paras.join('&'):'';
        },
        request: function(url, param){
                if(typeof url === 'string') var str = url.indexOf('?');
                this.loadScript(url + this.encodeParameters(str,param) );
        }
};

var ModelJS = {
    merge: function(model, objs){
        function convert(m, obj){
            for(var attr in obj){
                var key = new RegExp("%%" + attr + "%%", 'g');
                m = m.replace(key, obj[attr]);
            }
            return m;
        }
        if(objs instanceof Array){
            var buffer = [];
            for(var i=0, len=objs.length; i<len; i++){
                buffer.push( convert(model, objs[i]) );
            }
            return buffer.join('');
        }
        return convert(model, objs);
    }
};
var SubPlugin = {
    guidePage: function(callback){
        this.guideCB = callback;
        this.guideBox = document.getElementById('guideBox');
        this.guideMask = document.getElementById('loginBg');
        Jsonp.request("http://dyapi.inews.qq.com/getFirstSubList", {"callback":"SubPlugin.guideShow", "t":new Date().getTime()});
    },
    guideClose: function(url){
        this.guideBox.style.display = 'none';
        this.guideMask.style.display = 'none';
        if(url){
            window.location.hash = '#!/type/allSubscribe';
            window.location.reload();
        }
    },
    guideShow: function(obj){
        if(obj.ret != 0) return;
        var that = this, doc=document;
        var model = '<li class="cur" chlid="%%chlid%%"><div class="inner"><img src="%%icon%%" width="66" height="66"><i></i></div><p>%%chlname%%</p></li>';
        var guideItems = doc.getElementById('guideItems');
        var guideTips = doc.getElementById('guideTips');
        guideItems.innerHTML = '';
        if(obj.recommond.length > 8){
            obj.recommond = obj.recommond.slice(0, 8);
        }
        guideItems.innerHTML = ModelJS.merge(model, obj.recommond);

        guideItems.onclick = function(e){
            e = e||window.event;
            var target = e.target||e.srcElement;
            var count = 5;
            while(count--){
                if('LI' != target.nodeName){
                    target = target.parentNode;
                }else{
                    break;
                }
            }
            if('LI' != target.nodeName){
                return;
            }

            if(target.className == 'cur'){
                var allChl = guideItems.children, count=0;
                for(var i=0, len=allChl.length; i<len; i++){
                    var obj = allChl[i];
                    if(obj.className == 'cur' && obj != target){
                        count++;
                    }
                }
                if(count == 0){
                    guideTips.innerHTML = '\u63D0\u793A\uFF1A\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u5A92\u4F53\uFF0C\u9605\u8BFB\u7CBE\u9009\u5185\u5BB9';
                }else{
                    target.className = '';
                }
                // 取消订阅
            }else{
                target.className = 'cur';
                guideTips.innerHTML = '';
                // 开始订阅
            }
            return false;
        };
        // 开始阅读
        var guideBtn = doc.getElementById('guideBtn');
        guideBtn.onclick = function(){
            var allChl = guideItems.children, chlids=[];
            for(var i=0, len=allChl.length; i<len; i++){
                var obj = allChl[i];
                if(obj.className == 'cur'){
                    chlids.push( obj.getAttribute('chlid') );
                }
            }

            var config = {"callback":"SubPlugin.guideDone"};
            config.chlid = chlids.join(',');
            config.t = new Date().getTime();

            Jsonp.request("http://dyapi.inews.qq.com/addSubWeb", config);
            this.innerHTML = '\u6B63\u5728\u8BA2\u9605...';
            return false;
        };
        this.guideBox.style.display = 'block';
        this.guideMask.style.display = 'block';
    },
    guideDone: function(){
        this.guideClose();
        if(typeof this.guideCB != 'undefined'){
            this.guideCB();
        }else{
            window.location.reload();
        }
    }
};/*  |xGv00|14cbb7454334295e4841fa1f7ab039a5 */