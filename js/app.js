window.app={
	/*serverUrl:'http://39.97.213.247:8080',//后端服务器地址

	getUserGlobalInfo:function(){
		user={
			id:"12345",
			password:"123456"
		}
		return user;
	},*/
	
	//保存用户的朋友列表
	setfriList:function(friList){
		var friListStr=JSON.stringify(friList);
		plus.storage.setItem("friList",friListStr);
	},
	
	//取出朋友列表
	getFriList:function(){
		var friListStr=plus.storage.getItem("friList");
		if(friListStr!=null&&friListStr.length>0){
			return JSON.parse(friListStr);
		}
		else{
			return [];
		}
	}
}