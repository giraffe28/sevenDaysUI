mui.init();
mui.plusReady(function(){
	var user = app.getUserGlobalInfo();
	mui.ajax(app.serverUrl+'/drift/viewByUserId',{
		type:'post',
		contentType: "application/json;charset=utf-8",
		dataType: "json",
		data: {//data携带的参数，根据自己的服务器参数写
			userId:user.userId
		},
		success:function(data){
			//服务器返回响应，根据响应结果，分析是否捞取成功；
			//console.log(JSON.stringify(data));
			//console.log(JSON.stringify(data.data.content));
			if (data.status == 200) {
				var list=document.getElementById("bottlelist");
				var Html="";
				for(var i=0;i<data.data.length;i++){
					//console.log(JSON.stringify(data.data[i].bottleId));
					Html+='<li class="mui-table-view-cell bottleItem" id="'+data.data[i].bottleId+'">'+
							'<div class="mui-slider-right mui-disabled">'+
								'<span class="mui-btn mui-btn-red">删除</span>'+
							'</div>'+
							'<div class="mui-slider-handle">'+
								data.data[i].content+
							'</div>'+
						'</li>';
					/*
					'<div class="mui-card bottleItem" id="'+data.data[i].bottleId+'">'+
							'<div class="mui-card-content">'+
								'<p id="content" class="content">'+
									data.data[i].content+
								'</p>'+
							'</div>'+
						'</div>';*/
				}
				list.innerHTML=Html;
				addlistNer();
			}
			else{
				app.showToast(data.msg, "error");
			}
		}
	});
	
	
	
})

function addlistNer(){
	mui("#bottlelist").on("tap",".bottleItem",function(e){
		var bottleId = this.getAttribute("id");
		mui.openWindow({
			url:"crb_bottle.html",
			id:"bottle_"+bottleId,
			extras:{
				bottleid:bottleId,
			},
		});
	});
}

var bottles = new Vue({
	el: '#bottles',
	data: {
		items: [] //列表信息流数据
	}
});

function convert(items) {
	var bottleItems = [];
	items.forEach(function(item) {
		bottleItems.push({
			//icon:item.user.icon,
			//nickname:item.user.nickname,
			//date:new Date(item.postDate),
			//content:item.postContent,
			//postId:item.postId,
			//postlike:item.postLike
		});
	});
	return bottleItems;
}

var btnArray = ['我再想想叭','狠心删掉'];
mui('.bottlelist').on('tap', '.mui-btn', function() {
	var elem = this;
	var li = elem.parentNode.parentNode;
	var user = app.getUserGlobalInfo();
	mui.confirm('真的要狠心删除这个漂流瓶吗(｡ ˇ‸ˇ ｡)', '提示', btnArray, function(e) {
		if (e.index == 1) {
			//删除操作
			mui.ajax(app.serverUrl + '/drift/delete', {
				data: {
					driftId: li.attributes["id"].value,
					userId:user.userId
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'delete', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					//服务器返回响应
					if (data.status == 200) {
						location.reload();
						mui.toast('已经删除啦~');
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			});
		} else {
			app.showToast(data.msg, "error");
		}
	});
});