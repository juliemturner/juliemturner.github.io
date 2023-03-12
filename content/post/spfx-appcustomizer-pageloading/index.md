---
title: SharePoint Framework Application Customizer Cross-Site Page Loading
date: Thu, 05 Sep 2019 13:21:48 +0000
draft: false
tags: 
  - Microsoft 365
  - SharePoint Framework
  - TypeScript
seo:
  title: SharePoint Framework Application Customizer Cross-Site Loading
  description: Properly load an application customizer into modern SharePoint pages can be difficult. Outlines better practices to optimizing loading with the OnInit function firing multiple times. 
aliases: ["/2019/09/sharepoint-framework-application-customizer-cross-site-page-loading/"]
bigimg: [{src: "AppCustCrossSite_lg.png", desc: ""}]
---

I suspect, like [Elio Struyf](https://twitter.com/eliostruyf) and [Velin Georgiev](https://twitter.com/VelinGeorgiev) before him, we're all suffering from PTSD trying to properly load an application customizer into modern pages. It all started with an [issue posted in the sp-dev-docs repo](https://github.com/SharePoint/sp-dev-docs/issues/1971) that was about partial page load across site collections but devolved into and issue with the OnInit function firing multiple times. [Velin’s post](https://blog.velingeorgiev.com/page-hit-when-SPA-page-transitioning-modern-sharepoint-sites) describing his solution to the issue starts with a masterful breakdown of the page loading cycle and his need to track page hits. Then, [Elio’s variation](https://www.eliostruyf.com/things-to-check-in-your-spfx-application-customizer-after-page-transitions) highlights other things to check like what Hub Site do I belong to and what UI language does this page support and how those things might impact the transition with relation to the application customizer. This post is going to take that one step further and address page transition between sites where one site might include the application customizer and the other might not. This is all in reference to the [Multilingual Pages solution](https://github.com/SharePoint/sp-dev-solutions/tree/master/solutions/MultilingualPages) that lives in the SP-Dev-Solutions repo. This is a 400 level blog post so I’m not going to reiterate what Velin and Elio already did in their posts. Instead, I encourage you to pause here and go read their posts and then come back to continue on the journey.

No worries I’ll wait….

So now that you're all caught up, I've included this gist with some numerical placeholders that I’ll comment more on below.

1. My navigation handler is very similar. That said because the application customizer could have been disposed of but the event handler still fires anyway due to what I believe is a timing issue, I need to not only check that the current page is changed but also that if the navigated event was unsubscribed. My best guess is that it takes time to unregister the navigation event and so there’s an asynchronous timing issue an the event is fired anyway.
2. Functions to remove the application customizer from the placeholder
3. Render method starts by determining if the context on the page is undefined. That it could be (and believe me it happens repeatedly), seems like a bug. If the context isn’t defined, then we re-trigger the navigationEventHandler which waits another 50 MS hoping the context has gotten populated. Once the context is valid, then we verify the navigation event handler is set and we render the component.
4. This is the secret sauce. Here we determine if the location we’re going to is a site that has the application customizer installed on it.
5. Finally, assuming the application customizer is installed then we’re going to identify if the container for our application customizer is available (if not create it) and then render our component. If the application customizer is not installed, then we remove it from the DOM.

I truly hope this helps others out there that are struggling with their application customizers. Happy Coding!
