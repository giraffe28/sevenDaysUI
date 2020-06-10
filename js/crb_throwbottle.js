mui.init();
mui.plusReady(function () {
	var user = app.getUserGlobalInfo();
	var post=document.getElementById("post");
	post.addEventListener('tap',function(){
		var content=document.getElementById('throw_content').value;
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
	   mui.ajax(app.serverUrl+"/drift/write", {
	   	data: {
			userId:user.userId,
	   		content:content
	   	},
	   	dataType: 'json', //服务器返回json格式数据
	   	type: 'post', //HTTP请求类型
	   	timeout: 10000, //超时时间设置为10秒；
	   	headers: {
	   		'Content-Type': 'application/json;charset:utf-8'
	   	},
	   	success: function(data) {
	   		//服务器返回响应，根据响应结果，分析是否成功扔出；
	   		if (data.status == 200) {
	   			//显示成功信息
	   			mui.toast("成功扔出漂流瓶");
//				console.log(data.data);
				var chatWebview = plus.webview.getWebviewById("crb_drift.html");
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
})