mui.init();
mui.plusReady(function() {
	var thisWebview = plus.webview.currentWebview();
	thisWebview.addEventListener("show", function() {
		//发送请求到后端，返回黑名单
		requestBlackList();
		//从缓存中获取黑名单列表，并且渲染到页面
		renderBlackListPage();
	});

	document.getElementById("delete").addEventListener('tap', function() {
		var statu = confirm("确认将该联系人从黑名单移出吗?"); //在js里面写confirm，在页面中弹出提示信息。
		if (!statu) //如果点击的是取消
		{
			return false; //返回页面
		} else { //如果点击确定，就继续执行下面的操作
			var elem = this;
			var li = elem.parentNode.parentNode;
			var addedId = li.value;
			var userId = app.getUserGlobalInfo().userId;
			//向服务器发送请求删除该黑名单用户
			mui.ajax('http://server-name/login.php', {
				data: {
					userId: userId,
					addedId: addedId
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否删除成功；
					if (data.status == 200) {
						//删除黑名单缓存
						plus.storage.removeItem("blackList");
						// 页面跳转到默认首页（后续需更改
						mui.openWindow("ll_personalCenter.html", "ll_personalCenter.html");
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			});
			alert("保存成功");
			window.open('ll_personalCenter.html');
		}
	})


})

//从缓存中获取用户黑名单，并且渲染到页面
function renderBlackListPage() {
	//从缓存获取黑名单列表
	var blackList = app.getBlackList();
	//显示黑名单列表
	var ulBlackList = document.getElementById("ulBlackList");
	if (blackList != null && blackList.length > 0) {
		var blackListHtml = "";
		for (var i = 0; i < blackList.length; i++) {
			blackListHtml += renderUser(blackList[i]);
		}
		ulBlackList.innerHTML = blackListHtml;
	} else {
		ulBlackList.innerHTML = "";
	}
}

function renderUser(user) { //设置用户列表的单个列表项
	var html = "";
	html = '<li class="mui-table-view-cell" ' + 'value="' + user.userId + '">' +
		'<div class="mui-slider-right mui-disabled">' +
		'<a class="mui-btn mui-btn-red">删除</a>' +
		'</div>' +
		'<div class="mui-slider-handle">' + user.nickname +
		'</div>' +
		'</li>';
	return html;
}

//向后端发送请求获取黑名单
function requestBlackList() {
	mui.ajax('http://server-name/login.php', {
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
			//服务器返回响应，根据响应结果，分析是否修改成功；
			if (data.status == 200) {
				//刷新用户黑名单信息
				var blackListJson = data.data;
				app.setblackList(blackListJson);
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
		}
	});
}
