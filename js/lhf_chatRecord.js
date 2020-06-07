/*
本文件由lhf创建维护
本文件服务于lhf_chatRecord（即相遇的朋友主页面）
*/

mui.init();


mui.plusReady(function () {
	//从缓存中获取朋友列表，并且渲染到页面
    var thisWebview = plus.webview.currentWebview();
	
	thisWebview.addEventListener("show",function(){
		//fetchUnReadMsg();
//		console.log("触发chatRecord的show事件");
		//fetchContactList();
		renderFriPage();
		//加载聊天快照
		loadingChatSnapshot();
	});
	netChangeSwitch();//对网络连接进行监听
	//刷新页面
	var confidant = document.getElementById("confidant");
	var num=0;
	confidant.addEventListener("tap", function() {
		if(num==0){//避免关闭时也刷新
			loadingRecFriendRequests();
		}
		num=Math.abs(num-1);
	});
	
	window.addEventListener("refresh",function(){
		 console.log("触发chatRecord的refresh事件");
		//从缓存中获取朋友列表，并且渲染到页面
		fetchContactList();
	});
});


// 展示聊天快照，渲染列表
function loadingChatSnapshot() {
//	console.log("加载聊天快照");
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
	//	console.log(JSON.stringify(chatItem));
//		console.log(friendId);
		friendItem = chatFriendsList.querySelector('li[friendId="'+friendId+'"]');//获取指定id朋友的项
//		console.log(friendId);
		snapshotNode = friendItem.getElementsByClassName("mui-ellipsis")[0];//获取朋友的关于聊天快照的填写区域
		friNicknameNode = friendItem.querySelector('span[friId="'+friendId+'"]');//获取朋友的关于昵称的项
		// 判断消息的已读或未读状态
		var isRead = chatItem.isRead;
		if (!isRead) {
			friNicknameNode.setAttribute("class","red_point");//未读消息标记红点
		}
		snapshotNode.innerHTML=chatItem.msg;//对html的对应区域赋值
	}
}


// 获取后端所有好友列表，并渲染
function fetchContactList() {
	console.log("刷新加载好友列表所有内容");
	loadingFriendRequests();
	renderFriPage();
	//加载聊天快照
	loadingChatSnapshot();
	//loadingChatSnapshot();
}


//从缓存中获取朋友列表，并且渲染到页面
function renderFriPage(){
	//console.log("到达从缓存中获取数据加载到页面");
	//获取用户对象
	var me = app.getUserGlobalInfo();
	//获取好友列表
	var friList = app.getFriList();
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
			var friendNoteName = this.getAttribute("friendNoteName");
			var friendLevel = this.getAttribute("friendLevel");
			var friNicknameNode = this.getElementsByTagName('span');//获取朋友的关于昵称的项
			var friendIcon = this.getElementsByTagName('img')[0].src;//获取朋友头像
			
			//console.log(friendIcon);
			
			var friName=friendUserNickname;
			if(app.isNotNull(friendNoteName)){
				friName=friendNoteName;
			}
			
			friNicknameNode[1].setAttribute("class","");
			//console.log(friendUserId);
			//打开聊天子页面
			mui.openWindow({
				url:"lhf_chat.html",
				id:"lhf_chat_"+friendUserId,//每个朋友的聊天页面独立
				extras:{
					friUserId:friendUserId,
					friendLevel:friendLevel,
					friName:friName,
					friendFaceImg:friendIcon
				},
				createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
			//点击进入聊天页面后，标记未读状态为已读
			app.readUserChatSnapshot(me.userId,friendUserId);
		});
	}
	else{
		friUlist.innerHTML="";
	}
}


//发送朋友列表信息的加载
function loadingFriendRequests(){
	var user=app.getUserGlobalInfo();//获取用户全局对象
	//console.log("发送朋友的请求"+user.userId);
	plus.nativeUI.showWaiting("请稍后");
	mui.ajax(app.serverUrl+"/Friends?userId="+user.userId,{
		data:{},//上传的数据
		async:false,
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			// console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				var frilist = data.data;
				app.setFriList(frilist);//缓存朋友数据
				plus.nativeUI.closeWaiting();
			}
			else{
				mui.toast("发送好友列表加载请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.closeWaiting();
			console.log("发送朋友列表加载error");
			// console.log(JSON.stringify(data.data));
		}
	});
}


//发送朋友推荐列表信息的资源请求以及加载
function loadingRecFriendRequests(){
	var user=app.getUserGlobalInfo();//获取用户全局对象
	plus.nativeUI.showWaiting("等等给你推荐几个知己(ง ˙ω˙)ว ");
	mui.ajax(app.serverUrl+"/Friend/getInterest/?userId="+user.userId,{
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:15000,//超时时间设置为15秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			plus.nativeUI.closeWaiting();
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
				plus.nativeUI.closeWaiting();
				mui.toast("发送好友推荐列表加载请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.closeWaiting();
			console.log("发送获取推荐朋友列表出错error");
			// console.log(JSON.stringify(data.data));
		}
	});
}


//设置推荐朋友的html项内容
function renderFriendRecommend(friend) {
	var html="";
	var friIcon=friend.icon;
	if(friend.icon==""){
		friIcon="../images/1.jpg";
	}
	//console.log(friIcon);
	// console.log("friend的信息"+JSON.stringify(friend));
	html='<li class="mui-table-view-cell" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'">'+
		    '<div class="mui-slider-right mui-disabled" friendId="'+friend.userId+'">'+
		        '<span class="mui-btn mui-btn-blue">发起闲聊</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
				'<img class="mui-media-object mui-pull-left" src="'+friIcon+'">'+
		        '<a href="">'+friend.nickname+'</a>'+
		    '</div>'+
		'</li>';
	// console.log(html);
	return html;
}


//设置好友列表的html项内容
function renderFriends(friend){ 
	var html="";
	var nameShow=friend.nickname;
	if(app.isNotNull(friend.remark)){
		nameShow=friend.remark;
	}
	var friIcon=friend.icon;
	if(friend.icon==""){
		friIcon="../images/1.jpg";
	}
//	console.log(friIcon);
	// console.log("这是朋友"+JSON.stringify(friend));
	html='<li class="chatWithFriend mui-table-view-cell mui-media" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'" friendLevel="'+friend.level+'" friendNoteName="'+friend.remark+'">'+
				'<div class="mui-slider-right mui-disabled">'+
					'<span class="mui-btn mui-btn-red">删除</span>'+
				'</div>'+
				'<div class="mui-slider-handle">'+
					'<img class="mui-media-object mui-pull-left" src="'+friIcon+'">'+
					'<span friId="'+friend.userId+'">'+nameShow+'</span>'+
					'<p class="mui-ellipsis"></p>'+
				'</div>'+
			'</li>';
	//console.log(html);
	return html;
}


var btnArray = ['确认', '取消'];
//结束与朋友的聊天
mui('.chatRecords').on('tap','.mui-btn-red',function() {
    //获取当前DOM对象
	var elem1 = this;
    mui.confirm('确定结束与对方的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			//发送消息给后端
			var user=app.getUserGlobalInfo();//获取用户全局对象
			var par = elem1.parentElement.parentNode;
			var par1=par.getAttribute("friendId");
			if(uploadDelFri(user.userId,par1)==true){
				//去掉聊天快照
				app.deleteUserChatSnapshot(user.userId,par1);
				//重新获取朋友列表，并且渲染到页面
				fetchContactList();
			}
			else{
				//关闭滑动列表
				mui.toast("缘分未尽？好像出了一些问题QAQ");
				mui.swipeoutClose(par);
			}
		} 
		else {
			//取消：关闭滑动列表
			mui.swipeoutClose(par);
		}
	});
});


//发送删除好友信息到后端
function uploadDelFri(userId,friendId){
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
			if(data.status==200){
				status=true;
				mui.toast("Σ(っ °Д °;)っ 刚刚那个家伙，原地消失了!!!");
				
				var indexWebview = plus.webview.getWebviewById("index.html");
				var chatMsg = new app.ChatMsg(userId, friendId, null, null);
				var dataContent = new app.DataContent(app.PULL_FRIEND, chatMsg, null);
				indexWebview.evalJS("CHAT.chat('"+JSON.stringify(dataContent)+"')");
			}
		},
	});
	console.log(status);
	return status;
}


// 监听tap事件，解决 a标签 不能跳转页面问题
mui('body').on('tap','a',function(){document.location.href=this.href;});


//推荐朋友的展开聊天事件
mui('.makeChat').on('tap','.mui-btn-blue',function() {
	//获取当前DOM对象
	var elem1 = this;
	//获取DOM对象
	var par = elem1.parentElement.parentNode;
	mui.confirm('确定展开与其为其最多一周的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			var user=app.getUserGlobalInfo();//获取用户全局对象
			var par1=par.getAttribute("friendId");
		//	console.log(par1);
		
			var user=app.getUserGlobalInfo();//获取用户全局对象
			if(sendMakeFri(user.userId,par1)==true){
				//获取朋友列表，并且渲染到页面
				fetchContactList();
				//loadingRecFriendRequests();//用户进入聊天页了，不用加载推荐列表
				document.getElementById("recomendBtn").setAttribute("class","mui-table-view-cell mui-collapse");//将折叠面板收起来
				
				//页面跳转至对应的聊天页面
				var friendUserNickname = par.getAttribute("friendNickname");
				var friendIcon = par.getElementsByTagName('img')[0].src;//获取朋友头像
				gotoFriendChat(par1,friendUserNickname,friendIcon);//id、名称、头像
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
		}
	});
});


//对推荐好友进行发起聊天时，向后端发送消息
function sendMakeFri(userId,friendId){
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
			if(data.status==200){
				
				var indexWebview = plus.webview.getWebviewById("index.html");
				var chatMsg = new app.ChatMsg(userId, friendId, null, null);
				var dataContent = new app.DataContent(app.PULL_FRIEND, chatMsg, null);
				indexWebview.evalJS("CHAT.chat('"+JSON.stringify(dataContent)+"')");
				
				status = true;
			}
		},
	});
	return status;
}


//打开聊天页面
function gotoFriendChat(friendUserId,friName,friendIcon){
//	console.log(friendIcon);
	mui.openWindow({
		url:"lhf_chat.html",
		id:"lhf_chat_"+friendUserId,//每个朋友的聊天页面独立
		extras:{
			friUserId:friendUserId,
			friendLevel:0,//默认为不信任
			friName:friName,
			friendFaceImg:friendIcon
		},
		createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
	});
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
