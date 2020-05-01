mui.init();
mui.plusReady(function() {
	var meWebview = plus.webview.currentWebview();
	meWebview.addEventListener("show", function() {
		refreshBasicInfo();
	});
	window.addEventListener('refreshBlackList',function(event){
		//获得事件参数
		var userId = event.detail.userId;
		var addedId = event.detail.addedId;
		mui.ajax('/blacklist/delete', {
			data: {
				userId: userId,
				addedId:addedId,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否修改成功；
				if (data.status == 200) {
					//删除前端黑名单的的缓存
					plus.storage.removeItem("blackList");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
			}
		});
	});
	function refreshBasicInfo() {
		var user = app.getUserGlobalInfo();
		//用户信息不在缓存，则发送请求给后端请求数据
		if (user == null) {
			//后端服务器的url
			mui.ajax('http://server-name/login.php', {
				data: {
					userId:user.userId,
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否成功获取用户信息；
					if (data.status == 200) {
						//保存全局用户对象到本地缓存
						var userInfoJson = data.data;
						app.setUserGlobalInfo(userInfoJson);
						mui.openWindow("ll_personalCenter.html", "ll_personalCenter.html");
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
		};
		//用户基本信息已经在缓存中
		//var myImage=user.icon;//头像
		var nickname = user.nickname; //假名
		var gender = user.gender; //性别
		var profile = user.profile; //简介
		var telephone = user.telephone; //手机号，暂时不允许更改
		//document.getElementById("myImage").src=myImage;
		document.getElementById("nickname").innerHTML = nickname;
		document.getElementById("gender").innerHTML = gender;
		document.getElementById("profile").innerHTML = profile;
		document.getElementById("telephone").innerHTML = telephone;
	};

	/* 点击头像 */
	document.getElementById("myImage").addEventListener('tap',function(){
		mui.openWindow('ll_updateImage.html','ll_updateImage.html');
	});

	/* 点击“退出登录”按钮 */
	document.getElementById("confirmBtn").addEventListener('tap', function() {
		var btnArray = ['是', '否'];
		mui.confirm('退出登录？', '', btnArray, function(e) {
			if (e.index == 1) {
				info.innerText = '退出';
				//清空缓存
				app.setBasicInfo("");
			} else {
				info.innerText = '不退出'
			}
		})
	});

	/*点击“黑名单”项*/
	document.getElementById("blackList").addEventListener('tap', function() {
		mui.openWindow('ll_blackList.html', 'll_blackList.html');
	});

	/*点击“十字记忆”项 */
	document.getElementById("crossingMemory").addEventListener('tap', function() {
		mui.openWindow('ll_crossingMemory.html', 'll_crossingMemory.html');
	});
	/* 点击“添加标签” */
	document.getElementById("addTag").addEventListener('tap', function() {
		mui.openWindow('ll_addTags.html', 'll_addTags.html');
	});
	
	
});
