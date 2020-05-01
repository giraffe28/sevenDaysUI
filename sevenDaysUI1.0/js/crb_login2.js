mui.init();
mui.plusReady(function(){
	var userInfo=app.getUserGlobalInfo();
	if(userInfo!=null){
		mui.openWindow({
		    url:'list.html',//跳转到软件默认首页
		    id:'list'
		})
	}
    var reg=document.getElementById("reg");
    var login1=document.getElementById("login1");
	var forget=document.getElementById("forget");
	var cpatcha=document.getElementById("captcha");
	reg.addEventListener('tap',function(){
	    mui.openWindow({
	        url:'../html/crb_register.html',
	        id:'register.html'
	    })
	});
    login1.addEventListener('tap',function(){
        mui.openWindow({
            url:'../html/crb_login1.html',
            id:'login1.html'
        })
    });
	forget.addEventListener('tap',function(){
	    mui.openWindow({
	        url:'../html/crb_forget.html',
	        id:'forget.html'
	    })
	});
	
	//检验手机号
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
			textcap=GetCode(telephone);
		}
	});
	//点击登录按钮事件
	login.addEventListener('tap',function(){
		var telephone = document.getElementById('telephone').value;
	    var password=document.getElementById("password");
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
	    else if(captcha==''){
	    	mui.toast('请填写验证码');
	    	return false; 
	    }
		else{
				if(captcha==textcap){
					console.log("登录成功");
					dduse(telephone,password1);
					mui.toast('登录成功！！')
					setTimeout(function() { 
		    			mui.back();
		    		}
		    		,1000)
				}
				else{
					mui.toast('验证码输入不对')
				}
			};
	    mui.ajax('……',{//后端url
	        data:{
	            telephone:telephone.value,
	            //password:password.value
	        },
	        dataType:'json',
	        type:'POST',
	        timeout:10000,
			contentType:'application/json;charset=utf-8',
	        success:function(data){
			//服务器返回响应，根据响应结果，分析是否登录成功；
	        //console.log(JSON.stringify(data));
	        	telephone.blur();
	        	//password.blur();
	        	if (data.status == 200) {
	        		// 登录成功之后，保存全局用户对象到本地缓存
	        		var userInfoJson = data.data;
	        		app.setUserGlobalInfo(userInfoJson);
	        		// 页面跳转到默认首页（后续需更改
	        		mui.openWindow("index.html", "index.html");
	        	}
				else{
	        		app.showToast(data.msg, "error");
	        	}
	        }
	    })
	})
	//此处为点击获取验证码，服务器返回数据给客户端，接收验证码的接口：
	function GetCode(telephone){
		var capt;
		mui.ajax({
			type:'post',
			contentType: "application/json;charset=utf-8",
			url:http.......//此处填服务器url，
			dataType: "json",
			async: false,
			data: {
				telephone:telephone,
				msg:'',
			},
			success: function(data) {//成功的data函数
				var json = eval('('+ data.d + ")");
				capt=json.code;
				console.log("返回的验证："+capt);
			}
		});
		return capt;
	}
})