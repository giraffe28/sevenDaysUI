mui.init();
mui.plusReady(function () {
	var post=document.getElementById("post");
	post.addEventListener('tap',function(){
		var content=document.getElementById('post_content').value;
		if(content==''){
			mui.toast('内容不能为空');
			return false; 
		}
		else if(content.length>100){
		   mui.toast('正文不得超过100个字');
		   return false; 
	   }
	   else{
	   var user = app.getUserGlobalInfo();
	   var myDate = new Date();
	   mui.ajax(app.serverUrl+"/corner/talk", {
	   	data: {
			user:{
				userId:user.userId
			},
	   		postContent:content
	   	},
	   	dataType: 'json', //服务器返回json格式数据
	   	type: 'post', //HTTP请求类型
	   	timeout: 10000, //超时时间设置为10秒；
	   	headers: {
	   		'Content-Type': 'application/json;charset:utf-8'
	   	},
	   	success: function(data) {
	   		//服务器返回响应，根据响应结果，分析是否成功发送动态；
	   		if (data.status == 200) {
	   			//显示成功信息
	   			//mui.toast("发送动态成功");
				console.log(data.data);
				var chatWebview = plus.webview.getWebviewById("crb_square.html");
				chatWebview.evalJS("pulldownRefresh()");
				mui.back();
	   		}
	   		else{
	   			app.showToast(data.msg, "error");
	   		}
	   	},
	   	error: function(xhr, type, errorThrown) {
	   		//异常处理；
	   		console.log(type);
	   	}
	   });
	   }
	});	
	
	
	
	//上传图片
	var fileArr = [];
	document.getElementById('headImage').addEventListener('tap', function() {
		if(mui.os.plus) {
			var buttonTit = [{
				title: "拍照"
			}, {
				title: "从手机相册选择"
			}];
	
			plus.nativeUI.actionSheet({
				title: "上传图片",
				cancel: "取消",
				buttons: buttonTit
			}, function(b) { /*actionSheet 按钮点击事件*/
				switch(b.index) {
					case 0:
						break;
					case 1:
						getImage(); /*拍照*/
						break;
					case 2:
						galleryImg(); /*打开相册*/
						break;
					default:
						break;
				}
			})
		}
	}, false);
	
	// 拍照获取图片  
	function getImage() {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var imgSrc = entry.toLocalURL() + "?version=" + new Date().getTime(); //拿到图片路径  
				setFile(imgSrc);
				setHtml(imgSrc);
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s.message);
		}, {
			filename: "_doc/camera/"
		})
	}
	// 从相册中选择图片   
	function galleryImg() {
		// 从相册中选择图片  
		plus.gallery.pick(function(e) {
			for(var i in e.files) {
				var fileSrc = e.files[i];
				setFile(fileSrc);
				setHtml(fileSrc);
			}
		}, function(e) {
			console.log("取消选择图片");
		}, {
			filter: "image",
			multiple: true,
			//maximum: 9,
			system: false,
			onmaxed: function() {
				plus.nativeUI.alert('最多只能选择9张图片');
			}
		});
	}
	
	
	function setHtml(path) {
		var str = '';
		var img=document.getElementById("imgs");
		str = '<li class="mui-table-view-cell mui-media mui-col-xs-6">'+
				'<img class="mui-media-object" src="'+path+'">'+
				'<span class="mui-icon mui-icon-trash deleteBtn"></span>'+
	//					'<div class="mui-media-body">'+
	//						'<input type="text" class="remark" placeholder="备注">'+
	//					'</div>'+
			'</li>';
		img.innerHTML+=str;
	}
			
	function setFile(fileSrc){
		var image = new Image();  
		image.src = fileSrc;
		fileArr.push(image);
	}
					
	document.getElementById('uploadImage').addEventListener('tap',function(){
		var files = fileArr;
	 	var wt=plus.nativeUI.showWaiting();
		var task=plus.uploader.createUpload('http://192.168.1.111:8181/sys-privilege/Upload',
			{method:"POST"},
	        function(t,status){ //上传完成
	            if(status==200){
	                alert("上传成功："+t.responseText);
	                wt.close(); //关闭等待提示按钮
	            }else{
	                alert("上传失败："+status);
	                wt.close();//关闭等待提示按钮
	            }
	        }
	    );  
	    //将文件集合添加到上传队列中
		for(var i=0;i<files.length;i++){
	        var f=files[i];
	        task.addFile(f.src,{key:i});
	    }
	    //传其他的参数 如备注
	    //添加其他参数
	    //遍历5个input框			    
	    //task.addData("comment","test");
	    //task.start();
	});
})