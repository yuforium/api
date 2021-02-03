# How is a Forum different than a User?
Taking into account the ActivityPub specification, how is a forum different than a user?  Let's use the [recap from the ActivityPub Overview](https://www.w3.org/TR/activitypub/#Overview) on the W3 site:

## Inbox POST

### The User Way
You can POST to someone's inbox to send them a message (server-to-server / federation only... this is federation!)

### The Forum Way
A forum can POST to another forum's inbox to relay messages from one forum to another (server-to-server)

## Inbox GET

### The User Way
You can GET from your inbox to read your latest messages (client-to-server; this is like reading your social network stream)

### The Forum Way
You can GET from your forum's inbox to read the latest messages (client-to-server; this is like reading your social network stream)

## Outbox POST

### The User Way
You can POST to your outbox to send messages to the world (client-to-server)

### The Forum Way
You can POST to your forum's outbox to send messages to the world (client-to-server)

*A Note On This:* Anything generally posted to a forum should be posted to the public group, although it may be possible to specify targets in the future.

A forum represents all activity (user messages) that center around a topic - so when posting to a forum actor, its ID represents the topic to which it belongs.  Topics exist on yuforium.com, but may also exist in other services as well.

Topics should be the form https://yuforium.com/topic/**topicId**

### Outbox GET

### The User Way
You can GET from someone's outbox to see what messages they've posted (or at least the ones you're authorized to see). (client-to-server and/or server-to-server)

### The Forum Way
Your forum can GET from another forum's outbox to see what messages they've posted (or at least the ones you're authorized to see) and add them into their own collection. 
(client-to-server and/or server-to-server)