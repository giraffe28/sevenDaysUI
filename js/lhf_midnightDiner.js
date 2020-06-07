/*
本文件由lhf创建维护
本文件服务于lhf_midnightDiner（即深夜食堂主页面）

无需传参
*/

mui.init();

//获取用户对象
var me;
//通用的二次确认使用
var btnArray = ['确认', '取消'];

//记录通用的几处用于显示食堂数的位置
var closedRoomNums=document.getElementById("closedRoomNums");
var myRoomNums=document.getElementById("myRoomNums");
var openRoomNums=document.getElementById("openRoomNums");

mui.plusReady(function () {
	
	me = app.getUserGlobalInfo();
	//加载页面信息
	loadAllRoom();
	
	//监听show事件，用于加载缓存中的列表
	var thisWebview = plus.webview.currentWebview();
	thisWebview.addEventListener("show",function(){
//		console.log("触发midnightDiner的show事件");
		renderStoredClosedRoom();
		renderStoredCreateRoom();
		renderStoredOpenRoom();
		//加载聊天快照
		setTimeout("loadingChatSnapshot()",200);//延迟一点点
	});
	
	//刷新聊天室推荐(食堂街道)
	var recommendRoomOpen = document.getElementById("recommendRoomOpen");
	var num=0;
	recommendRoomOpen.addEventListener('tap', function() {
		if(num==0){//避免关闭时也刷新
			recommendRoomRequests();
		}
		num=Math.abs(num-1);
	});
	
	//开张新食堂
	document.getElementById("popCreateRoom").addEventListener('tap',function(){
		mui.openWindow({
			url:"lhf_addDiningRoom.html",
			id:"lhf_addDiningRoom",
			extras:{
				userId:me.userId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	//搜索食堂
	document.getElementById("search").addEventListener('tap',function(){
		//打开搜索页面
		mui.openWindow({
			url:"lhf_searchDiningRoom.html",
			id:"lhf_searchDiningRoom",
			extras:{
				userId:me.userId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	
});




//加载聊天室主页的所有内容（以交互的形式刷新加载）(推荐聊天室由于每次打开都会刷新，所以无需随页面而加载)
function loadAllRoom(){
	closedRoomRequests();
	createRoomRequests();
	openRoomRequests();
}


//渲染保存在缓存中的已加入但是已关闭的食堂
function renderStoredClosedRoom(){
	//console.log("到达从缓存中获取留恋的足迹数据加载到页面");
	//获取食堂列表
	var closedRoomList = app.getCloseRoomList();
	//显示食堂列表
	var closedRoomUlist = document.getElementById("closedRoom");
	if(closedRoomList!=null&&closedRoomList.length>0){
		var closedHtml="";
		closedRoomNums.innerHTML=closedRoomList.length;//显示房间数
		for(var i=0;i<closedRoomList.length;i++){
			closedHtml+=renderClosedRoom(closedRoomList[i]);
		}
		closedRoomUlist.innerHTML=closedHtml;
		//批量绑定点击事件
		mui("#closedRoom").on("tap",".closedRoom",function(e){
			var roomId = this.getAttribute("roomId");
			//打开食堂信息子页面
			mui.openWindow({
				url:"lhf_diningRoomMsg.html",
				id:"lhf_diningRoomMsg_"+roomId,//每个食堂的信息独立
				extras:{
					roomId:roomId,
					isMine:false
				},
				createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});
		//退出已加入且已关闭的食堂
		mui('#closedRoom').on('tap','.mui-btn-blue',function() {
			//获取当前DOM对象
			var elem1 = this;
			leaveRoom(elem1,1);
		});
	}
	else{
		closedRoomNums.innerHTML=0;//显示房间数
		closedRoomUlist.innerHTML="";
	}
}


//渲染保存在缓存中的加入的且处在开启状态的食堂
function renderStoredOpenRoom(){
	//console.log("到达从缓存中获取入座的食堂数据加载到页面");
	//获取食堂列表
	var openRoomList = app.getOpenRoomList();
	//显示食堂列表
	var openRoomUlist = document.getElementById("openRoom");
	if(openRoomList!=undefined && openRoomList!=null && openRoomList.length>0){
		var openHtml="";
		openRoomNums.innerHTML=openRoomList.length;//显示房间数
		for(var i=0;i<openRoomList.length;i++){
			openHtml+=renderOpenRoom(openRoomList[i]);
		}
		openRoomUlist.innerHTML=openHtml;
		//批量绑定点击事件
		mui("#openRoom").on("tap",".openRoom",function(e){
			var roomId = this.getAttribute("roomId");
			var roomName = this.getAttribute("roomName");
			//打开食堂子页面
			mui.openWindow({
				url:"lhf_diningRoom.html",
				id:"lhf_diningRoom_"+roomId,//每个食堂的聊天页面独立
				extras:{
					roomId:roomId,
					isMine:false,
					userId:me.userId,
					roomName:roomName,
					myIcon:me.icon
				},
				createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});
		//退出已加入且开启状态的食堂
		mui('#openRoom').on('tap','.mui-btn-blue',function() {
			//获取当前DOM对象
			var elem1 = this;
			leaveRoom(elem1,2);
		});
	}
	else{
		openRoomUlist.innerHTML="";
		openRoomNums.innerHTML=0;//显示房间数
	}
}


//渲染保存在缓存中的自己创建的食堂
function renderStoredCreateRoom(){
	//console.log("到达从缓存中获取我的食堂数据加载到页面");
	//获取食堂列表
	var createRoomList = app.getCreateRoomList();
	//显示食堂列表
	var createRoomUlist = document.getElementById("createRoom");
	if(createRoomList!=undefined && createRoomList!=null && createRoomList.length>0){
		var createHtml="";
		myRoomNums.innerHTML=createRoomList.length;//显示房间数
		for(var i=0;i<createRoomList.length;i++){
			createHtml+=renderCreateRoom(createRoomList[i]);
		}
		createRoomUlist.innerHTML=createHtml;
		//批量绑定点击事件
		mui("#createRoom").on("tap",".createRoom",function(e){
			var roomId = this.getAttribute("roomId");		
			var roomName = this.getAttribute("roomName");
//			console.log(roomName);
			//打开聊天子页面
			mui.openWindow({
				url:"lhf_diningRoom.html",
				id:"lhf_diningRoom_"+roomId,//每个食堂的聊天页面独立
				extras:{
					roomId:roomId,
					isMine:true,
					userId:me.userId,
					roomName:roomName,
					myIcon:me.icon
				},
				createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});
	}
	else{
		myRoomNums.innerHTML=0;//显示房间数
		createRoomUlist.innerHTML="";
	}
}


//离开食堂的操作（用于退出已加入的食堂，不区分是开启还是关闭状态）
function leaveRoom(elem1,tag){
	//获取DOM对象
	var par = elem1.parentElement.parentNode;
	var btnArray = ['确认', '取消'];
	mui.confirm('确定离开该食堂？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			var par1=par.getAttribute("roomId");
	//		console.log(par1);
		
			if(sendLeaveRoom(me.userId,par1)==true){
				mui.toast("您离开了食堂~( ´•︵•` )~");
				//获取新的已加入且关闭中的食堂列表，并且渲染到页面
				if(tag==1){
					closedRoomRequests();
				}
				else if(tag==2){//获取新的已加入且开启中的食堂列表，并且渲染到页面
					openRoomRequests();
				}
				else{//错误时
					Console.log("离开食堂的操作tag非法");
				}
			}
			else{
				mui.toast("发送离开食堂请求出错啦！QAQ");
				//取消：关闭滑动列表
				mui.swipeoutClose(par);
			}
		} 
		else {
			//取消：关闭滑动列表
			mui.swipeoutClose(par);
		}
	});
}


//设置留恋的足迹的html项内容（已加入但是已经关闭的食堂）
function renderClosedRoom(room) {
	var html="";
	html='<li class="mui-table-view-cell closedRoom room mui-media" roomId="'+room.chatroomId+'" roomName="'+room.chatroomName+'">'+
		    '<div class="mui-slider-right mui-disabled" roomId="'+room.chatroomId+'">'+
		        '<span class="mui-btn mui-btn-blue">离开食堂</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
				'<img class="mui-media-object mui-pull-left" src="../images/diner.png">'+
		        '<span>'+room.chatroomName+'</span>'+
				'<p class="mui-ellipsis"></p>'+
		    '</div>'+
		'</li>';
	// console.log(html);
	return html;
}


//设置食堂街道的html项内容（推荐的食堂）
function renderRecommendRoom(room) {
	var html="";
	html='<li class="mui-table-view-cell recommendRoom room mui-media" roomId="'+room.chatroomId+'" roomName="'+room.chatroomName+'">'+
		    '<div class="mui-slider-right mui-disabled" roomId="'+room.chatroomId+'">'+
		        '<span class="mui-btn mui-btn-blue">加入食堂</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
				'<img class="mui-media-object mui-pull-left" src="../images/diner.png">'+
		        '<span>'+room.chatroomName+'</span>'+
		    '</div>'+
		'</li>';
	// console.log(html);
	return html;
}


//设置我的食堂的html项内容（自己创建的食堂）
function renderCreateRoom(room) {
	var html="";
	html='<li class="mui-table-view-cell createRoom room mui-media" roomId="'+room.chatroomId+'" roomName="'+room.chatroomName+'">'+
				'<img class="mui-media-object mui-pull-left" src="../images/diner.png">'+
				'<div class="mui-media-body">'+
					'<span roomId="'+room.chatroomId+'">'+room.chatroomName+'</span>'+
					'<p class="mui-ellipsis"></p>'+
				'</div>'+
		'</li>';
	// console.log(html);
	return html;
}


//设置入座的食堂的html项内容（已加入且仍处在开启状态的食堂）
function renderOpenRoom(room) {
	var html="";
	html='<li class="mui-table-view-cell openRoom room mui-media" roomId="'+room.chatroomId+'" roomName="'+room.chatroomName+'">'+
		    '<div class="mui-slider-right mui-disabled" roomId="'+room.chatroomId+'">'+
		        '<span class="mui-btn mui-btn-blue">离开食堂</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
				'<img class="mui-media-object mui-pull-left" src="../images/diner.png">'+
		        '<span roomId="'+room.chatroomId+'">'+room.chatroomName+'</span>'+
				'<p class="mui-ellipsis"></p>'+
		    '</div>'+
		'</li>';
	// console.log(html);
	return html;
}


//发送获取过去加入但是已经关闭的食堂列表的资源请求以及加载
function closedRoomRequests(){
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/getBeforeRoomListById",{
		data:{
			userId:me.userId
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
				
				var closedRoomList=data.data;
				app.setCloseRoomList(closedRoomList);//缓存数据
				
				var closedRoomUlist=document.getElementById("closedRoom");
				if(closedRoomList!=null&&closedRoomList.length>0){
					var closedHtml="";
					closedRoomNums.innerHTML=closedRoomList.length;//显示房间数
					for(var i=0;i<closedRoomList.length;i++){
						closedHtml+=renderClosedRoom(closedRoomList[i]);
					}
					closedRoomUlist.innerHTML=closedHtml;
					//批量绑定点击事件
					mui("#closedRoom").on("tap",".closedRoom",function(e){
						var roomId = this.getAttribute("roomId");		
					
						//打开食堂信息子页面
						mui.openWindow({
							url:"lhf_diningRoomMsg.html",
							id:"lhf_diningRoomMsg_"+roomId,//每个食堂的信息独立
							extras:{
								roomId:roomId,
								isMine:false
							},
							createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
					});
					//退出已加入且已关闭的食堂
					mui('#closedRoom').on('tap','.mui-btn-blue',function() {
						//获取当前DOM对象
						var elem1 = this;
						leaveRoom(elem1,1);
					});
				}
				else{
					closedRoomUlist.innerHTML="";
					closedRoomNums.innerHTML=0;//显示房间数
				}
			}
			else{
				console.log("发送留恋的足迹加载请求出错啦！QAQ");
			}
		}
	});
}


//发送获取自己创建的食堂列表的资源请求以及加载
function createRoomRequests(){
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/getMyCreate",{ 
		data:{
			userId:me.userId
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
				
				var createRoomList=data.data;
				app.setCreateRoomList(createRoomList);//缓存数据
				
				var createRoomUlist=document.getElementById("createRoom");
				if(createRoomList!=null&&createRoomList.length>0){
					var createHtml="";
					myRoomNums.innerHTML=createRoomList.length;//显示房间数
					for(var i=0;i<createRoomList.length;i++){
						createHtml+=renderCreateRoom(createRoomList[i]);
					}
					createRoomUlist.innerHTML=createHtml;
					//批量绑定点击事件
					mui("#createRoom").on("tap",".createRoom",function(e){
						var roomId = this.getAttribute("roomId");
						var roomName=this.getAttribute("roomName");
						var roomNameNode = this.getElementsByTagName('span');//获取食堂名的项
						
						roomNameNode[1].setAttribute("class","");//去掉红点
						
						//打开聊天子页面
						mui.openWindow({
							url:"lhf_diningRoom.html",
							id:"lhf_diningRoom_"+roomId,//每个食堂的聊天页面独立
							extras:{
								roomId:roomId,
								isMine:true,
								userId:me.userId,
								roomName:roomName,
								myIcon:me.icon
							},
							createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
						
						//点击进入聊天页面后，标记未读状态为已读
						app.readUserChatRoomSnapshot(me.userId,roomId);
					});
				}
				else{
					myRoomNums.innerHTML=0;//显示房间数
					createRoomUlist.innerHTML="";
				}
			}
			else{
				console.log("发送我的食堂加载请求出错啦！QAQ");
			}
		}
	});
}


//发送获取加入且开启中的食堂列表的资源请求以及加载
function openRoomRequests(){
//	console.log("openRoomRequests()");
	
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/getMyJoinRoomListById",{
		data:{
			userId:me.userId
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
				
				var openRoomList=data.data;
				app.setOpenRoomList(openRoomList);//缓存数据
				
				var openRoomUlist=document.getElementById("openRoom");
				if(openRoomList!=null&&openRoomList.length>0){
					var openHtml="";
					openRoomNums.innerHTML=openRoomList.length;//显示房间数
					for(var i=0;i<openRoomList.length;i++){
						openHtml+=renderOpenRoom(openRoomList[i]);
					}
					openRoomUlist.innerHTML=openHtml;
					
					//批量绑定点击事件
					mui("#openRoom").on("tap",".openRoom",function(e){
						var roomId = this.getAttribute("roomId");
						var roomName=this.getAttribute("roomName");
						var roomNameNode = this.getElementsByTagName('span');//获取食堂名的项
						
						roomNameNode[1].setAttribute("class","");//去掉红点
						
						//打开食堂子页面
						mui.openWindow({
							url:"lhf_diningRoom.html",
							id:"lhf_diningRoom_"+roomId,//每个食堂的聊天页面独立
							extras:{
								roomId:roomId,
								isMine:false,
								userId:me.userId,
								roomName:roomName,
								myIcon:me.icon
							},
							createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
						
						//点击进入聊天页面后，标记未读状态为已读
						app.readUserChatRoomSnapshot(me.userId,roomId);
					});
					//退出已加入且开启状态的食堂
					mui('#openRoom').on('tap','.mui-btn-blue',function() {
						//获取当前DOM对象
						var elem1 = this;
						leaveRoom(elem1,2);
					});
				}
				else{
					openRoomUlist.innerHTML="";
					openRoomNums.innerHTML=0;//显示房间数
				}
			}
			else{
				console.log("发送入座的食堂加载请求出错啦！QAQ");
			}
		}
	});
}



//发送获取推荐食堂列表的资源请求以及加载
function recommendRoomRequests(){
	plus.nativeUI.showWaiting("正在四处寻找合口味的食堂...");
	mui.ajax(app.serverUrl+"/chatRoom/recommend",{
		data:{
			userId:me.userId
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:15000,//超时时间设置为15秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				plus.nativeUI.closeWaiting();
				
				var recommendRoomList=data.data;
							
				var recommendRoomUlist=document.getElementById("recommendRoom");
				if(recommendRoomList!=null&&recommendRoomList.length>0){
					var recommendHtml="";
					for(var i=0;i<recommendRoomList.length;i++){
						recommendHtml+=renderRecommendRoom(recommendRoomList[i]);
					}
					recommendRoomUlist.innerHTML=recommendHtml;
					//给加入推荐的食堂作动作
					mui('#recommendRoom').on('tap','.mui-btn-blue',function() {
						//获取当前DOM对象
						var elem1 = this;
						//获取DOM对象
						var par = elem1.parentElement.parentNode;
						mui.confirm('确定入座该食堂？', '提示', btnArray, function(e) {
							if (e.index == 0) {
								var par1=par.getAttribute("roomId");
						//		console.log(par1);
							
								if(sendIntoRoom(me.userId,par1)==true){
									mui.toast("入座成功(≧∇≦)");
									//获取新的已加入且开启中的食堂列表，并且渲染到页面
									openRoomRequests();
									
									gotoDiningRoom(par1,par.getAttribute("roomName"));
									//setTimeout("recommendRoomRequests()",200);
								}
								else{
									mui.toast("发送入座食堂请求出错啦！QAQ");
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
				}
				else{
					recommendRoomUlist.innerHTML="";
				}
			}
			else{
				console.log("发送食堂街道加载请求出错啦！QAQ");
			}
		}
	});
}


//对入座推荐食堂时，向后端发送消息
function sendIntoRoom(userId,roomId){
	console.log("roomId:"+roomId+" userId:"+userId);
	var status =false;
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/add",{
		data:{
			userId:userId,
			chatroomId:roomId
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		async:false,
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应,进行数据的重新加载
			if(data.status==200){
				status = true;
				plus.nativeUI.closeWaiting();
			}
			else{
				plus.nativeUI.closeWaiting();
			}
		},
	});
	console.log(status);
	return status;
}


//离开食堂时，向后端发送消息
function sendLeaveRoom(userId,roomId){
	var status =false;
	mui.ajax(app.serverUrl+"/chatRoom/delete",{
		data:{
			userId:userId,
			chatroomId:roomId
		},//上传的数据
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


//加载食堂的聊天快照
function loadingChatSnapshot(){
//	console.log("加载食堂的聊天快照");
	var chatSnapshotList = app.getUserChatRoomSnapshot(me.userId);
	
	var roomsList = document.getElementById("rooms");//获取食堂列表
	
	// 表示显示聊天快照的项
	var snapshotNode = null;
	var roomChatItem,roomId,roomItem,roomNameNode;
	
	//根据缓存中的快照表进行聊天列表的渲染
	for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
		roomChatItem = chatSnapshotList[i];
		roomId = roomChatItem.roomId;//获取聊天快照对应的食堂id
	//	console.log(JSON.stringify(roomChatItem));
		//console.log(roomId);
		roomItem = roomsList.querySelector('li[roomId="'+roomId+'"]');//获取指定id食堂的项
		//console.log(roomId);
		if(!app.isNotNull(roomItem)){
			continue;
		}
		snapshotNode = roomItem.getElementsByClassName("mui-ellipsis")[0];//获取食堂的关于聊天快照的填写区域
		roomNameNode = roomItem.querySelector('span[roomId="'+roomId+'"]');//获取食堂的关于昵称的项
		// 判断消息的已读或未读状态
		var isRead = roomChatItem.isRead;
		if (!isRead && app.isNotNull(roomNameNode)) {
			roomNameNode.setAttribute("class","red_point");//未读消息标记红点
		}
		snapshotNode.innerHTML=roomChatItem.msg;//对html的对应区域赋值
	}
}


//进入食堂聊天页
function gotoDiningRoom(roomId,roomName){
	//打开食堂子页面
	mui.openWindow({
		url:"lhf_diningRoom.html",
		id:"lhf_diningRoom_"+roomId,//每个食堂的聊天页面独立
		extras:{
			roomId:roomId,
			isMine:false,
			userId:me.userId,
			roomName:roomName,
			myIcon:me.icon
		},
		createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
	});
}
