---
title: 'Tip: React JS - Fragments streamline your DOM'
date: Thu, 18 Jul 2019 14:04:15 +0000
draft: false
tags: 
  - ReactJS
  - TypeScript
aliases: ["/2019/07/react-js-fragments-streamline-your-dom/"]
bigimg: [{src: "TipNavComponent_lg.jpeg", desc: ""}]
---

This quick post is going to fall into my Tips & Tricks category as it’s information readily available but if you didn’t know to look for it you probably wouldn’t have found it. In version 16.2 React JS introduced the notion of "Fragments". A Fragment is basically an empty container that you can use in a react component to group a set of children together without adding additional nodes into the DOM. Prior to version 16.2 (and 16.0 – we’ll get to why in a moment), every component must return one and only one parent node. This makes a certain amount of sense, but there are situations where you want a component to return a set of siblings. So, to support this scenario you would artificially add a `<div>` element to your component to adhere to that requirement.

## Pre React JS 16.0 (aka, the old way)

```tsx
public render(): React.ReactElement<IMyComponentProps> {
   return (
      <div>
         <p>First Sibling</p>
         <p>Second Sibling</p>
      </div>
   );
}
```

Resulting HTML if you render two of the components

```html
<div>
   <p>First Sibling</p>
   <p>Second Sibling</p>
</div>
<div>
   <p>First Sibling</p>
   <p>Second Sibling</p>
</div>
```

## React JS v16.0

In version 16.0 the framework introduced the idea of returning an array of elements instead of wrapping them in a DOM element. This means that the above solution could be implemented in the following manner.

```tsx
public render(): React.ReactElement<IMyComponentProps> {
   return [
      <p key="firstP">First Sibling</p>,
      <p key="secondP">Second Sibling</p>
   ];
}
```

Now the resulting HTML if you render 2 of the components doesn’t have extra unused DOM elements.

```html
<p>First Sibling</p>
<p>Second Sibling</p>
<p>First Sibling</p>
<p>Second Sibling</p>
```

There are several issues with this solution, first, you have to deal with the ugly code syntax of the array and making sure each element is separated by a comma. The second is that technically you would get key warnings from React, I tended to ignore those. The last was that text needed to be wrapped in quotes, I rarely put text directly in my code so that one again was not one I ran into but it’s worth knowing about.

## React JS 16.2

Introducing Fragments… these little beauties can be implemented two ways by either using

```tsx
<React.Fragment>
</React.Fragment>
```

Or the shorthand way… <>

```tsx
public render(): React.ReactElement<IMyComponentProps> {
   return (
      <>
         <p>First Sibling</p>
         <p>Second Sibling</p>
      </>
   );
}
```

The resulting HTML is just as streamlined without the extra work of adding brackets and keys.

You can find the full details by checking out this post from the React JS blog: [React v16.2.0: Improved Support for Fragments](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html)

With regard to SharePoint Framework as best as I can tell, by doing a little [CLI for Microsoft 365](https://github.com/pnp/cli-microsoft365) sleuthing, the move from React 15.x directly to 16.3.2 happened in version 1.6, so that means since that version we've had the ability to do React.Fragments.

Hope this little tip helps. Happy Coding!
