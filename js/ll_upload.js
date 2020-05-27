mui.init();
mui.plusReady(function() {
	/*picBase是base64图片带头部的完整编码*/
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

				/* http://ojvh6i96g.bkt.clouddn.com/是我的七牛云空间网址，keyText.key 是返回的图片文件名*/
				picUrl = "http://qazbuv5y2.bkt.clouddn.com/" + keyText.key;
				alert(picUrl);

			}
		}
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/octet-stream");
		xhr.setRequestHeader("Authorization", "UpToken "+myUptoken);
		xhr.send(picBase);
	}
})
