mui.init();
mui.plusReady(function() {
	var thisWebview = plus.webview.currentWebview();
	thisWebview.addEventListener("show", function() {
		//从缓存中获取黑名单列表，并且渲染到页面
		renderBlackListPage();
	});
	(function($) {
		$('#ulBlackList').on('tap', '.mui-btn', function(event) {
			var elem = this;
			var li = elem.parentNode.parentNode;
			var con=mui.confirm('确认将该联系人从黑名单移出？', btnArray, function(e) {
				if (e.index == 0) {
					var addedId=li.value;
					li.parentNode.removeChild(li);
					alert("删除成功");
					/*$.ajax('http://server-name/login.php', {
						data: {
							userId: app.getUserGlobalInfo().userId,
							addedId: addedId;
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						headers: {
							'Content-Type': 'application/json'
						},
						success: function(data) {
							//服务器返回响应，根据响应结果(返回用户最新的黑名单列表)，分析是否修改成功；
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
					*/
				} else {
					setTimeout(function() {
						$.swipeoutClose(li);
					}, 0);
				}
			});
		});
		var btnArray = ['确认', '取消'];
	})(mui);
	
})
//从缓存中获取用户黑名单，并且渲染到页面
function renderBlackListPage() {
	//获取黑名单列表
	var blackList = app.getBlackList();
	//发送请求返回黑名单列表
	if(blackList==null){
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
	html = '<li class="mui-table-view-cell" '+'value="'+user.userId+ '">'+
		'<div class="mui-slider-right mui-disabled">' +
		'<a class="mui-btn mui-btn-red">删除</a>' +
		'</div>' +
		'<div class="mui-slider-handle">' + user.nickname +
		'</div>' +
		'</li>';
	return html;
}
