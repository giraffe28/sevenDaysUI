window.app = {
	
	/**
	 * netty服务后端发布的url地址
	 */
	//nettyServerUrl: 'ws://192.168.0.100:8088/ws',
	//ws://192.168.0.100:8088/ws
	
	/**
	 * 后端服务发布的url地址
	 */
	//serverUrl: 'http://192.168.0.100:8080',
	
	/**
	 * 图片服务器的url地址
	 */
	//imgServerUrl: 'http://192.168.0.110:88/imooc/',
	
	/**
	 * 判断字符串是否为空
	 * @param {Object} str
	 * true：不为空
	 * false：为空
	 
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},*/
	
	/**
	 * 封装消息提示框，默认mui的不支持居中和自定义icon，所以使用h5+
	 * @param {Object} msg
	 * @param {Object} type
	 
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, 
			{icon: "image/" + type + ".png", verticalAlign: "center"})
	},*/
	
	/**
	 * 保存用户的全局对象
	 * @param {Object} user
	 */
	setUserGlobalInfo: function(user) {
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo", userInfoStr);
	},
	
	/**
	 * 获取用户的全局对象
	 */
	getUserGlobalInfo: function() {
		var userInfoStr = plus.storage.getItem("userInfo");
		return JSON.parse(userInfoStr);
	},
	
	
	/**
	 * 和后端的枚举对应
	 
	CONNECT: 1, 	// 第一次(或重连)初始化连接
	CHAT: 2, 		// 聊天消息
	SIGNED: 3, 		// 消息签收
	KEEPALIVE: 4, 	// 客户端保持心跳
	PULL_FRIEND:5,	// 重新拉取好友
	
	/**
	 * 和后端的 ChatMsg 聊天模型对象保持一致
	 * @param {Object} senderId
	 * @param {Object} receiverId
	 * @param {Object} msg
	 * @param {Object} msgId
	 
	ChatMsg: function(senderId, receiverId, msg, msgId){
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.msg = msg;
		this.msgId = msgId;
	},*/
	
	/**
	 * 构建消息 DataContent 模型对象
	 * @param {Object} action
	 * @param {Object} chatMsg
	 * @param {Object} extand
	 
	DataContent: function(action, chatMsg, extand){
		this.action = action;
		this.chatMsg = chatMsg;
		this.extand = extand;
	},*/
	
	/**
	 * 单个聊天记录的对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag
	 
	ChatHistory: function(myId, friendId, msg, flag){
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.flag = flag;
	},*/
	
	/**
	 * 快照对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead	用于判断消息是否已读还是未读
	 
	ChatSnapshot: function(myId, friendId, msg, isRead){
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.isRead = isRead;
	}*/
	
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

	},
	
}
