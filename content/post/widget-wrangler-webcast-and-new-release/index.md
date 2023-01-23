---
title: 'Widget Wrangler Webcast and New Release'
date: Mon, 14 Mar 2016 20:36:26 +0000
description: "Here’s a quick update on the Widget Wrangler – the light-weight JavaScript framework that helps you build flexible widgets that can be used in SharePoint content editor web parts, add-in parts, or really pretty much everywhere."
draft: false
tags: 
  - SharePoint
  - Server 2010
  - Server 2013
  - Server 2016
  - JavaScript
  - TypeScript
aliases: ["/2016/03/widget-wrangler-webcast-and-new-release/"]
---

{{< crosspost src="https://bob1german.com/2016/01/13/flexible-sharepoint-development-with-widget-wrangler/" name="Bob German's Vantage Point" >}}

## Widget Wrangler Webcast and New Release

Here’s a quick update on the Widget Wrangler – the light-weight JavaScript framework that helps you build flexible widgets that can be used in [SharePoint](https://sharepoint.microsoft.com "Microsoft SharePoint") content editor web parts, add-in parts, or really pretty much everywhere.

{{< figure src="wwchannel9.jpg" alt="WWChannel9">}}

The Widget Wrangler was featured in a webcast on Channel 9 today. The Office team’s [Vesa Juvonen](https://twitter.com/vesajuvonen) interviewed WW creators [Julie Turner](https://twitter.com/jfj1997) and [Bob German](https://twitter.com/Bob1German), who explained the framework and demonstrated how to use it with [AngularJS](https://www.angularjs.org/ "AngularJS"), [jQuery](https://jquery.com "JQuery"), and plain old [JavaScript](https://en.wikipedia.org/wiki/JavaScript "JavaScript"). Please check it out [here](https://channel9.msdn.com/blogs/OfficeDevPnP/PnP-Web-Cast-Introducing-Widget-Wrangler-for-SharePoint-development)!

Also today we’re pleased to announce the release of Widget Wrangler version 1.0.1. This new version is backward compatible with the old one; the new release includes:

* CSS Support – Allows packaging CSS references from within your widget; the Widget Wrangler will efficiently load each CSS file once on each page, even if it’s referenced by multiple widgets
* Multi-module support – Allows bootstrapping multiple AngularJS modules within a widget (thanks to Peter Wasonga for the feature suggestion; Peter writes widgets in Kenya)
* A new [TypeScript](https://www.typescriptlang.org/ "TypeScript") sample; the Widget Wrangler works the same with TypeScript or JavaScript; this is mainly useful to show how to develop an AnuglarJS widget in TypeScript
* Improved/reorganized documentation

You can get the new release on our Github repo at [https://github.com/Widget-Wrangler/ww](https://github.com/Widget-Wrangler/ww). The Widget Wrangler is also a part of the [Microsoft](<https://maps.google.com/maps?ll=47.6395972222,-122.12845&spn=0.01,0.01&q=47.6395972222,-122.12845> (Microsoft)&t=h "Microsoft") OfficeDev Patterns and Practices library, and will be updated there in the next PnP release.

Thanks to everyone for your interest and support, and happy widget writing!
