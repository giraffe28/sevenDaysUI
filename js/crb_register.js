mui.init();
mui.plusReady(function(){
	//第一部分 倒计时
	var countdown=60; 
	function settime(obj) { 
	    if (countdown == 0) { 
	        obj.removeAttribute("disabled");    
	        obj.value="获取验证码"; 
	        countdown = 60; 
	        return;
	    } 
		else {
	        obj.setAttribute("disabled", true); 
	        obj.value="重新发送(" + countdown + ")"; 
	        countdown--; 
	    } 
		setTimeout(function() { 
	    	settime(obj)
	    }
	    ,1000) 
	}
	
	//第二部分 检验手机号
	var textcap;//收到的验证码
	document.getElementById('capbt').addEventListener('tap',function(){
		var telephone = document.getElementById('telephone').value;
		if(telephone==''){
			mui.toast('手机号不能为空');
			return false; 
		}
		else if(!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(telephone))){
	    	mui.toast("手机号不正确");
	    	return false; 
		}
		else if(telephone.length!=11){
			mui.toast("手机号不正确");
		return false; 
		}
		else{
			settime(this);
			//textcap=GetCode(telephone);
		}
	});
	
	//第三部分 点击注册按钮事件
	document.getElementById('reg').addEventListener('tap',function(){
		var telephone = document.getElementById('telephone').value;
		var username= document.getElementById('username').value;
		var captcha = document.getElementById('captcha').value;
		var password1 = document.getElementById('password1').value;
		var password2 = document.getElementById('password2').value;
		if(telephone==''){
			mui.toast('手机号不能为空');
			return false; 
		}
		else if(telephone.length!=11){
			mui.toast('手机号不正确');
			return false; 
		}
		else if(!(/^[a-zA-Z][a-zA-Z0-9_]{0,}$/.test(username))&&username.length>10){
			mui.toast('用户名格式错误');
			return false;
		}
		else if(captcha==''){
			mui.toast('请填写验证码');
			return false; 
		}
		else if(password1==''||password1.length<6){
			mui.toast('密码不能为空并且不能少于6个字符');
			return false;
		}
		else if(password1!=password2){
			mui.toast('两次输入密码不一致');
			return false;
		}
		else{
			if(true){//captcha==textcap){
				console.log("注册成功");
				adduse(username,telephone,password1);
				/*mui.toast('注册成功！！')
				setTimeout(function() { 
	    			mui.back();
	    		}
	    		,1000)*/ //注册成功做的方法，在上面adduse返回的数据做判断就可以了，不用再写
			}
			else{
				mui.toast('验证码输入不对')
			}
		};
	});
	
	//第四部分；此处为注册接口调用；
	function adduse(username,telephone,password){
	    mui.ajax('http://192.168.18.1:8080/spring/Register',{
			type:'post',
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: {//data携带的参数，根据自己的服务器参数写
				telephone:telephone,
				password:password,
				nickname:username
			},
			success:function(data){
			//服务器返回响应，根据响应结果，分析是否注册成功；
			console.log(JSON.stringify(data));
				telephone.blur();
				password.blur();
				username.blur();
				if (data.status == 200) {
					// 注册成功之后，保存全局用户对象到本地缓存
					var userInfoJson = data.data;
					app.setUserGlobalInfo(userInfoJson);
					// 页面跳转到默认首页（后续需更改
					mui.openWindow("index.html", "index.html");
				}
				else{
					app.showToast(data.msg, "error");
				}
			}
		});
	}
				
	//第五部分：此处为点击获取验证码，服务器返回数据给客户端，接收验证码的接口：
	function GetCode(telephone){
		var capt;
		mui.ajax('http://192.168.18.1:8080/spring/GetCode',{
			type:'post',
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			async: false,
			data: {
				telephone:telephone
			},
			success: function(data) {//成功的data函数
				console.log(JSON.stringify(data));
				/*var json = eval('('+ data.d + ")");
				capt=json.code;
				console.log("返回的验证："+capt);*/
			}
		});
		return capt;
	}
})