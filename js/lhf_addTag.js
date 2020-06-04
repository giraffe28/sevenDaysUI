/*
	由lhf创建并维护
	服务于标签的修改或添加
	
	使用本标签修改方式，需要提供两个参数
	userId(用户的id)
	oldTags(以空格隔开的字符串)（如果为“”，则表示原本无标签设置，或者此次是新增标签）
	
	本功能点击保存或点击回退时，将调用打开本功能的父窗口的renderNewTag方法，该方法需要接受一个字符串参数（格式同传入的oldTags）
	本功能点击取消时，将仅仅作后退处理，不进行调用父窗口的方法
*/




var MAXTAGSNUM=3;//最大的可选中标签数

var userId;//用户id
var oldTags;//旧的标签
var fatherWebview;//父窗口
var thisWebview;//本窗口
var addTagDom;//记录本窗口的标签显示区域
var oldTagsStr="";//保存旧标签字符串
var newTags="";//保存新标签字符串

mui.init();

mui.plusReady(function() {
	//获取共用的信息
	thisWebview=plus.webview.currentWebview();
	oldTags=thisWebview.oldTags;
	userId=thisWebview.userId;
	fatherWebview=thisWebview.opener();
	addTagDom=document.getElementById("addtags");
	//获取结束
	
	oldTagsStr = oldTags.split(" ");
	newTags = oldTags;
	
	renderTagPage(oldTagsStr);
	
	var selectedTags = document.getElementsByTagName("input");
	var tagNum = 0;//统计选中了几个标签
	
	//点击保存按键
	document.getElementById("confirmBtn").addEventListener('tap', function() {
		tagNum = 0;//置零
		newTags="";
		for (var i = 0; i < selectedTags.length; i++) {
			if (selectedTags[i].type == "checkbox" && selectedTags[i].checked) {
				tagNum++;
			}
		}
		if (tagNum <= MAXTAGSNUM) {
			for (var i = 0; i < selectedTags.length; i++) {
				if (selectedTags[i].type == "checkbox" && selectedTags[i].checked) {
					newTags += selectedTags[i].value + " ";
				}
			}
			mui.back();
		}
		else {
			mui.toast('保存失败啦=.= 最多只能选择'+MAXTAGSNUM+'个哦！');
		}
	});
	
	//点击取消按键
	document.getElementById("cancelBtn").addEventListener("tap",function(){
		mui.back();
	});
});


//备份mui.back，mui.back已将窗口关闭逻辑封装的比较完善（预加载及父子窗口），因此最好复用mui.back
var oldBack = mui.back;
mui.back = function(){
	//console.log("添加标签结束后的返回前操作");
	//console.log(newTags);
	//退出前,先父窗口进行新标签的加载
	fatherWebview.evalJS("renderNewTag('"+newTags+"')");
    //执行mui封装好的窗口关闭逻辑；
    oldBack();
}


//从后台获取标签，渲染页面
function renderTagPage(oldTagsStr) {
//	console.log("渲染标签列表");
	mui.ajax(app.serverUrl + '/tag/getTag', { //发送请求返回系统标签
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},   
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否成功获取信息；
			if (data.status == 200) {
				var flag;
				var tags = data.data;
				//console.log(JSON.stringify(tags));
				if (tags != null && tags.length > 0) {
					var tagsHtml = "";
					for (var i = 0; i < tags.length; i++) {
						flag = false;
						for (var j = 0; j < oldTagsStr.length; j++) {
							if (tags[i].tagName==oldTagsStr[j])
								flag = true;
						}
						//如果是已有标签，默认被选中
						if (flag == true) {
							tagsHtml += '<div class="mui-input-row mui-checkbox">' +
								'<label>' + tags[i].tagName + '</label>' +
								'<input name="checkbox1" value="' + tags[i].tagName +
								'" type="checkbox" checked> </div>';
						}
						else {
							tagsHtml += '<div class="mui-input-row mui-checkbox">' +
								'<label>' + tags[i].tagName + '</label>' +
								'<input name="checkbox1" value="' + tags[i].tagName + '" type="checkbox"> </div>';
						}
					}
					addTagDom.innerHTML = tagsHtml;
					//console.log(tagsHtml);
				} 
				else {
					addTagDom.innerHTML = "";
				}
			} 
			else {
				app.showToast(data.msg, "error");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log("获取后台标签列表出错");
			// console.log(JSON.stringify(data.data));
		}
	});
}
