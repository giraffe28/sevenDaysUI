mui.init();
mui.plusReady(function(){
	//var userInfo=app.getUserGlobalInfo();
	
	var get=document.getElementById("get");
	var throwout=document.getElementById("throwout");
    var mine=document.getElementById("mine");
	
	get.addEventListener('tap',function(){
		mui.openWindow({
			url:'../html/crb_getbottle.html',
			id:'crb_getbottle.html'
		})
    });
	
	throwout.addEventListener('tap',function(){
		
	});
	
	mine.addEventListener('tap',function(){
		
	});
})