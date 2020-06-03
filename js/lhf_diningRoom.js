/*
	本文件由lhf创建并维护
	本文件仅用于深夜食堂的食堂内部聊天页使用
	
	使用时，需要传入四个参数
	roomId
	isMine（区分是否为自己创建的食堂）
	userId
	roomName
	
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
//记录食堂主页
var midnightDiner;


mui.plusReady(function () {
    //对共用的参数进行获取值
    var thisWebview=plus.webview.currentWebview();
	midnightDiner=thisWebview.opener();
    roomId=thisWebview.roomId;
    isMine=thisWebview.isMine;
	userId=thisWebview.userId;
	roomName=thisWebview.roomName;
	
	console.log(roomName);
	roomNameDom.innerHTML=roomName;
	
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