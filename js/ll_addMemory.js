mui.init();
mui.plusReady(function () {
	var memoryTitle=document.getElementById("title").value;
	var memoryContent=document.getElementById("content").value;
    document.getElementById("save").addEventListener('tap',function(){
		mui.ajax(app.serverUrl+"...",{
			data:{
				userId:app.getUserGlobalInfo().userId,
				memoryTitle:memoryTitle,
				memoryContent:memoryContent,
			},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				console.log(JSON.stringify(data));
				if(data.status==200){
					mui.toast('保存成功！');
					app.setMemory("memory");
					mui.openWindow("ll_crossingMemory.html", "ll_crossingMemory.html");
				}
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	})
})
