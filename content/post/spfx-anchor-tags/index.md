---
title: 'SPFx Anchor Tags - Hitting the Target'
date: Wed, 08 Aug 2018 18:17:18 +0000
draft: false
tags: 
  - SharePoint Framework
  - Microsoft 365
  - JavaScript
seo:
  title: "SharePoint Framework (SPFx) Anchor (a) Tags - Julie Turner"
aliases: ["/2018/12/resolve-to-log/"]
bigimg: [{src: "SPFxAnchorTags_lg.jpeg", desc: ""}]
---

If you’re developing SharePoint Framework web parts you may have run across an issue whereby your anchor tags will not honor the target=”\_blank” attribute allowing you to open a url in a new browser tab. The issue manifests itself only when your goal is to open another SharePoint page from a SharePoint page, i.e. the href is in the SharePoint domain. The reason for this is SharePoint’s built in but rather complex Page Router. Basically, the Page Router is the mechanism by which pages are rendered in SharePoint. In the most basic terms a component sits between you and a page refresh providing logic to how much and when parts of the page need to be loaded. What that means for you is that when you are trying to load a SharePoint page the router steps in and “decides” how it will be rendered and because of this the target attribute is ignored.

A colleague of mine imagined a complicated, but honestly quite ingenious solution to circumvent this problem. Basically, href url was set to the url of an azure function that would include the target url in the query string parameter. The job of the azure function was to issue a 302 redirect with the target url in it. Because the Azure function is not a SharePoint page, the target attribute is honored thus allowing the page to be opened in a new tab. Whew!

As it turns out there’s some built in, but undocumented functionality that solves the problem. There is an attribute you can add to your anchor tag in the form of “data-interception” that provides various methods to either bypass or partially bypass the Page Router. The first option is “off”. When you set the property to off it means that the loading of the target href completely bypasses the Page Router logic. This can mean that the rendering of your page goes from 1-2 seconds to upwards of 4 seconds… but if the alternative is to go without opening a new tab or implementing a complicated azure function redirect then this seems like a legit trade. The other option is to use the “propagate” value. In that instance the page router is not bypassed but it does allow your own click handlers to fire, which might mean that you can do some further processing before the anchor tag is redirected.

```html
<a href="https://mytenant.sharepoint.com/..." data-interception="off" target="_blank" rel="noopener noreferrer">My other page</a>
```

Either way this is a significant find and hopefully helpful to someone else. Happy Coding!
