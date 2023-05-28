---
title: 'Resolve to Log'
date: Mon, 31 Dec 2018 18:51:56 +0000
draft: false
tags:
  - Microsoft 365
  - SharePoint Framework
  - PnPjs
  - TypeScript
seo:
  title: "Resolve to Log: Methods for tracking client-side code errors"
aliases: ["/2018/12/resolve-to-log/"]
bigimg: [{src: "PnPLogging_lg.png", desc: ""}]
---

{{< updatepost src="../bettter-practices-soncole-log-pnpjs" name="Console Log Better Practices with PnPjs V3" >}}

My Sympraxis partner [Marc Anderson](https://twitter.com/sympmarc) mentioned that we’ve been talking about [PnPJS packages](https://pnp.github.io/pnpjs/) for SharePoint Framework a lot lately and called out that I would be blogging about utilizing the logging package in his post [Using PnPJS and Async/Await to Really Simplify Your API Calls](https://sympmarc.com/2018/12/12/using-pnpjs-and-async-await-to-really-simplify-your-api-calls/). If you haven’t checked it out and aren’t using PnPJS and the Async/Await method instead of Promises in your SharePoint Framework solutions, you should give it a read.

## TL;DR

Download the sample code from my [GitHub repo](https://github.com/juliemturner/Public-Samples) for three examples of how to use the [PnP Logging](https://pnp.github.io/pnpjs/logging/) package.

## Why Log

Logging information from your application to the browser console about what’s happening under the covers in your code can be enormously helpful when trying to debug issues that are bound to arise. From basic information, like the fact that your web part has started and successfully initialized to error information during execution. Well thought out and consistent logging can really go a long way to solving issues fast. Certainly, you can issue calls to console.log throughout your code, and if you’re going to take nothing else from this post, please consider making it a common practice to do so in almost, if not every, method. [Waldek Mastykarz](https://twitter.com/waldekm) has written a nice post on utilizing and extending, shall we say, the out of the box logging built into the SharePoint Framework in his post [Logging in the SharePoint Framework solutions](https://blog.mastykarz.nl/logging-sharepoint-framework/). PnPJS has an implementation that resembles the CustomLogHandler he describes but takes it a bit further.

## Types of logging

If you look at the documentation PnPJS Logging supports a default **ConsoleListener**, a **FunctionListener**, and the ability to pass in your own implementation of a listener that inherits from **LogListener**. Each one honors the _Active Log Level_ which will then only execute the log method when the call's error level is greater to or equal to the set level. This is something you could easily set as a web part property or a [Tenant property](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/tenant-properties?tabs=sprest) so that you could get more of less information as the situation warrants.

## Starting Point

First, the Logger is a singleton, which is important to understand because that means that you need only initialize it once and then it’s available to use in anywhere in your code. Start by passing the listener of your choice to the subscribe method.

```typescript
Logger.subscribe(new ConsoleListener());
```

The second step is to set the Active Log Level, like so:

```typescript
Logger.activeLogLevel = LogLevel.Verbose;
```

And, make note that you can have more than one listener. For my advanced example I not only want to do some custom logging I also want to log information to the console, so I’ve added both listeners to the Logger.

## Calling the Logger

To call the logger you have a couple of different options. You can either use the **write** method, which will simply pass your information as a string to the message and if you choose a logging level. You can use the **writeJSON** method which allows you to pass a JSON object which will get converted to a string to serve as your message and optionally a logging level. And finally, the **log** method which will allow you to specify each property of the LogEntry. For more samples see the [official documentation](https://pnp.github.io/pnpjs/logging/).

## Basic Logging

For basic logging we’re just using the functionality as is, by utilizing a ConsoleListener, setting the logging level, and noting that anything we “Log” is getting written to the browser’s console.

## Custom Logging

For custom logging we took advantage of the **FunctionListener** and created our own variation on how we might log information to the console. As the documentation points out, if you already have your own logging solution, be that an api or whatever, you could use this method to simply hand off the errors. My example shows making a REST call when the log entry is at the Error level.

```typescript
let listener = new FunctionListener((entry: LogEntry) => {
  try {
    switch (entry.level) {
      case LogLevel.Verbose:
        console.info(entry.message);
        break;
      case LogLevel.Info:
        console.log(entry.message);
        break;
      case LogLevel.Warning:
        console.warn(entry.message);
        break;
      case LogLevel.Error:
        console.error(entry.message);
        // pass all logging data to an existing framework -- for example a REST endpoint 
        this.context.httpClient.post("", HttpClient.configurations.v1, { headers: { Accept: "application/json" }, body: JSON.stringify(entry) });
        break;
    }
  } catch (err) {
    console.error(\`Error executing customLogging FunctionListener - ${err}\`);
  }
});

Logger.subscribe(listener); 
```

## Advanced Logging

Finally, advanced logging takes advantage of building your own implementation by inheriting from LogListener. In this implementation I'm creating a scenario where by you would log just the errors to a custom list, in this case in SharePoint, but it could easily be anywhere. The point is that I want to implement my own listener so that I can do some setup, like make sure I have the users’ Id.

```typescript
export default class AdvancedLoggingService implements LogListener {
  private _applicationName: string;
  private _web: Web;
  private _logListName: string;
  private _userId: number;
  private _writeLogFailed: boolean;

  constructor(applicationName: string, logWebUrl: string, logListName: string, currentUser: string) {
    //Initialize
    try {
      this._writeLogFailed = false;
      this._applicationName = applicationName;
      this._logListName = logListName;
      this._web = new Web(logWebUrl);
      this.init(currentUser);
    } catch (err) {
      console.error(`Error initializing AdvancedLoggingService - ${err}`);
    }
  }

  private async init(currentUser: string): Promise<void> {
    //Implement an asynchronous call to ensure the user is part of the web where the ApplicationLog list is and get their user id.
    try {
      let userResult = await this._web.ensureUser(`i:0#.f|membership|${currentUser}`);
      this._userId = userResult.data.Id;
    } catch (err) {
      console.error(`Error initializing AdvancedLoggingService (init) - ${err}`);
    }
  }

  public log(entry: LogEntry): void {
    try {
      //If the entry is an error then log it to my Application Log table.  All other logging is handled by the console listener
      if (entry.level == LogLevel.Error) {
        if (!this._writeLogFailed) {
          let stackArray = null;
          if (entry.data.StackTrace && entry.data.StackTrace.length > 0)
            stackArray = JSON.stringify(entry.data.StackTrace.split('\n').map((line) => { return line.trim(); }));
          let newLogItem: LogItem = new LogItem(this._applicationName, entry.data.FileName, entry.data.MethodName, new Date(), this._userId, entry.message, stackArray);
          let newLogItemResult = this._web.lists.getByTitle(this._logListName).items.add(newLogItem);
        }
      }
    } catch (err) {
      //Assume writing to SharePoint list failed and stop continuous writing
      this._writeLogFailed = true;
      console.error(`Error logging error to SharePoint list ${this._logListName} - ${err}`);
    }
    return;
  }
}
```

As a result, every time an error is logged a new entry is put in my **ApplicationLog** list.

{{< figure src="ApplicationLog.png" alt="ApplicationLog">}}

## Conclusion

PnPJS library logging package has a lot of depth to create some super functional logging implementations for your custom SharePoint Framework solutions. Resolve this year to make your code more robust and easily supportable. For the complete source code, please check out my [GitHub repo](https://github.com/juliemturner/Public-Samples).

Happy Coding!
