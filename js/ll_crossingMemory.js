mui.init();
mui.plusReady(function() {
	//发送请求到后端，返回十字记忆
	requestMemory();
	//从缓存中获取十字记忆，并且渲染到页面
	renderMemoryPage();
})
//从缓存中获取十字记忆，并且渲染到页面
function renderMemoryPage() {
	//获取十字记忆
	var memory = app.getMemory();
	//渲染十字记忆页面
	var ulMemory = document.getElementById("ulMemory");
	if (memory != null && memory.length > 0) {
		var memoryHtml = "";
		for (var i = 0; i < memory.length; i++) {
			memoryHtml += renderMemory(memory[i]);
		}
		ulMemory.innerHTML = memoryHtml;
	} else {
		ulMemory.innerHTML = "";
	}
}
//设置十字记忆列表的单个列表项
function renderMemory(memory) {
	var html = "";
	html = '<li class="mui-table-view-cell memoryRecord" id="'+memory.memoryId+'">'+
					'<div class="mui-slider-right mui-disabled">'+
						'<span class="mui-btn mui-btn-red">删除</span>'+
					'</div>'+
					'<div class="mui-slider-handle">'+memory.memoryTitle+'</div>'+
				'</li>';
	return html;
}

function requestMemory() {
	mui.ajax('......', {
		data: {
			userId: app.getUserGlobalInfo().userId,
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功；
			if (data.status == 200) {
				//获取用户十字记忆信息
				var memoryJson = data.data;
				app.setMemory(memoryJson);
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
		}
	});
}
var btnArray = ['确认', '取消'];
mui('.memoryList').on('tap', '.mui-btn', function() {
	var elem = this;
	var li = elem.parentNode.parentNode;
	mui.confirm('确认删除这条十字记忆？', '提示', btnArray, function(e) {
		if (e.index == 0) {
			//删除操作
			li.parentNode.removeChild(li);
		} else {
			mui.swipeoutClose(li);
		}
	});
});

mui('.memoryList').on('tap', '.memoryRecord', function() {
	var li = this;
	//mui.toast(li.attributes["id"].value);
	//打开十字记忆详情页面
	mui.openWindow({
		url:"../html/ll_memoryDetail.html",
		id:li.attributes["id"].value,
		extras:{
			memoryId:li.attributes["id"].value,
		}
	});
});
