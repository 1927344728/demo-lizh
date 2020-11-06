<template>
	<div class="posRelative checkboxDiv clearFloat">
		<div class="checkboxContentDiv" v-if="opts.length == 1">   <!-- 多选框只有一个选项时 -->
			<div class="checkboxEleDiv" :key="opt" v-for="(opt, idx) in opts" v-if="!opt.isHide">
				<label :class="opt.isDisabled && !eleData.value?'disabled':''"
				:for="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val" class="checkboxForLabel">{{opt.desc}}</label>
				<label class="checkboxRadioLabel floatRight">
					<input
					:id="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val"
					type="checkbox"
					v-model.number="eleData.value"
					:disabled="opt.isDisabled?true:null"
					v-if="!opt.isHide"
					@change="onchange"
					>
					<i class="iconfont" :style="opt.isDisabled && eleData.value ? 'color: #D2DFFE;' : ''" :class="[isDisabled?'disabled':'', eleData.value ? 'icon-choose_done_surface':'icon-choose_none_line']"></i>
				</label>
			</div>
		</div>

		<div class="checkboxContentDiv" v-else>   <!-- 多选框只有多个选项时 -->
			<div class="checkboxEleDiv" :key="opt" v-for="(opt, idx) in opts" v-if="!opt.isHide">
				<label :class="opt.isDisabled && !eleData.value?'disabled':''"
				:for="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val" class="checkboxForLabel">{{opt.desc}}</label>
				<label class="checkboxRadioLabel floatRight">
					<input
					:id="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val"
					type="checkbox"
					v-model.number="eleData.value"
					:value="opt.val + ''"
					:disabled="opt.isDisabled?true:null"
					v-if="!opt.isHide"
					@change="onchange"
					>
					<i class="iconfont" :style="opt.isDisabled && eleData.value ? 'color: #D2DFFE;' : ''" :class="[isDisabled?'disabled':'', eleData.value.indexOf(opt.val) !== -1 ?'icon-choose_done_surface':'icon-choose_none_line']"></i>
				</label>
			</div>
		</div>

		<cm-validation :validation="$validation"></cm-validation>
	</div>
</template>

<script>
	import helperJs from '@/utils/helper'
	import cmValidation from './common_plato_validation.vue'

	export default {
		name: 'cmCommonCheckbox',
		data () {
			var ruleName = this.eleData.ruleName || ('rule' + this.insData.key + this.eleData.key.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase() }))
			var validate = Object.assign(helperJs.initValidateRules(this), (window.verifyRules && verifyRules.validator && verifyRules.validator[ruleName]) || {})

			return {
				validate,
				ruleName
			}
		},
		props: ['eleData', 'insData', 'productData'],
		validator: {
		// auto: true          // 初始化后自动检查
	},
	methods: {
		onchange () {
			this.$emit("changeEleData", this)
		}
	},
	computed: {
		value () {
			return this.eleData.value
		},
		opts () {
			let self = this
			let opts = self.eleData.opts
			if (self.eleData.value.constructor === Array) {
				// self.eleData.value = self.eleData.value.filter(function (val) {
				// 	return !opts.filter(function (opt) {
				// 		return opt.val == val
				// 	})[0].isDisabled
				// })
			} else {
				self.eleData.value = []
			}
			return opts
		},
		isDisabled () {
			return this.eleData.isDisabled
		}
	},
	components: {
		cmValidation
	}
}
</script>

<style scoped>
	@import 'variables.css';
	.checkboxDiv {
		& .checkboxContentDiv {
			vertical-align: middle;
			& .checkboxEleDiv {
				display:block;
				position: relative;
				padding: 20px 0;
				vertical-align: middle;
			}
			& .checkboxForLabel {
				display: inline-block;
				width: 90%;
				vertical-align: middle;
				margin-right: 24px;
			}
		}
	}

</style>
