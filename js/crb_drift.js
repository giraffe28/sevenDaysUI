mui.init();
mui.plusReady(function(){
	
	var get=document.getElementById("get");
	var throwout=document.getElementById("throwout");
    //var mine=document.getElementById("mine");
	
	get.addEventListener('tap',function(){
		mui.openWindow({
			url:'../html/crb_getbottle.html',
			id:'crb_getbottle.html'
		})
    });
	
	throwout.addEventListener('tap',function(){
		mui.openWindow({
			url:'../html/crb_throwbottle.html',
			id:'crb_throwbottle.html'
		})
	});
	/*
	mine.addEventListener('tap',function(){
		mui.openWindow({
			url:'../html/crb_mybottle.html',
			id:'crb_mybottle.html'
		})
	});*/
	
})