mui.init();
mui.plusReady(function () {
	var memoryTitle;
	var memoryContent;
	document.getElementById("back").addEventListener('tap',function(){
		mui.openWindow('ll_crossingMemory.html','ll_crossingMemory.html');
	});
    document.getElementById("save").addEventListener('tap',function(){
		memoryTitle=document.getElementById("title").value;
		memoryContent=document.getElementById("content").value;
		console.log("22222");
		if(memoryTitle.trim()==""||memoryContent.trim()==""){
			mui.toast('内容不能为空哦');
		}
		else if(memoryTitle.length>20){
			mui.toast('标题长度不能超过12个字哦');
		}
		else if(memoryContent.length>100){
			mui.toast('内容不能超过100个字哦');
		}
		else{
			mui.ajax(app.serverUrl+'/memory/create',{
				data:{
					userId:app.getUserGlobalInfo().userId,
					memoryTitle:memoryTitle,
					content:memoryContent,
				},
				dataType:'json',//服务器返回json格式数据
				type:'post',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				headers:{'Content-Type':'application/json'},
				success:function(data){
					if(data.status==200){
						var memoryJson=app.getMemory();
						//console.log(JSON.stringify(data.data));
						memoryJson.push(data.data);
						//console.log(JSON.stringify(memoryJson));
						plus.storage.setItem("memory",JSON.stringify(memoryJson));
						var chatWebview = plus.webview.getWebviewById("ll_crossingMemory.html");
						chatWebview.evalJS("requestMemory()");
						chatWebview.evalJS("renderMemoryPage()");
						mui.toast('保存成功！');
						mui.back();
					}
				},
				error:function(xhr,type,errorThrown){
					mui.toast('遇到错误啦(−_−＃) 保存失败555');
				}
			});
		}
	})
});
