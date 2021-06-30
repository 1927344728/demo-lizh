/*
 * @Description: 
 * @Author: lizhao
 * @Date: 2020-11-13 10:50:15
 * @LastEditors: lizhao
 * @LastEditTime: 2020-11-24 19:19:04
 * @FilePath: /bxs-tools-ui/packages/planbook-input/helper.js
 */
import {
  initPersonData,
  personDataHandler,
  convertPersonData,
  initProductData,
  productDataHandler,
  convertProductData,
  verifyProductRules,
  convertEleOrderListToObj
} from 'bxs-tools-ui/lib/utils.js'
import { createMd5Token } from './md5Token.js';

export function initPageData(data) {
  let inputData = data && data.initData && data.initData.inputData;
  if (inputData) {
    initPersonData(inputData, data.verifyData);
    personDataHandler(inputData.personData);
    let productGroupList = inputData.productGroupList;
    if (productGroupList && productGroupList.length) {
      productGroupList.forEach(group => {
        if (group.prodOrderList) {
          group.prodOrderList.forEach(prod => {
            initProductData(prod);
            productDataHandler(
              prod,
              data.verifyData[prod.key],
              convertPersonData(
                inputData.personData,
                inputData.personData.personOrderList.map(p => p.key)
              )
            );
          });
        }
      });
    }
  }
  return data;
}
export function setPageDataBaseOnResult(data) {
  if (!data) {
    return data;
  }
  let inputData = data.initData && data.initData.inputData;
  let exportData = data.exportData ? JSON.parse(data.exportData) : null;
  if (inputData && exportData) {
    // 人员信息赋值
    let iPersonData = inputData.personData;
    let ePersonData = exportData.personData;
    if (iPersonData && ePersonData) {
      for (let k in iPersonData) {
        if (k == 'personOrderList' && ePersonData[k]) {
          iPersonData[k].forEach((person, pi) => {
            person.eleOrderList &&
              person.eleOrderList.forEach(ele => {
                if (
                  ePersonData[k][pi] &&
                  ePersonData[k][pi][ele.key] !== undefined &&
                  ePersonData[k][pi][ele.key] !== null
                ) {
                  ele.value = ePersonData[k][pi][ele.key];
                }
              });
          });
        }
        if (k == 'recipientInfo' && ePersonData[k]) {
          iPersonData[k].eleOrderList &&
            iPersonData[k].eleOrderList.forEach(ele => {
              if (iPersonData[k][ele.key]) {
                ele.value = ePersonData[k][ele.key];
              }
            });
        }
      }
    }

    // 产品赋值
    let iGroupList = inputData.productGroupList;
    let eGroupList = exportData.productGroupList;
    if (iGroupList && eGroupList) {
      iGroupList.forEach((group, gi) => {
        let eGroupData = eGroupList[gi];
        if (eGroupData && group.prodOrderList) {
          group.prodOrderList.forEach(prod => {
            let eProductData = eGroupData.prodOrderList.find(
              p => p.key === prod.key
            );
            if (eProductData) {
              // 取调整保额数据
              if (eProductData.adjustBaoeData) {
                prod.adjustBaoeData = eProductData.adjustBaoeData;
              }
              prod.inputResultSwitch = !!eProductData.inputResultSwitch;
              prod.resultImport = true;
              // 已生成的计划书取回的产品数据，赋值到初始化中的产品对象中
              for (let k in prod) {
                if (k == 'mulInsOrderList') {
                  // 已生成的计划书取回的险种数据，赋值到初始化中的险种对象中
                  prod.mulInsOrderList.forEach(ins => {
                    let eInsuranceData = eProductData.mulInsOrderList.find(
                      m => m.key === ins.key
                    );
                    if (eInsuranceData) {
                      if (ins.eleOrderList) {
                        // 下为处理从结果页中导入数值时，保额保费互算问题 2018.12.11
                        let calMethod = ins.eleOrderList.find(
                          e => e.key === 'calMethod'
                        );
                        let baoe = ins.eleOrderList.find(e => e.key === 'baoe');
                        let baof = ins.eleOrderList.find(e => e.key === 'baof');
                        if (
                          calMethod &&
                          baoe &&
                          baof &&
                          eInsuranceData.calMethod
                        ) {
                          baoe.isHide =
                            eInsuranceData.calMethod !== 'baoe2baof';
                          baof.isHide =
                            eInsuranceData.calMethod === 'baoe2baof';
                        }
                        ins.eleOrderList.forEach(ele => {
                          if (eInsuranceData[ele.key]) {
                            ele.value = eInsuranceData[ele.key];
                          }
                        });
                      }
                      if (eInsuranceData.inputResult !== undefined) {
                        ins.inputResult = eInsuranceData.inputResult;
                      }

                      // 万能账户存在，可以不加追加领取数据
                      for (let ik in ins) {
                        if (['reduceBaof'].indexOf(ik) !== -1) {
                          if (eInsuranceData[ik + 'Data']) {
                            ins[ik + 'Data'] = eInsuranceData[ik + 'Data'];
                          }
                        }
                      }
                    } else {
                      // 结果页数据中没有对应险种，对应的初始化数据置为未选中
                      if (ins.eleOrderList) {
                        ins.eleOrderList.forEach(ele => {
                          if (ele.key == 'title') {
                            ele.value = false;
                          }
                        });
                      }
                    }
                  });
                }
              }
            }
          });
        }
      });
    }
  }
  return initPageData(data);
}

export function createdProductDataToCalc(inputData, options = {}) {
  if (
    inputData &&
    inputData.personData &&
    inputData.productGroupList &&
    inputData.productGroupList.length
  ) {
    let productData = getProductFromInputData(inputData, {
      groupKey: options.groupKey,
      productKey: options.productKey
    });
    let productForm = convertProductData(productData);
    // 产品是否有选中的险种
    if (
      productForm &&
      productForm.mulInsOrderList &&
      productForm.mulInsOrderList.length
    ) {
      let errorMsg = verifyProductRules({
        personOrderList: convertPersonData(
          inputData.personData,
          inputData.personData.personOrderList.map(p => p.key)
        ),
        productData
      });

      // 清除产品中的一些不必要的数据
      productForm.insShowArr = null;
      productForm.mulInsOrderList.forEach(ins => {
        if (ins.shmInsData) {
          delete ins.shmInsData;
        }
      });
      if (options.type !== 'autoImport') {
        productForm.adjustBaoeData = null;
        productForm.mulInsOrderList.forEach(ins => {
          if (ins.accountData) {
            ins.accountData.addAndTakeData = [];
          }
          if (ins.reduceBaofData) {
            ins.reduceBaofData = [];
          }
        });
      }

      let reqData = {
        insuranceTypeId: options.planbookId ? options.planbookId * 1 : null,
        personData: convertPersonData(inputData.personData),
        productGroupList: [
          {
            key: options.groupkey,
            prodOrderList: [productForm] //转换后的产品数据
          }
        ]
      };
      return Promise.resolve({
        errorMsg,
        jd: JSON.stringify(reqData),
        signature: createMd5Token(reqData, {
          groupDataKey: options.groupKey
        })
      });
    } else {
      return Promise.reject('请选择险种');
    }
  } else {
    return Promise.reject('请填写投保数据');
  }
}

export function receiveProductData(inputData, rProductData, options = {}) {
  let productData = getProductFromInputData(inputData, options);
  rProductData.mulInsOrderList.forEach(ins => {
    let insuranceData = productData.mulInsOrderList.find(
      i => i.key === ins.key
    );
    if (insuranceData) {
      if (ins.huomian === 'shm_spouse') {
        insuranceData.shmInsData = ins;
      } else {
        //将返回来的险种数据，赋值到现在数据中
        for (let k in ins) {
          if (insuranceData.eleOrderList.some(e => e.key === k)) {
            insuranceData.eleOrderList.forEach(e => {
              if (ins[e.key] !== undefined) {
                e.value = ins[e.key];
              }
            });
          } else {
            insuranceData[k] = ins[k];
          }
        }
      }
    }
  });
  productData.mulInsOrderList.forEach(ins => {
    if (ins.isGroup) {
      let groupInsData = convertEleOrderListToObj(ins);
      let insuranceId = groupInsData.isCheckbox
        ? groupInsData.insuranceId[0]
        : groupInsData.insuranceId;
      let checkedIns = productData.mulInsOrderList.find(
        i => i.key === insuranceId
      );
      for (let key in checkedIns) {
        if (
          [
            'allowSamePerson',
            'code',
            'eleOrderList',
            'groupKey',
            'groupName',
            'huomian',
            'key',
            'name'
          ].indexOf(key) === -1
        ) {
          ins[key] = checkedIns[key];
        }
      }
    }
  });

  let hasSomeCheckedIns = rProductData.mulInsOrderList.some(ins => ins.title);
  productData.hadChoice = hasSomeCheckedIns;
  productData.totalBaof = hasSomeCheckedIns ? rProductData.totalBaof : null;
  // ??
  productData.companyName = rProductData.companyName;

  let insShowArr;
  if (rProductData.insShowArr) {
    insShowArr = rProductData.insShowArr;
  } else if (hasSomeCheckedIns) {
    insShowArr = [['险种', '保额', '保费', '交费期']];
    rProductData.mulInsOrderList.forEach(function(ins) {
      if (ins.title && !ins.resultFormulaRef) {
        insShowArr.push([
          ins.name,
          ins.showPlanDesc ? ins.planDesc : ins.baoeDesc || '-',
          ins.baofDesc === 0 || ins.baofDesc === '0' || ins.baofDesc
            ? ins.baof
            : '-',
          ins.pPeriodDesc
        ]);
      }
    });
  }
  productData.insShowArr =
    insShowArr && insShowArr.length > 1 ? insShowArr : null;
  return productData;
}

export function defaultProductData(eleOrderList) {
  let timeStamp = new Date().getTime();
  return {
    key: timeStamp,
    titleName: '待完善险种',
    policyType: 'manual_insurance',
    mulInsOrderList: [
      {
        eleOrderList: eleOrderList,
        key: timeStamp,
        title: true
      }
    ],
    liabilityOrderList: [],
    companyId: null,
    hide: false,
    trade: false,
    companyName: '',
    autoImport: false,
    liabilityShowType: 0,
    required: false
  };
}

export function createPlanbookDataToMake(planbookData = {}, options = {}) {
  let inputData =
    planbookData && planbookData.initData && planbookData.initData.inputData;
  let productGroup =
    inputData.productGroupList && inputData.productGroupList[0];
  let hadChoiceProducts =
    productGroup &&
    productGroup.prodOrderList &&
    productGroup.prodOrderList.some(ele => !!ele.hadChoice && !ele.hide);
  if (hadChoiceProducts) {
    let resultData = {
      ...options,
      companyId: inputData.companyId,
      recordSetting: inputData.recordSetting,
      personData: convertPersonData(inputData.personData),
      productGroupList: [],
      theme: inputData.theme,
      commonData: inputData.commonData,
      displayFormatSort: inputData.displayFormatSort,
      categorySort: inputData.categorySort,
      title: inputData.title || document.title,
      videoTypeKey: planbookData.videoTypeKey
    };

    inputData.productGroupList.forEach(group => {
      let reqProductGroup = {
        key: group.key,
        prodOrderList: []
      };
      group.prodOrderList.forEach(prod => {
        if (!!prod.hadChoice && !prod.hide) {
          prod.mulInsOrderList.forEach((ins, iIdx, arr) => {
            // 结果页需要显示的数据
            ins.eleOrderInResult = [];
            let refInsuranceData;
            //refInsuranceId: -1，关联主险；-2，关联险种自身
            if (ins.refInsuranceId && ins.refInsuranceId != -2) {
              if (ins.refInsuranceId == -1) {
                refInsuranceData = arr[arr[0].key == 'common' ? 1 : 0];
              } else {
                refInsuranceData = arr.find(e => e.key === ins.refInsuranceId);
              }
            }
            if (
              refInsuranceData &&
              refInsuranceData.eleOrderList &&
              ins.eleOrderList
            ) {
              ins.eleOrderList.forEach(ele => {
                let refElementData = refInsuranceData.eleOrderList.find(
                  e => e.key === ele.key
                );
                if (
                  ['title', 'calMethod', 'customRate', 'company'].indexOf(
                    ele.key
                  ) === -1 &&
                  (!ele.isHide ||
                    (ele.isHide &&
                      !ele.isDisabled &&
                      refElementData &&
                      !refElementData.isHide))
                ) {
                  ins.eleOrderInResult.push({
                    value: ele.key,
                    label: ele.labelName
                  });
                }
              });
            }
          });

          let productData = convertProductData(prod);
          productData.mulInsOrderList.forEach(ins => {
            if (
              ins.huomian == 'shuangHuomian' &&
              ins.shmInsData &&
              ins.shmInsData.title
            ) {
              productData.mulInsOrderList.push(ins.shmInsData);
            }
          });
          reqProductGroup.prodOrderList.push(productData);
        }
      });
      resultData.productGroupList.push(reqProductGroup);
    });
    return resultData;
  } else {
    return;
  }
}

export function getProductFromInputData(inputData, options = {}) {
  let product = null;
  if (inputData.productGroupList && inputData.productGroupList.length) {
    let groupData = inputData.productGroupList.find(
      g => g.key === options.groupKey
    );
    product =
      groupData &&
      groupData.prodOrderList &&
      groupData.prodOrderList.find(p => p.key === options.productKey);
  }
  return product;
}
