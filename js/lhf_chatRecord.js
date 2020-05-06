mui.init();

mui.plusReady(function () {
	//从缓存中获取朋友列表，并且渲染到页面
    var thisWebview = plus.webview.currentWebview();
	
	thisWebview.addEventListener("show",function(){
		fetchUnReadMsg();
		loadingFriendRequests();
		loadingRecFriendRequests(); //加载推荐好友信息
		//从缓存中获取朋友列表，并且渲染到页面
		renderFriPage();
		
	});
	netChangeSwitch();//对网络连接进行监听
	//刷新页面
	var confidant = document.getElementById("confidant");
	confidant.addEventListener("tap", function() {
		loadingRecFriendRequests();
	});
	window.addEventListener("refresh",function(){
		console.log("触发chatRecord的refresh事件");
		loadingRecFriendRequests();//加载推荐好友信息
		//从缓存中获取朋友列表，并且渲染到页面
		fetchContactList();
		renderFriPage();
		//加载聊天快照
		loadingChatSnapshot();
		CHAT.init();
	});
});


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
		loadingChatSnapshot();
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
		fetchUnReadMsg();
		// 定时发送心跳
		// setInterval("CHAT.keepalive()", 10000);
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
		loadingChatSnapshot();
	},
	wsclose: function() {
		mui.toast("连接关闭QAQ");
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
		fetchUnReadMsg();
		fetchContactList();
	}
};

// 每次重连后获取服务器的未签收消息
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
				// 调用批量签收的方法
				CHAT.signMsgList(msgIds);
				// 刷新快照
				loadingChatSnapshot();
			}
		}
	});
}

// 展示聊天快照，渲染列表
function loadingChatSnapshot() {
	var user = app.getUserGlobalInfo();
	var chatSnapshotList = app.getUserChatSnapshot(user.userId);
	var chatFriendsList = document.getElementById("chatFriends");//获取朋友列表
	// 表示显示聊天快照的项
	var snapshotNode = null;
	var chatItem,friendId,friendItem,friNicknameNode;
	//根据缓存中的快照表进行聊天列表的渲染
	for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
		chatItem = chatSnapshotList[i];
		friendId = chatItem.friendId;//获取聊天快照对应的朋友id
		friendItem = chatFriendsList.querySelector('li[friendId="'+friendId+']"');//获取指定id朋友的项
		snapshotNode = friendItem.getElementsByClassName("mui-ellipsis")[0];//获取朋友的关于聊天快照的填写区域
		friNicknameNode = friendItem.querySelector('span[friId="'+friendId+']"');//获取朋友的关于昵称的项
		// 判断消息的已读或未读状态
		var isRead = chatItem.isRead;
		if (!isRead) {
			friNicknameNode.setAttribute("class","red_point");//未读消息标记红点
		}
		snapshotNode.innerHTML=chatItem.msg;//对html的对应区域赋值
	}
}


// websocket中,获取后端所有好友列表，并渲染
function fetchContactList() {
	loadingFriendRequests();
	renderFriPage();
}


//从缓存中获取朋友列表，并且渲染到页面
function renderFriPage(){
	//获取用户对象
	var me = app.getUserGlobalInfo();
	//获取好友列表
	var friList = app.getFriList();
	// console.log("从后端获取到的好友列表" + JSON.stringify(friList));
	//显示好友列表
	var friUlist = document.getElementById("chatFriends");
	if(friList!=null&&friList.length>0){
		var friHtml="";
		for(var i=0;i<friList.length;i++){
			friHtml+=renderFriends(friList[i]);
		}
		friUlist.innerHTML=friHtml;
		//批量绑定点击事件
		mui("#chatFriends").on("tap",".chatWithFriend",function(e){
			var friendUserId = this.getAttribute("friendId");
			var friendUserNickname = this.getAttribute("friendNickname");
			//打开聊天子页面
			mui.openWindow({
				url:"lhf_chat.html",
				id:"lhf_chat_"+friendUserId,//每个朋友的聊天页面独立
				extras:{
					friUserId:friendUserId,
					friUserNickname:friendUserNickname,
					friFaceImage:"../images/1.jpg"
				}
			});
			//点击进入聊天页面后，标记未读状态为已读
			app.readUserChatSnapshot(me.userId,friendUserId);
			//重新渲染快照列表
			loadingChatSnapshot();
		});
	}
	else{
		friUlist.innerHTML="";
	}
}

function loadingFriendRequests(){//发送朋友列表信息的加载
	var user=app.getUserGlobalInfo();//获取用户全局对象
	// console.log("发送朋友的请求"+user.userId);
	mui.ajax(app.serverUrl+"/Friends?userId="+user.userId,{
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			// console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				frilist = data.data;
				app.setFriList(frilist);//缓存朋友数据
			}
			else{
				mui.toast("发送好友列表加载请求出错啦！QAQ");
			}
		}
	});
}

function loadingRecFriendRequests(){//发送朋友推荐列表信息的资源请求以及加载
	var user=app.getUserGlobalInfo();//获取用户全局对象
	mui.ajax(app.serverUrl+"/Friend/getInterest/?userId="+user.userId,{
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				var friRecList=data.data;
				var friRecUlist=document.getElementById("recommendFri");
				if(friRecList!=null&&friRecList.length>0){
					var friHtml="";
					for(var i=0;i<friRecList.length;i++){
						friHtml+=renderFriendRecommend(friRecList[i]);
					}
					friRecUlist.innerHTML=friHtml;
				}else{
					friRecUlist.innerHTML="";
				}
			}
			else{
				mui.toast("发送好友推荐列表加载请求出错啦！QAQ");
			}
		}
	});
}


function renderFriendRecommend(friend) {//设置推荐朋友的html项内容
	var html="";
	// console.log("friend的信息"+JSON.stringify(friend));
	html='<li class="mui-table-view-cell" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'">'+
		    '<div class="mui-slider-right mui-disabled" friendId="'+friend.userId+'">'+
		        '<span class="mui-btn mui-btn-blue">发起闲聊</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
		        '<a href="lhf_chat.html">'+friend.nickname+'</a>'+
		    '</div>'+
		'</li>';
	// console.log(html);
	return html;
}


function renderFriends(friend){ //设置好友列表的html项内容
	var html="";
	// console.log("这是朋友"+JSON.stringify(friend));
	html='<li class="chatWithFriend mui-table-view-cell mui-media" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'">'+
				'<div class="mui-slider-right mui-disabled">'+
					'<span class="mui-btn mui-btn-red">删除</span>'+
				'</div>'+
				'<div class="mui-slider-handle">'+
					'<img class="mui-media-object mui-pull-left" src="../images/1.jpg">'+
					'<span friId="'+friend.userId+'">'+friend.nickname+'</span>'+
					'<p class="mui-ellipsis"></p>'+
				'</div>'+
			'</li>';
	return html;
}


var btnArray = ['确认', '取消'];
mui('.chatRecords').on('tap','.mui-btn-red',function() {
    //获取当前DOM对象<a>
	var elem1 = this;
    mui.confirm('确定结束与对方的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			//发送消息给后端
			var user=app.getUserGlobalInfo();//获取用户全局对象
			var par = elem1.parentElement.parentNode;
			var par1=par.getAttribute("friendId");
			if(uploadDelFri(user.userId,par1)==true){
				//从缓存中获取朋友列表，并且渲染到页面
				renderFriPage();
				//去掉聊天快照
				app.deleteUserChatSnapshot(user.userId,par1);
				// 没有回退
				
			}
			else{
				mui.toast("发送结束闲聊请求出错啦！QAQ");
				//取消：关闭滑动列表
				mui.swipeoutClose(par);
			}
		} 
		else {
			//取消：关闭滑动列表
			mui.swipeoutClose(par);
		}
	});
});

function uploadDelFri(userId,friendId){//发送删除好友信息到后端
	var status =false;
	mui.ajax(app.serverUrl+"/Friend/delete/?userId="+userId+"&deleteId="+friendId,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		async:false,
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应,进行数据的重新加载
			var myFriendList = data.data;
			app.setFriList(myFriendList);//修改缓存内容
			//重新加载推荐好友列表
			loadingRecFriendRequests();
			status=true;
		},
	});
	return status;
}


// 监听tap事件，解决 a标签 不能跳转页面问题
mui('body').on('tap','a',function(){document.location.href=this.href;});


mui('.makeChat').on('tap','.mui-btn-blue',function() {
	//获取当前DOM对象<a>
	var elem1 = this;
	//获取DOM对象
	var par = elem1.parentElement.parentNode;
	mui.confirm('确定展开与其为其最多一周的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
		var user=app.getUserGlobalInfo();//获取用户全局对象
		var par1=par.getAttribute("friendId");
		console.log(par1);
		if (e.index == 0) {
			var user=app.getUserGlobalInfo();//获取用户全局对象
			if(sendMakeFri(user.userId,par1)==true){
				//从缓存中获取朋友列表，并且渲染到页面i
				renderFriPage();
				loadingRecFriendRequests();
				//页面跳转至对应的聊天页面
			}
			else{
				mui.toast("发送闲聊请求出错啦！QAQ");
				//取消：关闭滑动列表
				mui.swipeoutClose(par);
			}
		} 
		else {
			//取消：关闭滑动列表
			mui.swipeoutClose(par);
		}}
	});
});

function sendMakeFri(userId,friendId){//对推荐好友进行发起聊天时，向后端发送消息
	var status =false;
	mui.ajax(app.serverUrl+"/Friend/add?userId="+userId+"&friendUserId="+friendId,{
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		async:false,
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应,进行数据的重新加载
			var myFriendList = data.data;
			console.log("对推荐好友发起闲聊时，得到的返回值：");
			console.log(JSON.stringify(data.data));
			app.setFriList(myFriendList);//修改缓存内容
			//重新加载推荐好友列表
			loadingRecFriendRequests();
			status = true;
		},
	});
	return status;
}


//监听网络状态更改
function netChangeSwitch(){
	document.addEventListener("netchange",function(){
		//网络状态获取与判断
		var connectionStatus=plus.networkinfo.getCurrentType();
		if(connectionStatus!=0 && connectionStatus!=1){//当重新打开网络连接时
			var chatRecordTitle=document.getElementById("chatRecordTitle");
			chatRecordTitle.innerHTML="相遇的朋友";
		}
		else{//当关闭网络连接时
			var chatRecordTitle=document.getElementById("chatRecordTitle");
			chatRecordTitle.innerHTML="相遇的朋友(未连接QAQ)";
		}
	});
	}
