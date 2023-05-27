---
title: 'Console Log Better Practices with PnPjs V3'
date: Sat, 27 May 2023 09:51:56 +0000
draft: false
tags:
  - Microsoft 365
  - SharePoint Framework
  - PnPjs
  - TypeScript
  - JavaScript
bigimg: [{src: "header.png", desc: ""}]
---

I was recently asked by a conference attendee to help him understand when to use the @pnp/logging package that we ship with [PnPjs](https://pnp.github.io/pnpjs/).

This is an excellent question, and I've addressed it somewhat before in a previous post called [Resolve to Log](../resolve-to-log/). All of the guidance I included about the package in that post still applies, however the examples references V2 of the library. To recap there is the ability to create a ConsoleLogger, a FunctionalLogger, or a custom listener class and then register that listener to the PnPjs timeline via the PnPLogging behavior.

I believe the package to be extremely helpful when needed, however, I have changed my own personal practices lately and wanted to share my thinking. In V3 release of PnPjs it was our goal to minimize the size of the package as far as we possibly could while being as compatible. That made us take a hard look at some of our dependencies and we realized that although the [@pnp/logging package](https://pnp.github.io/pnpjs/logging/) is super powerful it's more than is needed for the root package logging. So instead of jettisoning the package all together, we just separated the dependency and continue to publish it but don't take a dependency in any of the other packages, such as @pnp/sp, @pnp/graph, etc.

When that happened I realized that I would be adding an additional package to my own projects where I was essentially using logging but not taking much advantage of the additional functionality and therefore was taking overhead I didn't need. So, I decided to move all my code to use [console](https://developer.mozilla.org/en-US/docs/Web/API/console) API directly.

> Side note, if you haven't looked at the power in the console API in depth, it would behove you to do so, there's way more there than just console.log and console.error!

V3 also brought some new [configuration options](https://pnp.github.io/pnpjs/logging/#configuration-options) to the to the @pnp/logging package in the form of the ability to customize coloring in the console.

Since as I said above my previous post's samples were written for V2 of PnPjs, I'm including the updated code before for using it with V3. When I have to implement logging with some of these more advanced scenarios I absolutely still reach for the @pnp/logging package.

## Custom Logging

For custom logging we took advantage of the **FunctionListener** and created our own variation on how we might log information to the console. As the documentation points out, if you already have your own logging solution, be that an api or whatever, you could use this method to simply hand off the errors. My example shows making a REST call when the log entry is at the Error level.

```typescript
import { LogLevel, PnPLogging, Logger, ConsoleListener } from "@pnp/logging";
import { spfi, SPFx } from "@pnp/sp";

const listener = new FunctionListener((entry: LogEntry) => {
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

const sp = spfi().using(SPFx(this.context), PnPLogging(LogLevel.Error));
```

## Advanced Logging

Finally, advanced logging takes advantage of building your own implementation by inheriting from LogListener. In this implementation I'm creating a scenario where by you would log just the errors to a custom list, in this case in SharePoint, but it could easily be anywhere. The point is that I want to implement my own listener so that I can do some setup, like make sure I have the users’ Id.

`AdvLog.ts` file:

```typescript
import { ILogListener, ILogEntry } from "@pnp/logging";
import { spfi, SPFx } from "@pnp/sp";

export default class AdvancedLoggingService implements ILogListener {
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
      const userResult = await this._web.ensureUser(`i:0#.f|membership|${currentUser}`);
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
          const newLogItem: LogItem = new LogItem(this._applicationName, entry.data.FileName, entry.data.MethodName, new Date(), this._userId, entry.message, stackArray);
          const newLogItemResult = this._web.lists.getByTitle(this._logListName).items.add(newLogItem);
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

Wherever I'm initializing my sp (or graph) object:

```typescript
import { LogLevel, PnPLogging, Logger } from "@pnp/logging";
import { spfi, SPFx } from "@pnp/sp";
import AdvancedLoggingService from "./AdvLog";

Logger.subscribe(new AdvancedLoggingService());

const sp = spfi().using(SPFx(this.context), PnPLogging(LogLevel.Error));
```

As a result, every time an error is logged a new entry is put in my **ApplicationLog** list.

{{< figure src="ApplicationLog.png" alt="ApplicationLog">}}
