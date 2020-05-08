//mui初始化，配置下拉刷新
var head;
var max;
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
	max = 1;
	var data = {
		start:0,
		max:1//需要的字段名
	}
	/*if(lastId) { //说明已有数据，目前处于下拉刷新，增加时间戳，触发服务端立即刷新，返回最新数据
		data.lastId = lastId;
		data.time = new Date().getTime() + "";
	}*/
	//请求最新列表信息流
	mui.post(app.serverUrl + "/square/find", data, function(rsp) {
		
		/*console.log(app.serverUrl + "/square/find?start=0&max=5");
		console.log(rsp.data[0].postContent);
		console.log(JSON.stringify(rsp.data));*/
		mui('#post').pullRefresh().endPulldownToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用
			
			posts.items = convert(rsp);
			console.log(posts.items[0].nickname);
			
			
			var list=document.getElementById("postlist");

				var postHtml="";
				for(var i=0;i<posts.items.length;i++){
					postHtml+=addpost(posts.items[i]);
				}
				list.innerHTML=postHtml;
				addlistNer();
		}
	},'json'
	);
}


function addpost(post) {
	var html="";
	html='<li class="postItem" id="'+post.postId+'">'+
			
		   '<div class="mui-card">'+
		        post.nickname+'<br/>'+
				post.content+'<br/>'+
				post.date+'<br/>'+
				post.postlike+'<br/>'+
				'</div>'+
				
		'</li>';	
	return html;
}

function addlistNer(){
	mui("#postlist").on("tap",".postItem",function(e){
		var postId = this.getAttribute("id");
		mui.openWindow({
			url:"crb_details.html",
			id:"post_"+postId,
			extras:{
				postid:postId,
				/*nickname:nickname,
				content:content,
				date:date,
				postlike:postlike*/
			}
		});
	});
}


/**
 * 上拉加载拉取历史列表 
 */
function pullupRefresh() {
	head += 1;
	max = 1;
	
	var data = {
		start:head,
		max:1//需要的字段名
	}
	
	
	//请求历史列表信息流
	mui.post(app.serverUrl + "/square/find", data, function(rsp) {
		
		//console.log(app.serverUrl + "/square/find?start=0&max=5");
		//console.log(rsp.data[0].postContent);
		//console.log(JSON.stringify(rsp.data));
		mui('#post').pullRefresh().endPullupToRefresh();
		rsp=rsp.data;
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].postId; //保存最新消息的id，方便下拉刷新时使用
			
			//posts.items = convert(rsp).concat(posts.items);
			posts.items = posts.items.concat(convert(rsp));
			console.log(posts.items[0].nickname);
			
			
			var list=document.getElementById("postlist");
				var postHtml="";
				for(var i=0;i<posts.items.length;i++){
					postHtml+=addpost(posts.items[i]);
				}

				list.innerHTML=postHtml;

		
		}
	},'json'
	);
}


var posts = new Vue({
	el: '#posts',
	data: {
		items: [] //列表信息流数据
	}
});
/**
 * 打开新闻详情
 * 
 * @param {Object} item 当前点击的新闻对象
 */
/*function open_detail(item) {
	//触发子窗口变更新闻详情
	mui.fire(webview_detail, 'get_detail', {
		//icon:item.icon,
		nickname:item.nickname,
		date:item.post_date,
		content:item.post_content
	});
}*/
/**
 * 1、将服务端返回数据，转换成前端需要的格式
 * 2、若服务端返回格式和前端所需格式相同，则不需要改功能
 * 
 * @param {Array} items 
 */
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
	//console.log(postItems);
	return postItems;
}

/**
 * 格式化时间的辅助类，将一个时间转换成x小时前、y天前等
 
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		mui.each(this.UNITS, function(unit, value) {
			if(milliseconds >= value) {
				humanize = Math.floor(milliseconds / value) + unit + '前';
				return false;
			}
			return true;
		});
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if(diff < this.UNITS['天']) {
			return this.humanize(diff);
		}

		var _format = function(number) {
			return(number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' + _format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};*/