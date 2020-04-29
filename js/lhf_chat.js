mui.plusReady(function () {
	var me=app.getUserGlobalInfo();//获取用户信息
	var chatWebview=plus.webview.currentWebview();//获取聊天页面
	chatWebview.setStyle({
		softinputMode:"adjustResize"//设置软键盘样式
	});
	//获取上一个页面传入的好友属性值
	var friendUserId=chatWebview.friUserId;
	var friendUserNickname=chatWebview.friUserNickname;
	//标题改为朋友的昵称
	document.getElementById("friNickname").innerHTML=friendUserNickname;
	//设置聊天记录在进入页面时自动滚动到最后一条
	resizeScreen ();
});

//设置聊天记录滚动到最后一条
function resizeScreen (){
	areaMsgList=document.getElementById("msg");
	areaMsgList.scrollTop=areaMsgList.scrollHeight+areaMsgList.offsetHeight;
}

//对当前窗口监听resize事件
window.addEventListener("resize",function(){
	resizeScreen ();
	document.getElementById("msgOutter").style.paddingBottom="50px";
});


/*
//监听用户输入，使得发送按钮变色
var msgText=document.getElementById("msg");
var send=document.getElementById("sendMsg");
var sendStyle=send.class;
msgText.addEventListener("input",function(){
	mui.toast("字");
	var msgTextValue=msgText.value;
	if(msgTextValue.length>0){
		send.setAttribute("calss",sendStyle+" mui-btn-blue");
		mui.toast("有字");
	}
	else{
		send.setAttribute("calss",sendStyle+"mui-btn-gray");
		mui.toast("无字");
	}
});
*/

var setObj = document.getElementsByClassName('mui-icon-settings');
setObj[0].addEventListener("tap",function () {
	if(mui('.mui-off-canvas-wrap').offCanvas().isShown()){
		mui('.mui-off-canvas-wrap').offCanvas().close();
	}
	else{
		mui('.mui-off-canvas-wrap').offCanvas().show();
	}
});


mui.back = function(){
  	var btn = ["确定","取消"];
	mui.confirm('确认关闭当前窗口？','Hello MUI',btn,function(e){
	if(e.index==0){
 		mui.currentWebview.close();
		plus.webview.open("../html/lhf_chatRecord.html","lhf_chatRecord.html","fade-in",200);
	}
	});
}

var sendMsgBtn = document.getElementById("sendMsg");
sendMsgBtn.addEventListener("tap",function(){
	var msgArea = document.getElementById("msg");
	var msgs = msgArea.value;
	if(msgs.length>128){
		mui.toast("您输入的字数超过了128字节，请进行分批次发送");
	}
	else if(msgs.length<1){
		msgArea.focus();
		mui.toast("请输入信息");
	}
	else{
		var connectionStatus=plus.networkinfo.getCurrentType();
		if(connectionStatus==0||connectionStatus==1){
			mui.toast("请打开软件链接！");
		}
		mui.toast("测试用：已发送");
		/*
		var cid=plus.push.getClientInfo().clientid;
		mui.ajax(app.serverUrl,{
			data:{
				userId:'username',
				message:'password',
				emojis:'',
				sendId:'',
				cid:cid;
			},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			headers:{'Content-Type':'application/json'},	              
			success:function(data){
				//服务器返回响应，根据响应结果，分析是否登录成功；
				console.log(JSON.stringify(data));
				if(data.status==200){
					
				}
			}
		});
		*/
	}
});