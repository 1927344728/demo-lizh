<template>
    <div :style="{
        minHeight: `${window.innerHeight}px`
    }">
        <div>aaaab</div>
    </div>
</template>

<script>
import {
    getPlanBookInitData
} from '@/api/planbook'
export default {
    name: 'InputMain',
    components: {
    },
    data () {
        return {
            window
        }
    },
    props: ['allInputData'],
    created () {
        getPlanBookInitData({
            insuranceTypeId: planbookId
        }).then(res => {
            if (res.success && res.data) {
                document.title = res.data.title  //更新页面标题
                if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')){
                    appBridge.changeWebviewTitle(document.title);
                }
                /**
                 * @Author   Lizh
                 * @DateTime 2019-07-01
                 * 新增投被保人是否为同一人选项
                 */
                if ((!pBType || pBType === 'video' || pBType === 'record') && res.data.initData.inputData.personData && res.data.initData.inputData.personData.personOrderList) {
                    var personOrderList = res.data.initData.inputData.personData.personOrderList
                    personOrderList.map(function (person) {
                        if (person.key === 'applicantInfo') {
                            person.eleOrderList.splice(1, 0, {
                                key: 'applicantAndInsuredSame',
                                value: 0,
                                labelName: '投被保人是同一人',
                                componentName: 'cmInfoRadio',
                                opts: [
                                    { val: 0, desc: '否' },
                                    { val: 1, desc: '是' }
                                ]
                            })
                        }
                    })
                }

                if (pBType) {
                    helperJs.changeInitData(res.data, Vue, function () {
                        helperJs.getInitDataFromResult(res.data, Vue, function () {
                            helperJs.initStart(res.data, (iRes) => {
                                self.getStoreData(iRes)
                            })
                        })
                    })
                } else {
                    helperJs.getInitDataFromResult(res.data, Vue, function () {
                        helperJs.initStart(res.data, (iRes) => {
                                self.getStoreData(iRes)
                            })
                    })
                }
            }
        })
    },
    mounted () {

    },
    methods: {
    }
}
</script>


<style>
    @import 'variables.css';
</style>
