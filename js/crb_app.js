
window.app = {
	//后端服务发布的URL地址
	serverUrl: 'http://192.168.1.2:8080/RATE_MAX_sevenDays2_10_war_exploded',
	//netty服务后端发布的url地址
	nettyServerUrl:'ws://192.168.1.2:7888/ws', //172.17.243.33
				
	/*
	//后端服务发布的URL地址
	serverUrl: 'http://192.168.1.2:8080/RATE_MAX_sevenDays2_7_war_exploded',
	//netty服务后端发布的url地址
	nettyServerUrl:'ws://192.168.0.3:7888/ws', //172.17.243.33*/

	
	/**
	 * 判断字符串是否为空
	 * true：不为空
	 * false：为空
	*/
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},
	
	/**
	 * 封装消息提示框，默认mui的不支持居中和自定义icon，所以使用h5+
	 */
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, 
			{icon: "image/" + type + ".png", verticalAlign: "center"})
	},
	
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
	
	
	// 和后端的枚举对应
	CONNECT: 1, 	// 第一次(或重连)初始化连接
	CHAT: 2, 		// 聊天消息
	SIGNED: 3, 		// 消息签收
	KEEPALIVE: 4, 	// 客户端保持心跳
	PULL_FRIEND:5,	// 重新拉取好友
	CHATROOM:6,     // 聊天室消息
	USEROUT:7,      // 用户退出
	CHATROOMOUT:8,  // 聊天室退出
	MUTIUSER:9,     // 用户多登录问题
	CHATROOMMSGSIGNED:10, //聊天室消息签收
	
	/*
	 * 和后端的 ChatMsg 聊天模型对象保持一致
	 */
	ChatMsg: function(senderId, receiverId, msg, msgId){
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.content = msg;
		this.msgId = msgId;
	},
	
	/**
	 * 构建消息 DataContent 模型对象
	 */
	DataContent: function(action, chatMsg, extend){
		this.action = action;
		this.msg = chatMsg;
		this.extend = extend;//扩展字段，紧急征用为食堂聊天时，放头像
	},
	
	/**
	 * 保存用户的聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag	判断本条消息是我发送的，还是朋友发送的，1:我  2:朋友
	 */
	ME:1, // 表示我
	FRIEND:2, // 表示朋友
	
	//保存用户的聊天记录
	saveUserChatHistory: function(myId, friendId, msg, flag) {
		var me = this;
		var chatKey = "chat_" + myId + "_" + friendId;//缓存的key
		// 从本地缓存获取聊天记录是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} 
		else {
			// 如果为空，赋一个空的list
			chatHistoryList = [];
		}
		// 构建聊天记录对象
		var singleMsg = new me.ChatHistory(myId, friendId, msg, flag);
		// 向list中追加msg对象
		chatHistoryList.push(singleMsg);
		//保存聊天记录
		plus.storage.setItem(chatKey, JSON.stringify(chatHistoryList));
	},
	
	
	/**
	 * 获取用户聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	getUserChatHistory: function(myId, friendId) {
		var me = this;
		var chatKey = "chat_" + myId + "_" + friendId;//缓存的key
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {// 如果不为空		
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} 
		else {// 如果为空，赋一个空的list	
			chatHistoryList = [];
		}
		return chatHistoryList;
	},
	
	/*
	 * 单个聊天记录的对象
	 */
	ChatHistory: function(myId, friendId, msg, flag){
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.flag = flag;
	},
	
	/*
	 * 快照对象
	   isRead用于判断消息是否已读还是未读
	 */
	ChatSnapshot: function(myId, friendId, msg, isRead){
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.isRead = isRead;
	},
	
	/**
	 * 聊天记录的快照，仅仅保存每次和朋友聊天的最后一条消息
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	saveUserChatSnapshot: function(myId, friendId, msg, isRead) {
		var me = this;
		var chatKey = "chat_snapshot" + myId;		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否包含（匹配）friendId，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId所对应的快照对象,删除一个即可
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} 
		else {// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}
		// 构建聊天快照对象
		var singleMsg = new me.ChatSnapshot(myId, friendId, msg, isRead);	
		// 向list中追加快照对象
		chatSnapshotList.unshift(singleMsg);	
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},
	

	/**
	 * 获取用户快照记录列表
	 */
	getUserChatSnapshot: function(myId) {
		var me = this;
		var chatKey = "chat_snapshot" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空	
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
		} 
		else {// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}	
		return chatSnapshotList;
	},
	
	
	//清空聊天快照
	clearUserChatSnapshot: function(myId) {
		var chatKey = "chat_snapshot" + myId;
		plus.storage.removeItem(chatKey);
	},
	

	/**
	 * 删除本地的聊天快照记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = "chat_snapshot" + myId;		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否包含（匹配）friendId，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId所对应的快照对象
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} 
		else {// 如果为空，不做处理
			return;
		}
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},

	
	/**
	 * 标记未读消息为已读状态
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	readUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = "chat_snapshot" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环这个list，判断是否存在好友，比对friendId，
			// 如果有，在list中的原有位置删除该 快照 对象，然后重新放入一个标记已读的快照对象
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				var item = chatSnapshotList[i];
				if (item.friendId == friendId) {
					item.isRead = true;		// 标记为已读
					chatSnapshotList.splice(i, 1, item);	// 替换原有的快照
					break;
				}
			}
			// 替换原有的快照列表
			plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
		} 
		else {// 如果为空			
			return;
		}
	},
	
	//保存用户的朋友列表
	setFriList:function(friList){
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
	
	
	//修改朋友的信赖等级
	changeFriTrust:function(friendId){
		var me=this;
		var friKey = "friList";
		// 从本地缓存获取朋友列表
		var friListStr = plus.storage.getItem(friKey);
		var friListList;
		if (me.isNotNull(friListStr)) {// 如果不为空
			friListList = JSON.parse(friListStr);
			// 循环这个list，判断是否存在好友，比对friendId，
			// 如果有，在list中的原有位置修改信赖状态
			for (var i = 0 ; i < friListList.length ; i ++) {
				var item = friListList[i];
				if (item.userId == friendId) {
					item.level = Math.abs(item.level-1);;		// 标记为与原本相反的信赖状态
					friListList.splice(i, 1, item);	// 替换原有的朋友数据
					console.log("app中的修改信赖");
					break;
				}
			}
			// 替换原有的朋友列表
			plus.storage.setItem(friKey, JSON.stringify(friListList));
		} 
		else {// 如果为空			
			return;
		}
	},
	
	
	//修改朋友备注
	changeFriNoteName:function(friendId,newNoteName){
		var me=this;
		var friKey = "friList";
		// 从本地缓存获取朋友列表
		var friListStr = plus.storage.getItem(friKey);
		var friListList;
		if (me.isNotNull(friListStr)) {// 如果不为空
			friListList = JSON.parse(friListStr);
			// 循环这个list，判断是否存在好友，比对friendId，
			// 如果有，在list中的原有位置修改备注
			for (var i = 0 ; i < friListList.length ; i ++) {
				var item = friListList[i];
				if (item.userId == friendId) {
					item.remark = newNoteName;		// 修改为新备注
					friListList.splice(i, 1, item);	// 替换原有的朋友数据
					console.log("app中的修改备注");
					break;
				}
			}
			// 替换原有的朋友列表
			plus.storage.setItem(friKey, JSON.stringify(friListList));
		} 
		else {// 如果为空			
			return;
		}
	},
	
	
	//删除黑名单缓存
	deleteBlackList:function(){
		plus.storage.removeItem("blackList");
	},
	
	//保存用户的黑名单
	setblackList:function(blackList){
		var blackListStr=JSON.stringify(blackList);
		plus.storage.setItem("blackList",blackListStr);
	},
	
	//取出黑名单
	getBlackList:function(){
		var blackListStr=plus.storage.getItem("blackList");
		return JSON.parse(blackListStr);
	},
	
	//举报的对象类型
	USERMSGVIOLATION:1, //用户信息违规
	CHATMSGVIOLATION:2,//聊天内容违规
	POSTVIOLATION:3,//动态相关内容违规
	CHATROOMVILATION:4,//食堂违规
	BOTTLEVIOLATION:5,//漂流瓶内容违规
	
	//举报原因
	PORNOGRAPHY:1,//淫秽色情传播
	FRAUD:2,//欺诈骗钱
	HARASSMENT:3,//骚扰
	EXAMCHEATING:4,//考试舞弊
	POLITICALLY:5,//政治敏感
	VIOLENCE:6,//暴力血腥
	INVASIONOFPRIVACY:7,//侵犯隐私
	OTHERRESON:8,//其他违规
	
	
	//保存十字记忆
	setMemory:function(memory){
		var memoryStr=JSON.stringify(memory);
		plus.storage.setItem("memory",memoryStr);
	},
	//取出十字记忆
	getMemory:function(){
		var memoryStr=plus.storage.getItem("memory");
		return JSON.parse(memoryStr);
	},
	
	
	
	//保存用户的已加入的关闭状态的食堂列表
	setCloseRoomList:function(closedRoomList){
		var closedRoomListStr=JSON.stringify(closedRoomList);
		plus.storage.setItem("closedRoomList",closedRoomListStr);
	},
	
	
	//取出用户的已加入的关闭状态的食堂列表
	getCloseRoomList:function(){
		var closedRoomListStr=plus.storage.getItem("closedRoomList");
		if(closedRoomListStr!=null&&closedRoomListStr.length>0){
			return JSON.parse(closedRoomListStr);
		}
		else{
			return [];
		}
	},
	
	//保存用户自己创建的食堂列表
	setCreateRoomList:function(createRoomList){
		var createRoomListStr=JSON.stringify(createRoomList);
		plus.storage.setItem("createRoomList",createRoomListStr);
	},
	
	//取出用户的自己创建的食堂列表
	getCreateRoomList:function(){
		var createRoomListStr=plus.storage.getItem("createRoomList");
		if(createRoomListStr!=null&&createRoomListStr.length>0){
			return JSON.parse(createRoomListStr);
		}
		else{
			return [];
		}
	},
	
	
	//修改食堂的食堂名和标签(仅涉及自己创建的食堂)
	changeRoomMsg:function(roomId,roomName,newTags){
		var me=this;
		var roomKey = "createRoomList";
		// 从本地缓存获取由自己创建的食堂列表
		var createRoomListStr = plus.storage.getItem(roomKey);
		var createRoomList;
		if (me.isNotNull(createRoomListStr)) {// 如果不为空
			createRoomList = JSON.parse(createRoomListStr);
			// 循环这个list，判断是否存在食堂，比对roomId，
			// 如果有，在list中的原有位置修改食堂名和标签
			for (var i = 0 ; i < createRoomList.length ; i ++) {
				var item = createRoomList[i];
				if (item.chatroomId == roomId) {
					item.chatroomName=roomName;
					item.chatroomTag=newTags;
					createRoomList.splice(i, 1, item);	// 替换原有的食堂数据
					console.log("app中的修改指定id食堂信息");
					break;
				}
			}
			// 替换原有的食堂列表
			plus.storage.setItem(roomKey, JSON.stringify(createRoomList));
		} 
		else {// 如果为空			
			return;
		}
	},
	
	
	//保存用户加入的处在开启状态的食堂列表
	setOpenRoomList:function(openRoomList){
		var openRoomListStr=JSON.stringify(openRoomList);
		plus.storage.setItem("openRoomList",openRoomListStr);
	},
	
	//取出用户加入的处在开启状态的食堂列表
	getOpenRoomList:function(){
		var openRoomListStr=plus.storage.getItem("openRoomList");
		if(openRoomListStr!=null&&openRoomListStr.length>0){
			return JSON.parse(openRoomListStr);
		}
		else{
			return [];
		}
	},
	
	
	
	/*
	 * 单个食堂的聊天记录的对象
	 * flag	判断本条消息是我发送的，还是别人发送的，1:我  2:朋友
	 */
	RoomChatHistory: function(sendId, roomId, msg, flag, icon){
		this.sendId = sendId;
		this.icon = icon;
		this.roomId = roomId;
		this.msg = msg;
		this.flag = flag;
	},
	
	//保存用户的食堂聊天记录
	saveUserChatRoomHistory: function(myId, otherId, roomId, msg, flag, icon) {
		var me = this;
		var chatRoomKey = "chatRoom_" + myId + "_" + roomId;//缓存的key
		// 从本地缓存获取聊天记录是否存在
		var chatHistoryListStr = plus.storage.getItem(chatRoomKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} 
		else {
			// 如果为空，赋一个空的list
			chatHistoryList = [];
		}
		// 构建食堂聊天记录对象
		var singleMsg = new me.RoomChatHistory(otherId, roomId, msg, flag, icon);
		// 向list中追加msg对象
		chatHistoryList.push(singleMsg);
		//保存聊天记录
		plus.storage.setItem(chatRoomKey, JSON.stringify(chatHistoryList));
	},
	
	
	/**
	 * 获取用户食堂的聊天记录
	 */
	getUserChatRoomHistory: function(myId, roomId) {
		var me = this;
		var chatRoomKey = "chatRoom_" + myId + "_" + roomId;//缓存的key
		var chatHistoryListStr = plus.storage.getItem(chatRoomKey);
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {// 如果不为空		
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} 
		else {// 如果为空，赋一个空的list	
			chatHistoryList = [];
		}
		return chatHistoryList;
	},
	
	
	/*
	 * 食堂消息的快照对象
	   isRead用于判断消息是否已读还是未读
	 */
	ChatRoomSnapshot: function(myId, roomId, msg, isRead){
		this.myId = myId;
		this.roomId = roomId;
		this.msg = msg;
		this.isRead = isRead;
	},
	
	/**
	 * 食堂聊天记录的快照，仅仅保存每个食堂聊天的最后一条消息
	 * @param {Object} myId
	 * @param {Object} roomId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	saveUserChatRoomSnapshot: function(myId, roomId, msg, isRead) {
		var me = this;
		var chatRoomKey = "chatRoom_snapshot" + myId;		
		// 从本地缓存获取食堂聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatRoomKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否包含（匹配）roomId，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				if (chatSnapshotList[i].roomId == roomId) {
					// 删除已经存在的roomId所对应的快照对象,删除一个即可
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} 
		else {// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}
		// 构建食堂聊天快照对象
		var singleMsg = new me.ChatRoomSnapshot(myId, roomId, msg, isRead);	
		// 向list中追加快照对象
		chatSnapshotList.unshift(singleMsg);	
		plus.storage.setItem(chatRoomKey, JSON.stringify(chatSnapshotList));
	},
	
	
	/**
	 * 获取用户快照记录列表
	 */
	getUserChatRoomSnapshot: function(myId) {
		var me = this;
		var chatRoomKey = "chatRoom_snapshot" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatRoomKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空	
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
		} 
		else {// 如果为空，赋一个空的list
			chatSnapshotList = [];
		}	
		return chatSnapshotList;
	},
	
	
	//清空食堂聊天快照
	clearUserChatRoomSnapshot: function(myId) {
		var chatRoomKey = "chatRoom_snapshot" + myId;
		plus.storage.removeItem(chatRoomKey);
	},
	
	
	/**
	 * 删除本地的某个食堂聊天快照记录
	 * @param {Object} myId
	 * @param {Object} roomId
	 */
	deleteUserChatRoomSnapshot: function(myId, roomId) {
		var me = this;
		var chatRoomKey = "chatRoom_snapshot" + myId;		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatRoomKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环快照list，并且判断每个元素是否包含（匹配）roomId，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				if (chatSnapshotList[i].roomId == roomId) {
					// 删除已经存在的roomId所对应的快照对象
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} 
		else {// 如果为空，不做处理
			return;
		}
		plus.storage.setItem(chatRoomKey, JSON.stringify(chatSnapshotList));
	},
	
	
	/**
	 * 标记食堂的未读消息为已读状态
	 * @param {Object} myId
	 * @param {Object} roomId
	 */
	readUserChatRoomSnapshot: function(myId, roomId) {
		var me = this;
		var chatRoomKey = "chatRoom_snapshot" + myId;
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatRoomKey);
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
			// 循环这个list，判断是否存在食堂，比对roomId，
			// 如果有，在list中的原有位置删除该 快照 对象，然后重新放入一个标记已读的快照对象
			for (var i = 0 ; i < chatSnapshotList.length ; i ++) {
				var item = chatSnapshotList[i];
				if (item.roomId == roomId) {
					item.isRead = true;		// 标记为已读
					chatSnapshotList.splice(i, 1, item);	// 替换原有的快照
					break;
				}
			}
			// 替换原有的快照列表
			plus.storage.setItem(chatRoomKey, JSON.stringify(chatSnapshotList));
		} 
		else {// 如果为空			
			return;
		}
	},
}
