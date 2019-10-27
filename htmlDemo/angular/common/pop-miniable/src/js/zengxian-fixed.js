//d = function(info) {
//	info = JSON.stringify(info, null, 4)
//	$("#debug-info").append(info);
//};
$(function() {
	(function(Storage, _global) {
		_global = _global || {
			userid: 0
		};

		function getdate() {
			var now = new Date()
			y = now.getFullYear()
			m = now.getMonth() + 1
			d = now.getDate()
			m = m < 10 ? "0" + m : m
			d = d < 10 ? "0" + d : d
			return y + "-" + m + "-" + d
		}
		var tool = {
			openTime: null,
			storageFixed: "popMinTime_",
			init: function() {
				self = this;
				var today = getdate();
				self.storageKey = self.storageFixed + today + "_" + _global.userid;
				self.openTime = Storage.Get(self.storageKey) || 0;
			},
			save: function() {
				self = this;
				//				console.log("self.storageKey", self.storageKey);
				//				console.log("self.openTime",self.openTime);
				Storage.Set(self.storageKey, self.openTime, 60 * 60 * 24 * 2);
			},
			checkOpen: function(cb) {
				self = this;
				//				console.log("self.openTime", self.openTime);
				if (self.openTime < 3) {
					self.openTime++;
					cb();
					self.save();
				} else {
					//					console.log("dFis");
				}
			}
		}
		var optmore = {
			closeTxt: "放弃订单",
			okTxt: "马上赠送",
			minisrc: "img/fu-pakage.png",
			okFn: function() {
				console.log("okFn");
			},
			closeFn: function() {
				console.log("closeFn");
			}
		};
		if (window.goTozengxianData) {
			optmore = PopMiniable.extend(optmore, window.goTozengxianData);
			mini = new PopMiniable(optmore);
			tool.init();
			$(document).ready(function() {
				//			d(JSON.stringify(appBridge, null, 4));
				//			d(appBridge && appBridge.checkAppFeature('SHARING_AWARE'));
				if (appBridge && appBridge.checkAppFeature('SHARING_AWARE')) {
					//				d("before on");
					appBridge.onSharingDone(function(sharingResult) {
						//					d("in on")
						//					d(sharingResult);
						tool.checkOpen(function() {
							mini.open();
						});
						//					d("out on")
					});
					//				d("after on");
				} else {
					//				var info = "Need appBridge, and SHARING_AWARE, local testing !";
					//				console.log(info);
					//				d(info);
					//				mini.open();
					//					tool.checkOpen(function() {
					//						mini.open();
					//					});
				}
			});
		}
	})(HL.Cookie, window.global);
});
//if (location.hostname != "192.168.4.54") {
//	location.href = "http://192.168.4.54:3088/pop-miniable/src/test-pop-miniable.html";
//}