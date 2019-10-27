;
(function(){
	var timer, timer2;
	var msgString;
	function popLayer(type, option){
		//type参数为必填项，有以下六种值：
			// message : 屏幕透明背景，框的背景为灰色，可自动消失、点击消失。
			// loading : 弹出正在加载页面，可传参修改页面默认文字；调用type=remove时删除
			// confirm : 弹出“确认”框，可自定义"click"事件
			// prompt  : 弹出提示框，有“确认”、“取消”按钮,可自定义"click"事件
			// downBtn : 弹出底部按钮，可自动添加选项及对应的"click"事件、选项样式
			// remove  : 移除弹框

		//option可传字符串、｛｝，不能为空。具体如下;
			// message、confirm、prompt时可传字符串，其值为弹出框显示的内容；也可传｛｝，其值具体如下defaults;
			// remove，不传参数；
			// loading，可不传参数，也可传{ loadingTx:"" }，定义页面文字；
			// downBtn，option中 { downBtnArray:[] }传数组，每个子元素为json值；
		var defaults = {
				 title : null,		//弹框标题，可选。适用message、confirm、prompt
			   // dataUrl : "json/json.json",	    	// 获取内容的地址，可选。适用message、confirm、prompt
				   msg : null,        	// 弹出框要显示的内容，必选。
		   alignCenter : true,     	// 默认msg文本内容居左; true，文本居中。适用message、confirm、prompt
		   	  autoTime : 3000,			// 默认10000，即10s; "message"自动消失的时间。适用message
			   okBtnTx : '确定',		// 默认按钮文字为"确定"; 适用confirm、prompt
		   cannelBtnTx : '取消',		// **************"取消"; 适用prompt
			 okBtnFunc : null, 			// "确定"按钮执行的事件，可选;  适用confirm、prompt
	     cannelBtnFunc : null, 			// "取消"********************;  适用prompt
		  downBtnArray : [				// 数组形式，每个数组子元素为[string, function, style] 分别为按钮的“键值 ”、“函数”、“样式”
			  // {
			  	// dBtnTx : null,		//新按钮显示的文字，传string值;
		  	 //  dBtnFunc : null,		//新按钮上的点击事件，传函数；
		  	 // dBtnStyle : null		//新按钮的样式，传样式string类型，如 "color: #0f0; font-size: 20px;"
			  // }
		  ],
   			 loadingTx : ""  // 默认加载页面文字; 适用loading
		};

		if(typeof option=="string") {
			defaults.msg = option;
		}else if(typeof option=="undefined"){
			if(type == "remove"){
				type="remove";
			}else if(type == "loading"){
				type="loading";
			}else{
				msgString = type;
				type = "message";
			}
		}else{
			$.extend(defaults,option);
		}

		if(defaults.dataUrl){
			$.ajax({
				url  : defaults.dataUrl,
				type : "post",
				dataType: "json",
				success: function(Data){
					Data.data.title && (defaults.title=Data.data.title);
					defaults.msg = Data.data.body;
				}
			});
		}


		//创建弹出框节点
		function createLayerDom(){
			if(!defaults.msg){ return; }
			$(".over-prompt, .over-loading").remove();
			clearTimeout(timer);
			clearTimeout(timer2);
			$('<div class="over-prompt"><ul class="prompt-ul"></ul></div>').appendTo($("body"));
			$('<li class="prompt-msg-mulline"><span class="msg-main">' + defaults.msg + '</span></li>').appendTo(".over-prompt .prompt-ul");
			defaults.title && $('<span class="prompt-tit-oneline">' + defaults.title + '</span>').prependTo(".over-prompt .prompt-msg-mulline");
			defaults.alignCenter && $(".over-prompt .prompt-msg-mulline").css("text-align", "center");
			if(defaults.okBtnTx && defaults.cannelBtnTx) {
				$('<li class="prompt-btn"><span class="pop-cannel-btn">' + defaults.cannelBtnTx + '</span><span class="pop-ok-btn">' + defaults.okBtnTx + '</span></li>').appendTo(".over-prompt .prompt-ul");
			}else{
				defaults.okBtnTx  && $('<li class="prompt-btn">' + defaults.okBtnTx + '</li>').appendTo(".over-prompt .prompt-ul");
			}
			if($(".over-prompt .prompt-ul").height() >= $(".over-prompt").height()*0.8 ){
				var h_Title = defaults.title? $(".over-prompt .prompt-tit-oneline").height()+40 : 0;
				var h_btn   = defaults.okBtnTx? $(".over-prompt .prompt-btn").height() : 0;
				$(".over-prompt .prompt-msg-mulline .msg-main").css({
						"height" : $(".over-prompt").height()*0.8 - h_Title - h_btn + "px",
				    "overflow-y" : "scroll",
				  	   "padding" : "0 20px"
				});
			}
			$(".over-prompt .prompt-ul").css("top", ($(".over-prompt").height()-$(".over-prompt .prompt-ul").height())/2 +"px");
		}


		//创建底部弹出框节点
		function createDownDom(){
			$(".over-prompt, .over-loading").remove();
			clearTimeout(timer);
			clearTimeout(timer2);
			$('<div class="over-prompt"><ul class="exit-ul"></ul></div>').appendTo("body");
			if(defaults.downBtnArray){
				var Arr = defaults.downBtnArray;
				$.each(Arr, function(i){
					Arr[i].dBtnTx && $('<li class="exit-li">' + Arr[i].dBtnTx + '</li>').appendTo(".over-prompt .exit-ul");
					Arr[i].dBtnFunc && $(".over-prompt .exit-li").eq(i).on("click", Arr[i].dBtnFunc);
					Arr[i].dBtnStyle && ($(".over-prompt .exit-li").eq(i).get(0).style.cssText = Arr[i].dBtnStyle);
				});
			}
			$('<li class="exit-li down-cannel">' + defaults.cannelBtnTx + '</li>').appendTo(".over-prompt .exit-ul");
			$(".over-prompt .down-cannel").on("click", function(){
				defaults.cannelBtnFunc && defaults.cannelBtnFunc();
				removeDownBtn();
			});
		}


		//创建加载动画
		function createLoadingDom(){
			$(".over-prompt, .over-loading").remove();
			clearTimeout(timer);
			clearTimeout(timer2);
			$(
				'<div class="loading-main over-loading">' +
	    			'<div class="loading-animate">' +
	        			'<div class="loader-threedots">' +
	            			'<span></span><span></span><span></span>' +
	       				'</div>' +
	        			'<div class="loading-text">' + defaults.loadingTx + '</div>' +
	    			'</div>' +
	    		'</div>'
	    	).appendTo("body");
		}


		switch(type){
			case "message":
				defaults.alignCenter = true;
				defaults.okBtnTx = null;
				defaults.cannelBtnTx = null;
				msgString && (defaults.msg = msgString);
				createLayerDom();
				$(".over-prompt").css("background", "transparent");
				$(".over-prompt .prompt-ul").css("background", "rgba(0,0,0,.6)");
				$(".over-prompt .msg-main").css("color","#fff");
				removeLayer($(".over-prompt"),"fadeout", defaults.autoTime);
				$(".over-prompt").on("click", function(){
					defaults.okBtnFunc && defaults.okBtnFunc();
					$(this).remove();
				});
				break;
			case "loading" :
				createLoadingDom();
				break;
			case "confirm" :
				defaults.cannelBtnTx = null;
				createLayerDom();
				$(".over-prompt .prompt-btn").on("click", function(){
					defaults.okBtnFunc && defaults.okBtnFunc();
					$(this).parents(".over-prompt").remove();
				});
				break;
			case "prompt" :
				createLayerDom();
				$(".over-prompt .pop-cannel-btn").on("click", function(){
					defaults.cannelBtnFunc && defaults.cannelBtnFunc();
					$(this).parents(".over-prompt").remove();
				});
				$(".over-prompt .pop-ok-btn").on("click", function(){
					defaults.okBtnFunc && defaults.okBtnFunc();
					$(this).parents(".over-prompt").remove();
				});
				break;
			case "downBtn" :
				createDownDom();
				break;
			case "remove" :
				clearTimeout(timer);
				clearTimeout(timer2);
				$(".over-prompt, .over-loading").remove();
				break;
		}


		//移除一般弹框、加载页面
		function removeLayer(obj,ani,delay){
			clearTimeout(timer);
			clearTimeout(timer2);
			timer = setTimeout(function(){
				obj.addClass(ani);
			},delay);
			timer2 = setTimeout(function(){
				obj.remove();
			},delay + 1000);
		}


		//移除底部弹出框
		function removeDownBtn(){
			clearTimeout(timer);
			clearTimeout(timer2);
			$(".over-prompt .exit-ul").addClass("downHide");
			timer = setTimeout(function(){
				$(".over-prompt").remove();
			},500);
		}

	} //--end popLayer--
	$.popLayer = popLayer;
})();



