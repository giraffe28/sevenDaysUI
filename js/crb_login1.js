mui.init();
mui.plusReady(function(){
	var userInfo=app.getUserGlobalInfo();
	if(userInfo!=null){
		mui.openWindow({//跳转到默认首页（后续需更改
		    url:'index.html',
		    id:'index.html'
		})
	}
    var reg=document.getElementById("reg");
	var forget=document.getElementById("forget");
    var login=document.getElementById("login");
	var login2=document.getElementById("login2");
    reg.addEventListener('tap',function(){
        mui.openWindow({
            url:'../html/crb_register.html',
            id:'crb_register.html'
        })
    });
	forget.addEventListener('tap',function(){
	    mui.openWindow({
	        url:'../html/crb_forget.html',
	        id:'crb_forget.html'
	    })
	});
	login2.addEventListener('tap',function(){
	    mui.openWindow({
	        url:'../html/crb_login2.html',
	        id:'crb_login2.html'
	    })
	});
    login.addEventListener('tap',function(){
		var telephone = document.getElementById('telephone').value;
        var password=document.getElementById("password").value;
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
        if(password.length==0){
            plus.ui.toast("密码不能为空");
            return;
        }

		console.log(app.serverUrl+"/user/login");
        mui.ajax(app.serverUrl+"/user/login",{//后端url
            data:{
                telephone:telephone,
                password:password,
            },
            dataType:'json',
            type:'POST',
            timeout:10000,
			headers: {"Content-Type":"application/json;charset=utf-8"},
            success:function(data){
			//服务器返回响应，根据响应结果，分析是否登录成功；
				console.log(JSON.stringify(data));
				console.log(telephone);
            	if (data.status == 200) {
					console.log(JSON.stringify(data));
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
        });
    })
})