mui.init();
mui.plusReady(function () {
    mui.ajax(app.serverUrl+"/corner/getpost",{
    	data:{
    		bottleId:bottleid
    	},
    	dataType:'json',
    	type:'POST',
    	timeout:10000,
    	contentType:'application/json;charset=utf-8',
    	success:function(data){
    		nickname=data.data.user.nickname;
    		date=new Date(data.data.postDate);
    		content=data.data.postContent;
    		postlike=data.data.postLike;
    	}
    })
    
    document.getElementById("title").innerHTML=nickname;
    document.getElementById("time").innerHTML=date;
    document.getElementById("content").innerHTML=content;
    document.getElementById("postlike").innerHTML=postlike;
    	
    head = 0;
    max = 10;
    var data = {
    	start:0,
    	max:max,//需要的字段名
    	postId:postid,
    }
    mui.post(app.serverUrl + "/corner/getcomment", data, function(rsp) {
    	if(rsp.data==""){
    		mui('#comment').pullRefresh().endPulldownToRefresh();
    	}else{
    		/*console.log(rsp.data[0].commentId);
    		console.log(JSON.stringify(rsp.data));*/
    		mui('#comment').pullRefresh().endPulldownToRefresh();
    		rsp=rsp.data;
    		if(rsp && rsp.length > 0) {
    			lastId = rsp[0].commentId; //保存最新消息的id，方便下拉刷新时使用
    			posts.items = convert(rsp);
    		
    			var list=document.getElementById("commentlist");
    			var postHtml="";
    			for(var i=0;i<posts.items.length;i++){
    				var j=parseInt(i)+parseInt(1);
    				postHtml+=addpost(posts.items[i],j);
    			}
    			if(max>posts.items.length){
    				index=posts.items.length;
    			}else{
    				index=max;
    			}
    			list.innerHTML=postHtml;
    		}
    	}	
    },'json');
})

function addpost(post,j) {
	var html="";
	html='<div class="mui-card comment" id="commentItem">'+
			'评论'+j+'<br/>'+
			post.sendUser+':'+post.postContent+
		'</div>';
		
	return html;
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
			commentId:item.commentId,
			postContent:item.postContent,
			sendUser:item.sendUser.userId
		});
	});
	//console.log(postItems);
	return postItems;
}

//窗口隐藏时，重置页面数据
mui.plusReady(function () {
	
	var user = app.getUserGlobalInfo();
	var Webview=plus.webview.currentWebview();
	postid=Webview.postid;
	console.log(postid);
	nickname=Webview.nickname;
	content=Webview.content;
	date=Webview.date;
	postlike=Webview.postlike;
	/*postid=Webview.postid;
	console.log(postlike);*/

})
