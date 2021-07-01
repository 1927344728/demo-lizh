import CompareVersions from 'compare-versions'
import IDValidator from 'id-validator'
import GB2260 from 'id-validator/src/GB2260'

import {
  IS_PRODUCT,
  SAFE_AREA_INSET_BOTTOM,
  URL_PARAM
} from './variables'

export * from './variables'
export * from './url'

export function getTimeStr(time) {
	let second = Math.round((new Date() - time) / 1000)
	if (second < 60) {
		return `${second}秒前`
	} else if (second >= 60 && second < 60 * 60) {
		return `${Math.round(second / 60)}分钟前`
	} else if (second >= 60 * 60 && second < 60 * 60 * 24) {
		return `${Math.round(second / 60 / 60)}小时前`
	} else if (second >= 60 * 60 * 24 && second < 60 * 60 * 24 * 30) {
		return `${Math.round(second / 60 / 60 / 24)}天前`
	}
}

export function numberToChinese(number) {
	var units = '个十百千万@#%亿^&~';
	var chars = '零一二三四五六七八九';
	var a = (number + '').split(''),
		s = [],
		t = this;

	if (a.length > 12) {
		throw new Error('too big');
	} else {
		for (var i = 0, j = a.length - 1; i <= j; i++) {
			if (j == 1 || j == 5 || j == 9) { // 两位数 处理特殊的 1*
				if (i == 0) {
					if (a[i] != '1') 
						s.push(chars.charAt(a[i]));
					
				} else {
					s.push(chars.charAt(a[i]));
				}
			} else {
				s.push(chars.charAt(a[i]));
			}
			if (i != j) {
				s.push(units.charAt(j - i));
			}
		}
	}
	return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) { // 优先处理 零百 零千 等
		b = units.indexOf(d);
		if (b != -1) {
			if (d == '亿') 
				return d;
			
			if (d == '万') 
				return d;
			
			if (a[j - b] == '0') 
				return '零'
			
		}
		return '';
	}).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) { // 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
		return b;
	}).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
		return {
			'@': '十',
			'#': '百',
			'%': '千',
			'^': '十',
			'&': '百',
			'~': '千'
		}[m];
	}).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
		c = units.indexOf(d);
		if (c != -1) {
			if (a[j - c] == '0') 
				return d + '零' + b
			
		}
		return m;
	});
}

export function WeiyiStatSDKInit({
	pageId = '',
	isProduct = IS_PRODUCT, // [必填] false: 测试环境、true: 正式环境
	heartBeatRate = 1000,
	projectInfo = {
		url: location.href
	},

	// 以下参数为错误上报专用参数
	Vue, // 可选, 也可前置 window.Vue = Vue 来代替
	name = process.env.PKG_NAME, // 必选, package.json 中的 name
	version = process.env.PKG_VERSION // 必选, package.json 中的 version
}) {
	window.WeiyiStatSDK && window.WeiyiStatSDK.init({
		pageId,
		isProduct, // [必填] false: 测试环境、true: 正式环境
		heartBeatRate,
		projectInfo,

		// 以下参数为错误上报专用参数
		Vue, // 可选, 也可前置 window.Vue = Vue 来代替
		name, // 必选, package.json 中的 name
		version, // 必选, package.json 中的 version
	})
}

export function gotoLogin() {
  if (window.appBridge && appBridge.checkAppFeature('APP_VIEW')) {
	appBridge.gotoAppView('login')
  } else if (URL_PARAM.isMiniprogram) {
	window.wx && wx.miniProgram.navigateTo({ url: '/pages/index/index' })
  } else {
	window.location.href = `https://app.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}/user/login?requestUrl=${encodeURIComponent(location.href)}`
  }
}

export function parseTime(time, cFormat) {
	if (arguments.length === 0) {
		return null;
	}
	const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
	let date;
	if (time === null) {
		return;
	} else if (typeof time === 'object') {
		date = time;
	} else {
		if (('' + time).length === 10) 
			time = parseInt(time) * 1000;
		
		date = new Date(time);
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	};
	const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key];
		if (key === 'a') {
			return [
				'日',
				'一',
				'二',
				'三',
				'四',
				'五',
				'六',
			][value];
		}
		if (result.length > 0 && value < 10) {
			value = '0' + value;
		}
		return value || 0;
	});
	return timeStr;
}

export function getAgeFromBirth (birth, cDate) {
	var nowDate = cDate? (new Date(cDate)) : (new Date())
	var bDate   = new Date(birth)
	var age     = nowDate.getFullYear() - bDate.getFullYear()
	if (nowDate.getMonth() - bDate.getMonth() < 0 || (nowDate.getMonth() - bDate.getMonth() === 0 && nowDate.getDate() - bDate.getDate() < 0) ) {
		age --
	}
	return age
}

export function deepCopy(obj, hash = new WeakMap()) {
	if (! obj || typeof obj !== 'object') {
		return obj;
	}
	if (hash.has(obj)) {
		return hash.get(obj);
	}
	let newObj;
	let Constructor = obj.constructor;
	switch (Constructor) {
		case RegExp: newObj = new Constructor(obj);
			break;
		case Date: newObj = new Constructor(obj.getTime());
			break;
		default: newObj = new Constructor();
			break;
	}

	hash.set(obj, newObj);
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key], hash) : obj[key];
		}
	}

	return newObj;
}

// 身份证校验
export const idVlidator = new IDValidator(GB2260)
let positionTop = 0
export function stopBodyScroll  (isFixed) {
	if (document) {
		var bodyEl = document.body
		if (isFixed) {
			positionTop = window.scrollY
	
			bodyEl.style.position = 'fixed'
			bodyEl.style.top = -positionTop + 'px'
			document.documentElement.style.height = (window.innerHeight + SAFE_AREA_INSET_BOTTOM) + 'px'
		} else {
			bodyEl.style.position = ''
			bodyEl.style.top = ''
			document.documentElement.style.height = ''
	
			window.scrollTo(0, positionTop) // 回到原先的top
		}
	}
}


/**
 * 修改网页标题（包括移动端原生标题栏）
 */
export function setDocumentAndViewportTitle (title) {
	document.title = title
	if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')){
	  appBridge.changeWebviewTitle(document.title);
	}
}

/**
 * 设置根节点大小
 */
export function setHTMLFontSize() {
	let baseFontSize = 16
	let realFontSize = Math.min(baseFontSize * document.documentElement.clientWidth / 375, baseFontSize * 2)
	document.documentElement.style.fontSize = `${realFontSize}px`
	window.onresize = () => {
	  document.documentElement.style.fontSize = `${realFontSize}px`
	}
}

/**
 * IOS 12以上，(app4.6.0或者 app.4.8及以上版本)或者(微信)中元素错位问题
 */
export function fixedViewportOffset () {
	//IOS 12以上，(app4.6.0或者 app.4.8及以上版本)或者(微信)中元素错位问题
	let iosVersion = navigator.userAgent.toLowerCase().match(/cpu iphone os ((\d*)_(.*)?) like mac os/)
	if (iosVersion && iosVersion[2] && iosVersion[2] >= 12) {
		let sAppVersion = appBridge && appBridge.isApp() && Jax && Jax.getAppVersion()
		if ((sAppVersion && (CompareVersions(sAppVersion, '4.6.0') === 0 || CompareVersions(sAppVersion, '4.8.0') > 0)) || appBridge.isWechat()) {
			document.body.addEventListener('blur', function (e) {
				if (["TEXTAREA", "INPUT", "SELECT"].indexOf(e.target.tagName) !== -1) {
					setTimeout( function () {
						window.scrollTo(0, document.documentElement.scrollTop || document.body.scrollTop);
					}, 100)
				}
			}, true)
		}
	}
}

export function initBasicConfig (options = {}) {
	setHTMLFontSize()
	fixedViewportOffset()
  if (options.statSDKPageId) {
    WeiyiStatSDKInit({
      pageId: options.statSDKPageId
    })
  }
	if (options.documentTitle) {
		setDocumentAndViewportTitle(options.documentTitle)
	}
	if (options.pageWrapperDom) {
		options.pageWrapperDom.style.minHeight = window.innerHeight + SAFE_AREA_INSET_BOTTOM + 'px'
	}
}

let areaValues = {}
export async function getSafeAreaInsetValues (param) {
	let ALL_VALUES = ['top', 'right', 'bottom', 'left']
	if (typeof param === 'string' && ALL_VALUES.indexOf(param) === -1) {
		return `参数错误！可不传，或者传[${ALL_VALUES.join('|')}]中的一个（字符串）或多个（数组）`
	}

	let values = [param]
	for (let k of values) {
		let tempDom =  document.createElement('div')
		tempDom.style.paddingBottom = 'constant(safe-area-inset-bottom, 0)'
		tempDom.style.paddingBottom = 'env(safe-area-inset-bottom, 0)'
		tempDom.style.background = '#0aa'
		tempDom.style.height = 'env(safe-area-inset-bottom, 0)'
		document.body.append(tempDom)
		areaValues.bottom = await new Promise((resolve) => {
			setTimeout(() => {
				tempDom.innerHTML = getComputedStyle(tempDom).paddingBottom
				return resolve(getComputedStyle(tempDom).paddingBottom)
			})
		})
	}
	if (typeof param === 'string') {
		return areaValues[param]
	}
	return areaValues
}
export function aa () {
	const css = document.createElement("style");
	css.type = "text/css";
	css.textContent = `
		@supports (padding-top: env(safe-area-inset-top)) {
			html {
				--safe-area-inset-top: env(safe-area-inset-top);
				--safe-area-inset-right: env(safe-area-inset-right);
				--safe-area-inset-bottom: env(safe-area-inset-bottom);
				--safe-area-inset-left: env(safe-area-inset-left);
			}
		}
	`;
	document.head.appendChild(css);
	
	const getSafeAreaInsetValue = () => {
		const styles = getComputedStyle(document.documentElement);
		const get = key =>
			parseFloat(styles.getPropertyValue(`--safe-area-inset-${key}`).trim(), 10);
		return {
			top: get("top"),
			right: get("right"),
			bottom: get("bottom"),
			left: get("left")
		};
	};
	
	let lastValue = "";
	let lastTime = Date.now();
	let values = [];
	const updateValues = () => {
		const value = `${JSON.stringify(getSafeAreaInsetValue(), null, "").replace(
			/"/g,
			""
		)}`;
		if (value !== lastValue) {
			const now = Date.now();
			values.push(`${value} ${now - lastTime}ms`);
			values = values.slice(-100);
			lastTime = now;
			lastValue = value;
		}
	};
	
	const printValues = () => {
		updateValues();
		const log = document.querySelector("#log");
		if (log) {
			log.textContent = values.join("\n");
			log.scrollTop = log.scrollHeight;
		}
	};
	
	window.onload = window.onresize = onscroll = updateValues;
	
	printValues();
	requestAnimationFrame(function loop() {
		printValues();
		requestAnimationFrame(loop);
	});
	
}

let a = getSafeAreaInsetValues('bottom')
console.log(a)

function getSafeArea() {
	var result, computed, div = document.createElement('div');

	div.style.padding = 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
	document.body.appendChild(div);
	computed = getComputedStyle(div);
	result = {
		top: parseInt(computed.paddingTop) || 0,
		right: parseInt(computed.paddingRight) || 0,
		bottom: parseInt(computed.paddingBottom) || 0,
		left: parseInt(computed.paddingLeft) || 0
	};
	document.body.removeChild(div);

	return result;
}

let b = getSafeArea(); // return { top: 0, right: 44, bottom: 21, left: 44 }
debugger

export default {
	getTimeStr,
	numberToChinese,
	WeiyiStatSDKInit,
	gotoLogin,
	parseTime,
	deepCopy,
	stopBodyScroll,
	setHTMLFontSize,
	fixedViewportOffset,
	initBasicConfig
}
