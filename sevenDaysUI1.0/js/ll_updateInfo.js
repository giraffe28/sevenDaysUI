mui.init();
mui.plusReady(function() {
	var meWebview = plus.webview.currentWebview();
	
	meWebview.addEventListener("show", function() {
		refreshBasicInfo();
	});

	function refreshBasicInfo() {
		var genderList=app.getGenderInfo();
		var user = app.getBasicInfo();
		//用户信息不在缓存，则发送请求给后端请求数据
		if (user == null) {
			//后端服务器的url
			mui.ajax('http://server-name/login.php', {
				data: {
					username: '',
					password: ''
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.result != null) {
						app.setBasicInfo(data);
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			});
		};
		//性别信息不在缓存，则发送请求给后端请求数据
		if (genderList == null) {
			//后端服务器的url
			mui.ajax('http://server-name/login.php', {
				data: {
					username: '',
					password: ''
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers: {
					'Content-Type': 'application/json'
				},
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.result != null) {
						app.setBasicInfo(data);
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
	
	document.getElementById("save").addEventListener('tap', function() {
		//向服务器发送请求保存用户信息
		mui.ajax('http://server-name/login.php', {
			data: {
				nickname:document.getElementById("nickname").value,
				gender: document.getElementById("gender").value,
				profile:document.getElementById("profile").value,
				telephone:document.getElementById("telephone").value,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.result != null) {
					app.setBasicInfo(data);
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

//确认框用于流程确认，最终版本时删除
mui.back = function(){
  	var btn = ["确定","取消"];
	mui.confirm('确认关闭当前窗口？','Hello MUI',btn,function(e){
	if(e.index==0){
 		mui.currentWebview.close();
		plus.webview.open("../html/ll_personalCenter.html","ll_personalCenter.html","fade-in",200);
	}
	});
}
