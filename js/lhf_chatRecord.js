mui.init();

/*mui.plusReady(function () {
	loadingFriendRequests();
    var thisWebview=plus.webview.currentWebview();
	thisWebview.addEventListener("show",function(){
		loadingRecFriendRequests();//加载推荐好友信息
		//从缓存中获取朋友列表，并且渲染到页面
		renderFriPage();
	})
});
*/

//从缓存中获取朋友列表，并且渲染到页面
function renderFriPage(){
	//获取好友列表
	var frilist=app.getFriList();
	//显示好友列表
	var friUlist=document.getElementById("chatFriends");
	if(frilist!=null&&frilist.length>0){
		var friHtml="";
		for(var i=0;i<frilist.length;i++){
			friHtml+=renderFriend(friList[i]);
		}
		friUlist.innerHTML=friHtml;
		//批量绑定点击事件
		mui("#chatFriends").on("tap","chatWithFriend",function(e){
			var friendUserId=this.getAttribute("friendId");
			var friendUserNickname=this.getAttribute("friendNickname");
			//打开聊天子页面
			mui.openWindow({
				url:"../html/lhf_chat.html",
				id:"lhf_chat_"+friendUserId,//每个朋友的聊天页面独立
				extras:{
					friUserId:friendUserId,
					friUserNickname:friendUserNickname
				}
			});
		});
	}
	else{
		friUlist.innerHTML="";
	}
}

function loadingFriendRequests(){//发送朋友列表信息的加载
	var user=app.getUserGlobalInfo();//获取用户全局对象
	mui.ajax(app.serverUrl+""+user.id,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			console.log(JSON.stringify(data.data));
			if(data.status==200){
				frilist=data.data;
				app.setFriList(frilist);//缓存朋友数据
			}
			else{
				mui.toast("发送好友列表加载请求出错啦！QAQ");
			}
		}
	});
}

function loadingRecFriendRequests(){//发送朋友推荐列表信息的资源请求以及加载
	var user=app.getUserGlobalInfo();//获取用户全局对象
	mui.ajax(app.serverUrl+""+user.id,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			console.log(JSON.stringify(data.data));
			if(data.status==200){
				friRecList=data.data;
				var friRecUlist=document.getElementById("recommendFri");
				if(friRecList!=null&&friRecList.length>0){
					var friHtml="";
					for(var i=0;i<friRecUList.length;i++){
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


function renderFriendRecommend(friend){//设置推荐朋友的html项内容
	var html="";
	html='<li class="mui-table-view-cell" friendId="'+friend.userId+'">'+
		    '<div class="mui-slider-right mui-disabled">'+
		        '<span class="mui-btn mui-btn-blue">发起闲聊</span>'+
		    '</div>'+
		    '<div class="mui-slider-handle">'+
		        '<a href="lhf_chat.html">'+friend.nickname+'</a>'+
		    '</div>'+
		'</li>';
	return html;
}


function renderFriends(friend){//设置好友列表的html项内容
	var html="";
	html='<li class="chatWithFri mui-table-view-cell mui-media" friendId="'+friend.userId+' friendNickname='+friend.nickname+'">'+
				'<div class="mui-slider-right mui-disabled">'+
					'<span class="mui-btn mui-btn-red">删除</span>'+
				'</div>'+
				'<div class="mui-slider-handle">'+
					'<img class="mui-media-object mui-pull-left" src="../img/1.jpg">'+
					friend.nickname+
					'<p class="mui-ellipsis">能和心爱的人一起睡觉，是件幸福的事情；可是，打呼噜怎么办？</p>'+
				'</div>'+
			'</li>';
	return html;
}


var btnArray = ['确认', '取消'];
mui('.chatRecords').on('tap','.mui-btn-red',function() {
    //获取当前DOM对象<a>
	var elem = this;
    mui.confirm('确定结束与对方的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			//发送消息给后端
			var user=app.getUserGlobalInfo();//获取用户全局对象
			var par = elem1.parentNode.parentNode;
			if(uploadDelFri(user.id,elem.parentNode.parentNode.friendId)==true){
				//从缓存中获取朋友列表，并且渲染到页面
				renderFriPage();
			}
			else{
				mui.toast("发送结束闲聊请求出错啦！QAQ");
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

function uploadDelFri(userId,friendId){//发送删除好友信息到后端
	mui.ajax(app.serverUrl+""+userId,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应,进行数据的重新加载
			var myFriendList = data.data;
			app.setfriList(myFriendList);//修改缓存内容
			//重新加载推荐好友列表
			loadingRecFriendRequests();
			return true;
		},
	});
	return false;
}


// 监听tap事件，解决 a标签 不能跳转页面问题
mui('body').on('tap','a',function(){document.location.href=this.href;});


mui('.makeChat').on('tap','.mui-btn-blue',function() {
	//获取当前DOM对象<a>
	var elem1 = this;
	//获取DOM对象
	var par = elem1.parentNode.parentNode;
    mui.confirm('确定展开与其为其最多一周的闲聊？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			var user=app.getUserGlobalInfo();//获取用户全局对象
			if(sendMakeFri(user.id,par.friendId)==true){
				//从缓存中获取朋友列表，并且渲染到页面
				renderFriPage();
				//页面跳转至对应的聊天页面
				mui.openWindow("../html/lhf_chat.html","lhf_chat.html");
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

function sendMakeFri(userId,friendId){//对推荐好友进行发起聊天时，向后端发送消息
	mui.ajax(app.serverUrl+""+userId,{
		data:{},
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应,进行数据的重新加载
			var myFriendList = data.data;
			app.setfriList(myFriendList);//修改缓存内容
			//重新加载推荐好友列表
			loadingRecFriendRequests();
			return true;
		},
	});
	return false;
}