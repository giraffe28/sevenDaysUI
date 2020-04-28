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
	var byzm;
	document.getElementById('capbt').addEventListener('tap',function(){
		var zhuceBox = document.getElementById('telephone').value;
		if(zhuceBox==''){
			mui.toast('手机号不能为空');
			return false; 
		}
		else if(!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(zhuceBox))){
	    	mui.toast("手机号不正确");
	    	return false; 
		}
		else if(zhuceBox.length!=11){
			mui.toast("手机号不正确");
    		return false; 
		}
		else{
			settime(this);
			byzm=GetCode(zhuceBox);
		}
	});
	
	//第三部分 点击注册按钮事件
	document.getElementById('reg').addEventListener('tap',function(){
		var zhuceBox = document.getElementById('telephone').value;
		var yhinfoBox = document.getElementById('username').value;
		var yzinfoBox = document.getElementById('captcha').value;
		var dlinfoBox1 = document.getElementById('password1').value;
		var dlinfoBox2 = document.getElementById('password2').value;
		if(zhuceBox==''){
			mui.toast('手机号不能为空');
			return false; 
		}
		else if(zhuceBox.length!=11){
			mui.toast('手机号不正确');
			return false; 
		}
		else if(!(/^[a-zA-Z][a-zA-Z0-9_]{0,}$/.test(yhinfoBox))&&yhinfoBox.length>10){
			mui.toast('用户名格式错误');
			return false;
		}
		else if(yzinfoBox==''){
			mui.toast('请填写验证码');
			return false; 
		}
		else if(dlinfoBox1==''||dlinfoBox1.length<6){
			mui.toast('密码不能为空并且不能少于6个字符');
			return false;
		}
		else if(dlinfoBox1!=dlinfoBox2){
			mui.toast('两次输入密码不一致');
			return false;
		}
		else{
			if(yzinfoBox==byzm){
				console.log("注册成功");
				dduse(zhuceBox,dlinfoBox);
				mui.toast('注册成功！！')
				setTimeout(function() { 
	    			mui.back();
	    		}
	    		,1000)
			}
			else{
				mui.toast('验证码输入不对')
			}
		};
	});
	
	/*第四部分；此处为注册接口调用；
	function adduse(zh,mm){
	    mui.ajax({
			type:'post',
			contentType: "application/json",
			url:http...//此处填写自己的服务器url地址；
			dataType: "json",
			data: {//data携带的参数，根据自己的服务器参数写就ok；
				sortname:zh,
				username:zh,
				pwd:mm,
				model:1
			},
			success: function(data) {
				console.log(JSON.stringify(data.d));
			}
		);
	}
				
	第五部分：此处为点击获取验证码，服务器返回数据给客户端，接收验证码的接口：
	function GetCode(tels){
		var yzm;
		mui.ajax({
			type:'post',
			contentType: "application/json",
			url:http.......//此处填服务器url，
			dataType: "json",
			async: false,
			data: {
				username:tels,
				msg:'',
			},
			success: function(data) {//成功的data函数
				var json = eval('('+ data.d + ")");
				yzm=json.code;
				console.log("返回的验证："+yzm);
			}
		});
		return yzm;
	 }*/
})