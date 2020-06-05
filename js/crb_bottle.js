mui.init();
mui.plusReady(function () {
	var user = app.getUserGlobalInfo();
	var Webview=plus.webview.currentWebview();
	bottleid=Webview.bottleid;
	
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
					Html+='<li class="mui-table-view-cell comment" id="commentItem">'+
							'<div class="mui-slider-handle">'+
								//'<span class="mui-badge mui-badge-primary mui-badge-inverted">'+parseInt(i+1)+'</span> '+
								data.data.comments[i].comment+
							'</div>'+
						'</li>';
				}
				list.innerHTML=Html;
			}else{
				app.showToast(data.msg, "error");
			}
    	}
    });
})