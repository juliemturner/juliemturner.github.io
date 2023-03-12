---
title: 'Streamline ADAL implementation: Extending SharePoint with the Microsoft Graph – Part 4'
date: Wed, 30 Aug 2017 13:25:59 +0000
draft: false
tags: 
  - Microsoft 365
  - Microsoft Graph
  - REST
  - TypeScript
  - JavaScript
series: ["Extending SharePoint with ADAL and the Microsoft Graph API"]
seo:
  title: Streamline ADAL implementation - Extending SharePoint with the Microsoft Graph
  description: Further streamline the implementation of ADAL, in AngularJS specifically, but with broader implications to any web based framework.
aliases: ["/2017/08/extending-sharepoint-with-adal-and-the-microsoft-graph-api-part-4-the-extension/"]
bigimg: [{src: "LeveragingGraphAPIPart4.jpeg", desc: ""}]
---

## Introduction

When I last left you ([in Part 3](../extending-sharepoint-with-adal-and-the-microsoft-graph-api-part-3/)) we had completed the round-trip journey that is learning all the facets to accessing the Microsoft Graph API (MSGraph) through an Azure Application and the ADAL.js library. A significant portion of our time was spent simply on the different ways to leverage ADAL.js depending on the framework you were using. In this next installment we're going to go one step further and streamline our implementation of ADAL, in AngularJS specifically, but with broader implications to any web based framework.

## The Architecture

When we discussed ADAL implementation in [Part 2](../extending-sharepoint-with-adal-and-the-microsoft-graph-api-part-2/) I mentioned the use of the adal-angular.js library which augments the $http provider as well as the ngRoute provider. In that installment, I gave you options for using or not using ngRoute but maintaining use of the library to augment the $http provider. The issue we would have was when trying to not only call MSGraph endpoints but also call SharePoint REST APIs within the same SPA. I had found as updates to ADAL.js came out issues started to arise with the reliance on the _anonymousEndpoints_ config option. Basically, and without much detail, it stopped working for me (this may not be what you're seeing and if so, please feel free to carry on). At the same time, I completely embraced using AngularJS UI router which you can use to manage views without modifying the URL which when working inside a SharePoint page is a beneficial state. Given that I wasn’t using either thing that made the custom angular implementation worthwhile I decided to adjust my architecture so I could leverage adal.js in the most efficient way possible.

## Simplification

The new simper method relies on 3 things. **The first**, is leftover, and that is configuring AngularJS HTML5 mode, which as shown below (and shown in Part 2) is done in the module configuration.

```javascript
//Module
angular.module("ReviewApp", \["ui.router", 'officeuifabric.core','officeuifabric.components', "SympLogService", "Message", "ReviewDataService", "ReviewVMService"\])
    .config(uiRouteConfiguration)

//config function, that sets html5Mode -- other code and injections are used to configure the ui.router module
function uiRouteConfiguration($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider, $locationProvider: angular.ILocationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('!');

    $stateProvider
        .state('default', {
            template: ''
        }).state('review', {
            template: ''
        });

    //Initializes state to default, without changing the URL
    $urlRouterProvider.otherwise(function($injector) {
        let $state = $injector.get('$state');
        $state.go('default');
    })
}

```

**The second** aspect is making sure the user is logged in when the page is loaded. When using ngRoute it’s imperative that on any route that will utilize the adal tokens the application make sure the user is logged in first. Given a user could navigate directly to a route then you needed to manage for that. When using the UI router, you only have 1 route and many views. So, I only need to make sure the “container” or “main” view verifies the user’s login. This simplifies things a lot, but I still want to make that implementation as modular as possible. In this case I’m going to implement the verification function in my view model and then call it from the main components $onInit function (part of AngularJS components, introduced in v1.5) which loads when the component is first run. That way I can trap the various page loads that happen during the implicit flow process.

>Note: This code is using AngularJS $q, depending on your implementation you may want to consider a more modern [async/await](https://mariusschulz.com/blog/compiling-async-await-to-es3-es5-in-typescript) implementation

### View

```javascript
$onInit(): void {
    this.reviewVM.adalHandler(this.adalAuthContext, window.location.hash).then((result) => {
        if(result){
            //.... continue initializing your component
        }
    });
}
```

### View Model

```typescript
public adalHandler(adalAuthContext: any, hash: string): angular.IPromise {
    let d = this.$q.defer();

    let isCallback: boolean = adalAuthContext.isCallback(hash);

    if (isCallback && !adalAuthContext.getLoginError()) {
        adalAuthContext.handleWindowCallback();
        d.resolve(false);
    }else{
        let user = adalAuthContext.getCachedUser();
        if (!user) {
            //Log in user
            adalAuthContext.login();
            d.resolve(false);
        }else{
            d.resolve(true);
        }
    }

    return d.promise;
} 
```

**The final** piece is acquiring the token which needs to be handled at our model layer. Our login function retrieves the token for us and placed it in the cache, but we still need to retrieve it whenever we want to make a call to one of our adal endpoints. To do this we create a promise scenario that retrieves the value from the cache and/or acquires a new one if necessary. Then a special base class for making the $http call and appending the ADAL token rounds out the implementation.

### Model

```typescript
//Function to get token from cache
private getAuthToken(endpoint): angular.IPromise {
    let d = this.$q.defer();

    //Read the token from the cache
    let tokenCache = this.adalAuthContext.getCachedToken(endpoint);

    if (tokenCache == undefined) {
        //If token is undefined, then call AAD to get a new token
        this.adalAuthContext.acquireToken(endpoint, function (error, token) {
            if (error || !token) {
                d.reject(error);
            }
            else {
                d.resolve(token);
            }
        });
    } else {
        d.resolve(tokenCache);
    }
    //Return a promise for acquiring token
    return d.promise;
};

//Base function for making MSGraph calls with auth token appended to header
private getAdal(url: string, endpoint: string, blob: boolean = false): angular.IPromise {
    let d = this.$q.defer();

    //Must pass the endpoint, not the full url
    this.getAuthToken(endpoint).then((token) => {
        let httpConfig: any = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': "Bearer " + token
            },
            url: url
        };
        if (blob)
            httpConfig.responseType = "blob";
        d.resolve(this.$http(httpConfig));
    });

    return d.promise;
} 
```

## Summary

As you can see this is really clean and straight forward and pushes the complexities of accessing the MSGraph into the background so you can get on with creating a great solution. Happy Coding!

## Resources

### OAuth Flows

* [Andrew Connell - Looking at the Different OAuth2 Flows Supported in AzureAD for Office 365 APIs](https://www.andrewconnell.com/blog/looking-at-the-different-oauth2-flows-supported-in-azuread-for-office-365-apis)
* [Microsoft - Integrating applications with Azure Active Directory](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#updating-an-application)
* [Microsoft - Should I use the v2.0 endpoint?](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-overview#restrictions-on-libraries-amp-sdks)

### ADAL

* [GitHub - Azure Active Directory Library for JS](https://github.com/AzureAD/azure-activedirectory-library-for-js)
* [Cloud Identity - Introducing ADAL JS v1](https://www.cloudidentity.com/blog/2015/02/19/introducing-adal-js-v1/)
* [Cloud Identity - ADAL JavaScript and AngularJS – Deep Dive](https://www.cloudidentity.com/blog/2014/10/28/adal-javascript-and-angularjs-deep-dive/)
* [Cloud Identity - Getting Acquainted with AuthenticationResult](https://www.cloudidentity.com/blog/2013/09/16/getting-acquainted-with-authenticationresult/)
* [Cloud Identity - Getting Acquainted with ADAL’s Token Cache](https://www.cloudidentity.com/blog/2013/10/01/getting-acquainted-with-adals-token-cache/)
* [Microsoft - Call the Microsoft Graph API using OAuth from your web part](https://dev.office.com/sharepoint/docs/spfx/web-parts/guidance/call-microsoft-graph-from-your-web-part)

### Microsoft Graph API

* [Microsoft Graph Documentation](https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0)
