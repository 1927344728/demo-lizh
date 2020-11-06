import MD5 from 'md5'
import CryptoJS from 'crypto-js'

export function createMd5Token (reqData) {
	const personList = reqData.personData.personOrderList

	const signInfo = {
		insuranceTypeId: reqData.insuranceTypeId,
		insuredAge: personList[0].age * 1,
		insuredSex: personList[0].sex * 1,
	}
	if (personList[1]) {
		signInfo.applicantAge = isNaN(personList[1].age * 1) ? 0 : personList[1].age * 1
		signInfo.applicantSex = isNaN(personList[1].sex * 1) ? 0 : personList[1].sex * 1
	}


	let productKeys = []
	let insuranceKeys = []
	let prodOrderList = reqData.productGroupList[0].prodOrderList.slice()
	prodOrderList && prodOrderList.map(prod => {
		productKeys.push(prod.key)
		prod.mulInsOrderList.map(ins => {
			insuranceKeys.push(ins.key)
		})
	})


	signInfo.product = ''
	signInfo.insurance = ''

	productKeys.sort((a,b) => a - b)
	productKeys.map(ele => {
		signInfo.product += `p=${ele};`
	})

	insuranceKeys.sort((a,b) => a - b)
	insuranceKeys.map(ele => {
		signInfo.insurance += `i=${ele};`
	})

	signInfo.params = JSON.stringify(reqData)


	let signInfoTx = ''
	for(let k in signInfo) {
		signInfoTx += `${k}=${signInfo[k]}&`
	}

	delete signInfo.params

	// console.log(signInfoTx)
	// console.log(MD5(signInfoTx))
	// console.log(JSON.stringify({
	// 	...signInfo,
	// 	signMd5: MD5(signInfoTx)
	// }))


	return CryptoJS.AES.encrypt(JSON.stringify({
		...signInfo,
		signMd5: MD5(signInfoTx)
	}), CryptoJS.enc.Utf8.parse('1234567890123456'), {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	}).toString() || MD5(signInfoTx) || '20190929'
}