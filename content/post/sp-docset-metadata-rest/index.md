---
title: 'Create SharePoint Document Set (and set metadata) using REST'
date: Mon, 14 Nov 2016 20:16:14 +0000
draft: false
tags: 
  - SharePoint
  - Server 2013
  - Server 2016
  - REST
  - JavaScript
aliases: ["/2016/11/create-sharepoint-document-set-and-set-metadata-using-rest/"]
---

A quick post today to augment what's out there in the "Googleverse".  I needed to create a Document Set in client side code, and went out to find the appropriate calls to make that happen.  To update the metadata on the folder you create (which is all a Document Set really is under the covers), you simply make an "almost" normal list item update call.  So the following is the various "functions" you need and how to string them together to do this task.  As you read through, I'll point out in the code where other older posts on this topic steer you wrong.

>WARNING, this code is not optimized for best practices but is generalized for reuse. As sample code, it may not work in all scenarios without modification.

>NOTE: this code requires jQuery to execute the AJAX calls and the promise__NOTE: The use of odata=verbose is no longer required and better practices would suggest that it should not be used in production. See this [post](https://sympmarc.com/2016/05/02/making-your-rest-calls-simpler-by-changing-the-metadata-setting/) from my partner Marc Anderson more information.

This first function is what is used to create the document set folder. The function uses the folderName parameter as the title of the Document Set

```javascript
var webUrl = window.location.protocol + "//" + window.location.host + \_spPageContextInfo.webServerRelativeUrl;

var createDocSet = function(listName, folderName, folderContentTypeId){
    var listUrl = webUrl + "/" + listName;
    var folderPayload = {
        'Title' : folderName,
        'Path' : listUrl
    };

    //Create Folder resource
    return $.ajax({
        url: webUrl + "/\_vti\_bin/listdata.svc/" + listName,
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(folderPayload),
        headers: {
            "Accept": "application/json;odata=verbose",
            "Slug": listUrl + "/" + folderName + "|" + folderContentTypeId
        }
    });
};
```

The following code is a generic update function, we'll use it to update our Document Set's metadata after its been created. In other posts out there, you'll see the **url** of the AJAX call set to the folder.\_\_metadata.uri. Unfortunately, that uri is no longer valid as a way to update the metadata and the call will fail. Also, when updating list items there's a standard "type" that defines the object your updating, with our Document Set this type is different than a generic list item, and so I'm passing it in from our calling function. It can partially be retrieved from the folder creation response's metadata, but it's not exactly correct and the call will fail.

>NOTE: the list's display name in this case has no spaces or odd characters, if yours does you will need to escape those characters when creating the list type, for example a list containing an "\_" you would use the following code: "SP.Data." + list.replace('\_', '\_x005f\_') + "ListItem"

```javascript
var update = function (list, item, type) {
    var eTag = item.eTag;
    delete item.eTag;
    //You may need to escape the list name when setting the \_\_metadata property "type".
    if(type != undefined){
        item\["\_\_metadata"\] = {"type": type};
    }else{
        item\["\_\_metadata"\] = {"type": "SP.Data." + list + "ListItem"};
    }

    return $.ajax({
        method: 'POST',
        headers: {
            "Content-Type": "application/json;odata=verbose",
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": document.getElementById("\_\_REQUESTDIGEST").value,
            "X-HTTP-Method": "MERGE",
            "If-Match": '"' + eTag + '"'
        },
        data: JSON.stringify(item),
        url: webUrl + "/\_api/web/lists/getbytitle('" + list + "')/items(" + item.Id + ")"
    });
};
```

So now we have functions that do the work for us we just need to call them. In this case I'm showing the code encapsulated in a function that does the calls but returns a promise to the calling function so that the caller can be notified when the document set has been created completely.

The call to _createDocSet_ includes the Document Set's content type, this can be retrieved from the URL of the Content Type definition page. Also note in this code that you need to do a bit of manipulation of the eTag if you're going to pass it. You technically could use a wildcard instead of extrapolating the eTag, but for completeness I've included it.

```javascript
var createDocSetObject = function(title, item){
    var list = 'MyList';
    var defer = $.Deferred();
    //Your list name, the title of the Document Set, and the Document Set's content type 
    createDocSet(list, title, '0x0120D520007ACA148760DDC646BBA59538FC81DBF9').then(function(response){
        var folder = response.data.d;
        //Make sure to get the eTag version by pulling off the leading info
        item.Id = folder.Id;
        item.eTag = folder.\_\_metadata.etag.split('\\"')\[1\].toString();
        var type = "SP.Data." + list + "Item";
        update(list, item, type).then(function(response2){
            //Formulate your response to the calling funciton
            var result = {ID: folder.Id, MyItemTitle: folder.Name};
            defer.resolve(result);
        }, function(error){
            defer.reject(error);
        });
    }, function(error){
        defer.reject(error);
    });
    return defer.promise;
};
```
