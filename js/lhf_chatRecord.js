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
		console.log("触发chatRecord的show事件");
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
	console.log("加载聊天快照");
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
	//	console.log(friendId);
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
			
			var friName=friendUserNickname;
			if(app.isNotNull(friendNoteName)){
				friName=friendNoteName;
			}
			
			friNicknameNode[0].setAttribute("class","");
			//console.log(friendUserId);
			//打开聊天子页面
			mui.openWindow({
				url:"lhf_chat.html",
				id:"lhf_chat_"+friendUserId,//每个朋友的聊天页面独立
				extras:{
					friUserId:friendUserId,
					friendLevel:friendLevel,
					friName:friName,
					friFaceImage:"../images/1.jpg"
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
	mui.ajax(app.serverUrl+"/Friends?userId="+user.userId,{
		async:false, 
		data:{},//上传的数据
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
			}
			else{
				mui.toast("发送好友列表加载请求出错啦！QAQ");
			}
		}
	});
}

//发送朋友推荐列表信息的资源请求以及加载
function loadingRecFriendRequests(){
	var user=app.getUserGlobalInfo();//获取用户全局对象
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/Friend/getInterest/?userId="+user.userId,{
		async:false, 
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
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


//设置推荐朋友的html项内容
function renderFriendRecommend(friend) {
	var html="";
	// console.log("friend的信息"+JSON.stringify(friend));
	html='<li class="mui-table-view-cell" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'">'+
		    '<div class="mui-slider-right mui-disabled" friendId="'+friend.userId+'">'+
		        '<span class="mui-btn mui-btn-blue">发起闲聊</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
				'<img class="mui-media-object mui-pull-left" src="../images/1.jpg">'+
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
	// console.log("这是朋友"+JSON.stringify(friend));
	html='<li class="chatWithFriend mui-table-view-cell mui-media" friendId="'+friend.userId+'" friendNickname="'+friend.nickname+'" friendLevel="'+friend.level+'" friendNoteName="'+friend.remark+'">'+
				'<div class="mui-slider-right mui-disabled">'+
					'<span class="mui-btn mui-btn-red">删除</span>'+
				'</div>'+
				'<div class="mui-slider-handle">'+
					'<img class="mui-media-object mui-pull-left" src="../images/1.jpg">'+
					'<span friId="'+friend.userId+'">'+nameShow+'</span>'+
					'<p class="mui-ellipsis"></p>'+
				'</div>'+
			'</li>';
	//console.log(html);
	return html;
}


var btnArray = ['确认', '取消'];
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
			}
			else{
				mui.toast("发送结束闲聊请求出错啦！QAQ");
			}
		},
	});
	return status;
}


// 监听tap事件，解决 a标签 不能跳转页面问题
mui('body').on('tap','a',function(){document.location.href=this.href;});


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
				setTimeout("loadingRecFriendRequests()",500);
				//页面跳转至对应的聊天页面todo
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
				status = true;
			}
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
