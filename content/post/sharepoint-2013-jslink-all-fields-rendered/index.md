---
title: 'SharePoint 2013 JSLink - All Fields Rendered'
date: Wed, 26 Aug 2015 19:41:41 +0000
draft: false
tags: 
  - SharePoint
  - JSLink
  - Server 2013
  - Server 2016
aliases: ["/2015/08/sharepoint-2013-jslink-all-fields-rendered/"]
---

While creating a custom Client Template using JSLink, I came up against the issue of knowing when all the fields were rendered on the form.  To explain where the issue arises let me first take just a moment to explain when building a custom template for this type of form, where you want to manipulate the fields, you have available to you both a Pre and Post Render function.  What that does is fire the function attached to it either pre or post **each** custom field rendering being executed.

The reason I bring this up is that there could be some misconception that it fires before field rendering starts and after all field rendering is complete, but that’s not the case. So if your form has 10 fields, these functions will each fire 10 times.  I also found document.ready to be unreliable as it often fired before all the fields were rendered, and further, if I needed to make decisions based on the context of the form, I would no longer have access to that information.

So, the solution does in the end involve the OnPostRender function of the Template Override, but what you do there is what counts. So just to put everything in context, and for brevity, here is the shell of the custom Client Template file.  _Note the declaration of the postfields variable inside of My.CustomTemplate._

```c#
window.My = window.My || {};
My.CustomTemplate = function() {
   var postfields = 0;
   function onPostRenderTemplate(ctx) {
      /*See Below*/
   }
   function registerTemplate() {
      var overrideCtx = {};
      overrideCtx.Templates = {};
      overrideCtx.Templates.Fields = { /*Removed for Brevity*/ };
      overrideCtx.OnPostRender = onPostRenderTemplate;
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
   }
}
RegisterModuleInit("/_catalogs/masterpage/MyCustomTemplate.js", My.CustomTemplate);
My.CustomTemplate(); 
```

Ok, now we need to fill in the onPostRenderTemplate function.  Primarily, we need to know when we’ve gotten through all the fields on the form. This is accomplished by incrementing the "global" postfields variable within the onPostRenderTemplate function.  The question is what are we testing it against to know when we've rendered all the fields.

```c#
 function onPostRenderTemplate(ctx) {
   postfields++;
   if (postfields <= Object.keys(ctx.Templates.Fields).length) {
      /* Execute post field render function */
   }
} 
```

The answer is JavaScript prototype function keys which seems to be fairly well [supported](http://kangax.github.io/compat-table/es5/#Object.keys "supported").

> The `**Object.keys()**` method returns an array of a given object's own enumerable properties, in the same order as that provided by a [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in "The for..in statement iterates over the enumerable properties of an object, in arbitrary order. For each distinct property, statements can be executed.") loop (the difference being that a for-in loop enumerates properties in the prototype chain as well).

Ergo, if you look at the ctx.Template.Fields and get the length that gives you the number of Fields on the form that will be "rendered" and provides you a way of telling when the last Field has been rendered.

So now I can execute some fancy functions to do thinks like:

## Hide Fields

```js
$('.hiddenField').closest('tr').hide();
```

## Modifying the Fields label to make it look like it was Required*

```js
$('.requiredField').closest('tr').find('h3').append('*');
```

or some other post rendering customization based as I stated on values in the ctx variable.
