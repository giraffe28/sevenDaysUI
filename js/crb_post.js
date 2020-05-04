mui.init();
mui.plusReady(function () {
	var post=document.getElementById("post");
	post.addEventListener('tap',function(){
	   var content=document.getElementById("post_content").value;
	   if(content.length>200){
		   mui.toast("正文不得超过100个字");
		   return false; 
	   }
	});
}