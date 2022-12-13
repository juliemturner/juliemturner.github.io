---
title: "Conquer your dev toolchain in 'Classic' SharePoint - Part 2"
date: Tue, 09 Jan 2018 14:47:29 +0000
draft: false
tags: ['2013', 'Javascript', 'SharePoint Online', '2010', 'ALM', 'Development', '2016', 'SharePoint Version', 'Language', 'TypeScript', '2007']
series: "Conquer your dev toolchain in 'Classic' SharePoint"
aliases: ["/2018/01/conquer-your-dev-toolchain-in-classic-sharepoint-part-2"]
---

In the [first post](../conquer-your-dev-toolchain-1) in this series I discussed some of the benefits of formalizing your client-side development process and then a bit about starting the process of tooling up. A common scenario to develop our own client-side solutions in SharePoint is to point a Content Editor (CEWP) or Script Editor (SEWP) web part at our custom html, css, and js files that are sitting in a document library somewhere in our environment. In this post I want to dive into the most basic implementations of a development toolchain that will automatically deploy those files into a location in SharePoint. This does not mean, and in most cases, should not mean, “production”. What it means is that while you’re developing your code any changes you make will be automatically uploaded to a location that you already have your CEWP or SEWP pointed to, that way when you refresh the page your custom solution will refresh with the latest version of your code. To accomplish this, we’re going to use [Gulp](https://gulpjs.com/) which is a JavaScript based task runner similar to the build process that exists in Visual Studio. As I said, I’m going to be sharing with you now the most basic [package.json](https://docs.npmjs.com/files/package.json) and [gulpfile.js](https://github.com/gulpjs/gulp) to configure this process. In addition, I’ve created 2 settings files, one has the project settings and the other has security and local configuration values that my gulp file will use. The reason I create two files is that one, settings.json, I check into our local source control and the other, settings\_security.json, I do not. This way in order for me to get up and running with a project that someone else worked on all I have to do is create a local copy of settings\_security.json and run “npm i” which will install all the dependencies I added to my package.json file.

Using REST to move your files into SharePoint – SharePoint 2013 and beyond
--------------------------------------------------------------------------

First let’s look at our package.json file for deploying files to SharePoint 2013 -> Office 365. This package.json and it’s corresponding gulpfile.js work with any SharePoint environment that supports the REST apis.

```json
{
  "name": "deploydemo",
  "version": "1.0.0",
  "description": "Sympraxis Conference Demos - CDN Demo",
  "license": "UNLICENSED",
  "private": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/juliemturner/deploydemo"
  },
  "devDependencies": {
    "gulp": "~3.9.1",
    "gulp-cache": "~0.4.6",
    "gulp-watch": "~4.3.11",
    "map-stream": "~0.0.7",
    "spsave": "~3.1.0"
  }
}
```

The only part of this file we’re going to discuss is the devDependencies section. These are all the packages we’ll need to support our deployment. I’ve linked to them and provided a very brief description.

[gulp](https://gulpjs.com/)

The task runner

[gulp-cache](https://www.npmjs.com/package/gulp-cache)

Caches files so that we can tell if the file has changed and only upload if it has.

[gulp-watch](https://www.npmjs.com/package/gulp-watch)

Watches a particular set of files paths for changes.

[map-stream](https://www.npmjs.com/package/map-stream)

Provides the ability to pass each file that changed from the watch into spsave to be uploaded to SharePoint

[spsave](https://www.npmjs.com/package/spsave)

Uploads the file into a SharePoint library.

One other thing I’d like to point out in my devDependencies is the use of the ~ before the version number. This is a modification I made purposefully, again due to run ins with older code getting updated and not working together very nicely. The ~ tells npm that it should “Allows patch-level changes if a minor version is specified on the comparator. Allows minor-level changes if not.” By default, when you use the ‘npm i’ to install a new package it will use the ^ range which “Allows changes that do not modify the left-most non-zero digit in the \[major, minor, patch\] tuple.” What I’m basically saying is that I would go back to code I had written a year ago, pull it out of source control and do an ‘npm i’. Because most of the packages I had reference updated since then I would get the latest version per the ^ range rules. What I found is I would often end up with breaking changes and it was super frustrating to go back and fix them for something that wasn’t broken to begin with, so I made this modification to all my package.json files. Ok, so if you’ve run “npm i” then all of these dependencies (and their dependencies) should be installed in the node\_modules subfolder. Once that is complete we can use them by creating a gulpfile.js which is basically a JavaScript file that uses these packages and runs on our NodeJS “server”. Start off by declaring variables that we'll use in our process.

```javascript
"use strict";
//Node v 6.12.0
var gulp = require('gulp');
var watch = require('gulp-watch');
var cache = require('gulp-cache');
var spsave = require('spsave').spsave;
var map = require('map-stream');

var settings = require("./settings.json");
var settingsSecurity = require("./settings\_security.json");
```

This first part of the file imports the packages that are required, all the ones we talked about and then imports the settings files that I mentioned. The settings files look like the following:

### settings.json

```json
{
    "projectname":"DeploymentDemo",
    "srcFiles": \["./client/\*.html","./client/\*.js", "./client/\*.css"\],
    "siteCollURL": "https://tenant.sharepoint.com/sites/sitecollection",
    "destFolder": "/Style%20Library/Folder"
}
```

projectname

The project name should be unique as it’s used by the gulp-cache to generate the cache for the project, reuse will potentially have two projects using the same cache and the result will be unpredictable at best.

srcFiles

This is an array of Globs that should be watched, see the primer for how to form the pattern matches for folder structure.

siteCollURL

The URL for the site collection you want to upload the files to.

destFolder

The site collection relative path to the library / folder you want the files uploaded to.

### settings\_security.json

```json
{
    "rootFolder": "/Code/Shire/GraphExtPOC",
    "username": "username@tenant.com",
    "pwd": "password"
}
```

rootFolder

The root of the project relative to the drive letter (i.e. C:). A problem I’ve had in the past is that the rootFolder path is case sensitive.

username

Either the O365 account (in the form of an email address) or for on premises environments the username below would take the form domain\\username.

pwd

The password for the username provided.

You now have two options. You can either upload the files maintaining the relative folder structure of your source into the destination or you can flatten the relationship which puts all the files in the destination's root. Below I have two functions one maintains the folder structure and the other flattens it. The idea here is that you get a listing of the files then pass them through the cache, then map the files that changed into a function call that passes each individual file to spsave which then uploads the file to the library. Because I normally use the more advanced version that I’ll be showing in part 4, which pretty much creates only 1 file, I almost always use the flatten option.

```javascript
function makeHashKey(file) {
    return \[file.contents.toString('utf8'), file.stat.mtime.toISOString()\].join('');
}

gulp.task("copyToSharePointFolder",
    function () {
        gulp.src(settings.srcFiles, { base: settingsSecurity.rootFolder })
            .pipe(
                cache(
                    map(function(file, cb) {
                        spsave({
                                siteUrl: settings.siteCollURL,
                                checkinType: 2,
                                checkin: false
                            },
                            {
                                username: settingsSecurity.username,
                                password: settingsSecurity.pwd
                            },
                            {
                                file: file,
                                folder: settings.destFolder
                            }
                        );
                        cb(null, file);
                    }),
                    {
                        key: makeHashKey,
                        fileCache: new cache.Cache({ cacheDirName: settings.projectname + '-cache' }),
                        name: settingsSecurity.username + "." + settings.projectname
                    }
                )
            );
    }
);

gulp.task("copyToSharePointFlat",
    function () {
        gulp.src(settings.srcFiles, { base: settingsSecurity.rootFolder })
            .pipe(
                cache(
                    map(function(file, cb) {
                        var filePath = file.history\[0\].replace(file.cwd, '.');
                        spsave({
                                siteUrl: settings.siteCollURL,
                                checkinType: 2,
                                checkin: false
                            },
                            {
                                username: settingsSecurity.username,
                                password: settingsSecurity.pwd
                            },
                            {
                                glob: filePath,
                                folder: settings.destFolder
                            }
                        );
                        cb(null, file);
                    }),
                    {
                        key: makeHashKey,
                        fileCache: new cache.Cache({ cacheDirName: settings.projectname + '-cache' }),
                        name: settingsSecurity.username + "." + settings.projectname
                    }
                )
            );
    }
);
```

Finally, we have the watch function that either calls the folder version or the flat version of our _copyToSharePoint_ function. Obviously if you have a preference you don’t need to keep both of these functions in your gulpfile, I’m just putting them both here for reference.

```javascript
gulp.task("watchFolder", function(){
    gulp.watch(settings.srcFiles, \["copyToSharePointFolder"\]);
});

gulp.task("watchFlat", function(){
    gulp.watch(settings.srcFiles, \["copyToSharePointFlat"\]);
});
```

Now if you run “gulp watchFolder” or “gulp watchFlat” from the command interface node will run your gulp package which will keep watch on your folder structure and when you save a file spsave will upload it to your SharePoint site and if you refresh the page you’re updated code will be available.

Using WebDAV to upload your files into SharePoint – SharePoint 2010 and below
-----------------------------------------------------------------------------

Before we had OneDrive in all its current synchronization support glory it was very common for organizations to use WebDAV to give their users access to their SharePoint libraries via the windows explorer. We can exploit that functionality within our development environment and the fact that Nodejs allows us to interact with the full file system since it’s running on our computer. Basically, anything we have access to we can access via our gulpfile. That said we’ll need slightly different tools for the process since instead of using a http post to upload our files to the SharePoint library we’re going to copy them to the server via WebDAV. First let’s modify our package.json file to include a new tool called vinyl-fs. This tool allows us to map files from a source location to a destination location. There are a lot of options that you can use with this package, and if you want to dig further in please take a look at the [documentation](https://www.npmjs.com/package/vinyl-fs). To modify the package.json file you can either execute the ‘npm i vinyl-fs –save-dev’ or modify your package.json file directly to add the file to your devDependencies section and then run ‘npm i’ which will install any missing packages. So in my package.json file devDependencies section I have added:

```json
"vinyl-fs": "~3.0.1"
```

Now we need to modify our gulpfile.js to include a reference to vinyl-fs and to add a new version of our _copyToSharePoint_ function that is specific for this legacy version. First add a variable at the top of the file to reference vinyl-fs

```javascript
var vfs = require('vinyl-fs');
```

Then add the following function which supports the WebDav path.

```javascript
gulp.task("copyToLegacySharePoint", function() {
    gulp.src(settings.srcFiles, { base: settingsSecurity.rootFolder })
        .pipe(
            cache(
                map(function(file, cb) {
                    var filePath = file.history\[0\].replace(file.cwd, '.');
                    console.log('Copying -- ' + file.path);
                    vfs.src(\[filePath\]).pipe(vfs.dest(settings.destFolder));
                    cb(null, file);
                }),
                {
                    key: makeHashKey,
                    fileCache: new cache.Cache({ cacheDirName: settings.projectname + '-cache' }),
                    name: settingsSecurity.username + "." + settings.projectname
                }
            )
        );
});

```

And finally, either modify or add an additional watch task that will utilize the legacy _copyToSharePoint_ function

```javascript
gulp.task("watchLegacy", function(){
    gulp.watch(settings.srcFiles, \["copyToLegacySharePoint"\]);
});
```

Before you run your watch make sure to update your settings.json file to put the WebDav path as your destFolder. You can optionally map the WebDav folder as a drive using ‘net use’ and then reference the drive letter, just make sure to use forward slashes not backslashes.

```json
"destFolder": “//sp2010dev/DavWWWRoot/Shared%20Documents”
```

Up Next
-------

In the next installment I’ll be covering how to implement a basic version of [Webpack](https://webpack.js.org/) into your environment which will bundle all your html, css, and js into one file.
