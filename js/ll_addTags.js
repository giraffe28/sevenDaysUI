var user = app.getUserGlobalInfo();
var thisWeekTags = user.thisWeekTag;
mui.init();
mui.plusReady(function() {
	renderTagPage();
	var thisWeekTagStr = "";
	var selectedTags = document.getElementsByTagName("input");
	var tagFormDom = document.getElementById("tagForm");
	var tagNum = 0;
	document.getElementById("save").addEventListener('tap', function() {
		for (var i = 0; i < selectedTags.length; i++) {
			if (selectedTags[i].type == "checkbox" && selectedTags[i].checked) {
				thisWeekTagStr += selectedTags[i].value + ' ';
				tagNum++;
			}
		}
		if (tagNum <= 3) {
			mui.ajax(app.serverUrl + "/user/setThisWeekTag", {
				data: {
					thisWeekTag: thisWeekTagStr
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					console.log(JSON.stringify(data));
				},
				error: function(xhr, type, errorThrown) {

				}
			});
		} else {
			mui.toast('保存失败啦=.= 最多只能选择三个哦！');
		}
	})
});

//从后台获取标签，渲染页面
function renderTagPage() {
	mui.ajax(app.serverUrl + '', { //发送请求返回系统标签
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取信息；
			if (data.status == 200) {
				var flag;
				var tags = JSON.stringify(data.data);
				if (tags != null && tags.length > 0) {
					var tagsHtml = "";
					for (var i = 0; i < tags.length; i++) {
						flag = false;
						for (var j = 0; j < thisWeekTags.length; j++) {
							if (tags[i].tagName.equals(thisWeekTags[j].tagName))
								flag = true;
						}
						//如果是本周标签，默认被选中
						if (flag == true) {
							tagsHtml += '<div class="mui-input-row mui-checkbox">' +
								'<label>' + tags[i].tagName + '</label>' +
								'<input name="checkbox1" value="' + tags[i].tagName +
								'" type="checkbox" checked> </div>';
						} else {
							tagsHtml += '<div class="mui-input-row mui-checkbox">' +
								'<label>' + tags[i].tagName + '</label>' +
								'<input name="checkbox1" value="' + tags[i].tagName + '" type="checkbox"> </div>';
						}
					}
					tagFormDom.innerHTML = tagsHtml;
				} else {
					tagFormDom.innerHTML = "";
				}
			} else {
				app.showToast(data.msg, "error");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(JSON.stringify(data.data));
		}
	});
}
