---
title: 'Maintain file version history when moving/copying files between SharePoint sites'
date: Thu, 02 Jun 2011 13:54:43 +0000
draft: false
tags: 
  - SharePoint
  - Server 2010
SEO:
  title: "Maintain file version history moving/copying between SharePoint sites"
aliases: ["/2011/06/maintain-file-version-history-when-movingcopying-files-between-sharepoint-sites/"]
---

I'm working on a requirement to copy files from one document library to another document library in a sub-site. I figured this wouldn't be horribly difficult to do but turns out it's not as simple as you might think and for some reason, although I found many questions about how to do it, I found very few answers. From the things I've read out there it's apparently relatively easy if you're moving documents within the same site... apparently the Move method works and I read where someone suggesting using SPExport and SPImport. I also found a post by Ivan Sanders that said that you can use _Site Actions > Manage Content and Structure > Choose the Library > Choose the docs >Use the Actions drop Down Click onMove > Choose the new Location_ to accomplish the move on this [thread](https://www.sharepointdev.net/sharepoint--general-question-answers-discussion/cannot-maintain-versioning-on-documents-when-moving-to-different-folders-within-the-same-repository-23.shtml). Unfortunately, none of these solutions fully met my needs.

Ok, so onward and upward... I ended up started from a good post by 'Dink' on `Copying documents between libraries with metadata – including version history` (_no longer available_) which was a great starting point but seemed like it could be optimized a bit and was posted back in 2007, so I hoped that there might be potential improvements in 2010. As it turns out there is, in the form of additional overload methods for SPFileCollection.Add

So here's my code snippet. I'll point out that this snippet is in a function that takes two parameters SPListItem itmSource which is the source item to move, and SPDocumentLibrary libDest which is the target document library.

```c#
SPFile fileSource = itmSource.File;
//Here we'll get the created by and created on values from the source document.
SPUser userCreatedBy = fileSource.Author;
//Note we need to convert the "TimeCreated" property to local time as it's stored in the database as GMT.
DateTime dateCreatedOn = fileSource.TimeCreated.ToLocalTime();
//Get the versions
int countVersions = itmSource.File.Versions.Count;
//This is a zero based array and so normally you'd use the < not <= but we need to get
//the current version too which is not in the SPFileVersionCollection so we're going to
//count one higher to accomplish that.
for (int i = 0; i <= countVersions; i++)
{
   Hashtable hashSourceProp;
   Stream streamFile;
   SPUser userModifiedBy;
   DateTime dateModifiedOn;
   string strVerComment = "";
   bool bolMajorVer = false;
   if (i < countVersions)
   {
 //This section captures all the versions of the document and gathers the properties
 //we need to add to the SPFileCollection.  Note we're getting the modified information
 //and the comments seperately as well as checking if the version is a major version
 //(more on that later).  I'm also getting a stream object to the file which is more efficient
 //than getting a byte array for large files but you could obviously do that as well.
 //Again note I'm converting the created time to local time.

      SPFileVersion fileSourceVer = itmSource.File.Versions\[i\];
      hashSourceProp = fileSourceVer.Properties;
      userModifiedBy = (i == 0) ? userCreatedBy: fileSourceVer.CreatedBy;
      dateModifiedOn = fileSourceVer.Created.ToLocalTime();
      strVerComment = fileSourceVer.CheckInComment;
      bolMajorVer = fileSourceVer.VersionLabel.EndsWith("0") ? true : false;
      streamFile = fileSourceVer.OpenBinaryStream();
   }
   else
   {
 //Here I'm getting the information for the current version.  Unlike in SPFileVersion when
 //I get the modified date from SPFile it's already in local time.
      userModifiedBy = fileSource.ModifiedBy;
      dateModifiedOn = fileSource.TimeLastModified;
      hashSourceProp = fileSource.Properties;
      strVerComment = fileSource.CheckInComment;
      bolMajorVer = fileSource.MinorVersion == 0 ? true : false;
      streamFile = fileSource.OpenBinaryStream();
   }
   string urlDestFile = libDest.RootFolder.Url + "/" + fileSource.Name;
 //Here I'm using the overloaded Add method to add the file to the SPFileCollection.
 //Even though this overload takes the created and modified dates for some reason they aren't
 //visible in the SharePoint UI version history which shows the date/time the file was added
 //instead, however if this were a Microsoft Word document and I opened it in Word 2010 and looked
 //at the version history it would all be reflective of the values passed to this Add method.
 //I'm voting for defect but there could just be something I'm missing.
   SPFile fileDest = libDest.RootFolder.Files.Add(
       urlDestFile,
       streamFile,
       hashSourceProp,
       userCreatedBy,
       userModifiedBy,
       dateCreatedOn,
       dateModifiedOn,
       strVerComment,
       true);
   if (bolMajorVer)
 //Here we're checking if this is a major version and calling the publish method, passing in
 //the check-in comments.  Oddly when the publish method is called the passed created and
 //modified dates are displayed in the SharePoint UI properly without further adjustment.
        fileDest.Publish(strVerComment);
   else
   {
 //Setting the created and modified dates in the SPListItem which corrects the display in the
 //SharePoint UI version history for the draft versions.
      SPListItem itmNewVersion = fileDest.Item;
      itmNewVersion\["Created"\] = dateCreatedOn;
      itmNewVersion\["Modified"\] = dateModifiedOn;
      itmNewVersion.UpdateOverwriteVersion();
   }
}

```
