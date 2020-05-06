mui.init();
window.addEventListener('newsId',function(event){
	//获得事件参数
	var id = event.detail.id;
	var postlist=document.getElementById("postlist");
	//根据id向服务器请求新闻详情
	mui.ajax('……',{//获取详情
		dataType:'json',
		type:'get',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		success:function(data){
			var listdata=data["rows"];
			var flist="";
			for(i=0;i<listdata.length;i++){
				if(listdata[i].postId==id){
					var ndata='<div class="mui-card">'+
								'<div class="mui-card-header mui-card-media">'+
									//'<img src="'+listdata[i].user.icon+'" id="icon">'+  显示用户头像、可能会出错
									'<div class="mui-media-body">'
										'<p id="name">'+listdata[i].user.nickname+'</p>'+
										'<p id="time">'+listdata[i].date+'</p>'+
									'</div>'+
								'</div>'+
								'<div class="mui-card-content">'+
									'<p id="post_content">'+
										listdata[i].content+
									'</p>'+
								'</div>'+
							'</div>'
							'<div class="mui-card-footer">'+
								'<div>赞'+//获赞个数的名字可能有误，麻烦修改
									'<span class="mui-badge mui-badge-warning mui-badge-inverted">'+listdata[i].postlike+'</span>'+
								'</div>'+
							'</div>';
					console.info(ndata);
					flist=flist+ndata;
				}
			}
			postlist.innerHTML+=flist;
		},
		error: function(xhr, type, errorThrown) {
		//异常处理；
			console.log(type);
		}
	});
	mui.ajax('……',{//获取评论
		dataType:'json',
		type:'get',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		success:function(data){
			var listdata=data["rows"];
			var flist="";
			for(i=0;i<listdata.length;i++){//显示所有评论的评论者名字与内容，名字可能有误，麻烦修改
				var ndata='<ul class="mui-table-view m-r-10 m-l-10">'+
							'<li class="mui-table-view-cell">'+listdata[i].nickname+':'+listdata[i].content+'</li>'+
						'</ul>';
				//console.info(ndata);
				flist=flist+ndata;
			}
			postlist.innerHTML+=flist;
		},
		error: function(xhr, type, errorThrown) {
		//异常处理；
			console.log(type);
		}
	});
	
});
mui.plusReady(function(){
	//点击发送评论按钮
	var send=document.getElementById("send");
	send.addEventListener('tap',function(){
		var comment=document.getElementById("comment").value;
		if(comment.length>20){
			mui.toast("评论不得超过20个字");
			return false; 
		}
		var user = app.getUserGlobalInfo();
		var myDate = new Date();
		mui.ajax('……', {
			data: {
				userId:user.userId,
				comment:'comment',
				//comment_time:myDate.toLocaleString()
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否成功发送评论；
				if (data.status == 200) {
					//显示成功信息
					mui.toast("评论成功");
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
});
