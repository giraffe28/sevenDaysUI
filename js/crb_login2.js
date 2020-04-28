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
	//点击登录按钮事件
	document.getElementById('reg').addEventListener('tap',function(){
		var zhuceBox = document.getElementById('telephone').value;
		var yzinfoBox = document.getElementById('captcha').value;
		if(zhuceBox==''){
			mui.toast('手机号不能为空');
			return false; 
		}
		else if(zhuceBox.length!=11){
			mui.toast('手机号不正确');
			return false; 
		}
		else if(yzinfoBox1==''){
			mui.toast('请填写验证码');
			return false; 
		}
		else{
			mui.ajax('http://192.168.0.7/newssystem/index.php/Home/User/login',{//需修改
			    data:{
			        telephone:telephone.value
			    },
			    dataType:'json',
			    type:'POST',
			    timeout:10000,
			    success:function(data){
			        //{"reslut":1}
			        if(data.result==1&&yzinfoBox==byzm){
			            //登录成功
			            plus.ui.toast("登录成功");
			            mui.openWindow({
			                url:'list.html',//跳转到软件默认首页
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
		};
	});
	/*第五部分：此处为点击获取验证码，服务器返回数据给客户端，接收验证码的接口：
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
	return yzm;*/
})