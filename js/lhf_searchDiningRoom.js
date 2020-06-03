/*
	本文件由lhf创建并维护
	本文件仅用于深夜食堂的食堂搜索页使用
	
	需要传一个参
	userId
*/

var userId;//用于记录传入的参数：用户id
var searchTag;//用于记录用于搜索的标签
//通用的二次确认使用
var btnArray = ['确认', '取消'];

mui.init();

mui.plusReady(function () {
	
	var thisWebview=plus.webview.currentWebview();
	userId=thisWebview.userId;
    
	/* 点击“添加标签” */
	document.getElementById("addTag").addEventListener('tap', function() {
		mui.openWindow({
			url:"lhf_addTag.html",
			id:"lhf_addTag.html",//每个朋友的聊天页面独立
			extras:{
				userId:userId,
				oldTags:""
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
	//点击用标签（主营）搜索的确认键
	document.getElementById('searchByTagCondirm').addEventListener('tap',function(){
		if(app.isNotNull(searchTag)){//如果已经弄了食堂主营
			searchByTagRequests(searchTag);
		}
		else{
			mui.toast("有给食堂主营才能找！s(・｀ヘ´・;)ゞ");
		}
	});
	//点击用标签（主营）搜索的取消键
	document.getElementById('tagCancel').addEventListener('tap',function(){
		mui.back();
	});
	//点击用id搜索的确认键
	document.getElementById('searchByIdConfirm').addEventListener('tap',function(){
		var searchstr=document.getElementById("searchByIdInput").value;
		if(app.isNotNull(searchstr)){//如果已经填写了食堂id
			searchByIdRequests(searchstr);
		}
		else{
			mui.toast("有给食堂id才能找！s(・｀ヘ´・;)ゞ");
		}
	});
	//点击用id搜索的取消键
	document.getElementById('idConfirm').addEventListener('tap',function(){
		mui.back();
	});
	//点击用食堂名搜索的确认键
	document.getElementById('searchByNameConfirm').addEventListener('tap',function(){
		var searchstr=document.getElementById("searchByNameInput").value;
		if(app.isNotNull(searchstr)){//如果已经填写了食堂名称
			searchByNameRequests(searchstr);
		}
		else{
			mui.toast("有给食堂名称才能找！s(・｀ヘ´・;)ゞ");
		}
	});
	//点击用食堂名搜索的取消键
	document.getElementById('nameCancel').addEventListener('tap',function(){
		mui.back();
	});
});


//渲染标签内容
function renderNewTag(newTags){
	searchTag=newTags;
	var addTagDom=document.getElementById("diningRoomTags");
	newTags = newTags.split(" ");
	if (app.isNotNull(newTags)) {
		var theTagsHtml = "";
		for (var i = 0; i < newTags.length; i++) {
			theTagsHtml += '<label style="background-color: lightgreen; border-radius: 7px;width: auto;margin:10px 0px 0px 5px ;padding: 0;">'
			+newTags[i]+'</label>';
		}
		addTagDom.innerHTML = theTagsHtml;
	}
	else {
		addTagDom.innerHTML = "";
	}
}


//渲染搜索的结果（顺便绑定点击事件）
function renderResult(roomList){
	console.log("渲染搜索食堂的结果");
	var resultShowDom=document.getElementById("searchResult");
	var room;
//	console.log(roomList.length);
//	console.log(roomList);
	if(app.isNotNull(roomList)!=false && roomList.length>0){
		var resultHtml="";
		for(var i=0;i<roomList.length;i++){
			room=roomList[i];
			resultHtml+='<li class="mui-table-view-cell room mui-media" roomId="'+room.chatroomId+'">'+
							'<div class="mui-slider-right mui-disabled" roomId="'+room.chatroomId+'">'+
								'<span class="mui-btn mui-btn-blue">加入食堂</span>'+
							'</div>'+
							'<div class="mui-slider-handle">'+
								'<img class="mui-media-object mui-pull-left" src="../images/diner.png">'+
								'<span>'+room.chatroomName+'</span>'+
							'</div>'+
						'</li>';
		}
		//console.log(resultHtml);
		resultShowDom.innerHTML=resultHtml;
		
		//批量绑定点击事件
		mui("#searchResult").on("tap",".room",function(e){
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
		//给加入食堂作动作
		mui("#searchResult").on('tap','.mui-btn-blue',function() {
			var midDinerWebview = plus.webview.getWebviewById("lhf_midnightDiner.html");
			//获取当前DOM对象
			var elem1 = this;
			//获取DOM对象
			var par = elem1.parentElement.parentNode;
			mui.confirm('确定入座该食堂？', '提示', btnArray, function(e) {
				if (e.index == 0) {
					var par1=par.getAttribute("roomId");
			//		console.log(par1);
					if(midDinerWebview.evalJS("sendIntoRoom("+me.userId+","+par1+")")==true){
						mui.toast("入座成功(≧∇≦)");
						//获取新的已加入且开启中的食堂列表，并且渲染到页面
						midDinerWebview.evalJS("loadingOpenRoom()");
						//页面跳转至对应的食堂内部聊天页面todo
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
		resultShowDom.innerHTML='<li class="tipStyle">'+
									'没找到对应的开启中的食堂呀，或者您已经加入了呢！'+
								'</li>';
	}
}


//向后端发送根据食堂主营的内容进行搜索并获得结果(记得调用renderResult)
function searchByTagRequests(searchTag){
	mui.ajax(app.serverUrl+"/chatRoom/searchByTag",{
		data:{
			chatroomTag:searchTag
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			// console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				var roomlist = data.data;
				renderResult(roomlist);
			}
			else if(data.status==500){
				mui.toast("找不到对应的聊天室o(╥﹏╥)o");
			}
			else{
				mui.toast("根据主营搜食堂的请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("根据主营搜食堂的请求出错error");
			// console.log(JSON.stringify(data.data));
		}
	});
}


//向后端发送根据食堂id的内容进行搜索并获得结果(记得调用renderResult)
function searchByIdRequests(searchstr){
	mui.ajax(app.serverUrl+"/chatRoom/searchById",{
		data:{
			chatroomId:searchstr
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			//console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				var roomlist = data.data;
				renderResult(roomlist);
			}
			else if(data.status==500){
				mui.toast("找不到对应的聊天室o(╥﹏╥)o");
			}
			else{
				mui.toast("根据id搜食堂的请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("根据id搜食堂的请求出错error");
			// console.log(JSON.stringify(data.data));
		}
	});
}


//向后端发送根据食堂名称进行搜索并获得结果(记得调用renderResult)
function searchByNameRequests(searchstr){
	mui.ajax(app.serverUrl+"/chatRoom/searchByName",{
		data:{
			chatroomName:searchstr
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			// console.log(JSON.stringify(data.data));//输出返回的数据
			if(data.status==200){
				var roomlist = data.data;
				renderResult(roomlist);
			}
			else if(data.status==500){
				mui.toast("找不到对应的聊天室o(╥﹏╥)o");
			}
			else{
				mui.toast("根据名称搜食堂的请求出错啦！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("根据名称搜食堂的请求出错error");
			// console.log(JSON.stringify(data.data));
		}
	});
}