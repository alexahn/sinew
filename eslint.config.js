import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	{
		ignores: [],
	},
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	pluginJs.configs.recommended,
	{
		rules: {
			"no-unexpected-multiline": "off",
			"no-unused-vars": "off",
			"no-undef": "off",
			"no-empty": "off",
		},
	},
];
