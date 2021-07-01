module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
	  [
		  "component", {
			  "libraryName": "bxs-ui-vue",
			  "libDir": 'esm',
			  "style": "index.css"
		  }, "bxs-ui-vue"
	  ]
	]
}
