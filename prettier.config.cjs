/** @type {import("prettier").Config | import("@ianvs/prettier-plugin-sort-imports").PluginConfig} */
const config = {
    plugins: [require("@ianvs/prettier-plugin-sort-imports")],
    printWidth: 120,
    tabWidth: 4,
    importOrder: [
        "@yin/common/src/sourceMap",
        "^(react/(.*)$)|^(react$)",
        "^(next/(.*)$)|^(next$)",
        "<THIRD_PARTY_MODULES>",
        "",
        "^types$",
        "^@/types/(.*)$",
        "^@/config/(.*)$",
        "^@/lib/(.*)$",
        "^@/components/(.*)$",
        "^@/styles/(.*)$",
        "^@/(.*)$",
        "^[./]",
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderBuiltinModulesToTop: true,
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderMergeDuplicateImports: true,
    importOrderCombineTypeAndValueImports: true,
};

module.exports = config;
