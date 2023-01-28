---
title: 'Managing the Unified Group in Office 365 for SharePoint and Beyond'
date: Tue, 10 Apr 2018 13:24:04 +0000
draft: false
tags: 
  - SharePoint
  - Microsoft 365
  - C#
aliases: ["/2018/04/managing-the-unified-group-in-office-365-for-sharepoint-and-beyond/"]
bigimg: [{src: "ManagingUnifiedGroup_lg.png", desc: ""}]
---

## Introduction

Azure Active Directory (AAD) Unified Groups, or better known as Office365 Groups, the security principal that underlies modern SharePoint team sites, Teams, Outlook Groups, Planner, etc. is a very powerful management construct that is the glue that holds the Office 365 security pyramid together. Basically, a Unified Group has both an Owners group and a Members group and by adding users (either users in your tenant or external users – with a Microsoft based work and school account or a personal account) you can create a construct that allows you to work across many of the vast product offerings in Office 365. For a more easily consumable infographic covering the power of Unified Groups go check out fellow MVP, [Matt Wade’s](https://twitter.com/thatmattwade) [_An everyday guild to Office 365 Groups_](https://icansharepoint.com/everyday-guide-office-365-groups/)

At the tenant level, weather you’ve thought about it or not, you have a default sharing status for all the Unified Groups in your environment. Assuming you haven’t changed anything, they are probably; “Let users add new guests to the organization” and then for SharePoint and OneDrive “Let users share SharePoint Online and OneDrive for Business content with people outside the organization” – “Anyone, including anonymous users”. Obviously, you can set these any way you like but assuming you want to allow sharing of some kind then you’ll need to have sharing enabled at the tenant level. So now how do you disable/enable sharing for each of the groups/site collections.

Long story short, if you’re an enterprise you might want the ability to manage which groups include users outside your organization. And you might even want to build a system for tracking what users are granted access and if there’s some sort of approval process in place. By flipping a lot of switches and twisting a bunch of knobs, most through the Microsoft Graph and somewhat through the Microsoft.TenantAdministration library you can achieve just that.

## Scenario

From a central management system, maintain a list of sites a partner has external access to and the names of each user from that partner with access.\* When a new site/user is added do the following:

1. manually add that user as an external user via invitation in AAD
2. modify their user properties
3. assign them a manager
4. add the new user to the member group of the Unified Group

When the user accepts the external sharing request they will have access to the group. Further, we want to maintain one entry in AAD for each external email account.

>For the purposes of this scenario I’m not discussing the architecture of said central management system suffice it to say it certainly could be a set of lists in SharePoint with a relationship on partner, but it also could be an external system built on top of a relational database. Regardless of this implementation let’s assume we have a source of partners and users that can be granted access.

## Implementation

With the assumption that you are familiar with creating an Azure AD Application (either v1 of v2), the various authentication flows that you could use depending on your platform du jour, and the various ways to use either the ADAL or MSAL libraries I’ll move on to the actual pieces of code that implement the solution. If you are not familiar, please start by checking out the documentation about how to get auth tokens from the official [Microsoft site](https://learn.microsoft.com/en-us/graph/auth/?view=graph-rest-1.0). That site also has a bunch of Quick Starts and if you like labs, there are some good Microsoft Graph [Hands On Labs](https://github.com/OfficeDev/TrainingContent/tree/master/Graph) you can use to get yourself up to speed.

Also, when creating your Azure Application, you will need to grant a bunch of permissions depending on what type of app registration you choose. Because I am using application permissions and not delegated permissions, I granted my application the following:

* Directory.Read.All
* Directory.ReadWrite.All
* Group.ReadWrite.All
* User.Invite.All
* User.ReadWrite.All

### Setup

Assuming you have a list of sites you want to enable sharing with for each site you will need the site’s URL and the corresponding O365 Unified Group ‘Id’. I explained in my [previous post](/post/harvesting-sharepoint-sites/) how you might use the Microsoft Graph to retrieve the ID if you know the site URL. Since we have to have "sharing" turned on at the tenant level you will most likely want a process in place that turns sharing off for all existing Unified Groups and site collections and any newly created ones, managing that is outside the scope of this post but the code would be the same.

>I have seen several instances where that scenario won’t work but I’m almost positive it’s legacy groups that were created in this tenant as a result of utilizing preview code… so for the purposes of this post I’m going to assume you can get the Id via graph but if not, there are other ways you can get it most notably the Exchange Online PowerShell comandlets. You can use [Get-UnifiedGroup](https://learn.microsoft.com/en-us/powershell/module/exchange/get-unifiedgroup?view=exchange-ps) to retrieve information about the group. Be aware an entirely confusing aspect of the results of the commandlet is knowing which of the various guid’s returned is the one that works consistently with the Microsoft Graph. I have found that the **ExternalDirectoryObjectId** property works most consistently but have found several instances where it’s null, and in that case the ID seems to be the best alternative.

### Manage Sharing of Unified Group

To enable or disable sharing of the Unified Group, which is different from the site collection sharing status, you will want to create and apply a particular **groupSettingTemplate** to the Unified Group. You do so by first creating your version of the **Group.Unified.Guest** template. You can get the id of this template by issuing the following get request using the [graph explorer](https://developer.microsoft.com/en-us/graph/graph-explorer): _<https://graph.microsoft.com/v1.0/groupSettingTemplates>_

If you scroll through the results you will find the template for ‘Group.Unified.Guest’. Note the templates Id. Based on my testing the id is the same in all tenants, so you can probably skip this test but if you have problems might be worth going back and checking. Ok, now what you want to do is create the content for your request, check if the template is already applied to the group in question and then either post or patch the template to the group. See the code below.

```C#
//URL to the group's settings
string urlGraph = String.Format("https://graph.microsoft.com/v1.0/groups/{0}/settings", groupId);
//The groupSettingsTemplate Id that we want to apply to our group
string templateId = "08d542b9-071f-4e16-94b0-74abb372e3d9";
//The version of the template we will apply to the group, where AllowToAddGuests is either true/false
var content = new StringContent(@"{
    'displayName': 'Group.Unified.Guest',
    'templateId': '08d542b9-071f-4e16-94b0-74abb372e3d9',
    'values': [
        {
        'name': 'AllowToAddGuests',
        'value': 'True'
        }
    ]
}'}", Encoding.UTF8, "application/json");


using (var client = new HttpClient())
{
    //setup client
    client.BaseAddress = new Uri(urlGraph);
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    //A previous Async request retrieved our access token, now we're appending it to the header
    client.DefaultRequestHeaders.Add("Authorization", "Bearer " + task.Result.AccessToken);

    //Check if template exists
    string settingId = String.Empty;
    //Gets a list of existing groupTemplates applied to the group, if any.
    var taskExists = Task.Run(async () => await client.GetAsync(urlGraph));
    taskExists.Wait();
    if (taskExists.Result != null)
    {
        if (taskExists.Result.StatusCode == HttpStatusCode.OK)
        {
            HttpResponseMessage response = taskExists.Result;
            var taskResponse = Task.Run(async () => await response.Content.ReadAsStringAsync());
            taskResponse.Wait();
            if (taskResponse.Result != null)
            {
                //Converting the results to an object we can consume in C#, this is done by creating a class that matches the JSON
                GroupSettingsList settings = JsonConvert.DeserializeObject<GroupSettingsList>(taskResponse.Result);
                if (settings.value.Count > 0)
                {
                    foreach (var setting in settings.value)
                    {
                        //If the current setting, matches the groupSettingTemplate then save it
                        if (setting.templateId == templateId)
                            settingId = settings.value[0].id;
                    }
                }
            }
        }
    }
    
    Task<HttpResponseMessage> taskResult = null;
    //Based on if the groupSettingTemplate is already applied to this group, either post a new one or patch the existing one
    if (settingId == String.Empty)
        taskResult = Task.Run(async () => await client.PostAsync(urlGraph, content));
    else
        taskResult = Task.Run(async () => await client.PatchAsync(urlGraph + "/" + settingId, content));

    taskResult.Wait();
    if (taskResult.Result != null)
    {
        if (taskResult.Result.StatusCode == HttpStatusCode.Created)
        {
            Console.WriteLine("Success");
        }
        else
        {
            Console.WriteLine("Failed");
        }
    }
}
```

### Manage Sharing of the SharePoint site collection

Unfortunately, there is (as of publishing) no way through the Microsoft Graph to modify the sharing status of the site collection, however you can easily do so through CSOM. The Microsoft.TenantAdministration library gives you the means to change to the following states through an enum: _Disabled, ExternalUserSharingOnly, ExternalUserAndGuestSharing, ExistingExternalUserSharingOnly_. The following code shows you how to change it from **Disabled** to **ExternalUserSharingOnly** based on a value passed to the function.

```C#
//Note this specific using for the 'Tenant'
using Microsoft.Online.SharePoint.TenantAdministration;

using (ClientContext ctx = new ClientContext(tenantUrl))
{
    ctx.Credentials = new SharePointOnlineCredentials(\_username, \_password);
    ctx.RequestTimeout = -1;
    Tenant tenant = new Tenant(ctx);
    var site = tenant.GetSitePropertiesByUrl(siteUrl, true);
    ctx.Load(site);
    var taskResult = Task.Run(async () => await ctx.ExecuteQueryAsync());
    taskResult.Wait();
    site.SharingCapability = sharingEnabled ? SharingCapabilities.ExternalUserSharingOnly : SharingCapabilities.Disabled;
    //A list of allowed external domains can be added here
    site.SharingAllowedDomainList = "";
    SpoOperation op = site.Update();
    ctx.Load(op, i => i.IsComplete, i => i.PollingInterval);
    ctx.ExecuteQuery();
    while (!op.IsComplete)
    {
        //wait 15 seconds and try again
        System.Threading.Thread.Sleep(15000);
        op.RefreshLoad();
        ctx.ExecuteQuery();
    }
}
```

### Creating External Users

If the external user’s account already exists in your AAD, you will need to retrieve the users AAD id which can be accomplished by making a call to the user endpoint as shown below. This code is also the basis as you can see by the comments for adding the existing or newly created user to the Unified Group.

```C#
//Url to verify if external user already exists
string urlGraph = "https://graph.microsoft.com/v1.0/users?$filter=mail eq 'my\_email@extdomain.com'";

using (var client = new HttpClient())
{
    //setup client
    client.BaseAddress = new Uri(urlGraph);
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    //A previous Async request retrieved our access token, now we're appending it to the header
    client.DefaultRequestHeaders.Add("Authorization", "Bearer " + task.Result.AccessToken);

    //make request
    string userId = string.Empty;
    var taskUser = Task.Run(async () => await client.GetAsync(urlGraph));
    taskUser.Wait();
    if (taskUser.Result != null)
    {
        if (taskUser.Result.StatusCode == HttpStatusCode.OK)
        {
            HttpResponseMessage response = taskUser.Result;
            var taskUserExists= Task.Run(async () => await response.Content.ReadAsStringAsync());
            taskUserExists.Wait();
            if (taskUserExists.Result != null)
            {
                //Converting the results to an object we can consume in C#, this is done by creating a class that matches the JSON
                var user = JsonConvert.DeserializeObject(taskUserExists.Result);
                if (user.value.Count > 0)
                {
                  //User exists so save the userId to add it to the unified group
                  userId = user.value\[0\].id;
                }
                else
                {
                  //CODE TO CREATE INVITATION GOES HERE
                }
            }
        }
    }

    if (userId != string.Empty)
    {
      //CODE TO ADD USER TO UNIFIED GROUP GOES HERE - Adding Users to the Unified Group
    }
}
```

If you’ve verified that the user account doesn’t exist, then you will want to create an invitation for them to join. Luckily the Microsoft Graph has a great way to do this for you called [Invitation Manager](https://learn.microsoft.com/en-us/graph/api/resources/invitation?view=graph-rest-1.0). Depending on how much control you want over the email that goes to guests you can set the **sendInvitationMessage** property to allow Microsoft to send the email for you with a couple of configurable properties or you can take the information returned from the invitation process to craft and send your own email.

```C#
urlGraph = "https://graph.microsoft.com/v1.0/invitations";
//User doesn't exist, create invitation
var content = new StringContent(@"{
    'invitedUserEmailAddress': 'my\_email@extdomain.com',
    'inviteRedirectUrl': 'https://myTenant.sharepoint.com/sites/MyExternalSite',
    'invitedUserDisplayName': 'My User (extdomain)',
    'sendInvitationMessage': 'true',
    'invitedUserMessageInfo': {
        'ccRecipients': \[{
            'emailAddress': {
                'address': 'ccRecipient@myTenant.com',
                'name': 'CC Recipient'
            }
        }\]
    }
}", Encoding.UTF8, "application/json");
var taskNewUser = Task.Run(async () => await client.PostAsync(urlGraph, content));
taskNewUser.Wait();
if (taskNewUser.Result != null)
{
    if (taskNewUser.Result.StatusCode == HttpStatusCode.Created || taskNewUser.Result.StatusCode == HttpStatusCode.OK)
    {
        HttpResponseMessage responseNewUser = taskNewUser.Result;
        var taskNewUserContent = Task.Run(async () => await responseNewUser.Content.ReadAsStringAsync());
        taskNewUserContent.Wait();
        if (taskNewUserContent.Result != null)
        {
            var userNew = JsonConvert.DeserializeObject(taskNewUserContent.Result);
            if (userNew != null)
            {
                userId = userNew.invitedUser.id;
                //At this point the user exists in AAD and can be modified further.
            }
        }
    }
    else
    {
        Console.Write(taskNewUser.Result.StatusCode);
    }
}

```

The return payload from that post, gives you the AAD id for the user that will be used in the next step but that you can also then be used to modify the users account more, by setting other properties like mobile phone, company, and maybe even uploading a photo or setting a manager relationship. For more information on modifying a user record see the [Graph documentation for a User](https://learn.microsoft.com/en-us/graph/api/resources/users?view=graph-rest-1.0).

### Adding Users to the Unified Group

So, either from the results of creating an invitation or from looking the user up you have the AAD Id that can be used to add that user to the members group of the Unified Group. This is as easy as making a post to the _group/{id}/members_ endpoint. The code below goes in outlined in the first code snippet in the section Creating External Users.

```C#
//Add to Group
urlGraph = String.Format("https://graph.microsoft.com/v1.0/groups/{0}/members/$ref", groupId);
var contentGroup = new StringContent(@"{'@odata.id': 'https://graph.microsoft.com/v1.0/users/" + userId + @"'}", Encoding.UTF8, "application/json");
var taskResultGroup = Task.Run(async () => await client.PostAsync(urlGraph, contentGroup));
taskResultGroup.Wait();
if (taskResultGroup.Result != null)
{
    if (taskResultGroup.Result.StatusCode == HttpStatusCode.NoContent || taskResultGroup.Result.StatusCode == HttpStatusCode.OK)
    {
      Console.WriteLine("Success");
    }
    else
    {
      Console.Write("Failed");
    }
}
```

## Summary

By taking these ideas and your own requirements and imagination you can assemble a very powerful tool to manage your companies external sharing. Luckily for us the Microsoft Graph allows us to attain most the capabilities we need and in time, probably all. I hope this helps get you started. Happy Coding!
