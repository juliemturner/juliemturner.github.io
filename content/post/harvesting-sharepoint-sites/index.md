---
title: 'Harvesting your SharePoint Site Collections'
date: Tue, 20 Mar 2018 11:36:31 +0000
draft: false
tags:
  - Microsoft 365
  - Microsoft Graph
  - REST
  - PowerShell
  - SharePoint
aliases: ["/2018/03/harvesting-your-sharepoint-site-collections/"]
bigimg: [{src: "harvestingsites.jpeg", desc: ""}]
---

One of the things I’ve been working on lately is harvesting a complete listing of all the site collections in a tenant, including as much metadata as possible. Some of the metadata I’m looking for revolves around adding governance to managing your catalog of sites, especially in a large tenant. For sure I think the SharePoint product group has visibility into the needs here but to get full fidelity might take significantly longer than you can wait. So, if you’re looking to create yourself a site catalog how do you go about it and what information is available to you. In this post I’m just going to touch on each of the ways you can harvest this information and what additional metadata each provides as well as what other ways you can get information.

## Site Collection Details - PowerShell

The SharePoint Online commandlets provide extremely basic information about a site collection through [Get-SPOSite](https://learn.microsoft.com/en-us/powershell/module/sharepoint-online/get-sposite?view=sharepoint-ps).

```powershell
Get-SPOSite -Limit All -Detailed
```

Metadata returned

* ResourceUsageCurrent
* ResourceUsageAverage
* StorageUsageCurrent
* LockIssue
* WebsCount
* CompatibilityLevel
* AllowSelfServiceUpgrade
* SiteDefinedSharingCapability - returns the stored value of the site policy.
* SharingCapability - returns the effective access level (the site policy and the tenant policy combined.

## Site Collection Details - PnPPowerShell/CSOM

If the information in the previous call isn’t enough for you or if PowerShell is not really the right language for your solution, then you have the alternative option of SharePoint PnP PowerShell which leverages the Tenant Administration CSOM. For a full list of properties that are returned see the documentation: [Powershell](https://learn.microsoft.com/en-us/powershell/module/sharepoint-online/Set-SPOSite?view=sharepoint-ps)/[CSOM](https://learn.microsoft.com/en-us/previous-versions/office/sharepoint-csom/dn159168(v=office.15))

```powershell
Get-PnPTenantSite -Detailed
```

Highlights of the information you can get from this endpoint are…

* AllowDownloadingNonWebViewableFiles
* AllowEditing
* CommentsOnSitePagesDisabled
* CompatibilityLevel
* ConditionalAccessPolicy
* DenyAddAndCustomizePages
* DisableCompanyWideSharingLinks
* DisableFlows
* HasHolds
* LockIssue
* LockState
* SharingAllowedDomainList
* SharingBlockedDomainList
* SharingCapability
* SharingDomainRestrictionMode
* ShowPeoplePickerSuggestionsForGuestUsers
* SiteDefinedSharingCapability
* Status
* Template
* WebsCount

### Under the covers… CSOM

Under the covers of the PnP PowerShell commandlet is CSOM and since it’s open source we can see an example of getting the same information via CSOM, so if you’re writing managed code this might be the better option for you.

```C#
using Microsoft.Online.SharePoint.TenantManagement;
using (ClientContext ctx = new ClientContext(tenantUrl))
{
  ctx.Credentials = new SharePointOnlineCredentials(\_username, \_password);
  Tenant tenant = new Tenant(ctx);
  SPOSitePropertiesEnumerableFilter filter = new SPOSitePropertiesEnumerableFilter()
  {
    IncludePersonalSite = PersonalSiteFilter.Exclude,
    StartIndex = "0",
    IncludeDetail = true
  };

  SPOSitePropertiesEnumerable sitesList = null;
  var sites = new List();
  do
  {
    sitesList = tenant.GetSitePropertiesFromSharePointByFilters(filter);
    ctx.Load(sitesList);
    ctx.ExecuteQuery();
    sites.AddRange(sitesList.ToList());
    filter.StartIndex = sitesList.NextStartIndexFromSharePoint;
  } while (!string.IsNullOrWhiteSpace(sitesList.NextStartIndexFromSharePoint));
}
```

## Sharing and External Users

One of the things I hear frequently is concerns about managing external access, so having visibility to what sites have external sharing enabled and how many (and which external users) have access us useful. From previous section one of the properties we have access to is ‘SharingCapability’. The possible values for that property are:

Disabled

external user sharing (share by email) and guest link sharing are both disabled

ExternalUserSharingOnly

external user sharing (share by email) is enabled, but guest link sharing is disabled

ExistingExternalUserSharingOnly

(DEFAULT) Allow sharing only with the external users that already exist in your organization’s directory

ExternalUserAndGuestSharing

external user sharing (share by email) and guest link sharing are both enabled

By using the TenantManagement class you can specifically harvest the external users you have in your site collection.

```C#
using Microsoft.Online.SharePoint.TenantManagement;
using (ClientContext ctx = new ClientContext(tenantUrl))
{
  ctx.Credentials = new SharePointOnlineCredentials(\_username, \_password);
  var tenant = new Office365Tenant(ctx);
  var extUsers = tenant.GetExternalUsersForSite(siteUrl, 0, 1, String.Empty, SortOrder.Ascending);
  ctx.Load(extUsers, i => i.TotalUserCount, i => i.ExternalUserCollection);
  var task = Task.Run(async () => await ctx.ExecuteQueryAsync());
  task.Wait();
  if (extUsers != null)
  {
    foreach(var user in extUsers.ExternalUserCollection)
    {
        var name = user.DisplayName;
    }
    var temp = extUsers.TotalUserCount;
  }
}
```

## Microsoft Graph - What’s available now

As the Microsoft Graph is an ever changing API that’s constantly being expanded I’m obviously going to be writing this as a primer as of the date of publication so please make sure you’re referencing the [graph documentation](https://learn.microsoft.com/en-us/graph/overview) to verify what might have changed. Of what we have outlined above you can get some very basic information about a site collection from the graph by making a REST call to:

```text
<https://graph.microsoft.com/v1.0/sites/contoso.sharepoint.com:/sites/1drvteam>
```

where 'contoso.sharepoint.com' is your tenant and '/sites/1drvteam' is the relative path to the site collection you're harvesting.

>There are several other ways to can formulate the call for site information see this [reference](https://learn.microsoft.com/en-us/graph/api/site-get?view=graph-rest-1.0&tabs=http) for more details.

```json
{
  "id": "contoso.sharepoint.com,2C712604-1370-44E7-A1F5-426573FDA80A,2D2244C3-251A-49EA-93A8-39E1C3A060FE",
  "owner": {
    "user": {
      "displayName": "Daron Spektor",
      "id": "5280E7FE-DC7A-4486-9490-E790D81DFEB3"
    }
  },
  "displayName": "OneDrive Team Site",
  "name": "1drvteam",
  "createdDateTime": "2017-05-09T20:56:00Z",
  "lastModifiedDateTime": "2017-05-09T20:56:01Z",
  "webUrl": "https://contoso.sharepoint.com/teams/1drvteam"
}
```

### Get Group – by site collection URL (sort of)

What might be useful for visibility of your tenant would be information about any group enabled team sites, to get that we can utilize the **/groups** endpoint. For the time being there is no way via the graph to get the related group via the **sites** endpoint. A work around is to use the **$filter** parameter with the **mailNickname** property of the group. For example, if your site collection was <https://contoso.sharepoint.com/teams/1drvteam> then the corresponding graph call to get the group information would be:

```text
https://graph.microsoft.com/v1.0/groups?$filter=mailNickname eq '1drvteam'
```

which then returns the following properties and extensions

```json
{
  "allowExternalSenders": false,
  "autoSubscribeNewMembers": true,
  "createdDateTime": "String (timestamp)",
  "description": "string",
  "displayName": "string",
  "groupTypes": \["string"\],
  "id": "string (identifier)",
  "isSubscribedByMail": true,
  "mail": "string",
  "mailEnabled": true,
  "mailNickname": "string",
  "onPremisesLastSyncDateTime": "String (timestamp)",
  "onPremisesSecurityIdentifier": "string",
  "onPremisesSyncEnabled": true,
  "proxyAddresses": \["string"\],
  "renewedDateTime": "String (timestamp)",
  "securityEnabled": true,
  "unseenCount": 1024,
  "visibility": "string",
  "acceptedSenders": \[ { "@odata.type": "microsoft.graph.directoryObject"} \],
  "calendar": { "@odata.type": "microsoft.graph.calendar" },
  "calendarView": \[{ "@odata.type": "microsoft.graph.event" }\],
  "conversations": \[ { "@odata.type": "microsoft.graph.conversation" }\],
  "createdOnBehalfOf": { "@odata.type": "microsoft.graph.directoryObject" },
  "drive": { "@odata.type": "microsoft.graph.drive" },
  "events": \[ { "@odata.type": "microsoft.graph.event" }\],
  "memberOf": \[ { "@odata.type": "microsoft.graph.directoryObject" } \],
  "members": \[ { "@odata.type": "microsoft.graph.directoryObject" } \],
  "owners": \[ { "@odata.type": "microsoft.graph.directoryObject" } \],
  "photo": { "@odata.type": "microsoft.graph.profilePhoto" },
  "rejectedSenders": \[ { "@odata.type": "microsoft.graph.directoryObject" } \],
  "sites": \[ { "@odata.type": "microsoft.graph.site" } \],
  "threads": \[ { "@odata.type": "microsoft.graph.conversationThread" }\]
}
```

Now you have the group’s guid, you can formalize the call to

```text
https://graph.microsoft.com/v1.0/groups/54e79fa1-0948-4a98-9914-199230818f49
```

And then get other related group information including those outlined in the response above. Included in the members endpoint is the **userPrincipalName**, in the case of external users this property will have the **#Ext#** pattern, and therefore could be used to determine if there are external users in the group. That said it's a much more round about method then the properties you got from the TenantAdministration CSOM call detailed in the previous section.
