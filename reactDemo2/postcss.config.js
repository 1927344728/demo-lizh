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
    "postcss-mixins": {},
    'postcss-px2rem-exclude': {
        'remUnit': 32
    },
    'postcss-flexbugs-fixes': {},
    'autoprefixer': {
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9', // React doesn't support IE8 anyway
      ],
      flexbox: 'no-2009',
    }
  }
}
