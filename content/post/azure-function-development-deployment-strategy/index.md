---
title: 'Azure Function Development-Deployment Strategy'
date: Tue, 05 Sep 2017 15:15:50 +0000
draft: false
tags:
  - SharePoint
  - Microsoft 365
  - Azure Functions
aliases: ["/2017/09/azure-function-development-deployment-strategy/"]
bigimg: [{src: "azurefunctiondevdep_feature.png", desc: ""}]
---

{{< figure src="VS.jpg" alt="VS">}}

There will be some that find what I’m about to say entirely obvious. For those that don’t this is a great way to think about development when the terminology changes but really everything stayed the same. Azure Functions are billed as “serverless computing”, and as I’m sure most of you have figured out already, all this really means is that the Azure extrapolates the complexity of managing the hardware and infrastructure that allows your code to execute. That extrapolation allows you the developer to focus on the functionality of your code, not the details of how you’re going to deploy it. _Note: There are obviously going to be limitations and you should make sure you understand them so you’re not blindsided._ The way that most people talk about these functions is to discuss implementing one individual function and how to go about doing that. 

This is wonderfully useful, however today I want to discuss the idea of having multiple Azure functions that may or may not share code and that are fully managed using some type of code repository (GitHub or VSTS or _MyCodeRepo_). My example revolves around technology, that for better or worse seems to have become near and dear to my heart, Azure Applications, and how we can leverage them to get work done against O365/SharePoint Online that the removal of farm/sandbox solutions has made prohibitively difficult. The goal is to be able to have a set of functions that do work against our SharePoint tenant. How they are triggered (HTTP Trigger, Timer Trigger, etc) is irrelevant, what is relevant is that I want to leverage the same Azure Application and its corresponding certificate, as well as some common code for all the functions. What may not be entirely obvious to some is that the Azure App Service that holds all your functions is just a directory at “Home” + \\site\\wwwroot\\ where Home is an environment variable that in my instance works out to D:\\. 

Underneath wwwroot is a folder for each of your functions. So, thinking in that way it might be obvious that if we want to share something like a certificate we could upload it to wwwroot and thereby all the functions could access it. To see what your own directory structure looks like, from your App Service, click on Platform Features, and then on “App Service Editor” which will show you the file/folder structure of your “serverless” server.

{{< figure src="AppServiceFeatures.jpg" alt="AppServiceFeatures">}}

{{< figure src="AppServiceEditor.jpg" alt="AppServiceEditor">}}

To make development even simpler VS2017 Enterprise edition offers us a lot of great tooling for building Azure functions. Now that I add this in the mix you can see from the screenshot at the top of this post, that it’s pretty easy for me to build a project that includes all of my Azure functions, plus my version of [Bob German’s csomHelper class](https://bob1german.com/2017/06/24/az-func-csom/) (and if you want to know how to implement accessing your SharePoint online environment in the way I'm referencing in this post, be sure to read his entire series), and the .pfx file that I can then share between these functions. BONUS, I can check all this code into my code repo and share the work load between multiple developers. 2x BONUS, I get “publish” functionality from Visual Studio that deploys all my compiled code up to the App Service making it ready to run. Powerful stuff!

### Update

In a recent discussion with [Mikael Svenson](https://twitter.com/mikaelsvenson), he was wondering if I was referring to Visual Studio publishing or automated deployment from a code repository... good point of clarification thanks Mikael! In the case of this post it was the former as more of a getting started type scenario. So, even though I don't address it specifically here there are ways to automate the deployment of your code to Azure on commit. Your options are continuous deployment from VSTS, GitHub, or Bitbucket as well as trigger deployments from OneDrive, DropBox, and external Git.

{{< figure src="DeploymentSources.jpg" alt="DeploymentSources">}}

I did a quick walk through to set it up against my GitHub repo and couldn't believe how easy it was, to start, navigate to Deployment options under Code Deployment section on the Platform Features screen of your App Service. A simple wizard will get you up and running.
