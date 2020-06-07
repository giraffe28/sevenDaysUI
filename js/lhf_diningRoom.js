/*
	本文件由lhf创建并维护
	本文件仅用于深夜食堂的食堂内部聊天页使用
	
	使用时，需要传入五个参数
	roomId
	isMine（区分是否为自己创建的食堂）
	userId
	roomName
	myIcon
	
	(是自己创建的食堂的话，本功能会额外在侧滑菜单中加上一个修改食堂信息的功能)
*/

mui.init();

//获取滑动菜单的dom，用于执行操作用
var setObj=document.getElementsByClassName('mui-icon-settings');
//获取显示食堂名的区域
var roomNameDom=document.getElementById("roomName");
//获取查看食堂信息的按键
var watchDiningRoomMsgDom=document.getElementById("watchDiningRoomMsg");
//获取进入举报页面的按键
var reportDom=document.getElementById("report");
//获取离开食堂的按键
var leaveDom=document.getElementById("leave");
//记录传入的用户id
var userId;
//记录传入的食堂id
var roomId;
//记录传入的食堂名
var roomName;
//记录传入的是否为自己创建食堂的判断
var isMine;
//记录传入的自己的头像
var myIcon="../images/2.jpg";//默认头像
//记录食堂主页
var midnightDiner;
//本页面
var thisWebview;
//记录index页面，用于执行websocket相关的操作
var	chatWebSocket;
//记录发送聊天消息的dom
var send=document.getElementById("sendMsg");
//获取要发送的消息内容的dom
var msgText=document.getElementById("msg");
//记录显示聊天内容列表的dom
var areaMsgList = document.getElementById("msgs");


mui.plusReady(function () {
    //对共用的参数进行获取值
    thisWebview=plus.webview.currentWebview();
	midnightDiner=thisWebview.opener();
    roomId=thisWebview.roomId;
    isMine=thisWebview.isMine;
	userId=thisWebview.userId;
	roomName=thisWebview.roomName;
	if(app.isNotNull(thisWebview.icon))
		myIcon=thisWebview.icon;
	//获取index页面
	chatWebSocket = plus.webview.getWebviewById("index.html");
	
	roomNameDom.innerHTML=roomName;
	
	thisWebview.setStyle({
		softinputMode:"adjustResize"//设置软键盘样式
	});
	
	//渲染初始化的食堂聊天记录
	initChatHistory()
	//设置聊天记录在进入页面时自动滚动到最后一条
	resizeScreen();
	
	//发送消息时的处理
	send.addEventListener("tap",function(){
		var msgTextValue = msgText.value;
		if(msgTextValue.length>128){
			mui.toast("您输入的字数超过了128字节，请进行分批次发送(´-ωก`)");
		}
		else if(msgTextValue.length<1){
			msgText.focus();
			mui.toast("请输入信息<(｀^´)>");
		}
		else{
			//发送前判断网络状态
			var connectionStatus = plus.networkinfo.getCurrentType();
			if(connectionStatus==0 || connectionStatus==1){
				mui.toast("请打开网络连接！QAQ");
				return;
			}
			// 构建ChatMsg
			var chatMsg = new app.ChatMsg(userId, roomId, msgTextValue, null);
			// 构建DataContent
			var dataContent = new app.DataContent(app.CHATROOM, chatMsg, null);
			// 调用websocket发送消息
			chatWebSocket.evalJS("CHAT.chat('" + JSON.stringify(dataContent) + "')");
			
			//我发送出去的信息进行保存
			app.saveUserChatRoomHistory(userId, null, roomId, msgTextValue, app.ME, null);
			
			//保存食堂聊天快照，由于是由自己发送的,所以默认为已读
			app.saveUserChatRoomSnapshot(userId, roomId, msgTextValue, true);
			
			midnightDiner.evalJS("loadingChatSnapshot()");
			
			sendMsgFunc(msgTextValue);//渲染发送出去的消息
			msgText.value="";//清空文本框中的内容
			send.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");//重置发送按钮的状态
			resizeScreen ();
			//mui.toast("测试用：已发送");
		}
	});
	
	//查看食堂信息
	watchDiningRoomMsgDom.addEventListener('tap',function(){
		//跳转到对应的食堂信息页
		mui.openWindow({
			url:"lhf_diningRoomMsg.html",
			id:"lhf_diningRoomMsg.html",
			extras:{
				roomId:roomId,
				isMine:isMine
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	
	//举报食堂
	reportDom.addEventListener('tap',function(){
		console.log("到达举报的事件监听");
		//跳转到对应的朋友的举报页面
		mui.openWindow({
			url:"lhf_report.html",
			id:"lhf_report.html",
			extras:{
				reportType:app.CHATROOMVILATION,
				reportObjectId:roomId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	
	//退出食堂的按键
	leaveDom.addEventListener('tap',function(){
		var btnArray = ['确认', '取消'];
		if(isMine==true){//这时候退出食堂等于关闭食堂
			mui.confirm('确定关闭该食堂？', '提示', btnArray, function(e) {
				if (e.index == 0) {
					if(midnightDiner.evalJS("sendLeaveRoom("+userId+","+roomId+")")==true){
						mui.toast("您关闭了食堂~( ´•︵•` )~");
						midnightDiner.evalJS("createRoomRequests()");
						mui.back();
					}
					else{
						mui.toast("发送关闭食堂请求出错啦！QAQ");
					}
				} 
				else {
					//取消
					mui.toast("食堂里还是蛮有意思的对吧！(*ﾟ∀ﾟ*)");
				}
			});
		}
		else{//普通的退出食堂
			mui.confirm('确定离开该食堂？', '提示', btnArray, function(e) {
				if (e.index == 0) {
				
					if(midnightDiner.evalJS("sendLeaveRoom("+userId+","+roomId+")")==true){
						mui.toast("您离开了食堂~( ´•︵•` )~");
						midnightDiner.evalJS("openRoomRequests()");
						mui.back();
					}
					else{
						mui.toast("发送离开食堂请求出错啦！QAQ");
					}
				} 
				else {
					//取消
					mui.toast("食堂里还是蛮有意思的对吧！(*ﾟ∀ﾟ*)");
				}
			});
		}
	});
	
	//点击他人头像，查看对方信息
/*	
	mui("#msgs").on("tap",".friLists",function(e){
		var otherId=this.otherId;
		console.log(otherId);
		mui.openWindow({
			url:"lhf_friMsgPage.html",
			id:"lhf_friMsgPage.html",
			extras:{
				friUserId:otherId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
*/

});


setObj[0].addEventListener("tap",function () {
	if(mui('.mui-off-canvas-wrap').offCanvas().isShown()){
		mui('.mui-off-canvas-wrap').offCanvas().close();
	}
	else{
		mui('.mui-off-canvas-wrap').offCanvas().show();
	}
});


//修改食堂信息后的配套动作，将被修改食堂信息的功能模块调用
//这里主要是更新显示的食堂名称
function reload(roomName,theTags){
	roomNameDom.innerHTML=roomName;
	midnightDiner.evalJS("renderStoredCreateRoom()");//由于修改了食堂名称，所以这里要重新加载食堂主页
}


//设置聊天记录滚动到最后一条
function resizeScreen (){
	areaMsgList.scrollTop = areaMsgList.scrollHeight+areaMsgList.offsetHeight;
}

//对当前窗口监听resize事件
window.addEventListener("resize",function(){
	resizeScreen ();
	document.getElementById("msgOutter").style.paddingBottom = "36px";
});


//监听用户输入，使得发送按钮变色
msgText.addEventListener("input",function(){
	var msgTextValue=msgText.value;
	if(msgTextValue.length>0){
		send.setAttribute("class","mui-btn mui-btn-block mui-btn-blue");
	}
	else{
		send.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");
	}
});


//发送的消息
function sendMsgFunc(myMsg){
	var myMsgHtml='<div class="myLists">'+
		'<div class="headerImg">'+
			'<img src="'+myIcon+'" class="imgMsg" />'+
		'</div>'+
		'<div class="myMsgWrapper">'+
			'<p class="msgRightGreen">'+myMsg+'</p>'+
		'</div>'+
	'</div>';
	areaMsgList.insertAdjacentHTML("beforeend",myMsgHtml);
}


//接收的消息
//如果对方头像为空，则默认使用系统配置的图片
function receiveMsgFunc(otherMsg,otherIcon,otherId){
	if(!app.isNotNull(otherIcon)){
		otherIcon="../images/1.jpg";
	}
	//console.log(otherIcon);
	var otherMsgHtml='<div class="friLists" otherId="'+otherId+'">'+
					'<div class="headerImg">'+
						'<img src="'+otherIcon+'" class="imgMsg" />'+
					'</div>'+
					'<div class="otherMsgWrapper">'+
						'<p class="otherId">'+otherId+':</p>'+
						'<p class="msgLeftWhite">'+otherMsg+'</p>'+
					'</div>'+
				'</div>';
	areaMsgList.insertAdjacentHTML("beforeend",otherMsgHtml);
}


// 初始化食堂的聊天记录
function initChatHistory() {
	var myId = userId;
	var chatHistoryList = app.getUserChatRoomHistory(myId, roomId);//获取缓存中的聊天记录
//	console.log("初始化聊天内容" + JSON.stringify(chatHistoryList));
	for (var i = 0 ; i < chatHistoryList.length ; i ++) {
		var singleMsg = chatHistoryList[i];
		if (singleMsg.flag == app.ME) {
			sendMsgFunc(singleMsg.msg);//渲染发送出去的消息
		} 
		else {
			receiveMsgFunc(singleMsg.msg,singleMsg.icon,singleMsg.sendId);//渲染接收到的消息
		}
	}
}

//用于弹出本页面
function outThisPage(){
	mui.back();
}