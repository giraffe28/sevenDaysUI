var user;
var thisWeekTags;
var tagFormDom;
mui.init();
mui.plusReady(function() {
	user = app.getUserGlobalInfo();
	var thisWeekTagStr = "";
	thisWeekTags = user.thisWeekTag.split(" ");
	renderTagPage(thisWeekTags);
	var selectedTags = document.getElementsByTagName("input");
	tagFormDom = document.getElementById("tagForm");
	var tagNum = 0;
	document.getElementById("save").addEventListener('tap', function() {
		tagNum = 0;//置零
		thisWeekTagStr = "";
		for (var i = 0; i < selectedTags.length; i++) {
			if (selectedTags[i].type == "checkbox" && selectedTags[i].checked) {
				thisWeekTagStr += selectedTags[i].value + ' ';
				console.log(thisWeekTagStr);
				tagNum++;
			}
		}
		if (tagNum <= 3) {
			mui.ajax(app.serverUrl + "/user/setThisWeekTag", {
				data: {
					userId:user.userId,
					thisWeekTag: thisWeekTagStr
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒
				headers:{'Content-Type':'application/json'},
				success: function(data) {
					console.log(JSON.stringify(data));
					user.thisWeekTag = thisWeekTagStr;
					plus.storage.setItem("userInfo",JSON.stringify(user));
					//console.log("thisweektag"+user.thisWeekTag);
					mui.toast("已经为您换上标签了哦(˶‾᷄ ⁻̫ ‾᷅˵)");
					var chatWebview = plus.webview.getWebviewById("ll_personalCenter.html");
					chatWebview.evalJS("refreshThisWeekTags('"+user.thisWeekTag+"')");
					mui.back();
				},
				error: function(xhr, type, errorThrown) {

				},
			});
		} else {
			mui.toast('保存失败啦=.= 最多只能选择三个哦！');
		}
	})
	document.getElementById("cancel").addEventListener("tap",function(){
		mui.back();
	});
});

//从后台获取标签，渲染页面
function renderTagPage(thisWeekTags) {
//	console.log("渲染标签列表");
	mui.ajax(app.serverUrl + '/tag/getTag', { //发送请求返回系统标签
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},   
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取信息；
			if (data.status == 200) {
				var flag;
				var tags = data.data;
				console.log(JSON.stringify(tags));
				if (tags != null && tags.length > 0) {
					var tagsHtml = "";
					for (var i = 0; i < tags.length; i++) {
						flag = false;
						for (var j = 0; j < thisWeekTags.length; j++) {
							//console.log(thisWeekTags[j]);
							if (tags[i].tagName==thisWeekTags[j])
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
			// console.log(JSON.stringify(data.data));
		}
	});
}
