mui.init();
mui.plusReady(function(){
	var userInfo=app.getUserGlobalInfo();
	
    var get=document.getElementById("get");
	var throwout=document.getElementById("throwout");
    var mine=document.getElementById("mine");
	
    get.addEventListener('tap',function(){//从数据库随机获取漂流瓶
        mui.ajax(app.serverUrl+"/user/login",{//后端url,需更改
            data:{
                telephone:telephone,
                password:password,
            },
            dataType:'json',
            type:'POST',
            timeout:10000,
        	headers: {"Content-Type":"application/json;charset=utf-8"},
            success:function(data){
        		console.log(JSON.stringify(data));
        		console.log(telephone);
            	if (data.status == 200) {
        			console.log(JSON.stringify(data));
            		// 登录成功之后，保存全局用户对象到本地缓存
            		var userInfoJson = data.data;
            		app.setUserGlobalInfo(userInfoJson);
            		// 页面跳转到默认首页（后续需更改
            		plus.webview.open("../html/index.html", "index.html");
            		plus.webview.currentWebview().close();
            		console.log("登录结束");
            	}
        		else{
            		app.showToast(data.msg, "error");
            	}
            }
        });
    });
	
	throwout.addEventListener('tap',function(){
		
	});
	
	mine.addEventListener('tap',function(){
		
	});
})