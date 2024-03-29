---
title: 'Sympraxis Development Process'
date: Tue, 16 Aug 2016 17:23:47 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - Server 2013
  - JavaScript
  - REST
seo:
  title: Sympraxis Development Process by Julie Turner
aliases: ["/2016/08/sympraxis-development-process-part-1/"]
bigimg: [{src: "devprocess.png", desc: ""}]
---

Marc and I discussed in our August Sympraxis Newsletter starting a blog series to share what we’re learning while implementing a [SharePoint](https://sharepoint.microsoft.com "Microsoft SharePoint") client side development process.  So this is my first post on the topic, and here’s a [link](https://sympmarc.com/2016/08/16/sharepoint-client-side-development-pipeline-introduction/) to his first post… it’s interesting to see how different our perspectives on the process were.

In all my previous experience I’ve either been in a team or in a regulated industry or both.  All of these scenarios dictate that you have at least some process in place and in the case of the regulated pharma industry, rigorous processes in place.

I’m an organized soul in general and grew up with a mother who should have been a professional organizer and is probably a tad OCD.  I remember her doing the accounting for our family business.  She had a color coding system of pens (red, green, blue) for checking off cleared checks, deposits, and other issues in the checkbook register and whose desk was always immaculate (and still is) with her black pen, red pen, and mechanical pencil diagonally aligned across the right top corner of her blotter (that she really didn’t need as the thing was/is pristine).  Don’t even get me started on how she “cleaned” the labels right off the knobs on the stove.

So to say that joining Marc’s rather haphazard method of source control was a shock is potentially an understatement but what’s fabulous was that he was happy, and I even might speculate a bit excited, to have something at least a little more organized.  And further, with two of us, sometimes working for the same client, and sometimes on the same project, it just really needed to happen.

Ok, so first we had to agree on source control.  We knew we were going to the cloud.  As a two-person team whom work out of our homes we don’t want to have a server footprint.  I grant you we could have spun up some Azure space and built servers, but seriously, why would we do that when there are great cloud choices and as my friends know… I don’t do infrastructure!

Given Marc wanted absolutely NOTHING to do with [Visual Studio](https://visualstudio.microsoft.com/ "Microsoft Visual Studio") proper as an [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment "Integrated development environment") I felt like that somewhat ruled out [TFS](https://en.wikipedia.org/wiki/Team_Foundation_Server "Team Foundation Server") Online.  I should point out that TFS Online can be configured to use [GitHub](https://git-scm.com "Git (software)") so that you can have the best of both worlds.  TFS has some other tools for managing the project and tasks in addition to source control so if you’re working with a larger team or in a more regulated environment this may be a good choice for you.  You can find out more about the integration [Getting Started with Git in Visual Studio and Team Foundation Service](https://devblogs.microsoft.com/devops/getting-started-with-git-in-visual-studio-and-team-foundation-service-2/).

Now that we choose [GitHub](https://github.com) as our repository and I had made the switch from Visual Studio proper to Visual Studio Code for most of my development we decided to start with a small GitHub plan.  I created a few private repos one of which was for clients.  Within a few weeks we realized the error of our ways.  The client’s repo although nicely organized was cumbersome to sync with since there was so much in there.  Luckily we hadn’t gotten that far and we were only at that point working on one client together.  So we upped our GitHub plan, created a repo per client, shuffled our code around, and are back on track.

The next thing we had to tackle was the absolutely horrendously cumbersome task of modifying files and testing them in SharePoint.  As Marc explains in his first post on this topic, [Sympraxis’ SharePoint Client Side Development Pipeline – Introduction](https://sympmarc.com/2016/08/16/sharepoint-client-side-development-pipeline-introduction/), his process was to literally edit in place by opening the library where the files were with the “Open with Explorer” which while he may have been fine with I literally couldn’t even get myself to do.  I think I may have even blacked out temporarily when I saw him do it.

However, for all this looseness in process, I did really like that he stored his files in the site collections master page gallery.  As he explains in his post everyone has read access to the location, but very few should have access to actually wander into the library.  So in this, I ended up picking up Marc’s process, but that meant that instead of being able to drag and drop my file changes into the browser window I had to manually upload them… I thought I was going to lose my mind.

We started researching various ways to get the files into SharePoint using [gulp](https://gulpjs.com/).  Luckily there were some options out there, two that come to mind.  One by our respected colleague [Wictor Wilen](https://twitter.com/wictor) – [gulp-spsync](https://github.com/wictorwilen/gulp-spsync).  I think it would have been a great solution but requires you have tenant admin access and in our experience we almost never are granted that level of access to our client’s tenants so we needed something else.  If, however you’re working on your own tenant and have that level of access it’s probably worth a look.  We then found [spsave](https://www.npmjs.com/package/spsave) which we found works pretty well for uploading files to SharePoint online and SharePoint 2013 on premises and have implemented it along with [gulp-cache](https://github.com/jgable/gulp-cache) to only upload files that have changed.

So at this point we have a pretty streamlined process for getting the files into SharePoint as we work.  In the future we need to add more to validating the code we’re writing such as [linting](https://en.wikipedia.org/wiki/Lint_(software)) and various other things… more to come as we implement.

Meanwhile, if you have specific questions, please feel free to add them in the comments and we'll attempt to cover them.
