window.app = {
	serverUrl:'http;//192.168.1.4:8080',
	
	isNotNull:function(str){
		if(str!=null&&str!=""&&str!=undefined){
			return true;
		}
		return false;
	},
	
	showToast:function(msg,type){
		plus.nativeUI.toast(msg,
			{icon:"image/"+type+".png",verticalAlign:"center"})
	},
	
	setUserGlobalInfo:function(user){
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo",userInfoStr);
	},
	
	getUserGlobalInfo:function(){
		var userInfoStr=plus.storage.getItem("userInfo");
		return userInfoStr;
	},
}