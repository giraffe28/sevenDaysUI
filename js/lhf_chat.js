/*
	本文件由lhf创建并维护
	本文件仅服务于聊天页面
*/

//dom定位
var areaMsgList = document.getElementById("msgs");
var msgText=document.getElementById("msg");
var send=document.getElementById("sendMsg");
var setObj=document.getElementsByClassName('mui-icon-settings');
var trustSwitch=document.getElementById("trustSwitch");//信赖与否的开关
var myFaceImg="../images/2.jpg";//自己的头像，实际上应该由app.js处获取
var me;//用户信息
var friendUserId;
var friendName;
var friendFaceImg;
var friendLevel;//信赖与否，0表示不信赖，1表示信赖
var chatWebview,chatWebSocket;//chatRecord页面和index页面

mui.plusReady(function () {
	//获取聊天页面
	var chatview=plus.webview.currentWebview();
	chatview.setStyle({
		softinputMode:"adjustResize"//设置软键盘样式
	});
	//获取上一个页面传入的好友属性值
	friendUserId = chatview.friUserId;
	//console.log(friendUserId);
	friendName=chatview.friName;
	friendFaceImg=chatview.friendFaceImg;
	friendLevel=chatview.friendLevel;
	//获取用户信息
	me = app.getUserGlobalInfo();
	//获取聊天记录页面
	chatWebview = plus.webview.getWebviewById("lhf_chatRecord.html");
	//获取index页面
	chatWebSocket = plus.webview.getWebviewById("index.html");
	//标题改为朋友的昵称
	document.getElementById("friNickname").innerHTML = friendName;
	
	//设置信赖开关,如果为信赖，则要初始化成开启状态，否则默认关闭状态
	if(friendLevel==1){
		mui("#trustSwitch").switch().toggle();
		console.log("调整信赖开关状态为开启");
	}
	
	//渲染初始化的聊天记录
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
			//console.log(friendUserId);
			var chatMsg = new app.ChatMsg(me.userId, friendUserId, msgTextValue, null);
			// 构建DataContent
			var dataContent = new app.DataContent(app.CHAT, chatMsg, null);
			// 调用websocket发送消息
			chatWebSocket.evalJS("CHAT.chat('" + JSON.stringify(dataContent) + "')");
			
			//我发送出去的信息进行保存
			app.saveUserChatHistory(me.userId, friendUserId, msgTextValue, app.ME);
			
			//保存聊天快照，由于是由自己发送的,所以默认为已读
			//console.log(friendUserId);
			app.saveUserChatSnapshot(me.userId, friendUserId, msgTextValue, true);
			chatWebview.evalJS("loadingChatSnapshot()");
			sendMsgFunc(msgTextValue);//渲染发送出去的消息
			msgText.value="";//清空文本框中的内容
			send.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");//重置发送按钮的状态
			resizeScreen ();
			//mui.toast("测试用：已发送");
		}
	});
	
	
	//监听是否信赖的开关动作
	trustSwitch.addEventListener("toggle",function(event){
		var Itrust;
		if(event.detail.isActive){
			Itrust=true;
			console.log("选择了信赖");
		}
		else{
			console.log("选择了不信赖");	
			Itrust=false;
		}
		//向后端发送消息，并更新缓存
		mui.ajax(app.serverUrl+"/Friend/trust?userId="+me.userId+"&trustId="+friendUserId,{
			data:{},//上传的数据
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			headers:{'Content-Type':'application/json'},	              
			success:function(data){
				//服务器返回响应
				if(data.status==200){
					if(Itrust==true){
						mui.toast("(*'▽'*)♪你们似乎很能聊得来呢！");
					}
					else{
						mui.toast("(# ` n´ )咱不信赖这家伙！");
					}
				}
				else{
					trustSwitch.switch().toggle();
					mui.toast("好像出了一些问题？稍后再试试吧！");
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log("信赖的ajax好像出了一些问题");
			}
		});
	});
	
	
	//监听查看好友信息的操作
	document.getElementById("watchFriMessage").addEventListener("tap",function(event){
		console.log("到达查看好友信息的事件监听");
		//跳转到对应的朋友的个人中心页面
		mui.openWindow({
			url:"lhf_friMsgPage.html",
			id:"lhf_friMsgPage.html",
			extras:{
				friUserId:friendUserId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	
	
	//监听举报的操作
	document.getElementById("report").addEventListener("tap",function(event){
		console.log("到达举报的事件监听");
		//跳转到对应的朋友的举报页面
		mui.openWindow({
			url:"lhf_report.html",
			id:"lhf_report.html",
			extras:{
				reportType:app.CHATMSGVIOLATION,
				reportObjectId:friendUserId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	
	
	//监听将朋友加入黑名单的操作
	document.getElementById("addToBlackList").addEventListener("tap",function(event){
		var btnArray = ['是', '否'];
		mui.confirm('你确定要将其加入黑名单吗？', '提示', btnArray, function(e) {
			if (e.index == 0) {
				console.log("选择了将其加入黑名单");
				//向服务器发送请求将该朋友加入黑名单
				mui.ajax(app.serverUrl+'/blacklist/add', {
					data: {
						userId: me.userId,
						addedId: friendUserId
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					headers: {
						'Content-Type': 'application/json'
					},
					success: function(data) {
						//服务器返回响应，根据响应结果，分析是否添加成功；
						if (data.status == 200) {
							//去掉聊天快照
							app.deleteUserChatSnapshot(user.userId,friendUserId);
							//从缓存中获取朋友列表，并且渲染到页面
							chatWebview.evalJS("fetchContactList()");
							mui.toast("╭( ･ㅂ･)و 好！已经加入黑名单了！");
							mui.back();
						}
						else{
							mui.toast("好像出了一些问题？稍后再试试吧！");
						}
					},
					error: function(xhr, type, errorThrown) {
						mui.toast("好像出了一些问题，等下再试试？T-T");
						//异常处理
						console.log(type);
					}
				});
			}
			else{
				mui.toast("消消气 ฅ(*°ω°*ฅ)*");
			}
		});
	});
	
	
	//监听结束聊天的操作
	document.getElementById("endChat").addEventListener("tap",function(event){
		var btnArray = ['是', '否'];
		mui.confirm('你确定要结束聊天吗？', '提示', btnArray, function(e) {
			if (e.index == 0) {
				console.log("选择了结束聊天");
				//发送消息给后端
				if(chatWebview.evalJS("uploadDelFri("+me.userId+","+friendUserId+")")==true){
					//去掉聊天快照
					app.deleteUserChatSnapshot(user.userId,friendUserId);
					//获取朋友列表，并且渲染到页面
					chatWebview.evalJS("fetchContactList()");
					mui.back();
				}
			}
			else{
				mui.toast("缘分未尽|･ω･｀)");
			}
		});
	});
	
	
	//监听结清空聊天快照的操作//仅仅测试时用
	document.getElementById("clearChat").addEventListener("tap",function(event){
		app.clearUserChatSnapshot(me.userId);
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
//	console.log("初始化聊天内容" + JSON.stringify(chatHistoryList));
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