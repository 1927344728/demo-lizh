// https://my-files-1259410276.cos.ap-chengdu.myqcloud.com/md/images/js/image-20200803225915556.png
let Utils = {
	getUrlParam: name => {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
		let r = window.location.search.substr(1).match(reg)
		if (r != null) {
			return decodeURIComponent(r[2])
		}
		return null
	},
	ready: () => {
    return new Promise((resolve, reject) => {
      let type = Utils.getUrlParam('type') * 1 || 1
      if (
        document.readyState === "complete" ||
        (document.readyState !== "loading" && !document.documentElement.doScroll)
      ) {
        Array.prototype.slice.apply(document.querySelectorAll('section')).map((ele, i) => {
          ele.style.display = i === type - 1 ? 'block' : 'none'
        })
        resolve(type)
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          Array.prototype.slice.apply(document.querySelectorAll('section')).map((ele, i) => {
            ele.style.display = i === type - 1 ? 'block' : 'none'
          })
          resolve(type)          
        })
      } 
    })
	}
}
window.Utils = Utils