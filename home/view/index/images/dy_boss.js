var gBossZoneHandler = new bossZoneHandler();
var gImage;
var registerZone2 = gBossZoneHandler.registerZone2;

if(document.addEventListener)
    document.addEventListener("click", registerZone2, false);
else if(document.attachEvent)
    document.attachEvent("onclick", registerZone2);

function bossZoneHandler()
{
    var category = "dy.qq.com";	
    var sFlag=false;
	this.registerZone2 = function (ev,clickType)
	{
	    var loopTryNum = 10;
	    var bossID = 1838;
        			  
	    try
		{		
		    //qq
			var a=document.cookie.match(new RegExp('(^|)o_cookie=([^;]*)(;|$)'));
			var iQQ=(a==null?"":unescape(a[2]));
			var purl='';
			var zoneId='';
			
			if(typeof clickType == 'undefined')
			{
			    if(sFlag) return true;
		        var ev = window.event || ev;
		        var et = ev.srcElement || ev.target;
			    var type=et.tagName;
		        if (type != "A" && type != "IMG" ) 
			    {
			        return true;
			    } 
			
			    if (type == "A")
			    {
			        purl = et.href;
			    }
			    else if (type == "IMG")
			    {
			        purl = et.parentNode.href;
			    }
			
			    //pseudo attr
			    for (var i=loopTryNum-1,tagNode=et;i>=0;i--,tagNode=tagNode.parentNode)
			    {
			        if(tagNode.attributes['bossZone'])
				    {
			            zoneId = tagNode.attributes['bossZone'].nodeValue;
				    } else if(tagNode.attributes['bosszone'])
				    {
				        zoneId = tagNode.attributes['bosszone'].nodeValue;
				    }
				    else if(tagNode.attributes['BossZone'])
				    {
				        zoneId = tagNode.attributes['BossZone'].nodeValue;
				    }
				    else if(tagNode.attributes['Bosszone'])
				    {
				        zoneId = tagNode.attributes['Bosszone'].nodeValue;
				    }

			        if(zoneId) break; 
			    }		
			    if(!zoneId) return;
			}
			else
			{
			    zoneId = ev.bossZone;
				purl = ev.url;
				sFlag = true;
				setTimeout(function (){sFlag = false;},200);
			}
			
			var localUrl = location.href;
			var ct = typeof gBossZoneHandler.category != 'undefined'?gBossZoneHandler.category:category;
			var iurl = 'http://btrace.qq.com/collect?sIp=&iQQ='+iQQ+'&sBiz='+ct+'&sOp='+zoneId+'&iSta=&iTy='+bossID+'&iFlow=&sUrl='+purl+'&sLocalUrl='+location.href+'&'+Math.random();
			gImage = new Image(1,1);
			gImage.src = iurl;
		} catch (e) {}
	}
}/*  |xGv00|150d785b8053fd587d0176f970eb9d87 */