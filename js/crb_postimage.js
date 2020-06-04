mui.init();

var $image = $('#image');
mui.plusReady(function() {

	var user = app.getUserGlobalInfo();
	var faceImage = user.faceImageBig;
	// 获取屏幕宽度，设置图片
	$image.attr('src', app.imgServerUrl + faceImage);
	// 从相册中选择图片
	console.log("从相册中选择图片:");
	plus.gallery.pick(function(path) {
		$image.attr('src', path);
		faceCutter();
	}, function(e) {
		mui.openWindow("index1.html", "index1.html");
	}, {
		filter: "image"
	});
});


document.getElementById("upload").addEventListener('tap', function() {

	plus.nativeUI.showWaiting("上传中...");

	var cropper = $image.data('cropper');
	var result = $image.cropper("getCroppedCanvas");
	if (result) {
		var base64Url = result.toDataURL();
		console.log("base64:"+base64Url);
		mui.ajax(app.serverUrl + "/upload/getToken", {
			data: {},
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			//headers:{'Content-Type':'application/json'},	              
			success: function(data) {
				// 关闭等待框
				//plus.nativeUI.closeWaiting();
				if (data.status == 200) {
					var myToken = data.data.token;
					//console.log(myToken);
					putb64(base64Url,myToken);
					// 关闭等待框
					plus.nativeUI.closeWaiting();
					mui.back();
				} else {
					app.showToast(data.msg, "error");
				}
			}
		});
	}
});

function faceCutter() {
	plus.nativeUI.showWaiting("请稍等...");
	var options = {
		aspectRatio: 1 / 1,
		crop: function(e) {}
	};

	// Cropper
	$image.cropper(options);

	plus.nativeUI.closeWaiting();
}
function putb64(picBase,myUptoken) {
		/*picUrl用来存储返回来的url*/
		var picUrl;
		/*把头部的data:image/png;base64,去掉。（注意：base64后面的逗号也去掉）*/
		picBase = picBase.substring(22);
		/*通过base64编码字符流计算文件流大小函数*/
		function fileSize(str) {
			var fileSize;
			if (str.indexOf('=') > 0) {
				var indexOf = str.indexOf('=');
				str = str.substring(0, indexOf); //把末尾的’=‘号去掉
			}
			fileSize = parseInt(str.length - (str.length / 8) * 2);
			return fileSize;
		}
		/*把字符串转换成json*/
		function strToJson(str) {
			var json = eval('(' + str + ')');
			return json;
		}
		var url = "http://up.qiniu.com/putb64/" + fileSize(picBase);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var keyText = xhr.responseText;
				/*返回的key是字符串，需要装换成json*/
				keyText = strToJson(keyText);
				/* 前面是七牛云空间网址，keyText.key 是返回的图片文件名*/
				picUrl = "http://qazbuv5y2.bkt.clouddn.com/" + keyText.key;
				//console.log(picUrl);
				var personalWebview=plus.webview.getWebviewById("crb_post.html");
				personalWebview.evalJS("showImage('"+picUrl+"')");
			}
		}
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/octet-stream");
		xhr.setRequestHeader("Authorization", "UpToken "+myUptoken);
		xhr.send(picBase);
	}
