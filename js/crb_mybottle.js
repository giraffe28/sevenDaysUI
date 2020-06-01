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
				var content=document.getElementById("content");
				var Html="";
				for(var i=0;i<data.data.length;i++){
					//console.log(JSON.stringify(data.data[i].bottleId));
					Html+=
						'<li class="mui-table-view-cell mui-media" id="'+data.data[i].bottleId+'">'+
							'<a href="javascript:;">'+
								'<span class="mui-pull-right"'+
									'style="color: gray;font-size: 14px;"></span>'+
								'<div class="mui-media-body" style="font-size:20px">'+
									data.data[i].content+
								'</div>'+
							'</a>'+
						'</li>';
				}
				content.innerHTML=Html;
			}
			else{
				app.showToast(data.msg, "error");
			}
		}
	});
	/*mui.json()
		mui('#post').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			//lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用			
			bottles.items = convert(rsp);
			var list=document.getElementById("bottlelist");
			var bottleHtml="";
			for(var i=0;i<bottles.items.length;i++){
				bottleHtml+=addbottle(bottles.items[i]);
			}
			list.innerHTML=bottleHtml;
			addlistNer();
		}
	},'json');*/
	
	
})

function addbottle(bottle) {
	var html="";
	html='<div class="mui-table-view-cell line-limit-length bottleItem" id="'+drift.driftid+'">'+
					
		'</div>';
	return html;
	
		   /*'<div class="mui-card postItem" id="'+post.postId+'">'+
				'<div class="mui-card-header mui-card-media">'+
					'<div class="mui-media-body">'+
						post.nickname+
						'<p>发表于'+post.date+'</p>'+
					'</div>'+
				'</div>'+
				'<div class="mui-card-content">'+
					'<p class="line-limit-length content">'+post.content+'</p>'+
				'</div>'+
				'<div class="mui-card-footer">'+
					'赞:'+post.postlike+
				'</div>'+
			'</div>';			
	return html;*/
}

function addlistNer(){
	mui("#bottlelist").on("tap",".bottleItem",function(e){
		var postId = this.getAttribute("id");
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
			/*icon:item.user.icon,
			nickname:item.user.nickname,
			date:new Date(item.postDate),
			content:item.postContent,
			postId:item.postId,
			postlike:item.postLike*/
		});
	});
	return bottleItems;
}
