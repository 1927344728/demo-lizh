module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
	  [
		  "component", {
			  libraryName: "bxs-ui-vue",
			  style: "index.css"
		  }, "bxs-ui-vue"
	  ],
	  [
		  "component", {
			  libraryName: "bxs-tools-ui",
			  style: "index.css"
		  }, "bxs-tools-ui"
	  ]
	]
}
