var randomId;
var reportDom=document.getElementById("report");

mui.init();
mui.plusReady(function(){
	var user = app.getUserGlobalInfo();
	mui.ajax(app.serverUrl+'/drift/randomGetOne',{//随机捞取漂流瓶
		type:'get',
		contentType: "application/json;charset=utf-8",
		dataType: "json",
		success:function(data){
			//服务器返回响应，根据响应结果，分析是否捞取成功；
			//console.log(JSON.stringify(data));
			if (data.status == 200) {
				randomId=data.data.bottleId;
				var content=document.getElementById("content");
				var Html="";
				Html='<div class="mui-card drift">'+
						//'<p style="font-size:20px">'+
						data.data.content+
						//'</p>'+
					'</div>';
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
					driftId:randomId				
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
						//console.log(JSON.stringify(data));
						mui.toast("评论发送成功,瓶子又回归大海了\^O^/");
						//mui.openWindow('../html/crb_drift.html','crb_drift.html');
						//location.reload();
						//mui.openWindow('../html/crb_drift.html','crb_drift.html');
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
	
	reportDom.addEventListener('tap',function(){
//		console.log("到达举报的事件监听");
//		console.log(randomId);
		//跳转到对应的朋友的举报页面
		mui.openWindow({
			url:"lhf_report.html",
			id:"lhf_report.html",
			extras:{
				reportType:app.BOTTLEVIOLATION,
				reportObjectId:randomId
			},
			createNew:false//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	});
})

