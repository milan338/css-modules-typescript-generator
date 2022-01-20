const path = require('path');
const csstree = require('css-tree');

/**
 * Get all selectors from a stylesheet
 * @param {string} content Stylesheet content
 * @param {string} file File path to the original stylesheet
 * @returns {string[]} All id and class selectors from the supplied stylesheet
 */
function getSelectors(content, file) {
    let transformed;
    const type = path.extname(file).slice(1);
    switch (type) {
        case 'sass':
        case 'scss':
            const sass = require('sass');
            transformed = sass.compile(file).css;
            break;
        case 'css':
            transformed = content;
            break;
        default:
            throw new Error(`Invalid stylesheet type ${type}`);
    }
    const ast = csstree.parse(transformed);
    let selectors = [];
    csstree.walk(ast, (node) => {
        if (node.type === 'ClassSelector' || node.type === 'IdSelector') {
            selectors.push(node.name);
        }
    });
    selectors = [...new Set(selectors)];
    return selectors;
}

module.exports = getSelectors;
