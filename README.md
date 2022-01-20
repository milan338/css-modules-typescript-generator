# css-modules-typescript-generator

![issues](https://img.shields.io/github/issues/milan338/css-modules-typescript-generator?style=flat-square)
![version](https://img.shields.io/npm/v/css-modules-typescript-generator?style=flat-square)
![downloads](https://img.shields.io/npm/dt/css-modules-typescript-generator?style=flat-square)
![license](https://img.shields.io/github/license/milan338/css-modules-typescript-generator?style=flat-square)

## Generate Typescript definitions for CSS modules

Supports CSS, SASS, SCSS files

## Installation

`npm install --save-dev css-modules-typescript-generator`

## Usage

Typescript definition files will be generated in the same directory as their relevant stylesheet files.

This package does not include any stylesheet preprocessors as dependencies to prevent applications depending on preprocessors they would otherwise not use.
As such, it is assumed the workspace will already have required preprocessors available (if using .scss files, for example, the sass package will need to be present in the workspace).

### Webpack

```js
// Webpack config

// Defining stylesDir to generate typings before all other checks
const genCssTypings = require('css-modules-typescript-generator')({
    stylesDir: __dirname,
    excludeDirs: /node_modules/,
});

module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // The additionalData callback function will be run for each changed
                // Stylesheet upon save in webpack watch mode
                additionalData: (content, { resourcePath }) => {
                  genCssTypings(content, resourcePath);
                  return null;
                },
              },
            },
          }
        ],
      }
    ],
  },
};

```

If you're using a framework like Next.js, typescript checks might run immediately during the build task.
In this case, provide the `stylesDir` property as a root directory from which to scan for stylesheets, and all CSS modules nested within this directory will have typings generated before the rest of the build process.
If you specify this as the workplace directory, you may wish to exclude directories like node_modules through the `excludeDirs` property.

Frameworks like Next.js also include hot module reloading that triggers on stylesheet file updates.
In this case, pass the `genCssTypings` function to the appropriate style loader to regenerate typings each time the stylesheet file is updated.
In the above example, this is passed into SASS's `additionalData` property that runs a callback function for each compiled stylesheet file.
Doing this will enable automatic typing updates during development.

To prevent outdated typings being committed into VCS, it may be beneficial to exclude them through a `.gitignore` file using the following template for relevant extensions: `*.module.css.d.ts`.

[MIT License](https://github.com/milan338/three-minify-shaderchunk/blob/master/LICENSE)
