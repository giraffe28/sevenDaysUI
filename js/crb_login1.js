mui.init();
mui.plusReady(function(){
	var userInfo=app.getUserGlobalInfo();
	if(userInfo!=null){
		mui.openWindow({
		    url:'list.html',
		    id:'list'
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
        var username=document.getElementById("username");
        var password=document.getElementById("password");
        if(username.value.length==0){
            plus.ui.toast("用户名不能为空");
            return;
        }
        if(password.value.length==0){
            plus.ui.toast("密码不能为空");
            return;
        }
        mui.ajax('http://192.168.0.7/newssystem/index.php/Home/User/login',{//需更改
            data:{
                username:username.value,
                password:password.value
            },
            dataType:'json',
            type:'POST',
            timeout:10000,
            success:function(data){
                //{"reslut":1}
                if(data.result==1){
                    //登录成功
                    plus.ui.toast("登录成功");
                    mui.openWindow({
                        url:'list.html',
                        id:'list'
                    })
                }else{
                    //登录失败
                    plus.ui.toast(data.data);
                }
            },
            error:function(){
            }
        })
    })
})