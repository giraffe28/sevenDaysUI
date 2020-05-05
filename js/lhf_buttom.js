mui.init();

mui.plusReady(function () {
	//禁止返回导致登录页面
	mui.back=function(){
		return false;
	}
	var indexWebview=plus.webview.currentWebview();//获得当前的webview
	for(var i=0;i<sevenDaysArray.length;i++){//创建webview窗口
		var page=plus.webview.create(sevenDaysArray[i].pageUrl,sevenDaysArray[i].pageId,pageStyle);
		page.hide();//隐藏窗口
		indexWebview.append(page);//追加子界面到当前主页面
	}
	plus.webview.show(sevenDaysArray[4].pageId);
	
	//批量绑定页面显示事件
	mui(".mui-bar-tab").on('tap',"a",function(){
		var tabindex=this.getAttribute("tabindex");
		plus.webview.show(sevenDaysArray[tabindex].pageId,"fade-in",200);//显示页面
		for(var i=0;i<sevenDaysArray.length;i++){//隐藏其他不需要的页面
			if(i!=tabindex){
				plus.webview.hide(sevenDaysArray[i].pageId,"fade-out",200);
			}
		}
	}) 
	
	// 延时加载
	setTimeout("initData()", "1000");
})


var sevenDaysArray=[
	{
		pageId:"lhf_chatRecord.html",
		pageUrl:"../html/lhf_chatRecord.html"
	},
	{
		pageId:"test1.html",
		pageUrl:"../html/test.html"
	},
	{
		pageId:"test2.html",
		pageUrl:"../html/test.html"
	},
	{
		pageId:"test3.html",
		pageUrl:"../html/test.html"
	},
	{//个人中心
		pageId:"ll_personalCenter.html",
		pageUrl:"../html/ll_personalCenter.html"
	},
];


var pageStyle={
	top:"0px",
	bottom:"50.4px"
}


// 预加载
function initData() {
	var lhf_chatRecord = plus.webview.getWebviewById("lhf_chatRecord.html");
	mui.fire(lhf_chatRecord, "refresh");
	var ll_personalCenter = plus.webview.getWebviewById("ll_personalCenter.html");
	mui.fire(ll_personalCenter, "refresh");
}
