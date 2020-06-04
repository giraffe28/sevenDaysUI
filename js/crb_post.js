var imgUrl="";
mui.init();
mui.plusReady(function () {
	var post=document.getElementById("post");
	post.addEventListener('tap',function(){
		console.log(imgUrl);
		var content=document.getElementById('post_content').value;
		if(content==''){
			mui.toast('内容不能为空');
			return false; 
		}
		else if(content.length>100){
		   mui.toast('正文不得超过100个字');
		   return false; 
	   }
	   else{
	   var user = app.getUserGlobalInfo();
	   var myDate = new Date();
	   mui.ajax(app.serverUrl+"/corner/talk", {
	   	data: {
			user:{
				userId:user.userId
			},
	   		postContent:content,
			postImage:imgUrl
	   	},
	   	dataType: 'json', //服务器返回json格式数据
	   	type: 'post', //HTTP请求类型
	   	timeout: 10000, //超时时间设置为10秒；
	   	headers: {
	   		'Content-Type': 'application/json;charset:utf-8'
	   	},
	   	success: function(data) {
	   		//服务器返回响应，根据响应结果，分析是否成功发送动态；
	   		if (data.status == 200) {
	   			//显示成功信息
	   			mui.toast("发送动态成功");
				console.log(data.data);
				var chatWebview = plus.webview.getWebviewById("crb_square.html");
				chatWebview.evalJS("pulldownRefresh()");
				mui.back();
	   		}
	   		else{
	   			app.showToast(data.msg, "error");
	   		}
	   	},
	   	error: function(xhr, type, errorThrown) {
	   		//异常处理；
	   		console.log(type);
	   	}
	   });
	   }
	});	

	document.getElementById('headImage').addEventListener('tap', function() {
		//mui.openWindow('../html/crb_postimage.html','crb_postimage.html');
		mui("#sheet-myImage").popover("toggle");
	});
	
	document.getElementById('choose').addEventListener('tap', function() {
		mui.openWindow('../html/crb_postimage.html','crb_postimage.html');
		mui("#sheet-myImage").popover("toggle");
	});
})

function showImage(imageUrl){
	console.log("暂时显示动态照片");
	imgUrl=imageUrl;
	/*
	mui.ajax(app.serverUrl+'/user/modifyIcon', {
			data: {
				userId:app.getUserGlobalInfo().userId,
				icon:imageUrl,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers:{'Content-Type':'application/json'},	
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否成功获取信息；
				if (data.status == 200) {
					var userJson= app.getUserGlobalInfo();
					userJson.icon=imageUrl;
					//console.log(JSON.stringify(memoryJson));
					plus.storage.setItem("userInfo", JSON.stringify(userJson));
					document.getElementById("myImage").src=imageUrl;
					var imageWebview=plus.webview.getWebviewById("ll_updateImage.html");
					imageWebview.evalJS("refreshImage()");
					var currentWebview=plus.webview.currentWebview();
					mui.fire(currentWebview,'refresh');
					mui.toast('修改成功！');
				}
				else{
					app.showToast(data.msg, "error");
				}
			},
		
		});*/
	//console.log(imageUrl)
	var img=document.getElementById("imgs");
	var html="";
	html='<li class="mui-table-view-cell mui-media mui-col-xs-6">'+
		'<a href="#">'+
			'<img class="mui-media-object" src="'+imageUrl+'">'+
			'<span class="mui-icon mui-icon-trash deleteBtn"></span>'+
		'</a>'+
	'</li>';
	img.innerHTML=html;
	
}