---
title: "Conquer your dev toolchain in 'Classic' SharePoint – Part 4"
date: Tue, 16 Jan 2018 14:43:38 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - Server 2013
  - Server 2016
  - TypeScript
  - JavaScript
series: ["Conquer your dev toolchain in 'Classic' SharePoint"]
aliases: ["/2018/01/conquer-your-dev-toolchain-in-classic-sharepoint-part-4"]
bigimg: [{src: "DevProcess2c.png", desc: ""}]
---

For this last post I want to take what we’ve learned and add the final pieces that have you creating web parts in the same way you would modern SPFx web parts and solutions. We’re going to start by discussing [TypeScript](https://www.typescriptlang.org/) and then briefly touch on [Sass](https://sass-lang.com/) and how to include these languages into your new Webpack/Gulp environment.

TypeScript is becoming almost ubiquitous in modern web development. The pros are numerous, my favorites are the ability to write code to target older browser with modern capabilities, and the ability to use a version of intellisense to validate your objects properties and methods. In my experience both of these features makes development go faster. The cons are that you’ll need to transpile your code as well as utilize typings for the libraries you want to include. By using [Visual Studio Code](https://code.visualstudio.com/), or another IDE as your development environment TypeScript is pretty much built in. If you are coming from C#, or some other compiled language, you’re going to find that you feel significantly more comfortable writing TypeScript than JavaScript, mainly because many of the conventions you’re used to have an equivalent in the TypeScript language and thus patterns like MVVM are easily implemented.

As I’ve mentioned in many of my other posts I tend to use [AngularJS](https://angularjs.org/) as my development framework of choice simply because it works well and supports dynamic binding which is needed for web part development. That’s changing with the introduction of Web Components and Angular 5’s – Angular Elements but at this moment that’s super cutting edge and I’m not going to address it.

>If you are interested in Angular Elements check out both Andrew Connell’s post ([Solve the SharePoint Framework + Angular Challenge with Angular 5.0 Elements](https://www.andrewconnell.com/blog/solve-the-sharepoint-framework-angular-challenge-with-angular-5-0-elements)) and Sébastien Levert’s series ([SHAREPOINT FRAMEWORK & ANGULAR ELEMENTS : BUILDING YOUR FIRST WEB PART](https://www.sebastienlevert.com/2017/12/02/sharepoint-framework-angular-elements-building-your-first-web-part/))

All that said that doesn’t mean AngularJS has to be the framework you choose, or that you need to choose a framework at all. All it means is that I’m going to show an example below of how I add the typings for spinning up an AngularJS project. If you’re interested in some good reading and further links around the framework wars you might check out [Angular, React or Vue - Which Web Framework to Focus on for SPFx?](https://www.andrewconnell.com/blog/angular-react-or-vue-which-web-framework-to-focus-on-for-spfx) where Andrew Connell gives you a lot of resources to help you learn about the different frameworks, and some good advice…. Try before you 'buy'!

### TypeScript

Enough introduction, on to the actual process. First we’re going to update our package.json file by adding TypeScript. Now if you’re using a tool like WebStorm they provide a “bundled” version of TypeScript (Visual Studio Code provides language support but not the transpiler, you will need to add it as I describe). Again, per my discussions in the previous posts I have run into version incompatibility issues and so I’ve taken to including my own version and not installing it globally or relying on the bundled version. You should choose what works for you but if you’re going to pick your version then you need to add it to you devDependencies section of your package.json.

```json
"typescript": "~2.3.4",
```

[typescript](https://www.npmjs.com/package/typescript)

Provides typescript processing

A basic requirement of TypeScript is a configuration file, also known as a [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file. The power of TypeScript really comes from the ability to code once and target whatever version of ECMAScript your browser(s) require. My basic tsconfig.json files looks like the following. You can see from the 'target' property that I want my transpiled JavaScript to run in browsers supporting ECMAScript v5.

```json
{
  "compilerOptions": {
      "target": "es5",
      "module": "commonjs",
      "sourceMap": true,
      "experimentalDecorators": true,
      "lib": \["dom", "es6", "es2016.array.include"\]
  }
}
```

In addition, I need to add the typings for my third-party libraries. Typings are the “intellisense” for your code. They allow the transpiler to check that you’ve correctly utilized the various properties and methods your referencing before it actually “builds” it. The "cool" way to add typings to your project is to use the @types pattern, you can look up your favorites in [NPM](https://www.npmjs.com/~types). Here I'm adding the typing for AngularJS to my dependencies.

```json
"@types/angular": "~1.6.36",
```

| | |
| -- | -- |
| [@types/angular](https://www.npmjs.com/package/@types/angular) | Provides typescript support for AngularJS |

We also need to add [Webpack](https://webpack.js.org/) support for our TypeScript files. So, we’ll add the following:

```json
"ts-loader": "~2.3.7",
```

| | |
| -- | -- |
| [ts-loader](https://www.npmjs.com/package/ts-loader) | This is the typescript loader for webpack. |

Then we’ll modify our webpack.config.js file to reference and use ts-loader. Note other modifications to support our switch to TypeScript including changing our entry file, adding ts-loader to our modules section, and the addition of the "[resolve](https://webpack.js.org/configuration/resolve/#resolve)" section which helps Webpack configure how modules are resolved. By including extensions section we’re telling Webpack to automatically resolve files with these extensions.

```javascript
var webpack = require('webpack');

module.exports = {
    entry: {
        bundleCDNDemoWebpackTS: "./client/cdndemo.ts"
    },
    output: {
        path: '/code/Conference-Demos/CDNDemoWebpackTS/build/',
        filename: "\[name\].js",
        publicPath: '/'
    },
    module: {
        rules: \[
            {
                test: /\\.css$/,
                exclude: /node\_modules/,
                loader: \["style-loader", "css-loader"\]
            },            
            {
                test: /\\.html$/,
                exclude: /node\_modules/,
                loader: "html-loader"
            },
            {
                test: /\\.ts$/,
                loader: 'ts-loader',
                exclude: /node\_modules/
            }
        \]
    },
    externals: {
        angular: 'angular',
        Sympraxis: 'Sympraxis'
    },
    resolve: {
        extensions: \['.ts', '.js'\],
    },
    watch: true
};
```

Now if I run an “npm i” all these dependencies will be loaded into my node\_modules folder, and I can start my "npm build" process to start transpiling and webpacking my TypeScript based solution.

### SASS/SCSS

Sass stands for “Syntactically Awesome Style Sheets” and its file extension is _scss_. Once I tried Sass I’ve never looked back as it makes those things that you should be able to do in stylesheets easy by providing features like variables, nesting, partials, inheritance, and operators. If you've never tried it check out the [Sass site](https://sass-lang.com/guide) for some easy getting started snippets. To include Sass files in your project you need to include a few modules to help Webpack out.

```json
"node-sass": "~4.7.2",
"sass-loader": "~4.1.1",
```

| | |
| -- | -- |
| [node-sass](https://www.npmjs.com/package/node-sass) | A dependency of Sass-loader that must be manually included. |
| [sass-loader](https://www.npmjs.com/package/sass-loader) | Compiles the scss file into a css file so that webpack and include it in the bundle. |

And then to our modules section of the webpack.config.js we need to add a rule for our scss files which is basically the same rules as css files but with the Sass processor first (or last, processors work from last to first.. so the file will go through the sass-loader, then the css-loader, then the style-loader).

```json
{
   test: /\\.scss$/,
   exclude: /node\_modules/,
   loader: \["style-loader", "css-loader", "sass-loader"\]
},
```

### And Beyond

There are so many other things we could add to our chain at this point. Linters, testing frameworks, etc, etc but this series covers what we at Sympraxis do at a minimum for our projects that reside in classic SharePoint. I really hope you’ve enjoyed reading them and if you have any questions please feel free to leave a comment below. If you’re interested, you can download the complete files that I’ve discussed in my series from my [GitHub](https://github.com/juliemturner/Public-Samples) repo under the “Development Toolchain” folder. Happy Coding!
