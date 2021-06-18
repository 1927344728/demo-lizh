
const path = require("path");
console.log(process.env)
module.exports = {
  style: {
  	sass: {
  		loaderOptions: {
      	additionalData:  '$my-color: cyan;'
  		}
  	},
    postcss: {
      plugins: [
	      require('postcss-px2rem-exclude')({
		      remUnit: 16,
		      exclude: /node_modules|folder_name/i
		    })
      ]
    },
  },
  eslint: {
      enable: true,
      mode: "extends",
      configure: {
        extends: [
          "react-app",
          "react-app/jest"
        ],
        rules: {
          'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
        },
      },
      pluginOptions: {
      },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, "src")
    }
  },
}