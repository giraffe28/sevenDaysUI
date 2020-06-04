/*
	本文件由lhf创建并维护
	本文件仅用于深夜食堂的食堂详情信息页使用
	
	使用时，需要传入两个参数
	roomId
	isMine
*/

mui.init();

var titleNameDom;//记录显示食堂信息标题的位置
var roomIdDom;//记录显示食堂id的位置
var roomNameDom;//记录显示食堂名称的位置
var creatorDom;//记录显示食堂创造者名称的位置
var tagsDom;//记录显示标签的位置
var roomPeoplesDom;//记录显示食堂当前人数的位置
var creationTimeDom;//记录显示食堂开张时间的位置
var closeTimeDom;//记录显示食堂预期关闭时间的位置
var userId;//记录用户id
var roomTag;//记录食堂主营

var roomId;//本食堂的id
var isMine;//是否为自己开启的食堂

mui.plusReady(function () {
    //对共用的参数进行获取值
	var thisWebview=plus.webview.currentWebview();
	roomId=thisWebview.roomId;
	isMine=thisWebview.isMine;
	
	titleNameDom=document.getElementById("roomName");
	roomIdDom=document.getElementById("roomId");
	creatorDom=document.getElementById("creator");
	tagsDom=document.getElementById("tags");
	roomPeoplesDom=document.getElementById("roomPeoples");
	creationTimeDom=document.getElementById("creationTime");
	closeTimeDom=document.getElementById("closeTime");
	
	userId=app.getUserGlobalInfo().userId;
	//获取结束
	
	getRoomMsgRequests();//发送请求，加载数据
	
	if(isMine==true){
		//添加修改入口
		addmodifyEntrance();
		// 点击“修改食堂信息”
		document.getElementById("modifyBtn").addEventListener('tap', function() {
			mui.openWindow({
				url:"lhf_modifyDiningRoom.html",
				id:"lhf_modifyDiningRoom.html",
				extras:{
					userId:userId,
					roomId:roomId,
					roomName:titleNameDom.innerHTML,
					theTags:roomTag
				},
				createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});
	}
});


//对于如果是自己创建的食堂，则增加修改食堂信息的入口
function addmodifyEntrance(){
	if(isMine==true){
		modifyHtml='<button type="button" class="mui-btn mui-btn-primary" id="modifyBtn" >修改食堂信息</button>';
		document.getElementById("modifyRow").innerHTML=modifyHtml;
	}
}



//修改食堂信息后的配套动作，将被修改食堂信息的功能模块调用
//这里是修改食堂名和食堂主营
function reload(roomName,tags){
	//console.log(tags);
	titleNameDom.innerHTML=roomName;
	tags=tags.split(" ");
	if (app.isNotNull(tags)) {
		var theTagsHtml = "";
		for (var i = 0; i < tags.length; i++) {
			theTagsHtml += '<label style="background-color: lightgreen; margin-left: 5px;border-radius: 7px;">'
			+tags[i]+'</label>';
		}
		tagsDom.innerHTML = theTagsHtml;
	}
	else {
		tagsDom.innerHTML = "";
	}
	
	var fatherWebview=plus.webview.currentWebview().opener();
	fatherWebview.evalJS("reload("+roomName+","+tags+")");//修改食堂聊天页面的名称
	
	var midnightDinerWebview=plus.webview.getWebviewById("lhf_midnightDiner.html");
	midnightDinerWebview.evalJS("renderStoredCreateRoom()");//重新渲染自己创建的食堂列表
}


//对传入的对象用于本页面的加载
function renderRoomMsg(room){
	titleNameDom.innerHTML=room.chatroomName;
	roomIdDom.innerHTML=room.chatroomId;
	creatorDom.innerHTML=room.userName;
	
	roomTag=room.chatroomTag;//记录返回的食堂标签，用于进入修改食堂信息时的页面传参
	
	var tags=room.chatroomTag;
	tags=tags.split(" ");
	if (app.isNotNull(tags)) {
		var theTagsHtml = "";
		for (var i = 0; i < tags.length; i++) {
			theTagsHtml += '<label style="background-color: lightgreen; margin-left: 5px;border-radius: 7px;">'
			+tags[i]+'</label>';
		}
		tagsDom.innerHTML = theTagsHtml;
	}
	else {
		tagsDom.innerHTML = "";
	}
	
	roomPeoplesDom.innerHTML=room.chatroomNumber;
	startDate=new Date(room.chatroomStart);
	creationTimeDom.innerHTML=startDate.getFullYear()+'.'+t(startDate.getMonth()+1)+'.'+t(startDate.getDate())+' '+t(startDate.getHours())+':'+t(startDate.getMinutes())+':'+t(startDate.getSeconds());
	endDate=new Date(room.chatroomEnd);
	closeTimeDom.innerHTML=endDate.getFullYear()+'.'+t(endDate.getMonth()+1)+'.'+t(endDate.getDate())+' '+t(endDate.getHours())+':'+t(endDate.getMinutes())+':'+t(endDate.getSeconds());
}

function t(s){
	return s<10?"0"+s:s;
}

//从后端获取指定id的食堂信息的请求
function getRoomMsgRequests(){
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/getRoomInfoById",{
		async:false, 
		data:{
			chatroomId:roomId
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
				
				var roomMsg=data.data;
				renderRoomMsg(roomMsg);
				console.log("加载食堂详情完毕");
			}
			else{
				mui.toast("发送食堂详情加载请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("发送获取食堂信息error");
			// console.log(JSON.stringify(data.data));
		}
	});
}