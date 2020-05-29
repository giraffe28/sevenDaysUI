mui.init();
mui.plusReady(function(){
	mui.post(app.serverUrl + "/square/find", data, function(rsp) {
	
		mui('#post').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用			
			posts.items = convert(rsp);
			var list=document.getElementById("postlist");
			var postHtml="";
			for(var i=0;i<posts.items.length;i++){
				postHtml+=addpost(posts.items[i]);
			}
			list.innerHTML=postHtml;
			addlistNer();
		}
	},'json');
	
})

function addpost(post) {
	var html="";
	html='<div class="mui-table-view-cell line-limit-length">'+
					
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
	mui("#postlist").on("tap",".postItem",function(e){
		var postId = this.getAttribute("id");
		mui.openWindow({
			url:"crb_bottle.html",
			id:"post_"+postId,
			extras:{
				postid:postId,
			},
		});
	});
}

var posts = new Vue({
	el: '#posts',
	data: {
		items: [] //列表信息流数据
	}
});

function convert(items) {
	var postItems = [];
	items.forEach(function(item) {
		postItems.push({
			//icon:item.user.icon,
			nickname:item.user.nickname,
			date:new Date(item.postDate),
			content:item.postContent,
			postId:item.postId,
			postlike:item.postLike
		});
	});
	return postItems;
}
