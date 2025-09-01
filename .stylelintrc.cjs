module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-use-variable"],
  rules: {
    "color-named": "never",
    "color-no-hex": true,
    "scale-unlimited/declaration-strict-value": [
      ["/color/", "fill", "stroke", "background", "border-color"],
      {
        "ignoreValues": ["transparent", "currentColor", "inherit", "initial", "unset", "var\\(.+\\)"]
      }
    ]
  }
}
