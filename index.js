const fs = require('fs');
const path = require('path');
const getSelectors = require('./get_selectors');

const FILES_REGEXP = /\.module.(css|scss|sass)$/;

/**
 * Generate an output typings file for given css content
 *
 * Use within a build tool in watch mode to re-generate typings on file changes
 *
 * @param {string} content CSS files content
 * @param {string} file File path to the original stylesheet
 * @example
 * // Webpack config
 * const genCssTypings = require('css-modules-typescript-generator')({});
 *
 * module.exports = {
 *   module: {
 *     rules: [
 *       {
 *         test: /\.s[ac]ss$/i,
 *         use: [
 *           'style-loader',
 *           'css-loader',
 *           {
 *             loader: 'sass-loader',
 *             options: {
 *               sassOptions: {
 *                 // The additionalData callback function will be run for each changed
 *                 // Stylesheet upon save in webpack watch mode
 *                 additionalData: (content, { resourcePath }) => {
 *                   genCssTypings(content, resourcePath);
 *                   return null;
 *                 },
 *               },
 *             },
 *           }
 *         ],
 *       }
 *     ],
 *   },
 * };
 */
async function genCssTypings(content, file) {
    if (file.match(FILES_REGEXP) === null) return;
    const selectors = getSelectors(content, file);
    let outData = '// AUTO-GENERATED\ninterface CSSExports {';
    for (const selector of selectors) outData += ` '${selector}': string;`;
    outData += ' }\nexport const exports: CSSExports;\nexport default exports;';
    try {
        // Format with prettier if available
        const prettier = require('prettier');
        const options = await prettier.resolveConfig(process.cwd());
        outData = prettier.format(outData, {
            ...options,
            parser: 'typescript',
        });
    } catch (err) {}
    const outFile = `${file}.d.ts`;
    fs.writeFile(outFile, outData, (err) => {
        if (err) console.error(err);
    });
}

/**
 * Generate typings for all valid files in a directory
 * @param {string} srcDir Root directory to search for stylesheets
 * @param {string | RegExp} excludeDirs Directories to not search
 */
function genTypingsFromDir(srcDir, excludeDirs) {
    if (excludeDirs && srcDir.match(excludeDirs) !== null) return;
    const files = fs.readdirSync(srcDir);
    files.forEach((fileName) => {
        const file = path.join(srcDir, fileName);
        if (!fs.existsSync(file)) throw new Error(`File ${file} no longer exists`);
        if (fs.lstatSync(file).isDirectory()) genTypingsFromDir(file, excludeDirs);
        else if (fileName.match(FILES_REGEXP) !== null) {
            const content = fs.readFileSync(file, {
                encoding: 'utf-8',
                flag: 'r',
            });
            genCssTypings(content, file);
        }
    });
}

/**
 * Specify a root styles directory to generate typings upon import
 * @param {{stylesDir: string, excludeDirs: string}} options Options for generating typings as side-effect import
 */
module.exports = ({ stylesDir, excludeDirs }) => {
    // Generate typings as side effect
    if (stylesDir) genTypingsFromDir(stylesDir, excludeDirs);
    return genCssTypings;
};
