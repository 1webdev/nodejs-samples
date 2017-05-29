## SNS Push Notifications

```javascript

// Get Platforms
client.platforms
      .limit(8)
      .page(1)
      .spread(function(platforms, response) {
        /* ... */
      });

// Get Topics
client.topics
      .limit(8)
      .page(1)
      .spread(function(platforms, response) {
        /* ... */
      });

// Publish to a topic
client.topics
      .id('top::...')
      .post()
      .publish()
      .send({
        message: 'My message'
      })
      .then(/* ... */);

```
