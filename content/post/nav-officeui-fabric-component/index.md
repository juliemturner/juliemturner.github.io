---
title: 'Tip: Implementing ''Nav'' Office Fabric UI React Component'
date: Tue, 31 Jul 2018 23:55:05 +0000
draft: false
tags: 
  - Microsoft 365
  - SharePoint Framework
  - ReactJS
  - TypeScript
aliases: ["/2018/07/tip-implementing-nav-office-fabric-ui-react-component/"]
bigimg: [{src: "TipNavComponent_lg.jpeg", desc: ""}]
---

This post is meant to be a quick supplement to the documentation provided by Microsoft around the Nav component of the [Fluent UI](https://developer.microsoft.com/en-us/fluentui/#/). This Nav component gives you a control that you either create URL links or maybe more commonly, support navigation via code. For general links, where the URL is either a route or some other page, the implementation of the INavLinkGroup\[\] and INavLink is quite straight forward, just provide a Key, Name, and URL with a couple other optional parameters. For programmatic support, the documentation provides a solution but as it turns out that implementation is misleading. I was finding that my nav items that needed to execute a bit of code would sometimes execute that code twice. As it turns out I wasn’t using it right, so let me help clarify by showing you what I found.

### Documented Implementation

{{< highlight html "linenos=inline">}}
<Nav
  groups={[
 {
   links: [
  {
    name: 'Home',
    url: 'https://example.com',
    links: [
   {
     name: 'Activity',
     url: 'https://msn.com',
     key: 'key1'
   },
   {
     name: 'News',
     url: 'https://msn.com',
     key: 'key2'
   }
    ],
    isExpanded: true
  },
  { name: 'Documents', url: 'https://example.com', key: 'key3', isExpanded: true },
  { name: 'Pages', url: 'https://msn.com', key: 'key4' },
  { name: 'Notebook', url: 'https://msn.com', key: 'key5' },
  { name: 'Long Name Test for ellipse', url: 'https://msn.com', key: 'key6' },
  {
    name: 'Edit',
    url: 'https://cnn.com',
    onClick: this._onClickHandler2,
    icon: 'Edit',
    key: 'key8'
  },
  {
    name: 'Delete',
    url: 'https://cnn.com',
    onClick: this._onClickHandler2,
    iconProps: { iconName: 'Delete' },
    key: 'key9'
  }
   ]
 }
  ]}
  expandedStateText={'expanded'}
  collapsedStateText={'collapsed'}
  selectedKey={'key3'}
/>
{{</ highlight >}}

Note the code on lines 29 and 36.  Those are INavLink entries that include the “onClick” event. So when I implemented similar Nav items I implemented them the same way. After playing around with it a little I realized my issue with some code executing twice when the link was clicked and realized that the proper implementation is to leverage the onLinkClick property by which you can bind an event handler to the Nav component to handle link clicks. The signature for that method includes the HTML element as well as the INavLink item that was clicked. Using this allows us to redirect to our other code to handle those Nav items that require a little more programmatic support.

In my implementation the Nav is hidden until the user clicks on a menu icon. I decided to implement with a simple switch statement, where the default case hides the menu by changing my state property that displayed it in the first place (I handle hiding the menu for each of the other menu options in their specific implementations as I’m often changing some other aspect of the state and want to try and consolidate these calls as much as possible). Ok, so let me just show you how I would implement the above example:

### Updated Implementation

Note in lines 28 and 34 I simply set the url to an empty string.  Then, later on line 41 I hook the component up to my click handler.

{{< highlight html "linenos=inline">}}
<Nav
  groups={[
 {
   links: [
  {
    name: 'Home',
    url: 'https://example.com',
    links: [
   {
     name: 'Activity',
     url: 'https://msn.com',
     key: 'key1'
   },
   {
     name: 'News',
     url: 'https://msn.com',
     key: 'key2'
   }
    ],
    isExpanded: true
  },
  { name: 'Documents', url: 'https://example.com', key: 'key3', isExpanded: true },
  { name: 'Pages', url: 'https://msn.com', key: 'key4' },
  { name: 'Notebook', url: 'https://msn.com', key: 'key5' },
  { name: 'Long Name Test for ellipse', url: 'https://msn.com', key: 'key6' },
  {
    name: 'Edit',
    url: '',
    icon: 'Edit',
    key: 'key8'
  },
  {
    name: 'Delete',
    url: '',
    iconProps: { iconName: 'Delete' },
    key: 'key9'
  }
   ]
 }
  ]}
  onLinkClick={this._onNavClick}
  expandedStateText={'expanded'}
  collapsedStateText={'collapsed'}
  selectedKey={'key3'}
/>
{{</ highlight >}}

{{< highlight typescript "linenos=inline">}}
private _onNavClick(e: React.MouseEvent<HTMLElement>, item: INavLink): void {
  switch(item.key){
    case "key8":
      this._onEdit();
      break;
    case "key9":
      this._onDelete();
      break;
    default:
      this.setState({showPlaylistMenu: false});
      break;
  }
}
{{</ highlight >}}

Hope this helps in your implementations, Happy Coding!
