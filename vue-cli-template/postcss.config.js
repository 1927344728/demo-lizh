module.exports = {
  plugins: {
    "postcss-import": {
      "path": "src/assets/css"
    },
  	'postcss-preset-env': {
  	    features: {
  	        'custom-properties': {
  	            preserve: false,
  	            variables: {}
  	        },
  	        'nesting-rules': true
  	    }
  	},
    // "postcss-mixins": {},
    "postcss-apply": {},
    'postcss-px2rem-exclude': {
        'remUnit': 16
    }
  }
}
