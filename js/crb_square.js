//mui初始化，配置下拉刷新
mui.init({
	pullRefresh: {
		container: '#postlist',
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
		column: "icon,nickname,post_date,post_content" //需要的字段名
	}
	if(lastId) { //说明已有数据，目前处于下拉刷新，增加时间戳，触发服务端立即刷新，返回最新数据
		data.lastId = lastId;
		data.time = new Date().getTime() + "";
	}
	//请求最新列表信息流
	mui.getJSON("……", data, function(rsp) {
		mui('#postlist').pullRefresh().endPulldownToRefresh();
		if(rsp && rsp.length > 0) {
			lastId = rsp[0].id; //保存最新消息的id，方便下拉刷新时使用
			if(!minId) {//首次拉取列表时保存最后一条消息的id，方便上拉加载时使用
				minId = rsp[rsp.length - 1].id; 										
			}
			posts.items = convert(rsp).concat(posts.items);
		}
	});
}
/**
 * 上拉加载拉取历史列表 
 */
function pullupRefresh() {
	var data = {
		column: "icon,nickname,post_date,post_content" //需要的字段名
	};
	if(minId) { //说明已有数据，目前处于上拉加载，传递当前minId 返回历史数据
		data.minId = minId;
		data.time = new Date().getTime() + "";
		data.pageSize = 10;
	}
	//请求历史列表信息流
	mui.getJSON("……", data, function(rsp) {
		mui('#postlist').pullRefresh().endPullupToRefresh();
		if(rsp && rsp.length > 0) {
			minId = rsp[rsp.length - 1].id; //保存最后一条消息的id，上拉加载时使用
			posts.items = posts.items.concat(convert(rsp));
		}
	});
}
mui.plusReady(function() {
	//预加载详情页
	webview_detail = mui.preload({
		url: '../html/crb_details.html',
		id: 'crb_details.html',
	});
});
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
function open_detail(item) {
	//触发子窗口变更新闻详情
	mui.fire(webview_detail, 'get_detail', {
		icon:item.icon,
		nickname:item.nickname,
		date:item.post_date,
		content:item.post_content
	});
}
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
			icon:item.icon,
			nickname:item.nickname,
			date:item.post_date,
			content:item.post_content
		});
	});
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