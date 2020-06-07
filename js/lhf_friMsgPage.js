var me;//用户信息
var friendUserId;


mui.plusReady(function () {
	console.log("到达朋友的信息页，进行plusReady加载中");
    //获取本页面
    var chatview=plus.webview.currentWebview();
    //获取上一个页面传入的朋友id
    friendUserId = chatview.friUserId;
    //获取用户信息
    me = app.getUserGlobalInfo();
	//加载朋友信息
	loadFriMsg();
	
	//监听用户输入，使得修改备注的确认按钮变色
	var newNoteText=document.getElementById("newNote");
	var newNoteConfirm=document.getElementById("confirmNoteName");
	
	newNoteText.addEventListener("input",function(){
		var newNoteValue=newNoteText.value;
		if(newNoteValue.length>0){
			newNoteConfirm.setAttribute("class","mui-btn mui-btn-block mui-btn-blue");
		}
		else{
			newNoteConfirm.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");
		}
	});
	
	//响应用户确定更改备注的操作
	newNoteConfirm.addEventListener("tap",function(){
		var newNoteValue1=newNoteText.value;
		if(newNoteValue1.length>28){
			mui.toast("字数太多了呢(´-ωก`)");
		}
		else if(newNoteValue1.length<1){
			newNoteText1.focus();
			mui.toast("请先输入新备注<(｀^´)>");
		}
		else{
			changeNoteName(newNoteValue1);
		}
	});
})


//向后端发送请求以加载朋友的信息
function loadFriMsg(){
	//console.log(app.serverUrl+"/Friend/getInformation/?userId="+me.userId+"&viewedId="+friendUserId);
	mui.ajax(app.serverUrl+"/Friend/getInformation/?userId="+me.userId+"&viewedId="+friendUserId,{
		data:{},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			if(data!=undefined){
				var friMsg = data;
				showFrimsg(friMsg);
			}
			else{
				console.log(JSON.stringify(data));//输出返回的数据
				mui.toast("好像出了一些问题？稍后再试试吧！");
			}
		}
	});
}


//利用后端传来的数据进行信息的显示
function showFrimsg(friMsg){
	console.log("朋友信息开始加载");
	
	var nickName=friMsg.nickname; //假名
	var noteName=friMsg.remark;//备注
	var gender=friMsg.gender; //性别
	var profile=friMsg.profile; //简介
	var tags=friMsg.thisweektags;//本周标签
	
	if(friMsg.icon=""){//如果朋友有设置头像
		document.getElementById("friImage").src=friMsg.icon;
	}
	
	document.getElementById("titleName").innerHTML=nickName+"的资料";//标题加载
	//document.getElementById("friImage").src=friImage;//头像加载
	document.getElementById("noteName").innerHTML=noteName;//备注加载
	document.getElementById("profile").innerHTML=profile;//加载个人简介
	
	if(gender==null){
		gender=",,Ծ^Ծ,,看不到呢！";
	}
	document.getElementById("gender").innerHTML=gender;
	
	//显示本周标签
	var weekTagsDom=document.getElementById('weekTags');
	if (tags!= null && tags.length > 0 && tags!=undefined) {
		tags = tags.split(" ");
		var weekTagsHtml = "";
		for (var i = 0; i <tags.length-1; i++) {
			weekTagsHtml += '<span class="mui-badge mui-badge-success" style="margin-top: 10px;">'
			+tags[i]+'</span>';
		}
		weekTagsDom.innerHTML = weekTagsHtml;
	} 
	else {
		weekTagsDom.innerHTML = ",,Ծ^Ծ,,看不到呢！";
	}
}


//将新的备注发送到后端进行处理
function changeNoteName(newNoteName){
	//向后端发送消息，并更新缓存
	mui.ajax(app.serverUrl+"/Friend/remark/?remarkId="+friendUserId+"&userId="+me.userId+"&remark="+newNoteName,{
		data:{
		},//上传的数据
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			if(data.status==200){
				app.changeFriNoteName(friendUserId,newNoteName);
				document.getElementById("noteName").innerHTML=newNoteName;//新备注加载
				mui.toast("(´｡･v･｡｀)偷偷备注成功！");
			}
			else{
				mui.toast("好像出了一些问题？稍后再试试吧！");
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log("备注修改的ajax好像出了一些问题");
		}
	});
}