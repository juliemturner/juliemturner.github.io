---
title: 'Special Characters in REST ListItem Metadata'
date: Mon, 12 Sep 2016 21:07:17 +0000
draft: false
tags: 
  - SharePoint
  - Server 2013
  - Server 2016
  - JavaScript
  - REST
aliases: ["/2016/09/special-characters-in-rest-listitem-metadata/"]
bigimg: [{src: "heximage.jpg", desc: ""}]
---

I'm constantly trying to remember which way to encode content when making calls to the server while developing client side solutions for [SharePoint](https://en.wikipedia.org/wiki/SharePoint "SharePoint").  Usually it's some form of [JavaScript](https://en.wikipedia.org/wiki/JavaScript)'s [encodeURI()](https://www.w3schools.com/jsref/jsref_encodeuri.asp)/[encodeURIComponent()](https://www.w3schools.com/jsref/jsref_encodeuricomponent.asp) functions... but this latest one gave me a bit of trouble until I finally figured it out which encoding to use and, almost as important, when to apply it.

When making RESTful calls to update or create data in a SharePoint list you must include the "\_\_metadata" (two underscores followed by 'metadata') property in the information object you send on the data property of the call.  If you have a list with the **internal** name "Clients" and your data property object is called "item" then you would do something like the following:

`item.__metadata: {"type": "SP.Data.ClientsListItem"}`

However, if your list's **internal** name has any spaces or special characters you must encode the list name in this property differently than you're encoding it for the REST url which (most often) uses the list's **display** name.  But what type of encoding you may ask... the full ASCII hex value plus a leading and trailing underscore is the answer.  So for instance:

List with **internal** name "Client\_Information" would look like:  
`item.__metadata: {"type": "SP.Data.Client_x005f_InformationListItem"}`

and a list with **internal** name "Client Information" would look like:  
`item.__metadata: {"type": "SP.Data.Client_x0020_InformationListItem"}`

_Here's one reference to an [ASCII chart](https://www.ascii.cl/htmlcodes.htm) but there's hundreds available._

Now, when you're making your REST call, in the [URL](https://en.wikipedia.org/wiki/Uniform_Resource_Locator "Uniform Resource Locator") you would use the lists **display** name (because that's what getbytitle expects) and it would look something like:

`<SharePoint site URL>/_api/web/lists/getbytitle('Client_Information')/items(1)`

or

`<SharePoint site URL>/_api/web/lists/getbytitle('Client Information')/items(1)`

In the case of the list item with these special characters you can wrap the list name in the afore mentioned encodeURIComponent() function, something like...

`var url = "<SharePoint site URL>/_api/web/lists/getbytitle('" + encodeURIComponent('Client Information') + "')/items(1)"`

but in general I find it works just fine without it.

Hope the clarification helps someone else.

UPDATE: And now that I shared all that insight, guess what?!  You don't need any of it.  Check out Marc's [blog post](https://sympmarc.com/2016/05/02/making-your-rest-calls-simpler-by-changing-the-metadata-setting/) where he explains the "odata" setting in your request header!

Happy Coding!
