//mui初始化，配置下拉刷新
var head;
var max;
var length;
var index;
mui.init({
	pullRefresh: {
		container: '#post',
		down: {
			style: 'circle',
			offset: '0px',
			auto: true,
			callback: pulldownRefresh
		},
		up: {
			contentrefresh: '正在加载...',
			contentnomore:'动态到底了',
			callback: pullupRefresh
		}
	}
});

document.getElementById('addPost').addEventListener('tap',function(){
	mui.openWindow('crb_post.html','crb_post.html');
});

/**
 *  下拉刷新获取最新列表 
 */
function pulldownRefresh() {
	if(window.plus && plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
		plus.nativeUI.toast('似乎已断开与互联网的连接', {
			verticalAlign: 'top'
		});
		return;
	}
	
	head = 0;
	max = 10;
	var data = {
		start:head,
		max:max//需要的字段名
	}
	/*if(lastId) { //说明已有数据，目前处于下拉刷新，增加时间戳，触发服务端立即刷新，返回最新数据
		data.lastId = lastId;
		data.time = new Date().getTime() + "";
	}*/
	//请求最新列表信息流
	mui.post(app.serverUrl + "/square/find", data, function(rsp) {
		console.log(JSON.stringify(rsp));
		mui('#post').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用			
			posts.items = convert(rsp);
			var list=document.getElementById("postlist");
			var postHtml="";
			index=posts.items.length;
			for(var i=0;i<posts.items.length;i++){
				postHtml+=addpost(posts.items[i]);
			}
			list.innerHTML=postHtml;
			addlistNer();
		}
	},'json');
}

function addpost(post) {
	//console.log(post.image);
	var html="";
	year=post.date.getFullYear();
	month=parseInt(post.date.getMonth()+1);
	day=post.date.getDate();
	hour=post.date.getHours();
	minute=post.date.getMinutes();
	second=post.date.getSeconds();
	html=
		'<div class="mui-card postItem" id="'+post.postId+'">'+
			'<div class="mui-card-header mui-card-media">';
	if(post.icon!=""){
		html+='<img src="'+post.icon+'"/>'+
				'<div class="mui-media-body">'+
					post.nickname+
					'<p>发表于 '+year+'.'+t(month)+'.'+t(day)+' '+
					t(hour)+':'+t(minute)+':'+t(second)+
					'</p>'+
				'</div>'+
			'</div>'+
			'<div class="mui-card-content">'+
				'<p class="line-limit-length content">'+post.content+'</p>'+
				//'<img src="'+post.postImage+'" alt="" width="100%">'+
			'</div>'+
			'<div class="mui-card-footer">'+
				'赞:'+post.postlike+
			'</div>'+
		'</div>';
	}else{
		html+='<img src="../images/1.jpg"/>'+
				'<div class="mui-media-body">'+
					post.nickname+
					'<p>发表于 '+year+'.'+t(month)+'.'+t(day)+' '+
					t(hour)+':'+t(minute)+':'+t(second)+
					'</p>'+
				'</div>'+
			'</div>'+
			'<div class="mui-card-content">'+
				'<p class="line-limit-length content">'+post.content+'</p>'+
				//'<img src="'+post.postImage+'" alt="" width="100%">'+
			'</div>'+
			'<div class="mui-card-footer">'+
				'赞:'+post.postlike+
			'</div>'+
		'</div>';
	}		
			
						
	return html;
}

function t(s){
	return s<10?"0"+s:s;
}

function addlistNer(){
	mui("#postlist").on("tap",".postItem",function(e){
		var postId = this.getAttribute("id");
		mui.openWindow({
			url:"crb_details.html",
			id:"post_"+postId,
			extras:{
				postid:postId,
			},
		});
	});
}

/**
 * 上拉加载拉取历史列表 
 */
function pullupRefresh() {
	console.log(index);
	console.log(head);
	
	head += max;
	max = 10;	
	var data = {
		start:head,
		max:max//需要的字段名
	}
	//if(index>=head){
	//请求历史列表信息流
	mui.post(app.serverUrl + "/square/find", data, function(rsp) {
		mui('#post').pullRefresh().endPullupToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用
			posts.items = posts.items.concat(convert(rsp));	
			var list=document.getElementById("postlist");
			var postHtml="";
			index=posts.items.length
			for(var i=0;i<posts.items.length;i++){
				postHtml+=addpost(posts.items[i]);
			}
			list.innerHTML=postHtml;
		}		
	},'json');
	//}
	//else{
	//	mui('#post').pullRefresh().endPullupToRefresh(true);
	//}
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
			icon:item.user.icon,
			nickname:item.user.nickname,
			date:new Date(item.postDate),
			content:item.postContent,
			postImage:item.postImage,
			postId:item.postId,
			postlike:item.postLike
		});
	});
	return postItems;
};

window.addEventListener('refresh', function(e){//执行刷新
    location.reload();
});