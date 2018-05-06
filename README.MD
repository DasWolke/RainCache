# RainCache

## A simple and modular Discord caching library

Part of the WeatherStack

You want to use a shared cache for your Discord bot ? Maybe MongoDB ? But Presences should be stored in redis ?

Then RainCache is the right tool for the job!

#### Cool things you can do with RainCache:
- Store data received from Discord in a configurable storage medium
- Select the type of storage on a type level basis (e.g Channel, Presence, etc..)
- Batteries included, RainCache can parse raw Discord events and store the data accordingly
- Easily customizable, you can write your own storage engine, connector or cache class

#### Documentation:
You can find the docs at [https://daswolke.github.io/RainCache/](https://daswolke.github.io/RainCache/)

#### Installation:
To be able to install RainCache, make sure that you have node 8 (or higher) and npm installed on your computer.
Then run the following command in a terminal `npm install raincache`

#### Example:
```js
let RainCache = require('raincache');
// Load the Amqp Connector
let AmqpConnector = RainCache.Connectors.AmqpConnector; 
// Load the redis storage engine class
let RedisStorageEngine = RainCache.Engines.RedisStorageEngine; 
// Use the default options and create a new connector which isn't connected yet
let con = new AmqpConnector(); 
// Create a new uninitialized RainCache instance, set redis as the default storage engine, 
// disable debugging mode and pass an inbound and an outbound connector to receive and forward events
let cache = new RainCache({
    storage: {
        default: new RedisStorageEngine({
            host: 'localhost'
        })
    }, debug: false}, 
    con, con);

let init = async () => {
    // initialize the cache, the connector and the database connection
    await cache.initialize(); 
};
// Declare an asynchronous init method
init().then(() => {
    console.log('Cache initialized');
}).catch(e => console.error(e));
// Run the init function
```

#### Small tricks and hints:
- RainCache creates an entry on the user collection with an id of "self" when it processes the READY packet,
 this entry only contains an id and allows you to easily get the current user from the cache by looking up the id.


---

#### Notable Difference to normal caches
RainCache generally does not have any differences in comparison with general Discord library caches, but there is one notable difference: 

**Presences are stored per user and not per guild**

This means that you should make sure to fetch all users of a guild on startup of the gateway (by using guild member chunk),
because you may have to deal with users that are not cached yet.
This decision has the benefit,that you can safely ignore the presence_update event when you do not care about the status (online/offline, etc..) of a user.
Apart from that it allows RainCache to minimize the storage usage a lot, since a user has one presence instead of x presences.

---


#### Indexing

RainCache uses indexing to allow you to easily get something like a list of all members of a server or similar,
although, depending on the storage engine you use, it might not be needed.
Whether indexing is used is up to the programmer of the storage engine you use.
The Redis Storage Engine which is already shipped with RainCache does use indexing by creating a redis set per namespace with a collection of ids in it.
This way you have a redis set containing something like a list of all members that are in a server available at `guild.$guild_id.member`
