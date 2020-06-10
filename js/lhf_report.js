/*
	本文件由lhf创建并维护
	本文件仅服务于举报页面
*/

/* 
	打开本页面需要传入
	举报对象类型、举报对象id两个参数(皆为数字)
	类型参数在app.js中已经有设置参考
*/

var reportTypeItem=document.getElementById("reportType");//html中显示举报类型的项
var reportReasonItem=document.getElementById("reportReason");//html中显示举报原因的项
var sendReportButton=document.getElementById("sendReport");//html中发送举报的按键
var reportContentItem=document.getElementById("reportContent");//html中填写举报理由的项
var reportReasonChose=document.getElementById("reasonChose");//html中进行原因选择的折叠面板
var reportType;//举报类型
var reportObjectId;//举报对象id
var myId;//获取用户自身id

mui.plusReady(function () {
    
	var reportView=plus.webview.currentWebview();
	
	reportType=reportView.reportType;//举报类型
	reportObjectId=reportView.reportObjectId;//举报对象id
	myId=app.getUserGlobalInfo().userId;//获取用户自身id
	
	var reportTypeStr;
	switch(reportType){
		case app.USERMSGVIOLATION:
			reportTypeStr="用户信息违规";
			break;
		case app.CHATMSGVIOLATION:
			reportTypeStr="聊天内容违规";
			break;
		case app.POSTVIOLATION:
			reportTypeStr="动态相关内容违规";
			break;
		case app.CHATROOMVILATION:
			reportTypeStr="食堂违规";
			break;
		case app.BOTTLEVIOLATION:
			reportTypeStr="漂流瓶内容违规";
			break;
		default:
			reportTypeStr="奇怪的问题发生了QAQ";
	}
	reportTypeItem.innerHTML=reportTypeStr;
	
	document.getElementById("pornSpread").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.PORNOGRAPHY;
		reportReasonItem.innerHTML="淫秽色情传播";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("fraud").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.FRAUD;
		reportReasonItem.innerHTML="欺诈骗钱";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("harassment").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.HARASSMENT;
		reportReasonItem.innerHTML="骚扰";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("examCheat").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.EXAMCHEATING;
		reportReasonItem.innerHTML="考试舞弊";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("political").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.POLITICALLY;
		reportReasonItem.innerHTML="政治敏感";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("violence").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.VIOLENCE;
		reportReasonItem.innerHTML="暴力血腥";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("invasionOfPrivacy").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.INVASIONOFPRIVACY;
		reportReasonItem.innerHTML="侵犯隐私";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	document.getElementById("otherReason").addEventListener("tap",function(){
		reportReasonItem.reportReasonId=app.OTHERRESON;
		reportReasonItem.innerHTML="其他违规";
		reportReasonChose.setAttribute('class',"mui-table-view-cell mui-collapse");
	});
	
	//监听用户输入，使得发送按钮变色
	reportContentItem.addEventListener("input",function(){
		var textValue=reportContentItem.value;
		if(textValue.length>0 && reportReasonItem.innerHTML!=""){
			sendReportButton.setAttribute("class","mui-btn mui-btn-block mui-btn-blue");
		}
		else{
			sendReportButton.setAttribute("class","mui-btn mui-btn-block mui-btn-gray");
		}
	});
	
	sendReportButton.addEventListener("tap",function(){
		var textValue=reportContentItem.value;
		if(reportReasonItem.innerHTML==""){
			mui.toast("先选一下举报原因类型吧(*^ω^*)");
		}
		else if(textValue.length<=0){
			mui.toast("先填一下举报理由吧(*^ω^*)");
		}
		else{
			var result=sendReport();
			if(result==true){//如果举报内容提交完毕
				mui.back();
			}
		}
	});
});


//提交举报内容到后端
function sendReport(){
	var result=false;
	
//	console.log(myId);
//	console.log(reportObjectId);
//	console.log(reportType);
//	console.log(reportReasonItem.reportReasonId);
//	console.log(reportContentItem.value);
	
	mui.ajax(app.serverUrl+"/Friend/report",{
		data:{
			sendId:myId,
			reportedId:reportObjectId,
			reportTypeId:reportType,
			reportReason:reportReasonItem.reportReasonId,
			reportContent:reportContentItem.value
		},//上传的数据
		async:false,
		dataType:'json',//服务器返回json格式数据
		type:'post',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},	              
		success:function(data){
			//服务器返回响应
			if(data.status==200){
				mui.toast("恶人终将被制裁(# ` n´ )");
				result=true;
				//console.log(result);
			}
			else{
				mui.toast("好像出了一些问题？稍后再试试吧！QAQ");
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log("举报的ajax好像出了一些问题");
		}
	});
	
	//console.log(result);
	
	return result;
}