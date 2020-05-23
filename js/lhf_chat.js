//dom定位
var areaMsgList = document.getElementById("msgs");
var msgText=document.getElementById("msg");
var send=document.getElementById("sendMsg");
var setObj=document.getElementsByClassName('mui-icon-settings');
var myFaceImg="../images/2.jpg";//自己的头像，实际上应该由app.js处获取
var me;//用户信息
var friendUserId;
var friendUserNickname;
var friendFaceImg;

mui.plusReady(function () {
	var chatWebview=plus.webview.currentWebview();//获取聊天页面
	chatWebview.setStyle({
		softinputMode:"adjustResize"//设置软键盘样式
	});
	//获取上一个页面传入的好友属性值
	friendUserId = chatWebview.friUserId;
	console.log(friendUserId);
	friendUserNickname=chatWebview.friUserNickname;
	friendFaceImg=chatWebview.friendFaceImg;
	me = app.getUserGlobalInfo();//获取用户信息
	//标题改为朋友的昵称
	document.getElementById("friNickname").innerHTML = friendUserNickname;
	//渲染初始化的聊天记录
	initChatHistory()
	//设置聊天记录在进入页面时自动滚动到最后一条
	resizeScreen();
	
	//发送消息时的处理
	send.addEventListener("tap",function(){
		var msgTextValue = msgText.value;
		if(msgTextValue.length>128){
			mui.toast("您输入的字数超过了128字节，请进行分批次发送");
		}
		else if(msgTextValue.length<1){
			msgText.focus();
			mui.toast("请输入信息");
		}
		else{
			//发送前判断网络状态
			var connectionStatus = plus.networkinfo.getCurrentType();
			if(connectionStatus==0 || connectionStatus==1){
				mui.toast("请打开网络连接！QAQ");
				return;
			}
			// 构建ChatMsg
			console.log(friendUserId);
			var chatMsg = new app.ChatMsg(me.userId, friendUserId, msgTextValue, null);
			// 构建DataContent
			var dataContent = new app.DataContent(app.CHAT, chatMsg, null);
			// 调用websocket发送消息
			var chatWebSocket = plus.webview.getWebviewById("lhf_index.html");
			console.log("CHAT.chat('" + JSON.stringify(dataContent) + "')");
			chatWebSocket.evalJS("CHAT.chat('" + JSON.stringify(dataContent) + "')");
			
			//我发送出去的信息进行保存
			app.saveUserChatHistory(me.userId, friendUserId, msgTextValue, app.ME);
			
			//保存聊天快照，由于是由自己发送的,所以默认为已读
			console.log(friendUserId);
			app.saveUserChatSnapshot(me.userId, friendUserId, msgTextValue, true);
			var chatWebSocket = plus.webview.getWebviewById("lhf_chatRecord.html");
			chatWebview.evalJS("loadingChatSnapshot()");
			sendMsgFunc(msgTextValue);//渲染发送出去的消息
			msgText.value="";//清空文本框中的内容
			send.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");//重置发送按钮的状态
			mui.toast("测试用：已发送");
		}
	});
	
});


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


setObj[0].addEventListener("tap",function () {
	if(mui('.mui-off-canvas-wrap').offCanvas().isShown()){
		mui('.mui-off-canvas-wrap').offCanvas().close();
	}
	else{
		mui('.mui-off-canvas-wrap').offCanvas().show();
	}
});


//确认框用于流程确认，最终版本时删除
/*mui.back = function(){
  	var btn = ["确定","取消"];
	mui.confirm('确认关闭当前窗口？','提示',btn,function(e){
	if(e.index==0){
 		mui.currentWebview.close();
		plus.webview.show("lhf_chatRecord.html","fade-in",200);
	}
	});
}*/




//发送消息
function sendMsgFunc(myMsg){
	var myMsgHtml='<div class="myLists">'+
		'<div class="headerImg">'+
			'<img src="'+myFaceImg+'" class="imgMsg" />'+
		'</div>'+
		'<div class="myMsgWrapper">'+
			'<p class="msgRightGreen">'+myMsg+'</p>'+
		'</div>'+
	'</div>';
	areaMsgList.insertAdjacentHTML("beforeend",myMsgHtml);
}

//接收消息
function receiveMsgFunc(friMsg){
	var friMsgHtml='<div class="friLists">'+
					'<div class="headerImg">'+
						'<img src="'+"../images/1.jpg"+'" class="imgMsg" />'+
					'</div>'+
					'<div class="friMsgWrapper">'+
						'<p class="msgLeftWhite">'+friMsg+'</p>'+
					'</div>'+
				'</div>';
	areaMsgList.insertAdjacentHTML("beforeend",friMsgHtml);
}


// 初始化用户的聊天记录
function initChatHistory() {
	var myId = me.userId;
	var chatHistoryList = app.getUserChatHistory(myId, friendUserId);//获取缓存中的聊天记录
	console.log("初始化聊天内容" + JSON.stringify(chatHistoryList));
	for (var i = 0 ; i < chatHistoryList.length ; i ++) {
		var singleMsg = chatHistoryList[i];
		if (singleMsg.flag == app.ME) {
			sendMsgFunc(singleMsg.msg);//渲染发送出去的消息
		} 
		else {
			receiveMsgFunc(singleMsg.msg);//渲染接受到的消息
		}
	}
}

//监听是否信赖的开关动作
document.getElementById("trustSwitch").addEventListener("toggle",function(event){
	if(event.detail.isActive){
		console.log("你选择了信赖");
		//向后端发送消息，并更新缓存
	
	}
	else{
		console.log("你选择了不信赖");
		//向后端发送消息，并更新缓存
	}
});
