/*
	本文件由lhf创建并维护
	本文件仅用于深夜食堂的食堂内部聊天页使用
	
	使用时，需要传入两个参数
	roomId
	isMine（区分是否为自己创建的食堂）
	
	(是自己创建的食堂的话，本功能会额外在侧滑菜单中加上一个修改食堂信息的功能)
*/

mui.init();

//获取滑动菜单的dom，用于执行操作用
var setObj=document.getElementsByClassName('mui-icon-settings');
//获取显示食堂名的区域
var roomNameDom=mui("#roomName");

mui.plusReady(function () {
    
	
});

setObj[0].addEventListener("tap",function () {
	if(mui('.mui-off-canvas-wrap').offCanvas().isShown()){
		mui('.mui-off-canvas-wrap').offCanvas().close();
	}
	else{
		mui('.mui-off-canvas-wrap').offCanvas().show();
	}
});


//修改食堂信息后的配套动作，将被修改食堂信息的功能模块调用
//这里主要是更新显示的食堂名称
function reload(roomName,theTags){
	roomNameDom.innerHTML=roomName;
}


//当传入参数isMine==true时，进行修改食堂信息的功能额外添加
function addModifyEntrance(){
	mui("#funcUL").innerHTML='<li class="mui-table-view-cell"></li><!-- 占位置用的 -->'+
						'<li class="mui-table-view-cell"></li><!-- 占位置用的 -->'+
						'<li class="mui-table-view-cell" id="watchDiningRoomMsg">查看食堂信息</li>'+
						'<li class="mui-table-view-cell" id="modifyDiningRoomMsg">修改食堂信息</li>'+
						'<li class="mui-table-view-cell" id="report">举报</li>'+
						'<li class="mui-table-view-cell" id="leave">关闭食堂</li>';
}