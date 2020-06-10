/*
	由lhf创建并维护
	服务于食堂的信息修改（目前只允许修改主营（标签）和名字）
	
	目前仅在食堂页面可被调用
	
	使用本标签修改方式，需要提供四个参数
	userId(用户的id)
	roomId（食堂Id）
	roomName（原本的食堂名）
	theTags(以空格隔开的字符串，表示标签)（如果为“”，则表示原本无标签设置）
	
	修改成功时，将回退到打开本功能模块的页面，并先使其重新加载，启用reload方法（附带roomName和theTags两个参数）
*/


var userId;//用户id
var roomId;//食堂id
var roomName;//食堂名
var theTags;//以空格隔开的字符串，表示标签
var addTagDom;//本窗口中用于显示食堂主营的区域
var fatherWebview;//父窗口


mui.init();

mui.plusReady(function () {
	
	//获取共用的信息
	thisWebview=plus.webview.currentWebview();
	theTags=thisWebview.theTags;
	userId=thisWebview.userId;
	roomId=thisWebview.roomId;
	roomName=thisWebview.roomName;
	fatherWebview=thisWebview.opener();
	addTagDom=document.getElementById("addTag");
	//获取结束
	
	//加载页面数据
	document.getElementById("modifyRoomName").value=roomName;
	//console.log(roomName);
	renderNewTag(theTags);
	
    
	/* 点击“添加标签/修改标签” */
	document.getElementById("addTagAction").addEventListener('tap', function() {
		mui.openWindow({
			url:"lhf_addTag.html",
			id:"lhf_addTag.html",//每个朋友的聊天页面独立
			extras:{
				userId:userId,
				oldTags:theTags
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	//点击确认键时的动作
	document.getElementById("confirmBtn").addEventListener('tap',function(){
		roomName=document.getElementById("modifyRoomName").value;//获取当前的食堂名
		if(app.isNotNull(roomName)==true){
			if(roomName.length<18){
				if(modifyRequests()==true){
					mui.back();
				}
			}
			else{
				mui.toast("食堂名太长了哦！(*｀へ´*) ");
			}
		}
		else{
			mui.toast("食堂名不能为空哦！(*｀へ´*) ");
		}
	});
	//点击取消键时的操作
	document.getElementById("cancelBtn").addEventListener('tap',function(){
		mui.back();
	});
});


//渲染标签内容
function renderNewTag(newTags){
	theTags=newTags;//用于修改标签的功能页面的反馈
	newTags = newTags.split(" ");
	if (app.isNotNull(newTags)) {
		var theTagsHtml = "";
		for (var i = 0; i < newTags.length-1; i++) {
			theTagsHtml += '<span  class="mui-badge mui-badge-success" style="margin-top: 10px; margin-left:5px;">'
			+newTags[i]+'</span>';
		}
		addTagDom.innerHTML = theTagsHtml;
	}
	else {
		addTagDom.innerHTML = "";
	}
}


//发送修改请求到后端
//返回：true(表示修改成功)，false(表示修改失败)
function modifyRequests(){
	plus.nativeUI.showWaiting("请稍等");
	mui.ajax(app.serverUrl+"/chatRoom/update",{
		data:{
			chatroomId:roomId,
			chatroomName:roomName,
			chatroomTag:theTags
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			plus.nativeUI.closeWaiting();
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				mui.toast("修改成功(๑>؂<๑）");
				renderNewTag(theTags);
				app.changeRoomMsg(roomId,roomName,theTags);//修改缓存中的数据
				fatherWebview.evalJS("reload('"+roomName+"','"+theTags+"')");
//				console.log("0");
				mui.back();
			}	
			else{
				mui.toast(data.status+"出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.closeWaiting();
			console.log("发送修改食堂信息error");
			// console.log(JSON.stringify(data.data));
		}
	});
}