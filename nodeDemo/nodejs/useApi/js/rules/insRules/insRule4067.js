//函数: 过滤数组
//参数：arr, 需要过滤的数组
//     key, arr子元素的key
var filterArr = function (arr, key) {
    return arr && arr.filter(function (ele) {
        return ele.key == key
    })[0]
}

var verifyRules = window.verifyRules || {}
verifyRules.validator = {
}

verifyRules.changeFn  = {
    rule16642Baoe: function (me, inputData){
        var insData1 = filterArr(me.productData.mulInsOrderList, "16642" )

        var element1 = filterArr(insData1.eleOrderList, "baoe" )
        var insuredData = inputData.personData.personOrderList[0]
        var age = filterArr(insuredData.eleOrderList, "age" )

        var errorMsg = ''
        if (age.value >= 0 && age.value <= 17 && element1.value  * 1 > 200){
            errorMsg = "0-17岁, 日额不得大于200"
        } else if (age.value >= 18 && age.value <= 50 && element1.value  * 1 > 500){
            errorMsg = "18-50岁, 日额不得大于500"
        }
        return errorMsg
    }
}

window.verifyRules = verifyRules;
