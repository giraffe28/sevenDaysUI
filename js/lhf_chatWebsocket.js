/*
本文件由lhf创建
本文件服务于“相遇的朋友”以及“深夜食堂”两大模块
本文件的任务是利用websocket建立与后端的连接，不仅用于聊天消息的收发，更是有心跳的定时动作
*/

//获取个人中心页面
var me;


mui.plusReady(function () {
	console.log("websocket的plusReady");
	
	me = app.getUserGlobalInfo();
	
	var myinterval=null;
	// 构建聊天业务CHAT
	window.CHAT = {
		socket: null,
		init: function() {
			if (window.WebSocket) {
				// 如果当前的状态已经连接，那就不需要重复初始化websocket
				if (CHAT.socket != null && CHAT.socket != undefined && CHAT.socket.readyState == WebSocket.OPEN) {
					return false;
				}
				
				if(CHAT.socket!=null){
					console.log(CHAT.socket.readyState);
					//CHAT.socket.close();
				}
				
				CHAT.socket = new WebSocket(app.nettyServerUrl);
			
				CHAT.socket.onopen = CHAT.wsopen,
				CHAT.socket.onclose = CHAT.wsclose,
				CHAT.socket.onerror = CHAT.wserror,
				CHAT.socket.onmessage = CHAT.wsmessage;
			} 
			else {
				mui.toast("手机设备过旧，请升级手机设备T_T");
			}
		},
		chat: function(msg) {
			// 如果当前websocket的状态是已打开，则直接发送， 否则重连
			//console.log("发送的消息" + msg);
			if (CHAT.socket != null && CHAT.socket != undefined && CHAT.socket.readyState == WebSocket.OPEN) {
				//console.log("发送的消息" + msg);
				CHAT.socket.send(msg);
			} 
			else {
				offWebConnect();//先注销用户登录
				// 重连websocket
				CHAT.init();
				setTimeout("CHAT.reChat('" + msg + "')", "1000");//延时一秒重新发送
			}
			
			// 渲染快照列表进行展示
			//reloadChatSnapshot();//大概率多余
		},
		reChat: function(msg) {
		//	console.log("消息重新发送...");
			CHAT.socket.send(msg);
		},
		wsopen: function() {
		//	console.log("websocket连接已建立...");
			// 构建ChatMsg
			var chatMsg = new app.ChatMsg(me.userId, null, null, null);
			// 构建DataContent
			var dataContent = new app.DataContent(app.CONNECT, chatMsg, null);
			// 发送websocket
			
			CHAT.chat(JSON.stringify(dataContent));
			
			// 每次连接之后，获取用户的未读未签收消息列表
			//console.log("连接建立的时候获取未读的消息");
			fetchUnReadMsg();
			fetchUnReadRoomMsg();
		/*	
			// 构建ChatMsg
			var checkMsg = new app.ChatMsg(me.userId, null, null, null);
			// 构建对象
			dataContent = new app.DataContent(app.USEROUT, checkMsg, null);
			// 发送自己当前用户状态监测请求
			CHAT.chat(JSON.stringify(dataContent));
		*/
		   
			// 定时发送心跳
			if(myinterval!=null) clearInterval(myinterval);//先清空心跳
			myinterval=setInterval("CHAT.keepalive()", 4000);
		},
		wsmessage: function(e) {
			//console.log("接受到消息：" + e.data);	
			// 转换DataContent为对象
			var dataContent = JSON.parse(e.data);
			var action = dataContent.action;
			var chatMsg = dataContent.msg;
			
			if (action === app.PULL_FRIEND) {//需要重新拉取好友列表
				plus.webview.getWebviewById("lhf_chatRecord.html").evalJS("fetchContactList()");
				return false;
			}
			else if(action === app.USEROUT){//用户被封禁
				closeUserAction(chatMsg.content);
				return false;
			}
			else if(action === app.CHATROOMOUT){//聊天室状态变更
				roomBeClose(chatMsg.senderId);
				return false;
			}
			else if(action === app.MUTIUSER){//多登录的弹出
				kickoutUserAction(chatMsg.content);
				return false;
			}
			
			// 如果不是上面的操作，则获取聊天消息模型，渲染接收到的聊天记录
			var msg = chatMsg.content;
			var senderId = chatMsg.senderId;
			var myId = chatMsg.receiverId;
			
			if(action === app.CHAT){
			//if(action === 0){
				// 调用聊天webview的receiveMsg方法
			//	console.log("获取到的朋友id" + senderId);
				var chatWebview = plus.webview.getWebviewById("lhf_chat_" + senderId);
				var isRead = true;	// 设置消息的默认状态为已读
				if (chatWebview != null) {
					//console.log("webview不为空");
					chatWebview.evalJS("receiveMsgFunc('" + msg + "')");
					chatWebview.evalJS("resizeScreen()");//让滚动条在最下方
				}
				else {
					//console.log("webview为空");
					isRead = false;	// chatWebview 聊天页面没有打开，标记消息未读状态
				}
				// 接受到消息之后，对消息记录进行签收
				var dataContentSign = new app.DataContent(app.SIGNED, null, chatMsg.msgId);
				CHAT.chat(JSON.stringify(dataContentSign));
				// 保存聊天历史记录到本地缓存
				app.saveUserChatHistory(myId, senderId, msg, app.FRIEND);//朋友发给我的信息进行保存
				//聊天快照
				app.saveUserChatSnapshot(myId, senderId, msg, isRead);
				// 渲染快照列表进行展示
				reloadChatSnapshot();
			}
			
			else if(action === app.CHATROOM){//这时：myId是食堂id，senderId是发送者id
			//else if(action === 0){
				// 调用聊天webview的receiveMsg方法
				//console.log("获取到的食堂id" + myId);
				var chatWebview = plus.webview.getWebviewById("lhf_diningRoom_"+myId);
				var isRead = true;	// 设置消息的默认状态为已读
				if (chatWebview != null) {
					//console.log(dataContent.extend);
					chatWebview.evalJS("receiveMsgFunc('" + msg + "','"+ dataContent.extend+ "'," + senderId + ")");
					chatWebview.evalJS("resizeScreen()");//让滚动条在最下方
				}
				else {
					isRead = false;	// chatWebview 聊天页面没有打开，标记消息未读状态
				}
				// 接受到消息之后，对消息记录进行签收
				var dataContentSign = new app.DataContent(app.CHATROOMMSGSIGNED, null, chatMsg.msgId);
				//console.log("1");
				CHAT.chat(JSON.stringify(dataContentSign));
				//console.log("2");
				// 保存食堂的聊天历史记录到本地缓存app.FRIEND表示是别人发的
				app.saveUserChatRoomHistory(me.userId, senderId, myId, msg, app.FRIEND, dataContent.extend);
				//console.log("3");
				//食堂的聊天快照
				app.saveUserChatRoomSnapshot(me.userId, myId, msg, isRead);
				//console.log("4");
				// 渲染食堂的快照列表进行展示
				reloadChatRoomSnapshot();
				//console.log("5");
			}
		},
		wsclose: function(e) {
			console.log("连接关闭QAQ"+e.code+"reason:"+e.reason);
		},
		wserror: function() {
			CHAT.socket.close();
			mui.toast("发生错误QAQ");
		},
		signMsgList: function(unSignedMsgIds) {
			// 构建批量签收对象的模型
			//console.log("进入了签收消息的方法");
			var dataContentSign = new app.DataContent(app.SIGNED,null,unSignedMsgIds);
			// 发送批量签收的请求
			CHAT.chat(JSON.stringify(dataContentSign));
		},
		signroomMsgList: function(unSignedMsgIds) {
			// 构建批量签收对象的模型
			//console.log("进入了签收消息的方法");
			var dataContentSign = new app.DataContent(app.CHATROOMMSGSIGNED,null,unSignedMsgIds);
			// 发送批量签收的请求
			CHAT.chat(JSON.stringify(dataContentSign));
		},
		keepalive: function() {
			//心跳
		//	console.log("心跳");
			
			var checkMsg = new app.ChatMsg(me.userId, null, null, null);
			var dataContent = new app.DataContent(app.KEEPALIVE, checkMsg, null);
			CHAT.chat(JSON.stringify(dataContent));//发送心跳
			
			checkMsg = new app.ChatMsg(me.userId, null, null, null);
			dataContent = new app.DataContent(app.USEROUT, checkMsg, null);
			CHAT.chat(JSON.stringify(dataContent));// 发送自己当前用户状态监测请求
			
			// 定时执行函数
			//fetchUnReadMsg();//故意的读取操作，用于保存连接
		}
	};
});



// 每次获取服务器的未签收消息
function fetchUnReadMsg() {
	var user = me;
	console.log("获取后端未读消息");
	var msgIds = ",";	// 格式：  ,1001,1002,1003,
	mui.ajax(app.serverUrl + "/unreadMsgs?acceptUserId=" + user.userId,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			if (data.status == 200) {
				var unReadMsgList = data.data;
				//console.log("获取未读的消息" + JSON.stringify(unReadMsgList));
				// 1. 保存聊天记录到本地
				// 2. 保存聊天快照到本地
				// 3. 对这些未签收的消息，批量签收
				if (unReadMsgList==null || unReadMsgList==undefined) {
					return false;
				}
				if(unReadMsgList.length == 0 ) {
					return false;
				} 
				for (var i = 0 ; i < unReadMsgList.length ; i ++) {
					var msgObj = unReadMsgList[i];
					// 逐条存入聊天记录
					app.saveUserChatHistory(msgObj.receiveUser.userId,msgObj.sendUser.userId,msgObj.msgContent, app.FRIEND);
					
					// 存入聊天快照
					app.saveUserChatSnapshot(msgObj.receiveUser.userId,msgObj.sendUser.userId,msgObj.msgContent, false);
					// 拼接批量接受的消息id字符串，逗号间隔
					msgIds += msgObj.msgId;
					msgIds += ",";
				}
				console.log("获取服务器未签收消息并加载聊天快照");
				// 调用批量签收的方法
				CHAT.signMsgList(msgIds);
				// 刷新快照
				reloadChatSnapshot();
			}
		}
	});
}


// 每次获取服务器的聊天室未签收消息
function fetchUnReadRoomMsg() {
	var userId = me.userId;
	console.log("获取后端聊天室未读消息");
	var msgIds = ",";	// 格式：  ,1001,1002,1003,
	mui.ajax(app.serverUrl + "/chatRoomMsg/unreadMsgs",{
		data:{
			acceptUserId:userId
		},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			if (data.status == 200) {
				var unReadMsgList = data.data;
				//console.log("获取未读的消息" + JSON.stringify(unReadMsgList));
				// 1. 保存聊天记录到本地
				// 2. 保存聊天快照到本地
				// 3. 对这些未签收的消息，批量签收
				if (unReadMsgList==null || unReadMsgList==undefined) {
					return false;
				}
				if(unReadMsgList.length == 0 ) {
					return false;
				} 
				for (var i = 0 ; i < unReadMsgList.length ; i ++) {
					var msgObj = unReadMsgList[i];
					// 逐条存入聊天记录app.FRIEND表示是别人发的
					app.saveUserChatRoomHistory(userId, msgObj.senderId, msgObj.chatroomId, msgObj.cmsgContent, app.FRIEND, msgObj.senderIcon);
					
					// 存入聊天快照
					app.saveUserChatRoomSnapshot(userId, msgObj.chatroomId, msgObj.cmsgContent, false);
					// 拼接批量接受的消息id字符串，逗号间隔
					msgIds += msgObj.cmsgId;
					msgIds += ",";
				}
				console.log("获取服务器未签收聊天室消息并加载聊天快照");
				// 调用批量签收的方法
				
				CHAT.signroomMsgList(msgIds);
				// 刷新快照
				reloadChatRoomSnapshot();
			}
		}
	});
}


//重新加载聊天快照
function reloadChatSnapshot(){
	plus.webview.getWebviewById("lhf_chatRecord.html").evalJS("loadingChatSnapshot()");
}

//重新加载聊天室的聊天快照
function reloadChatRoomSnapshot(){
	plus.webview.getWebviewById("lhf_midnightDiner.html").evalJS("loadingChatSnapshot()");
}


//用户被封禁的退出
function closeUserAction(msg){
	mui.toast(msg);
	plus.webview.getWebviewById("ll_personalCenter.html").evalJS("requestLogOff()");
}


//用户被多登录挤下
function kickoutUserAction(msg){
	mui.toast(msg);
	mui.ajax(app.serverUrl+'/user/loginoff', {
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取用户信息；
			if (data.status == 200) {
				var webviews= plus.webview.all();
				//打开login页面
				mui.openWindow("crb_login1.html","crb_login1.html");
				console.log("执行至跳转到登录页面");
				setTimeout(function(){
					for(var i=0;i<webviews.length;i++){
						webviews[i].close();
					}
				},1000);
			}
			else{
				app.showToast(data.msg, "error");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理
			mui.toast("好像出了一些问题？QAQ")
			// console.log(JSON.stringify(data.data));
		}
	});
}


//聊天室封禁的弹出
function roomBeClose(roomId){
	plus.webview.getWebviewById("lhf_midnightDiner.html").evalJS("loadAllRoom()");
	
	closedRoom=plus.webview.getWebviewById("lhf_diningRoom_"+roomId);
	if(app.isNotNull(closedRoom)){
		closedRoom.evalJS("outThisPage()");
	}
}


//重连webSocket前，先注销用户的在线状态
function offWebConnect(){
	mui.ajax(app.serverUrl+'/user/loginoff', {
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功；
			if (data.status == 200) {
				console.log("重连webSocket前，先注销用户的在线状态");
			}
			else{
				console.log("重连webSocket前，先注销用户的在线状态返回非200");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理
			mui.toast("好像出了一些问题？QAQ");
			// console.log(JSON.stringify(data.data));
		}
	});
}