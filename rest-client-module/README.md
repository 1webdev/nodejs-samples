#Rest-API Client

A Javascript client for the rest-api.

```


### Branches

#### master

Main branch, all changes and p.r.s are against master.


#### Feature

Feature branches are created off of master for changes, and then merged-in
later via pull request.


### Usage


```javascript
var ApiClient = require('rest-client');

var client = new ApiClient('http://localhost:300');

// Get some devices
client.devices
      .limit(10)      // limit() and page() are optional,
      .page(2)        // they'll default to the api's default
      .spread(function(data, response) {
          // data is the response data returned from the server,
          // response is an object that represents the entire response

          /* ... */
      });

// Get a particular play-list
client.playlists
      .id('pls::5bb803ca-1704-4888-b7ca-ba2c29b9899f')
      .spread(function(data) {
          /* ... */
      });


// Authenticate
client
    .authenticate({ username:'brandNewUser', password:'test' })
    .then(function() {
        // After authenticating the client saves the access token and
        // automatically sends it in future responses.

        client.devices
              .post()
              .send({ /* data for a new device */ )
              .then(function(resArray) {
                  // resArray[0] is the same as the data argument above
                  // resArray[1] is the same as the response argument above

                  /* ... */
              });
    })
    .catch(function(err) {
        // ...
    });
```


### ApiClient

#### Properties

**baseUrl**: Set during construction, a base url that points towards the
rest-api itself. ex: `http://test.com`

**auth**: An object that contains the authorization information. It is
automatically set as part of a successful call to `ApiClient.authenticate()`. It
can also be set manually. Properties:
* `token`: The auth token
* `user`: User object for the authenticated user
* `profile`: Profile object for the authenticated user

**options**: An object with misc. properties. Properties:
* `project`: A projectId to be automatically included on requests.


#### Endpoint Properties

Endpoint properties are calculated on the fly and return a new `ApiRequest` for
communicating with a specific endpoint. A couple of properties are given for
each endpoint, to help create clearer code

* **Accounts** : `.accounts`, `.account`, `.acn`
* **Activities** : `.activities`, `.activity`, `.act`, `.acts`
* **Categories** : `.categories`, `.category`, `.cat`, `.cats`
* **Channels** : `.channels`, `.channel`, `.cha`
* **Devices** : `.devices`, `.device`, `.dev`
* **Events** : `.events`, `.event`, `.evt`
* **Exercises** : `.exercises`, `.exercise`, `.exc`
* **Courses** : `.courses`, `.course`, `.crs`
* **Licenses** : `.licenses`, `.license`, `.lcs`
* **Media** : `.media`, `.med`
* **News** : `.news`, `.nws`
* **Playlists** : `.playlists`, `.playlist`, `.pls`
* **Projects** : `.projects`, `.project`, `.prj`
* **Roles** : `.roles`, `.role`, `.rle`
* **Tenants** : `.tenants`, `.tenant`, `.tnt`
* **Training-Plans** : `.trainingPlans`, `.trainingPlan`, `.tpl`
* **Users** : `.users`, `.user`, `.usr`


* **Auth** : `.authorization`, `.authEndpoint`
* **Conversations** : `.conversation`, `.convo`, `.convos`, `.conversations`
* **Info** : `.info`
* **Now** : `.now`
* **Pois** : `.poi`, `.pois`, `.place`, `.places`
* **Profiles** : `.profiles`, `.profiles`, `.prf`


#### Methods

##### *`Constructor`*(url[, options])

Takes a base url for the api, and gives a new instance of the client.

```
var ApiClient = require('rest-client'),
    url = 'http://test.com';

var client = new ApiClient(url);
```


##### *`setProject`*(projectId)

Set a project id to be used for subsequent requests.

```
client.project('prj::1');
```


##### *`authenticate`*(credentials)

Authenticate with the rest-api.

```
var credentials = {
    username:'brandNewUser',
    password:'test'
};

client.authenticate(credentials)
      .then(function() { /* successfully authentiacted now, yay! */ })
      .catch(function(err) { /* :( */ });
```


#### *`newRequest`*(url[, options])

Creates a new `ApiRequest` and returns it.

```
var apiRequest = client.newRequest(url);
```


### ApiRequest

#### Properties

**url**: The base url of the request

**options**

**ids**: An array of the ids that will be used as part of the url.

**lastVerb**: The last HTTP verb that was set for the request.

**request**: The actual Superagent request object.

**postfix**: A postfix that will be added to the url. Usually used for extra api
methods. ex: `url + '/unread'`


#### Methods

##### *`Constructor`* (url[, options])

Takes a url for the api endpoint, and gives a new request instance.

```
var ApiRequest = require('rest-client/src/request'),
    url = 'http://test.com/profiles';

var request = new ApiRequest(url);
```


##### *`get`*()
##### *`put`*()
##### *`post`*()
##### *`patch`*()
##### *`delete`*()

Set the HTTP verb that will be used for the requestr. `GET` is default.

```
restClient
    .profiles
    .post()
    .send(data)
    .then(/* ... */);
```


##### *`query`*()

Add query parameters to the request, passes arguments to the superagent request.

```
restClient
    .news
    .query({ category:categoryId })
    .then(/* ... */);
```


##### *`exec`*()

Execute the request, returning back a thenable.


##### *`then`*()

Execute the request, and return the result to a callback.

```
restClient
    .news
    .then(function(resultArray) {
        resultArray[0] // => response data
        resultArray[1] // => response
    });
```


##### *`spread`*()

Execute the request, and return the results to a callback

```
restClient
    .news
    .spread(function(data, response) {/* ... */});
```


##### *`promise`*()

Returns back a promise object for the request

```
var requestPromise = restClient
    .news
    .promise();
```


##### *`send`*(data)

Give data to send with the request

```
restClient
    .media
    .post()
    .send({
        cloudinary_id: '...',
        width: 150,
        height: 350
    })
    .then(/* ... */);
```


##### *`sendPatch`*(newValue, oldValu)

Create a JSON-patch for two objects and set it as the send data.

```
restClient
    .media
    .patch()
    .id(mediaId)
    .sendPatch(updatedMediaObject, oldMediaObject)
    .then(/* ... */);
```

EXAMPLE (updatedMediaObject must be different from oldMediaObject):

```
#!javascript

restClient.instance().devices
        .patch()
        .id(_id)
        .sendPatch({"device_name": device_name}, {"device_name": 'gmghm-bezveze'})
        .then(function (data) {

          def.resolve(data[1].xhr.responseURL);
          console.log('dataX: ' + JSON.stringify(data));

        }).catch(function (err) {

          def.reject('modDevNameERR: ' + err);
          console.log('modDevNameERR: ' + err);

        });
```






##### *`id`*(id[, index])

Set ids for use in the request.

```
// GET: /api/conversation/{profileId}/{messageId}
restClient
    .conversation
    .id(profileId)      // Set the first id, index 0
    .id(messageId, 1)   // Set the next id, index 1
    .then(/* ... */);
```


##### *`method`*(postfix)

Set a postfix. Aliases `.base`, `.method`, `.action`, `.setPostfix`.

```
// GET: /api/conversation/{profileId}/unread
restClient
    .conversation
    .method('unread')
    .id(profileId)      // Set the first id, index 0
    .then(/* ... */);
```


##### *`set`*(header, value)

Set a header value.

```
restClient
    .users
    .set('x-access-token','...'); // Set automatically when using an authenticated client
```


##### *`authenticate`*(token)

Sets the `x-access-token` header.

```
restClient
    .users
    .authenticate('...'); // Set automatically when using an authenticated client
```


##### *`media`*([field])

Sets the postfix to be used for a media request.

```
// GET: /api/profile/{profileId}/media
restClient
    .profile
    .media()
    .id(profileId);

// GET: /api/profile/{profileId}/media/header
restClient
    .profile
    .media('header')
    .id(profileId);
```


##### *`searchQuery`*()

Set the postfix to get a query endpoint.

```
// GET: /api/profiles/query
restClient
    .profiles
    .query();
```


##### *`envelope`*()

Get an enveloped response instead of the regular type

```
restClient
    .profiles
    .enevelope();
```


##### *`page`*(num)

Set the page number for the request


##### *`limit`*(num)

Set the result limit for the request


##### *`includes`*(includes)

Fields to include the full values of for the request

```
restClient
    .profiles
    .include('user') // Valid values are a string,
                     // a comma-delimited string: 'user,owner'
                     // or an array: ['user','owner']
```


##### *`includeFlags`*()

To include optional flags with the response body


##### *`project`*(projectId)

To set a project id to limit the response objects to. This is automatically set
when a project is set on the `ApiClient`


##### *`search`*(search)

Search request.


##### *`location`*(location)

Search via a latitude and longitude.


##### *`distance`*(number)

The geographical search distance in km.


##### *`sort`*(sortValue)

Field(s) to sort by.


##### *`select`*(fields)

Select which field(s) to return in the response


##### *`detach`*()

Detach included fields to a separate object


##### *`count`*()

Return a count of the number of results returns

```
restClient
    .profiles
    .search('cool')
    .count()
    .then(function(count) {
        console.log('number of cool cats: %s', count);
    });
```
