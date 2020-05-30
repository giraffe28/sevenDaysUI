mui.init();
mui.plusReady(function(){
	var user = app.getUserGlobalInfo();
	mui.ajax(app.serverUrl+'/drift/randomGetOne',{//随机捞取漂流瓶
		type:'get',
		contentType: "application/json;charset=utf-8",
		dataType: "json",
		data: {//data携带的参数，根据自己的服务器参数写
			
		},
		success:function(data){
			//服务器返回响应，根据响应结果，分析是否捞取成功；
			console.log(JSON.stringify(data));
			//console.log(JSON.stringify(data.data.content));
			if (data.status == 200) {
				var content=document.getElementById("content");
				var Html="";
				Html='<ul class="mui-view-cell">'+
						data.data.content+
					'</ul>';
				content.innerHTML=Html;
			}
			else{
				app.showToast(data.msg, "error");
			}
		}
	});
	var send=document.getElementById("send-btn");
	send.addEventListener('tap',function(){
		var content=document.getElementById('comment-text').value;
		if(content==''){
			mui.toast('内容不能为空');
			return false; 
		}
		else if(content.length>50){
		   mui.toast('评论不得超过50个字');
		   return false; 
		}
		else{
			var myDate = new Date();
			mui.ajax(app.serverUrl+"/drift/send", {//回复漂流瓶
				data: {
					replayId:user.userId,
					message:content,
					driftId:1				
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json;charset:utf-8'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否成功发送评论；
					if (data.status == 200) {
						//显示成功信息
						mui.toast("评论发送成功");
						console.log(data.data);
						location.reload()
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