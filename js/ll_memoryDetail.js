mui.init();
mui.plusReady(function() {
	var title = document.getElementById("title");
	var content = document.getElementById("content");
	var index; //要修改的十字记忆在缓存中的下标
	//十字记忆详情页面
	var memoryDetailWebview = plus.webview.currentWebview();
	//获取上一个页面传入的十字记忆id
	var memoryId = memoryDetailWebview.memoryId;
	//console.log(memoryId);
	var memory = app.getMemory();
	for (var i = 0; i < memory.length; i++) {
		if (memory[i].memoryId == memoryId) {
			title.value = memory[i].memoryTitle;
			content.value = memory[i].content;
			index = i;
		}
	}
	document.getElementById("edit").addEventListener('tap', function() {
		mui.toast('现在你想怎么改就怎么改啦ψ(｀∇´)ψ');
		title.disabled = false;
		content.disabled = false;
	})
	document.getElementById("back").addEventListener('tap', function() {
		mui.openWindow('ll_personalCenter.html', 'll_personalCenter.html');
	})

	document.getElementById("save").addEventListener('tap', function() {
		title.setAttribute('disabled', 'disabled');
		content.setAttribute('disabled', 'disabled');
		var memoryTitle = title.value;
		var memoryContent = content.value;
		if (memoryTitle.trim() == "" || memoryContent.trim() == "") {
			mui.toast('内容不能为空哦');
		} 
		else if(memoryTitle.length>20){
			mui.toast('标题长度不能超过12个字哦');
		}
		else if(memoryContent.length>100){
			mui.toast('内容不能超过100个字哦');
		}
		else {
			mui.ajax(app.serverUrl + '/memory/edit', {
				data: {
					memoryId: memoryId,
					memoryTitle: memoryTitle,
					memoryContent: memoryContent,
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					console.log(data.msg);
					if (data.status == 200) {
						//console.log(JSON.stringify(data));
						title.value = JSON.stringify(data.data.memoryTitle);
						//console.log(JSON.stringify(data.data.memoryTitle));
						content.value = JSON.stringify(data.data.memoryContent);
						//title.setAttribute('disabled','disabled');
						//content.setAttribute('disabled','disabled');
						var memoryJson = app.getMemory();
						//console.log(JSON.stringify(data.data));
						memoryJson.splice(index, 1, data.data);
						//console.log(JSON.stringify(memoryJson));
						plus.storage.setItem("memory", JSON.stringify(memoryJson));
						var chatWebview = plus.webview.getWebviewById("ll_crossingMemory.html");
						chatWebview.evalJS("requestMemory()");
						chatWebview.evalJS("renderMemoryPage()");
						mui.toast('修改完毕(˶‾᷄ ⁻̫ ‾᷅˵) 为您保存好了呢');
						mui.back();
					}
				},
				error: function(xhr, type, errorThrown) {
					mui.toast('遇到错误啦(−_−＃) 保存失败555');
				}
			});
		}
	})
});
