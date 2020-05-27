mui.init();

mui.plusReady(function() {
	var myImage = document.getElementById("myImage");
	if(app.getUserGlobalInfo().icon!="")
		myImage.src=app.getUserGlobalInfo().icon;
	var imgWidth = document.body.clientWidth;
	myImage.width = imgWidth;
	myImage.height = imgWidth;

	var openMenu = document.getElementById("openMenu");
	openMenu.addEventListener("tap", function() {
		mui("#sheet-myImage").popover("toggle");
	});
	
	var back = document.getElementById("back");
	back.addEventListener("tap", function() {
		mui.openWindow('ll_personalCenter.html','ll_personalCenter.html');
	});
	
	//选择照片
	var choose = document.getElementById("choose");
	choose.addEventListener("tap", function() {
		//alert("选择照片");
		mui.openWindow("../html/ll_imageUpload.html", "ll_imageUpload.html");
		mui("#sheet-myImage").popover("toggle");
	});
	//保存照片
	/*var save = document.getElementById("save");
	save.addEventListener("tap", function() {
		alert("保存照片");
	});*/
});

function refreshImage(){
	if(app.getUserGlobalInfo().icon!="")
		myImage.src=app.getUserGlobalInfo().icon;
	mui.back();//刷新必须
}