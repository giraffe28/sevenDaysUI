mui.init();
mui.plusReady(function () {
	var user = app.getUserGlobalInfo();
	var Webview=plus.webview.currentWebview();
	bottleid=Webview.bottleid;
	//icon=Webview.icon;
	//nickname=Webview.nickname;
	//content=Webview.content;
	//date=Webview.date;
	//postlike=Webview.postlike;
    mui.ajax(app.serverUrl+"/drift/view",{
    	data:{
    		driftId:bottleid
    	},
    	dataType:'json',
    	type:'POST',
    	timeout:10000,
    	contentType:'application/json;charset=utf-8',
    	success:function(data){
			//console.log(JSON.stringify(data));
			if (data.status == 200) {
				var list=document.getElementById("commentlist");
				var Html="";
				//index=posts.items.length;
				for(var i=0;i<data.data.comments.length;i++){
					//console.log(JSON.stringify(data.data.comments.length));
					//console.log(JSON.stringify(data.data.comments[i].comment));
					Html+='<div class="mui-card comment" id="commentItem">'+
							data.data.comments[i].comment+
						'</div>';
				}
				list.innerHTML=Html;
			}else{
				app.showToast(data.msg, "error");
			}
    	}
    });
	/*mui.ajax(app.serverUrl+"/drift/getAllComment",{
		data:{
			bottleId:bottleid,
		},
		dataType:'json',
		type:'GET',
		timeout:10000,
		contentType:'application/json;charset=utf-8',
		success:function(data){
			
		}
	});*/
})