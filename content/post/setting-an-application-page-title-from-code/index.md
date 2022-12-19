---
title: 'Setting an Application Page Title from code'
date: Wed, 15 Jun 2011 21:02:25 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - C#
aliases: ["/2011/06/setting-an-application-page-title-from-code/"]
---

I'm currently dealing with a requirement where I need to the set an application page's title from the code behind. By default the form has a ContentPlaceHolder control with a ContentPlaceHolderID="PlaceHolderPageTitle" which in the master page is the text that will fall in the header's title tag. Unfortunately, _<asp:Content>_ controls are not added to the hierarchy at runtime so I can't access it directly.

There are good ways to modify this title on the client side with Javascript but client side code doesn't really suit my needs as the title will come from some custom manipulation that's better done on the server. It did cross my mind that I could do this minipulation and then post it back in script to have it update but it seemed kind of like taking the long way around. Anyway, long story short I found a way to access that title in the Page\_Load event but if anyone out there has any better ideas I'd love to hear them.

```C#
using System.Web.UI.HtmlControls;

protected void Page\_Load(object sender, EventArgs e)
{
  if(!Page.IsPostBack){
    HtmlTitle tagTitle = new HtmlTitle();
    //Obviously this would be more complex code in practice
    tagTitle.Text = "My new title here";
    //The parent of "PlaceHolderPageTitle" is the HtmlTitle control
    Page.Header.Controls.Remove(
        Page.Header.FindControl("PlaceHolderPageTitle").Parent);
    Page.Header.Controls.Add(tagTitle);
  }
}

```
