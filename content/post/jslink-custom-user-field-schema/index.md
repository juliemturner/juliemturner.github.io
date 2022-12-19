---
title: 'JSLink Custom User Field Schema'
date: Fri, 28 Aug 2015 19:13:00 +0000
draft: false
tags:
  - SharePoint
  - Server 2013
  - Server 2016
  - JSLink
aliases: ["/2015/08/jslink-custom-user-field-schema-1/"]
---

I had the requirement of setting the default value of a person field to the current user.  After looking around in the great wide internet I found a very helpful [article by Glenn Reian](https://umeaworks.wordpress.com/2015/03/17/setting-default-value-of-person-field-in-sharepoint-2013-with-jslink/) article by Glenn Reian which got me started.

Where I ran into a problem was that my user field had customized settings that weren't being pulled through into the custom implementation of my people picker.  As it turns out the issue was with the schema that is passed to the SPClientPeoplePicker\_InitStandaloneControlWrapper function.  In Glenn's example (and every other example I found out there) this schema is hard coded, which is perfectly acceptable in most cases.  However, I needed some values to be slightly different to adhere to my column settings.  

As it turns out there are two solutions.  The first, obvious one, is to adjust the schema manually in the code.  And again this may be a fine solution.  But as Glenn did, I had separated my concerns and created what I hoped to be a fairly reusable version of initializePeoplePicker.  So now I needed to enhance that function to pass through adendums to the schema or maybe it's own schema.

What I found was something i wasn't quite expecting.  The schema I needed was actually right there in the context variable in JSLink.  So, using Glenn's implementation and extending it slightly I just modified initialzePeoplePicker to the following:

```javascript
var initUserDefaultPeoplePicker = function (ctx, peoplePickerElementId, ppSchema) {  
    if (ppSchema === null) {  
        ppSchema = {};  
        ppSchema['PrincipalAccountType'] = 'User';  
        ppSchema['ShowUserPresence'] = true;  
        ppSchema['SearchPrincipalSource'] = 15;  
        ppSchema['ResolvePrincipalSource'] = 15;  
        ppSchema['AllowMultipleValues'] = false;  
        ppSchema['MaximumEntitySuggestions'] = 50;  
        ppSchema['Width'] = '280px';  
    }  
    var uri = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";  
    getAjax(uri).done(function(user) {         
        // Set the default user by building an array with one user object  
        var users = new Array(1);  
        var currentUser = new Object();  
        currentUser.AutoFillDisplayText = user.DisplayName;  
        currentUser.AutoFillKey = user.AccountName;  
        currentUser.Description = user.Email;  
        currentUser.DisplayText = user.DisplayName;  
        currentUser.EntityType = "User";  
        currentUser.IsResolved = true;  
        currentUser.Key = user.AccountName;  
        currentUser.Resolved = true;  
        users[0] = currentUser;         // Render and initialize the picker  
        SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, users, ppSchema);  
    });  
};
```

and then from the custom rendering function for the user field I passed the schema associated with the field through:

```javascript
function efTaskOwner(ctx) {  
    var retVal = '<div id="TaskOwnerDiv">';  
    retVal += initDefaultPeoplePicker(ctx.CurrentItem["TaskOwner"], 'TaskOwnerDiv', tx.CurrentFieldSchema)  
    retVal += '</div><span class="etmRequiredField"></span>';       
    return retVal;  
}
```
