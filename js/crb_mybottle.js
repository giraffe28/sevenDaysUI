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
					Html+='<div class="mui-card bottleItem" id="'+data.data[i].bottleId+'">'+
							'<div class="mui-card-content">'+
								'<p id="content" class="content">'+
									data.data[i].content+
								'</p>'+
							'</div>'+
						'</div>';
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
