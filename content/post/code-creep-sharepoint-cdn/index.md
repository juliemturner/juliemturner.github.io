---
title: 'Code Creep - SharePoint "CDN"'
date: Tue, 06 Sep 2016 14:00:00 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - Server 2013
  - Server 2016
  - TypeScript
  - JavaScript
aliases: ["/2016/09/code-creep-sharepoint-cdn/"]
bigimg: [{src: "MajorVersion_User.png", desc: ""}]
---

### _Centralizing your SharePoint client side code_

“Code Creep”… no it’s not the latest thriller movie out of Hollywood, although it probably could be. I’m referring to the sprawl of client side code files that are stored when implementing client side web parts or "widgets" in SharePoint. A common solution for implementing "widgets" in SharePoint is to store the files in a document library, linking to them with a CEWP that will then run and render your “widget”. This is an effective way to implement customization when you don’t have administrator access, or you're running in SharePoint online, or you just prefer the flexibility of a client side development paradigm; as some of my colleagues in the SharePoint community like to say, “It isn’t code, it’s content.” However, depending on the complexities of your environment and your development staff, this kind of end run can cause maintenance issues at best, horror stories at worst. There are many ways to solve the code creep problem, from simple to incredibly complicated, and of course, as with everything there is no one-size-fits-all answer. Some guidance from my perspective centers on where your code will be implemented and how big your farm/tenant(s) are. I’ve created a matrix below that outlines my thoughts on the subject.

{{< figure src="solutionmatrix.png" alt="solutionmatrix">}}

The solution I’m going to focus on in this post is the “Store code in a site collection specifically for your client side code”, or basically creating a private CDN ([Content Delivery Network](https://en.wikipedia.org/wiki/Content_delivery_network)) within your own tenant/farm.  In my opinion this is a fairly good solution to balance code maintenance/deployment without going all the way to the cost and complexities of implementing a full blown commercial style CDN. The scenario is that you have developed or are developing client side “widgets” that you’re going to use in multiple site collections within a farm or tenant. My solution is to build a site collection specifically for storing the code needed to render those widgets.  And by code I mean all the html, js, and css files.  Any third party libraries that are already hosted on a CDN could be referenced separately and do not need to be added to your internal CDN, however, my rule of thumb is that if your SharePoint farm is behind a firewall and people access it from an internal network, you should consider downloading copies of the libraries you need and host them locally.  No reason why your solutions shouldn't work if the internet goes down. So let’s say I create a new site collection and I call it CDN so that my URL is http(s)://mysharepointurl/sites/CDN I can disable most site collection and site features, leaving enabled at a minimum:

* SharePoint Server Standard Site Collection features
* SharePoint Server Standard Site features

Everything else is optional depending on what you want to do in your CDN, create approval workflows, etc… The key to the solution is getting the permissions right. We want to make sure that everyone that needs access to code at any time now or in the future can get it, otherwise the “widgets” won’t work for them. But what we’d also like is the ability to version and “lightly” test that code without affecting them. So to that end we’re going to give “All authenticated users”/”Everyone” read permission to our CDN site by adding them to our CDN Visitors group. We can then add our developers to the CDN Members group, and we can add our CDN Managers or Administrators to the CDN Owners group. Now, by default, unless we break inheritance, all our code “libraries” will be able to be read by everyone and managed by our developers. With permissions taken care of, we can create a library or libraries in the site to hold our code. There’s a lot of ways this could be organized and you should certainly take some time to think it through. Maybe you want to have different groups of developers have contribute rights to different code bases, etc… the key is to make sure you don’t remove visitors read rights from any of your code libraries and that you modify the versioning settings of your library as follows, the key being that we want Draft Item Security set to "Only users who can edit items".   This allows you to “publish” major versions of the code files and until you do the user will continue to use the last published version.  Now you to do some “light” testing on the modifications to make sure everything is working before you “publish” it to the users.  I do not encourage you to use this method as a full out [ALM](https://en.wikipedia.org/wiki/Application_lifecycle_management) solution but as a light weight one it can work well.  You could also in theory create approval workflows that would “publish” the content for you, but that’s a different post. 

{{< figure src="LibrarySettings.png" alt="LibrarySettings">}}

{{< figure src="MinorVersion_LibView-300x159.png" alt="MinorVersion_LibView">}}

So here’s an example of how you might use this.  I’ve uploaded some files into my “Code” library and note that they’re all minor versions of the file.  I’ve added myself as a CDN Member so I have the ability to “Contribute” to this library. Now I need to insert the widget on the page and to do that I need to be a tad fancy.  This is because I cannot use a simple CEWP and point to the URL of an html file in my CDN Code library because CEWP cannot cross site collections.  To get around this you can either write your own binding function or utilize the [Widget Wrangler](https://github.com/Widget-Wrangler/ww) to bootstrap your code simply into the page.  Below is an example of using a SEWP for that purpose with the Widget Wrangler to implement an AngularJS 1.x application:```

{{< figure src="PuttingCodeOnPage-300x158.png" alt="PuttingCodeOnPage-300x158">}}

The key here is that this code embedded onto the page is benign. Other than referencing the files that implement the solution it really doesn’t do anything and therefore it won’t need to be changed in order to modify the widget’s UX.

Now if we save the page and view it we’ll see our widget. Because our files have not been published my end users see nothing.

{{< figure src="MinorVersion_Julie.png" alt="MinorVersion_Julie">}}

If I then publish all the files for this “widget” you can see that the end user now sees the same thing I do.

{{< figure src="MajorVersion_User.png" alt="MajorVersion_User">}}

So, as you can see there are real ways to help avoid the dreaded "code creep".  From simply storing all your code in a library in the site collection to utilizing a commercial CDN.  The moral of the story is there is no one-size-fits-all answer, so you need to assess your needs and try and centralize your client side code in a way that makes the most sense for your environment allowing you to manage your solutions from one location.
