---
title: 'Quick Primer on InfoPath and SharePoint 2010 Time Zones'
date: Thu, 31 Jan 2013 13:28:46 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
  - Server 2013
  - InfoPath
aliases: ["/2013/01/quick-primer-on-infopath-and-sharepoint-2010-time-zones/"]
---

[InfoPath](https://www.microsoft.com/en-us/microsoft-365/blog/2014/01/31/update-on-infopath-and-sharepoint-forms/) _decrepcated_ functions such as Today() and Now() pick up the time zone based on the settings of the [SharePoint server](https://sharepoint.microsoft.com).  By default the web is set to the time zone of the server, which is thereby the default of any new sites created as well as new user profiles created.  For global organizations with users around the world, there are situations where you will want the automated date/time stamps to display the local time for the user rather than the server time.  This article will show you how to set that up.

The time zone of the web can be changed in central administration.  The time zone of the site can be changed by going to site settings / regional settings.  In addition a user can change their personal time zone settings by going to “my settings / my regional settings”.

The InfoPath form I created to test the scenario has 2 fields.  The first is set by default using the now() function when the form is created, the second is set by an action on form load, again using the now() function.  The first field is also used to name the form when it’s first submitted.  Using the magic of VMs, I set the time zone of the host machine and the site settings to be Hawaii time zone (GMT-10).  I then have a separate test user whose regional settings I set to Pacific (GMT-8) and am using the browser on a machine whose time zone is set to EST (GMT-5).

On the machine whose time zone is set to Hawaii, I created an instance of the InfoPath form.  Note that not only are the two fields set to the current Hawaii time but also the Created and Modified dates show as Hawaii time (Figure 1).

{{< figure src="image5.gif" alt="Image5">}}

Figure 1: Form in Hawaii time zone from machine in Hawaii time zone.

If I log into SharePoint as the same user but from the host machine whose time zone is set to EST I still see the exact same results.  Note the machine’s time is 12:35. (Figure 2)

{{< figure src="image6.gif" alt="Image6">}}

Figure 2: Form in Hawaii time zone from machine in Eastern time zone

Now, by logging into SharePoint as the user who changed the regional settings to Pacific time, I see something very different (Figure 3).  Note that the Created and Modified dates in the SharePoint list are adjusted to my regional settings which are Pacific time zone.  And when I open the form the refresh date time uses the now() function which uses my regional time zone setting to set that date/time.

{{< figure src="image7.gif" alt="Image7">}}

Figure 3: Form in Hawaii time zone from machine in Eastern time zone as user in Pacific time zone.

## Conclusion

If you need all the date/time stamps to appear the same regardless of the user’s location, then either override or leave the default regional settings for your web and make sure the users do not change the regional settings of the web.  If the users want to see the information converted to their own time zone, they should change their regional settings to their own time zone.
