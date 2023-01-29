---
title: "Tip: 'npm version' isn't creating tag for your project"
date: Mon, 08 Apr 2019 23:33:40 +0000
draft: false
tags: 
  - SharePoint Framework
aliases: ["/2019/04/tip-npm-version-isnt-creating-tag-for-your-project/"]
bigimg: [{src: "TipNavComponent_lg.jpeg", desc: ""}]
---

I love the new feature I picked up from my friend [Stefan Bauer](https://twitter.com/StfBauer) about using **npm version** to [upgrade the version of your SPFx solution](https://n8d.at/blog/use-npm-version-to-upgrade-version-of-your-spfx-solution/). It has made working as an individual and as a team contributor so much easier because it becomes obvious in your repositories history when versions of the project we're created and by whom.

I was struggling though because some of my more complicated projects, although set up the same way, were functioning with the exception that the git tags were not getting being created. It turns out that if your folder structure is more complicated, and your package.json file is in a sub folder below your .git folder the tags won't get created automatically, although all the other aspects of the solution work fine.

Luckily I found a post with a [workaround](https://github.com/npm/npm/issues/9111) in the npm repos issues list.

If you're repository structure looks anything like this, where your package.json file is not at the same level as your .git folder for the project you're running npm version on, a workaround to get the tags to apply automatically is to add an additional, empty .git folder.

So this...

```text
mySpfxProject
|----.git/
|----docs/
|----specs/
|----webparts/
|--------package.json
|--------{all the other spfx files}
```

becomes...

```text
mySpfxProject
|----.git/
|----docs/
|----specs/
|----webparts/
<strong>|--------.git/</strong>
|--------package.json
|--------{all the other spfx files}
```

And voila, [npm version](https://docs.npmjs.com/cli/v9/commands/npm-version/) will now create the appropriate tag.

Keep in mind that the tag is for the entire repo, so if you have multiple solutions in the same repo that have different versions you may want to manually apply your tags in a different way. Which is probably why the feature works the way it does in the first place.

Happy coding!
