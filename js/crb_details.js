
//mui初始化，配置下拉刷新
mui.init({
	pullRefresh: {
		container: '#commentlist',
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
	var data = {
		column: "comment_name,comment_content" //需要的字段名
	}
	if(lastId) { //说明已有数据，目前处于下拉刷新，增加时间戳，触发服务端立即刷新，返回最新数据
		data.lastId = lastId;
		data.time = new Date().getTime() + "";
	}
	//请求最新列表信息流
	mui.getJSON("……", data, function(rsp) {
		mui('#commentlist').pullRefresh().endPulldownToRefresh();
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].id; //保存最新消息的id，方便下拉刷新时使用
			if(!minId) {//首次拉取列表时保存最后一条消息的id，方便上拉加载时使用
				minId = rsp[rsp.length - 1].id; 										
			}
			comments.items = convert(rsp).concat(comments.items);
		}
	});
}
/**
 * 上拉加载拉取历史列表 
 */
function pullupRefresh() {
	var data = {
		column: "comment_name,comment_content" //需要的字段名
	};
	if(minId) { //说明已有数据，目前处于上拉加载，传递当前minId 返回历史数据
		data.minId = minId;
		data.time = new Date().getTime() + "";
		data.pageSize = 10;
	}
	//请求历史列表信息流
	mui.getJSON("……", data, function(rsp) {
		mui('#commentlist').pullRefresh().endPullupToRefresh();
		if(rsp && rsp.length > 0) {
			minId = rsp[rsp.length - 1].id; //保存最后一条消息的id，上拉加载时使用
			comments.items = comments.items.concat(convert(rsp));
		}
	});
}
var posts = new Vue({
	el: '#comments',
	data: {
		items: [] //列表信息流数据
	}
});
/**
 * 1、将服务端返回数据，转换成前端需要的格式
 * 2、若服务端返回格式和前端所需格式相同，则不需要改功能
 * 
 * @param {Array} items 
 */
function convert(items) {
	var commentItems = [];
	items.forEach(function(item) {
		commentItems.push({
			comment_name:item.comment_name,
			comment_content:item.comment_content
		});
	});
	return commentItems;
}


function getDefaultData() {
	return {
		icon:'',
		nickname:'',
		date:'',
		image:'',
		content:'',
		like_num:''
	}
}
var vm = new Vue({
	el: '.mui-content',
	data: getDefaultData(),
		methods: {
			resetData: function() {//重置数据
			Object.assign(this.$data, getDefaultData());
		}
	}
});

//监听自定义事件，获取动态详情
document.addEventListener('get_detail', function(event) {
	var guid = event.detail.guid;
			 
	if(!guid) {
		return;
	}
				
//前页传入的数据，直接渲染，无需等待ajax请求详情后
vm.icon = event.detail.icon;
vm.nickname = event.detail.nickname;
vm.date = event.detail.date;
vm.image = event.detail.image;
vm.content = event.detail.content;
vm.like_num = event.detail.like_num;

//重写返回逻辑
mui.back = function() {
	plus.webview.currentWebview().hide("auto", 300);
}
			
//窗口隐藏时，重置页面数据
mui.plusReady(function () {
	var self = plus.webview.currentWebview();
	self.addEventListener("hide",function (e) {
		window.scrollTo(0, 0);
		vm.resetData();
	},false);
})

//点击发送评论按钮
var send=document.getElementById("send");
send.addEventListener('tap',function(){
   var content=document.getElementById("comment").value;
   if(content.length>40){
	   mui.toast("正文不得超过20个字");
	   return false; 
   }
});