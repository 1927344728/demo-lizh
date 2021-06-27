const path = require("path");
module.exports = {
  style: {
  	sass: {
  		loaderOptions: {
      	additionalData:  "$my-color: cyan;"
  		}
  	},
    postcss: {
      plugins: [
        require("postcss-import")({
          "path": "src/assets/css"
        }),
        require("postcss-preset-env")({
          features: {
            "custom-properties": {
              preserve: false,
              variables: {}
            },
            "nesting-rules": true
          }
        }),
        require("postcss-apply")({}),
        require("postcss-css-variables")({}),
	      require("postcss-px2rem-exclude")({
		      remUnit: 16,
		      exclude: /node_modules|folder_name/i
		    }),
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
          "no-console": process.env.NODE_ENV === "production" ? 0 : 1,
        },
      },
      pluginOptions: {
      },
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
}