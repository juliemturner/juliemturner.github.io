---
title: 'Curate the News: Social Following Sites on behalf of a user'
date: Mon, 18 Feb 2019 13:51:20 +0000
draft: false
tags: 
  - SharePoint
  - Microsoft 365
  - C#
aliases: ["/2019/02/curate-the-news-social-following-sites-on-behalf-of-a-user/"]
bigimg: [{src: "followsite_lg.png", desc: ""}]
---

## Curate the News

### Social Following Sites on behalf of a user

The impetus for this post was the desire to follow a site for a batch of users. Why? Well, the news that shows up on the SharePoint home page stems from news posted to sites you follow. So as an organization, especially a large one, if you want to somewhat curate what news gets pushed to your users you need to make sure they’re following the sites that have the news you want them to see.

The social endpoints that are generally available via REST or CSOM clearly let you follow a site for the current user but there really is no documented way to follow one site for a batch of users or on behalf of another user.

This post follows the lead set by [Mikael Svenson](https://twitter.com/mikaelsvenson) in his post [Quickly clear Followed sites using PnP PowerShell](https://www.techmikael.com/2018/05/quickly-clear-followed-sites-using-pnp.html). In Mikael’s case he was trying to clear the sites he had followed while doing some testing, and a quick way to do that is with his PowerShell script. What he uncovered though is the hidden list in the user’s personal site that stores and abundance of social information including sites, documents and items a user is following. Now all I had to do was leverage this list and see what could come of it.

>Let me be super clear, since it was a topic of conversation on the twitterverse, that this is not a Microsoft sanctioned method for solving this problem. Sadly there is no supported method for solving this problem, and so you need to make sure that you, or your client understand the inherent risks with going off reservation.

What comes next is just the code, it’s almost ridiculously simple solution, but low and behold it works.

{{< figure src="FollowSite.png" alt="FollowSite">}}

Once you add the site to the list, the site will show up as being followed when the user navigates to it, and after a short time news from that site will bubble up for the user when they visit the SharePoint home page.

#### Init setup

Obviously this code is an example. Normally you would want to set up all these variables in an app.config, database, or whatever works for your solution. I'm just outlining here the information you're going to need to be able to complete the process.

The biggest hurdle to success here is permissions. By default the "Company Administrator" is the only person who is a SCA (Site Collection Administrator) on each of the personal sites. You'll need to make sure whatever account your using has access to each of the users you want to modify or this solution isn't going to work for you. To get around that, the simplest solution is probably to create an Azure app registration with the "Have full control of all site collections" app permission and then use that context to access each users site.

```C#
const string \_tenant = ""; //e.g. 'contoso'
const string \_username = "";
SecureString \_password = null; //The password for \_username

var user = ""; //e.g. 'test\_contoso\_com'

var socialSite = $"https://{\_tenant}-my.sharepoint.com/personal/{user}";
var socialPartial = $"/personal/{user}";

var followSite = $"https://{\_tenant}.sharepoint.com/sites/MySite";

Guid webId = new Guid("");
string webTitle = "";
Guid siteId = new Guid("<Site Id for followSite>");
```

#### Execute

```C#
using (ClientContext ctx = new ClientContext(socialSite))
{
 ctx.Credentials = new SharePointOnlineCredentials(_username, _password);
 try
 {
  //Hidden list that contains followed sites, documents, and items
  var list = ctx.Web.Lists.GetByTitle("Social");
  ctx.Load(list);

  //Validate the 'Private' folder exists -- for a user who hasn't followed anything it will not be there.
  var folderPrivate = ctx.Web.GetFolderByServerRelativeUrl($"{socialPartial}/Social/Private");
  ctx.Load(folderPrivate);
  try
  {
   ctx.ExecuteQuery();
  }
  catch (Exception ex)
  {
   //Create private and Followed site
   var info = new ListItemCreationInformation();
   info.UnderlyingObjectType = FileSystemObjectType.Folder;
   info.LeafName = "Private";
   ListItem newFolder = list.AddItem(info);
   newFolder["Title"] = "Private";
   newFolder["ContentTypeId"] =
    "0x01200029E1F7200C2F49D9A9C5FA014063F220006553A43C7080C04AA5273E7978D8913D";
   newFolder.Update();
   ctx.ExecuteQuery();
  }

  //Validate the 'FollowedSites' folder exists -- for a user who hasn't followed anything it will not be there.
  var folderFollowed = ctx.Web.GetFolderByServerRelativeUrl($"{socialPartial}/Social/Private/FollowedSites");
  ctx.Load(folderFollowed);
  try
  {
   ctx.ExecuteQuery();
  }
  catch (Exception ex)
  {
   //Create private and Followed site
   var info = new ListItemCreationInformation();
   info.UnderlyingObjectType = FileSystemObjectType.Folder;
   info.FolderUrl = $"{socialPartial}/Social/Private";
   info.LeafName = "FollowedSites";
   ListItem newFolder = list.AddItem(info);
   newFolder["Title"] = "FollowedSites";
   newFolder["ContentTypeId"] = "0x0120001F6E5E1DE9E5447195CFF4F4FC5DDF5B00545FD50747B4D748AA2F22CD9D0BCB5E";
   newFolder.Update();
   ctx.ExecuteQuery();
  }

  //Create the new follow item for the site, in the FollowedSites folder.
  var infoItem = new ListItemCreationInformation();
  infoItem.FolderUrl = $"{socialPartial}/Social/Private/FollowedSites";
  var newFollowedSite = list.AddItem(infoItem);
  newFollowedSite["Title"] = webTitle;
  newFollowedSite["ContentTypeId"] = "0x01FC00533CDB8F4EAE447D941948EFAE32BFD500D2687BB5643C16498964AD0C58FBA2F3";
  newFollowedSite["Url"] = followSite;
  newFollowedSite["SiteId"] = siteId;
  newFollowedSite["WebId"] = webId;
  newFollowedSite.Update();
  ctx.ExecuteQuery();
 }
 catch (Exception ex)
 {
  Console.WriteLine(ex.Message);
 }
}
```

As usual the source code for this solution can be found in my [github repo](https://github.com/juliemturner/Public-Samples).

Happy Coding!
