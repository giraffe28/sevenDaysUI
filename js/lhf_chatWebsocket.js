/*
本文件由lhf创建
本文件服务于“相遇的朋友”以及“深夜食堂”两大模块
本文件的任务是利用websocket建立与后端的连接，不仅用于聊天消息的收发，更是有心跳的定时动作
*/


mui.plusReady(function () {
	console.log("websocket的plusReady");
})

// 构建聊天业务CHAT
window.CHAT = {
	socket: null,
	init: function() {
		if (window.WebSocket) {
			// 如果当前的状态已经连接，那就不需要重复初始化websocket
			if (CHAT.socket != null && CHAT.socket != undefined 
				&& CHAT.socket.readyState == WebSocket.OPEN) {
				return false;
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
		// console.log("发送的消息" + msg);
		if (CHAT.socket != null && CHAT.socket != undefined && CHAT.socket.readyState == WebSocket.OPEN) {
			console.log("发送的消息" + msg);
			CHAT.socket.send(msg);
		} 
		else {
			// 重连websocket
			CHAT.init();
			setTimeout("CHAT.reChat('" + msg + "')", "1000");//延时一秒重新发送
		}
		
		// 渲染快照列表进行展示
		//reloadChatSnapshot();//大概率多余
	},
	reChat: function(msg) {
		console.log("消息重新发送...");
		CHAT.socket.send(msg);
	},
	wsopen: function() {
		console.log("websocket连接已建立...");
		var me = app.getUserGlobalInfo();//获取用户信息
		// 构建ChatMsg
		var chatMsg = new app.ChatMsg(me.userId, null, null, null);
		// 构建DataContent
		var dataContent = new app.DataContent(app.CONNECT, chatMsg, null);
		// 发送websocket
		
		CHAT.chat(JSON.stringify(dataContent));
		// 每次连接之后，获取用户的未读未签收消息列表
		console.log("连接建立的时候获取未读的消息");
		//fetchUnReadMsg();
		// 定时发送心跳
		clearInterval();//先清空心跳
		//setInterval("CHAT.keepalive()", 10000);
	},
	wsmessage: function(e) {
		console.log("接受到消息：" + e.data);	
		// 转换DataContent为对象
		var dataContent = JSON.parse(e.data);
		var action = dataContent.action;
		if (action === app.PULL_FRIEND) {//需要重新拉取好友列表
			fetchContactList();
			return false;
		}
		// 如果不是重新拉取好友列表，则获取聊天消息模型，渲染接收到的聊天记录
		var chatMsg = dataContent.msg;
		var msg = chatMsg.content;
		var friendUserId = chatMsg.senderId;
		var myId = chatMsg.receiverId;
		// 调用聊天webview的receiveMsg方法
		console.log("获取到的朋友id" + friendUserId);
		var chatWebview = plus.webview.getWebviewById("lhf_chat_" + friendUserId);
		var isRead = true;	// 设置消息的默认状态为已读
		if (chatWebview != null) {
			chatWebview.evalJS("receiveMsgFunc('" + msg + "')");
			chatWebview.evalJS("resizeScreen()");//让滚动条在最下方
		}
		else {
			isRead = false;	// chatWebview 聊天页面没有打开，标记消息未读状态
		}
		// 接受到消息之后，对消息记录进行签收
		var dataContentSign = new app.DataContent(app.SIGNED, null, chatMsg.msgId);
		CHAT.chat(JSON.stringify(dataContentSign));
		// 保存聊天历史记录到本地缓存
		app.saveUserChatHistory(myId, friendUserId, msg, app.FRIEND);//朋友发给我的信息进行保存
		//聊天快照
		app.saveUserChatSnapshot(myId, friendUserId, msg, isRead);
		// 渲染快照列表进行展示
		reloadChatSnapshot();
	},
	wsclose: function(e) {
		console.log("连接关闭QAQ"+e.code+"reason:"+e.reason);
	},
	wserror: function() {
		mui.toast("发生错误QAQ");
	},
	signMsgList: function(unSignedMsgIds) {
		// 构建批量签收对象的模型
		console.log("进入了签收消息的方法");
		var dataContentSign = new app.DataContent(app.SIGNED,null,unSignedMsgIds);
		// 发送批量签收的请求
		CHAT.chat(JSON.stringify(dataContentSign));
	},
	keepalive: function() {
		// 构建对象
		var dataContent = new app.DataContent(app.KEEPALIVE, null, null);
		// 发送心跳
		CHAT.chat(JSON.stringify(dataContent));
		// 定时执行函数
		//fetchContactList();//似乎多余了，会导致频繁刷新
		fetchUnReadMsg();
	}
};

// 每次获取服务器的未签收消息
function fetchUnReadMsg() {
	var user = app.getUserGlobalInfo();
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
				console.log("获取未读的消息" + JSON.stringify(unReadMsgList));
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

//重新加载聊天快照
function reloadChatSnapshot(){
	plus.webview.getWebviewById("lhf_chatRecord.html").evalJS("loadingChatSnapshot()");
}