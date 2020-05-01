window.app = {
	//后端的url地址
	serverUrl:'localhost:8080',
	
	isNotNull:function(str){
		if(str!=null&&str!=""&&str!=undefined){
			return true;
		}
		return false;
	},
	
	showToast:function(msg,type){
		plus.nativeUI.toast(msg,
			{icon:"images/"+type+".png",verticalAlign:"center"})
	},
	
	setUserGlobalInfo:function(user){
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo",userInfoStr);
	},
	
	getUserGlobalInfo:function(){
		var userInfoStr=plus.storage.getItem("userInfo");
		return userInfoStr;
	},
	//设置用户基本资料
	setBasicInfo:function(basicInfo){
		var basicInfoStr = JSON.stringify(basicInfo);
		plus.storage.setItem("basicInfo",basicInfoStr);
	},
	//获得用户的基本资料
	getBasicInfo:function(){
		var basicInfoStr=plus.storage.getItem("basicInfo");
		return basicInfoStr;
	},
	//设置所有性别选项
	setGenderInfo:function(genderInfo){
		var genderInfoStr = JSON.stringify(genderInfo);
		plus.storage.setItem("genderInfo",genderInfoStr);
	},
	//获得所有性别选项
	getGenderInfo:function(){
		var genderInfoStr=plus.storage.getItem("genderInfo");
		return genderInfoStr;
	},
	
}