mui.init();
mui.plusReady(function(){
	String thisWeekTagStr="";
	var selectedTags=document.getElementsByTagName("input");
	for(int i=0;i<selectedTags.length;i++){
		if(selectedTags[i].type=="checkbox"&&selectedTags[i].checked)
			thisWeekTagStr+=selectedTags[i].value+' ';
	}
	document.getElementById("save").addEventListener('tap',function(){
		mui.ajax(app.serverUrl+"/user/setThisWeekTag",{
			data:{
				thisWeekTag:thisWeekTagStr;
			},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				console.log(JSON.stringify(data));
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	})
});