mui.init();
mui.plusReady(function() {
	var meWebview = plus.webview.currentWebview();
	meWebview.addEventListener("show", function() {
		refreshBasicInfo();
	});

	function refreshBasicInfo() {
		var user = app.getUserGlobalInfo();
		//用户基本信息已经在缓存中
		//var myImage=user.icon;//头像
		var nickname = user.nickname; //假名
		var gender = user.gender; //性别
		var profile = user.profile; //简介
		var telephone = user.telephone; //手机号，暂时不允许更改
		//document.getElementById("myImage").src=myImage;
		document.getElementById("nickname").innerHTML = nickname;
		var maleOption = document.getElementById("male");
		var femaleOption = document.getElementById("female");
		var secretOption = document.getElementById("secret");
		if (gender.isequals("男"))
			maleOption.selected = "selected";
		if (gender.isequals("女"))
			femaleOption.selected = "selected";
		if (gender.isequals("保密"))
			secretOption.selected = "selected";
		document.getElementById("profile").innerHTML = profile;
		document.getElementById("telephone").innerHTML = telephone;
	};

	document.getElementById("save").addEventListener('tap', function() {
		var user = app.getUserGlobalInfo();
		var myselect=document.getElementById("gender");
		var index=myselect.selectedIndex ;
		/*var wtf = {};
				wtf["nickname"] = document.getElementById("nickname").value;
				//console.log(nickname);
				wtf["gender"] = document.getElementById("gender").value;
				//console.log(gender);
				wtf["telephone"] = document.getElementById("telephone").value;
				//console.log(telephone);
				wtf["profile"] = document.getElementById("profile").value;
				//console.log(profile);
				var goodJson = JSON.stringify(wtf);
				alert("封装为json:"+goodJson);*/
		//向服务器发送请求保存用户信息
		//console.log(app.serverUrl+"/user/modifyInformation");
		mui.ajax(app.serverUrl+"/user/modifyInformation", {
			data: {
				userId: user.userId,
				nickname: document.getElementById("nickname").value,
				gender: myselect.options[index].value,
				profile: document.getElementById("profile").value,
				telephone: document.getElementById("telephone").value,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(data) {
				console.log(data.data);
				//console.log(app.serverUrl+"/user/modifyInformation");
				//服务器返回响应，根据响应结果，分析是否修改成功；
				if (data.status == 200) {
					//刷新用户信息
					var userInfoJson = data.data;
					app.setUserGlobalInfo(userInfoJson);
					// 跳转到个人中心页
					mui.openWindow("ll_personalCenter.html", "ll_personalCenter.html");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
			}
		});
		alert("保存成功");
		window.open('ll_personalCenter.html');
	})
});
