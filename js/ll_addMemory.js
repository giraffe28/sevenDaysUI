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
		if(memoryTitle.trim()==""||memoryContent.trim()==""){
			mui.toast('内容不能为空哦');
		}
		else{
			console.log(memoryTitle);
			console.log(memoryContent);
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
						mui.toast('保存成功！');
						mui.openWindow("ll_crossingMemory.html", "ll_crossingMemory.html");
					}
				},
				error:function(xhr,type,errorThrown){
					mui.toast('遇到错误啦(−_−＃) 保存失败555');
				}
			});
		}
	})
});
