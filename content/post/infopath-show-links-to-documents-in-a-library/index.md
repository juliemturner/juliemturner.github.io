---
title: 'InfoPath - Show links to documents in a library from the form'
date: Fri, 11 Jan 2013 20:00:38 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - InfoPath
  - REST
aliases: ["/2013/01/infopath-show-links-to-documents-in-a-library-from-the-form/"]
---

I had an interesting client issue recently where the users were copying and pasting[](https://en.wikipedia.org/wiki/Cut%2C_copy%2C_and_paste "Cut, copy, and paste") the contents of entire e-mail messages into a text box inside an [InfoPath](https://office.microsoft.com/infopath/ "Microsoft InfoPath") form.  Although useful in that the information was captured with the form, the implementation was tedious at best when trying to find information potentially buried there.  Long story short by putting the e-mail messages in a document library that was linked to the InfoPath form library by the ID I was able to have a parent-child relationship.  The issue then was how to display those e-mails from within the form.

Obviously the ideal solution was to be able to actually preview them, but barring the funds to take on a challenge like that, and very little hope that the exercise would be fruitful it was decided to try and at least show a list of the "messages" that were stored in the document library related to the form that was open.  Sounds simple I'm sure, and in the end it was fairly straight forward but a few little gotcha's had to be worked around.

My first thought was to make a secondary data connection to the document library in question.  Unfortunately, I figured out rather quickly that getting the name of the file or the path to the file wasn't happening.  Enter [REST](https://en.wikipedia.org/wiki/Representational_state_transfer "Representational state transfer") services for [SharePoint](https://sharepoint.microsoft.com "Microsoft SharePoint")... i.e. /\_vti\_bin/listdata.svc

The first step was to validate the URL for the REST service that I would add as a datasource in the InfoPath form.  To do this I used the URL `https://sp2010/test/\_vti\_bin/listdata.svc` where sp2010/test is the path to the site that housed the document library.  What resulted was this:

{{< figure src="listdata.gif" alt="listdata.svc">}}

If you then modify the URL to put /TestDocuments after the service call... in other words: `https://sp2010/test/\_vti\_bin/listdata.svc/TestDocuments` you will see the contents of the Test Documents library.  There are a lot of references on the web for quering REST data so I won't go into it here suffice to say that the best way to figure out what you need to query is to view the source of the resulting page.  So when I showed the contents of the Test Document library I saw the following:

{{< figure src="test_document_listing.gif" alt="Test Document listing">}}

Then when I viewed the source of the page I could see that to filter for the Form field I would need to use "FormId" (I found out the hard way that this seems to be case sensitive as FormID didn't work).

{{< figure src="image3.gif" alt="Image3">}}

Ergo, my final url to show all the documents filtered by the Form field (in this case where that value was 1) would be:  
`https://sp2010/test/\_vti\_bin/listdata.svc/TestDocuments?$filter=FormId eq 1`

Ok, now I needed to be able to connect to the data from InfoPath.  That's a simple enough process, simply add a data connection for a REST Service.  Use the URL from above, but do not have it retrieve data by default.

 Now you have a couple options about how you form the URL.  If you want to linked document to open in the browser you're going to have to jump through some serious hoops.  Certainly doable though and I'll have more on that in a moment.

If it's ok that the document opens in the client side applications than the solution is much simpler, all you'll need to do is create a link to the document using the following XPath function: **concat(xdServerInfo:get-SharePointSiteUrl(), m:properties/ns1:Path, "/", m:properties/ns1:Name)**

So step by step, here's how you'll finish configuring your InfoPath form:

1. Insert a repeating section and bind it to the "entry" of the REST service.

1. Add a hyperlink control into the repeating section and set it's "Link To" data source value to **concat(xdServerInfo:get-SharePointSiteUrl(), m:properties/ns1:Path, "/", m:properties/ns1:Name)**.  You can also set the "Display" data source to m:properties/ns1:Name.

1. If you haven't already done so, create a secondary service to the same SharePoint list that you're submitting the InfoPath form to and get the ID value.  Make sure you're only getting the value for the current form, and that you're getting it automatically on form load.

1. Create an FormLoad action event (or a Action rule on a button) and set it to "Change REST URL".  Set the URL for the REST call to: **concat(xdServerInfo:get-SharePointSiteUrl(), "\_vti\_bin/listdata.svc/TestDocuments?$filter=FormId eq ", max(ID))**.  This will then load the list of documents to display in the form.

Voila, a list of document hyperlinks shown in the InfoPath form.

## Open Documents In Browser

Now, if opening the documents using the client application isn't enough here's the good, the bad and the hack you need to put together to have your hyperlink open the document in the browser window.  First, an example function:

`concat(xdServerInfo:get-SharePointSiteUrl(), "\_layouts/", concat(substring("Word", 1, contains(m:properties/ns1:Name, "docx") \* string-length("Word")), substring("xl", 1, contains(m:properties/ns1:Name, "xlsx") \* string-length("xl"))), "Viewer.aspx?id=", m:properties/ns1:Path, "/", m:properties/ns1:Name)`

Told you it was going to be ugly.  This section of the function  
**concat(substring("Word", 1, contains(m:properties/ns1:Name, "docx") \* string-length("Word")), substring("xl", 1, contains(m:properties/ns1:Name, "xlsx") \* string-length("xl")))**  
is what decides which viewer you need to use.  The example above only handles .xslx and .docx documents... you'll need to expand the function to support other types of documents.

Now the hack.  This kills me actually.  The hyperlink control in InfoPath does not support XPath functions as the "Link To" value.  Ergo, you can't just put this function in the hyperlink control and have it work nice and neat.  The work around I came up with involves using a rule to set the value of one of the fields in the REST secondary datasource to the XPath for the hyperlink and then referencing that field from the hyperlink's "Link To" data source property.

I know, this is ugly, but I figured since we're only going to be reading data I can use one of the fields I don't need to display to the users as a holding area for this information.  If you wanted to, the much cleaner solution would be to write code behind and populate a repeating field in the main section of the InfoPath form with the hyperlink values and probably the display value too.  However, code behind wasn't acceptable in my scenario.

Ok, so here's what I did.

1. Go to the REST secondary data source, expand entry and select m:properties.

1. Add an action rule to "Set a fields value" and then set a field from the properties area (I used CopySource) to the XPath value shown above.  What will happen is that as the data loads the CopySource field will be populated with the hyperlink you want that particular entry to use to load the document in the browser.

1. Replace the "Link To" data source value of the hyperlink control you added in Step 2 with the field you set the value of in step 6.  You should have already set the "Display" data source, but if not go ahead and do it now.

Voila, publish the form and the list of documents will be displayed for the user that show the linked document in the browser when clicked on.

{{< figure src="image4.gif" alt="Image4">}}
