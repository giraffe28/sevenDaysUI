mui.init();
mui.plusReady(function () {
	var bugContent;
	document.getElementById('commit').addEventListener('tap',function(){
		bugContent=document.getElementById('bugContent').value;
		//console.log(bugContent);
		if(bugContent.trim()==""){
			mui.toast('内容不能为空哦');
		}
		else if(bugContent.length>128){
			mui.toast('内容不能超过128个字哦');
		}
		else{
			mui.ajax(app.serverUrl + '/bug/feedback', { //发送请求返回系统标签
				data: {
						content:bugContent,
					},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				headers:{'Content-Type':'application/json'},   
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否成功获取信息；
					if (data.status == 200) {
						console.log(JSON.stringify(data.data));
							mui.toast('谢谢您提出的宝贵意见 我们会努力改进的ψ(｀∇´)ψ');
							setTimeout(function()
							{
							plus.webview.currentWebview().close();
							},1000);
						}
						else {
							app.showToast(data.msg, "error");
						}
				},
				error: function(xhr, type, errorThrown) {
					mui.toast('反馈失败啦 ಥ_ಥ请稍后重试叭')
				}
			});
		}
   }) 
})