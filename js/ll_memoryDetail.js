mui.init();
mui.plusReady(function() {
	var title=document.getElementById("title");
	var content=document.getElementById("content");
	//十字记忆详情页面
	var memoryDetailWebview=plus.webview.currentWebview();
	//获取上一个页面传入的十字记忆id
	var memoryId=memoryDetailWebview.memoryId;
	//向后端发送请求，返回该十字记忆的详细信息
	mui.ajax(app.serverUrl+'...',{
	    data:{
	        memoryId:memoryId,
	    },
	    dataType:'json',
	    type:'POST',
	    timeout:10000,
		contentType:'application/json;charset=utf-8',
	    success:function(data){
		//服务器返回响应，根据响应结果，分析是否成功；
	    console.log(JSON.stringify(data));
	    	if (data.status == 200) {
				//将十字记忆的详情显示在页面上
				var memory=JSON.stringify(data.data);
				title.innerHTML=memory.memoryTitle;
				content.innerHTML=memory.memoryContent;
	    	}
			else{
	    		app.showToast(data.msg, "error");
	    	}
	    }
	})
	
	document.getElementById("edit").addEventListener('tap',function(){
		mui.toast('edit');
		title.disabled=false;
		content.disabled=false;
	})
	
	//用户点击‘保存’按钮
	document.getElementById('save').addEventListener('tap',function(){
		//发送请求，更新十字记忆
		mui.ajax(app.serverUrl+'...',{
		    data:{
		        memoryId:memoryId,
				memoryTitle:title.value,
				memoryContent:content.value,
		    },
		    dataType:'json',
		    type:'POST',
		    timeout:10000,
			contentType:'application/json;charset=utf-8',
		    success:function(data){
			//服务器返回响应，根据响应结果，分析是否成功；
		    console.log(JSON.stringify(data));
		    	if (data.status == 200) {
					title.setAttribute('disabled','disabled');
					content.setAttribute('disabled','disabled');
					mui.toast('保存成功！');
		    	}
				else{
		    		app.showToast(data.msg, "error");
		    	}
		    }
		})
	})
	
});
