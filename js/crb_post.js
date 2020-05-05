mui.init();
mui.plusReady(function () {
	//
	var post=document.getElementById("post");
	post.addEventListener('tap',function(){
	   var content=document.getElementById("post_content").value;
	   if(content.length>200){
		   mui.toast("正文不得超过100个字");
		   return false; 
	   }
	   var user = app.getUserGlobalInfo();
	   var myDate = new Date();
	   mui.ajax('……', {
	   	data: {
	   		userId:user.userId,
	   		content:'content',
	   		comment_time:myDate.toLocaleString()
	   	},
	   	dataType: 'json', //服务器返回json格式数据
	   	type: 'post', //HTTP请求类型
	   	timeout: 10000, //超时时间设置为10秒；
	   	headers: {
	   		'Content-Type': 'application/json'
	   	},
	   	success: function(data) {
	   		//服务器返回响应，根据响应结果，分析是否成功发送动态；
	   		if (data.status == 200) {
	   			//显示成功信息
	   			//mui.toast("发送动态成功");
				mui.openWindow({//跳转到广场页面
				    url:'../html/crb_square.html',
				    id:'crb_square.html'
				})
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
	});	
}