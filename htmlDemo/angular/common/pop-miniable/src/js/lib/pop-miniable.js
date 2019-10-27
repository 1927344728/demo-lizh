// require jQuery
// mail 405606225@qq.com
// Date 2016-01-12
(function($, window) {
	var extend = function(base, more) {
		// 浅复制拓展。
		var result = {};
		for (var prop in base) {
			result[prop] = base[prop];
		}
		for (var prop in more) {
			result[prop] = more[prop];
		}
		return result;
	};
	var PopMiniable = function(opt) {
		var noop = function() {};
		defaultOpts = {
			baseTemp: '<div class="pop-miniable-wraper" id="pop-miniable-wraper" >\
				<div class="mini-mask">\
				</div>\
				<div id="pop-miniable-main" class="pop-miniable-main">\
					{{mainHtml}}\
				</div>\
				<div id="pop-miniable-sub" class="pop-miniable-sub">\
					{{subHtml}}\
				</div>\
			</div>',
			mainTemp: '<a href="{{linkhref}}">\
				<img src="{{picsrc}}" class="pop-miniable-pic" />\
			</a>\
			<div class="pop-miniable-info">\
				<div class="pop-miniable-title">\
					{{title}}\
				</div>\
				<div class="pop-miniable-desc">\
					{{desc}}\
				</div>\
				<a href="javascript:;" class="pop-miniable-btn close" onclick="PopMiniable.close();">{{closeTxt}}</a>\
				<a href="javascript:;" class="pop-miniable-btn ok" onclick="PopMiniable.ok();">{{okTxt}}</a>\
			</div>',
			subTemp: '<img src="{{minisrc}}" class="songzengxian" onclick="PopMiniable.open();" />',
			closeFn: noop,
			closeTxt: "取消",
			okFn: noop,
			okTxt: "好的",
			classFix: ""
		};
		var opts = extend(defaultOpts, opt);
		this.opts = opts;
		PopMiniable.$instent = this;
	};

	function feedTempData(temp, data) {
		return temp.replace(/{{\w+}}/g, function(keyword) {
			var value = data[keyword.substr(2, keyword.length - 4)];
			return typeof(value) == "undefined" ? keyword : value;
		})
	}
	PopMiniable.prototype.open = function() {
		var baseTemp = this.opts.baseTemp;
		var mainTemp = this.opts.mainTemp;
		var subTemp = this.opts.subTemp;
		var mainHtml = feedTempData(mainTemp, this.opts);
		var subHtml = feedTempData(subTemp, this.opts);
		this.opts.mainHtml = mainHtml;
		this.opts.subHtml = subHtml;
		var baseHtml = feedTempData(baseTemp, this.opts);
		if ($("#pop-miniable-sub").length) {
			$("#pop-miniable-sub").fadeOut(100, function() {
				$("#pop-miniable-wraper").remove();
				$("body").append(baseHtml);
				$("#pop-miniable-main,.mini-mask").fadeIn(250);
			});
		} else {
			$("body").append(baseHtml);
			$("#pop-miniable-main,.mini-mask").fadeIn();
			setTimeout(function() {
				$("#pop-miniable-main").width($(window).width() - 48);
			}, 100);
		}
	};
	var miniSizeWindow = function() {
		$(".pop-miniable-main").html();
		$(".pop-miniable-main").html("");
		var onAnimationEnd = function() {
			$(".pop-miniable-main").removeClass('animated move-pop-miniable');
			$(".pop-miniable-main,.mini-mask").hide();
			$(".pop-miniable-sub").fadeIn(250);
			if (animationTimout) {
				clearTimeout(animationTimout);
				animationTimout = null;
			}
		};
		animationTimout = setTimeout(function() {
			onAnimationEnd();
		}, 350);
		$(".pop-miniable-main").addClass('animated move-pop-miniable').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			onAnimationEnd();
		});
	};
	PopMiniable.prototype.close = function() {
		miniSizeWindow();
		this.opts.closeFn();
	};
	PopMiniable.prototype.ok = function() {
		miniSizeWindow();
		this.opts.okFn();
	};
	PopMiniable.open = function() {
		this.$instent.open();
	};
	PopMiniable.close = function() {
		this.$instent.close();
	};
	PopMiniable.ok = function() {
		this.$instent.ok();
	};
	PopMiniable.extend = extend;
	var module = window["module"];
	if (typeof module === "object" && typeof module.exports === "object") {
		// For CommonJS and CommonJS-like environments where a proper window is present
		module.exports = PopMiniable;
	} else {
		window["PopMiniable"] = PopMiniable;
	}
})(jQuery, window);