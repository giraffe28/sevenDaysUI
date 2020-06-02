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

var roomId;//本食堂的id
var isMine;//是否为自己开启的食堂

mui.plusReady(function () {
    //对共用的参数进行获取值
	var thisWebview=plus.webview.currentWebview();
	roomId=thisWebview.roomId;
	isMine=thisWebview.isMine;
	
	titleNameDom=mui("#titleName");
	roomIdDom=mui("#roomId");
	creatorDom=mui("#creator");
	tagsDom=mui("#tags");
	roomPeoplesDom=mui("#roomPeoples");
	creationTimeDom=mui("#creationTime");
	closeTimeDom=mui("#closeTime");
	//获取结束
	
	getRoomMsgRequests();//发送请求，加载数据
});



//修改食堂信息后的配套动作，将被修改食堂信息的功能模块调用
//这里是修改食堂名和食堂主营
//TODO
//暂时没想好是否应该给这个页面加上修改信息的入口
function reload(roomName,theTags){
}


//对传入的对象用于本页面的加载
function renderRoomMsg(room){
	titleNameDom.innerHTML=room.chatroomName;
	roomIdDom.innerHTML=room.chatroomId;
	creatorDom.innerHTML=room.userName;
	
	var tags=room.chatroomTag;
	tags=tags.splice(" ");
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
	
	roomPeoplesDom=room.chatroomNumber;
	creationTimeDom=room.chatroomStart;
	closeTimeDom=room.chatroomEnd;
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