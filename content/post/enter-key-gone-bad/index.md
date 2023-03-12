---
title: 'Enter key gone bad'
date: Fri, 18 Mar 2016 16:12:50 +0000
draft: false
tags: 
  - SharePoint
  - Microsoft 365
  - SharePoint Framework
  - TypeScript
  - JavaScript
seo:
  title: Enter key behavior on SharePoint Page Changing to Edit Mode
  description: When writing client-side code, how to keep the user pressing the Enter key from putting SharePoint page in edit mode.
aliases: ["/2016/03/enter-key-gone-bad/"]
---

{{< figure src="editgonewrong.png" alt="EditGoneWrong">}}

This morning I had an issue trying to implement a Phone Directory on a client’s home page.  The UI incorporated a First Name and a Last Name input box and a “Go” button.  But as we all know, users like to hit Enter, and we all want to try and support the best user experiences we can.  However, [SharePoint](https://sharepoint.microsoft.com "Microsoft SharePoint")'s default implementation of the Enter key can sometimes put the page in edit mode…

So how do you get around this… two things..

1. You need to stop the event from propagating, not that this is really the culprit but if you’re doing widget type work it’s just good practice to make sure that what you’re doing doesn’t affect the functionality of the rest of the page.
2. You need to ignore the SharePoint's default behavior of the enter key.

So what does this look like?

Let’s say you had the following DOM:

```html
<div>
  <input placeholder="First" onkeydown=" MYCODE.onEnter();" />  
  <input placeholder="Last" onkeydown=" MYCODE.onEnter();" />  
  <input style="cursor: pointer;" onclick=" MYCODE.go();" />
</div>  
```

And the following script:

```javascript
"use strict"

var MYCODE = MYCODE || {};  
MYCODE.go = function () {
  //Code to execute Phone Directory search goes here
}
MYCODE.onEnter = function onEnter() {
  //See options below`  
} 
```

There are a few ways to accomplish the same thing:

Option 1 (Old School):

```javscript
if (event.keyCode == 13) {
    MYCODE.go();   
    event.returnValue = false;   
} 
```

Option 2 (Modern and Sexy):

```javascript
if (event.keyCode == 13) {  
    MYCODE.go();   
    event.preventDefault();   
    event.stopPropagation();   
} 
```

Option 3: (Perfectionist)

```javascript
if (event.keyCode == 13) {  
    MYCODE.go();   
    if(event.preventDefault){  
        event.preventDefault();  
        event.stopPropagation();   
    }else{   
        event.returnValue = false;   
    }  
}   
  
Happy Coding!
```
