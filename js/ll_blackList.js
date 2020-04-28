mui.init();
(function($) { 
	$('#OA_task_1').on('tap', '.mui-btn', function(event) {
		var elem = this;
		var li = elem.parentNode.parentNode;
		mui.confirm('确认将该联系人从黑名单移出？', '', btnArray, function(e) {
			if (e.index == 0) {
				li.parentNode.removeChild(li);
				/*mui.ajax(app.serverUrl + "/blackList/delete", {
					data: {
						userId:'';
						addedId:'';
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						console.log(JSON.stringify(data));
					},
				});*/
			} else {
				setTimeout(function() {
					$.swipeoutClose(li);
				}, 0);
			}
		});
	});
	var btnArray = ['确认', '取消'];
})(mui);
