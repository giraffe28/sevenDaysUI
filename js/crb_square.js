mui.init({
	pullRefresh:{
		container:"#posts",//下拉刷新容器标识
		down:{
			contentdown:"下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
			contentover: "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
			contentrefresh:"正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
			callback:pulldown //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据
		},
		up:{
			contentrefresh:"正在加载...",
			contentnomore:"没有更多数据了",
			callback:pullup
		}
	}
});

var cpage=1;
var tpage=10;
var url="……";
mui.ajax(url,{
	dataType:'json',
	type:'get',
	timeout:10000,
	contentType:'application/json;charset=utf-8',
	success:function(data){
		tpage=Math.ceil(data["total"]/10);
		var listdata=data["rows"];
		var postlist=document.getElementById("postlist");
		var flist="";
		for(i=0;i<listdata.length;i++){
			var ndata='<div class="mui-card">'+
						'<div class="mui-card-header mui-card-media">'+
							//'<img src="'+listdata[i].user.icon+'" id="icon">'+  显示用户头像、可能会出错
							'<div class="mui-media-body">'
								'<p id="name">'+listdata[i].user.nickname+'</p>'+
								'<p id="time">'+listdata[i].date+'</p>'+
							'</div>'+
						'</div>'+
						'<div class="mui-card-content">'+
							'<p id="post_content" class="line-limit-length">'+
								listdata[i].content+
							'</p>'+
						'</div>'+
						'<div class="mui-card-footer">'+
							'<a id="'+listdata[i].postId+'">详情'+
							'</p>'+
						'</div>'+
					'</div>';
			console.info(ndata);
			flist=flist+ndata;
		}
		postlist.innerHTML+=flist;
		bindtap();
	},
	error: function(xhr, type, errorThrown) {
	//异常处理；
		console.log(type);
	}
})

//下拉刷新函数
function pulldown(){
	setTimeout(function() {
		if(cpage<tpage)
			cpage=cpage+1;
		url="http://rjxy.jsu.edu.cn/php/listaccess.php?page="+cpage;//更改一下url
		var table = document.body.querySelector('.mui-table-view-cell');
		var cells = document.body.querySelectorAll('.mui-card');

		mui.ajax(url,{
			dataType:'json',
			type:'get',
			timeout:10000,
			contentType:'application/json;charset=utf-8',
			success:function(data){
				var listdata=data["rows"];
				var postlist=document.getElementById("postlist");
				for(i=0;i<listdata.length;i++){
					var div = document.createElement('div');
					div.className = 'mui-card';
					div.innerHTML = '<div class="mui-card-header mui-card-media">'+
										//'<img src="'+listdata[i].user.icon+'" id="icon">'+  显示用户头像、可能会出错
										'<div class="mui-media-body">'
											'<p id="name">'+listdata[i].user.nickname+'</p>'+
											'<p id="time">'+listdata[i].date+'</p>'+
										'</div>'+
									'</div>'+
									'<div class="mui-card-content">'+
										'<p id="post_content" class="line-limit-length">'+
											listdata[i].content+
										'</p>'+
									'</div>'+
									'<div class="mui-card-footer">'+
										'<a id="'+listdata[i].postId+'">详情'+
										'</p>'+
									'</div>';
					//下拉刷新，新纪录插到最前面；
					table.insertBefore(div, table.firstChild);
				}
				bindtap();
			},
			error: function(xhr, type, errorThrown) {
			//异常处理；
				console.log(type);
			}
		})
		mui('#posts').pullRefresh().endPulldownToRefresh(); //刷新结束
	}, 1500);
}

//上拉加载函数
function pullup(){
	setTimeout(function() {
		if(cpage<tpage) 
			cpage=cpage+1;
		mui('#posts').pullRefresh().endPullupToRefresh((cpage >= tpage));
		url="http://rjxy.jsu.edu.cn/php/listaccess.php?page="+cpage;//更改一下url

		mui.ajax(url,{
			dataType:'json',
			type:'get',
			timeout:10000,
			contentType:'application/json;charset=utf-8',
			success:function(data){
				var listdata=data["rows"];
				var postlist=document.getElementById("postlist");
				var flist="";
				for(i=0;i<listdata.length;i++){
					var ndata='<div class="mui-card">'+
									'<div class="mui-card-header mui-card-media">'+
										//'<img src="'+listdata[i].user.icon+'" id="icon">'+  显示用户头像、可能会出错
										'<div class="mui-media-body">'
											'<p>'+listdata[i].user.nickname+'</p>'+
											'<p>'+listdata[i].date+'</p>'+
										'</div>'+
									'</div>'+
									'<div class="mui-card-content">'+
										'<p class="line-limit-length">'+
											listdata[i].content+
										'</p>'+
									'</div>'+
									'<div class="mui-card-footer">'+
										'<a id="'+listdata[i].postId+'">详情'+
										'</p>'+
									'</div>'+
								'</div>';
					flist=flist+ndata;
					console.info(flist);
					bindtap();
				}
				postlist.innerHTML+=flist;

			},
			error: function(xhr, type, errorThrown) {
			//异常处理；
				console.log(type);
			}
		})
	}, 1500);
}

//初始化预加载详情页面
mui.init({
  preloadPages:[{
    id:'../html/crb_detail.html',
    url:'crb_detail.html'           
  }
  ]
});

var detailPage = null;
//添加列表项的点击事件
mui('.mui-content').on('tap', 'a', function(e) {
  var id = this.getAttribute('id');
  //获得详情页面
  if(!detailPage){
    detailPage = plus.webview.getWebviewById('../html/crb_details.html');
  }
  //触发详情页面的newsId事件
  mui.fire(detailPage,'newsId',{
    id:id
  });
//打开详情页面          
  mui.openWindow({
    id:'../html/crb_detail.html'
  });
});  