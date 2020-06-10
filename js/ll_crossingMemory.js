mui.init();
mui.plusReady(function() {
	//从缓存中获取十字记忆，并且渲染到页面
	requestMemory();
	renderMemoryPage();
	/*var meWebview = plus.webview.currentWebview();
	meWebview.addEventListener("show", function() {
		requestMemory();
		renderMemoryPage();
	});*/
});
window.addEventListener("show", function() {
	console.log("触发十字记忆的show事件");
	requestMemory();
	renderMemoryPage();
});

window.addEventListener("refresh", function() {
	console.log("触发十字记忆的refresh事件");
	requestMemory();
	renderMemoryPage();
	//location.reload(true); 
});

document.getElementById('addMemory').addEventListener('tap', function() {
	mui.openWindow('ll_addMemory.html', 'll_addMemory.html');
});

var btnArray = ['我再想想叭','狠心删掉'];
mui('.memoryList').on('tap', '.mui-btn', function() {
	var elem = this;
	var li = elem.parentNode.parentNode;
	var memory = app.getMemory();
	var index;
	for (var i = 0; i < memory.length; i++) {
		if (memory[i].memoryId == li.attributes["id"].value) {
			index = i;
		}
	}
	mui.confirm('真的要狠心删除这条十字记忆吗(｡ ˇ‸ˇ ｡)', '提示', btnArray, function(e) {
		if (e.index == 1) {
			//删除操作
			mui.ajax(app.serverUrl + '/memory/delete', {
				data: {
					memoryId: li.attributes["id"].value,
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
						var memoryJson = app.getMemory();
						//console.log(JSON.stringify(data.data));
						memoryJson.splice(index, 1);
						//console.log(JSON.stringify(memoryJson));
						plus.storage.setItem("memory", JSON.stringify(memoryJson));
						var chatWebview = plus.webview.getWebviewById("ll_crossingMemory.html");
						chatWebview.evalJS("requestMemory()");
						chatWebview.evalJS("renderMemoryPage()");
						mui.toast('已经删除啦~');
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			});
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
		url: "../html/ll_memoryDetail.html",
		id: li.attributes["id"].value,
		extras: {
			memoryId: li.attributes["id"].value,
		}
	});
});

function requestMemory() {
	plus.nativeUI.showWaiting("请稍等");
//	console.log("请求十字记忆");
	mui.ajax(app.serverUrl + '/memory/getMemory', {
		data: {
			userId: app.getUserGlobalInfo().userId,
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		async: false,
		timeout: 10000, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			//服务器返回响应
//			console.log(data.data);
			if (data.status == 200) {
				//刷新用户十字记忆信息
				var memoryJson = data.data;
				app.setMemory(memoryJson);
				//console.log(JSON.parse(memoryJson));
				plus.nativeUI.closeWaiting();
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
		}
	});
};




//从缓存中获取十字记忆，并且渲染到页面
function renderMemoryPage() {
//	console.log("渲染十字记忆界面");
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
		mui.toast("空空如也呢 赶快来创建属于你的十字记忆吧ψ(｀∇´)ψ");
	}
};
//设置十字记忆列表的单个列表项
function renderMemory(memory) {
	var html = "";
	var date=new Date(memory.memoryDate);
	html = '<li class="mui-table-view-cell memoryRecord" id="' + memory.memoryId + '">' +
		'<div class="mui-slider-right mui-disabled">' +
		'<span class="mui-btn mui-btn-red">删除</span>' +
		'</div>' +
		'<div class="mui-slider-handle">' + memory.memoryTitle +'<br> <span style="font-size: smaller;">' +
		 date.getFullYear()+'.'+t(date.getMonth()+1)+'.'+t(date.getDate())+' '+
		 t(date.getHours())+':'+t(date.getMinutes())+':'+t(date.getSeconds())+'</span>'+ '</div>' +
		'</li>';
	return html;
};

function t(s){
	return s<10?"0"+s:s;
}


