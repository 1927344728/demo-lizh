<template>
    <div class="input_record_setting" v-if="recordSetting">
        <!-- 所选险种数据展示  -->
        <header class="record_setting_title">
            <span>语音设置</span>
            <hr>
        </header>
        <div class="record_setting_content">
          <label class="record_setting_label">声音</label>
          <div class="record_setting_radio">
            <bxs-radio-group v-model="recordSetting.voiceType">
              <bxs-radio type="button" :name="1">男声</bxs-radio>
              <bxs-radio type="button" :name="2">女声</bxs-radio>
            </bxs-radio-group>
          </div>
        </div>
    </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    export default {
        name: 'RecordSetting',
        components: {
        },
        data () {
            return {
                pBType,
                helperJs: helperJs
            }
        },
        props: {
            recordSetting: Object
        },
        created () {
        },
        mounted () {
        },
        methods: {
        },
        computed: {
        }
    }
</script>

<style scoped>
    @import 'variables.css';
    .input_record_setting {
        position: relative;
        margin: 18px auto 0;
        padding-bottom: 20px;
        background: #fff;
        border-radius: 8px;
        font-size: 26px;
        & .record_setting_title {
            position: relative;
            margin-top: 12px;
            padding: 18px 0 18px 30px;
            line-height: normal;
            & span {
                color: #333;
                font-size: 34px;
                font-weight: bold;
                vertical-align: middle;
            }
            & hr {
              position: absolute;
              top: 24px;
              left: 0;
              width: 8px;
              height: 30px;
              border: none;
              background-color: #508CEE;
            }
        }
        & .record_setting_content {
            padding: 0 30px;
            & .record_setting_label {
                display: inline-block;
                padding: 27px 0;
            }
            & .record_setting_radio {
                display: inline-block;
                line-height: normal;
                padding: 0 0 0.5rem;
                text-align: right;
                float: right;
            }
        }
    }

</style>

