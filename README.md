# Yuforium API
_a federated community platform based on activitypub_

Yuforium focuses on federated communities so they are no longer constrained to a single entity.  Let's make communities distributed in the same way that the Internet itself is, and make communities more like public exchange points.

## Federating Communities
The ActivityPub specification provides a `context` field, and Yuforium adds a `/topic` endpoint to provide a shared context for federated communities.

Before we begin, let's clarify that:
- Yuforium is code and standards, Yuforia.com is a service
- `@context` is not the same as `context`

_Post to a forum from your Activity Stream by addressing the forum_
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "https://mastodon.social/cpmoser/note/some-id",
  "type": "Note",
  "name": "First Post by Chris",
  "content": "Hi world!",
  "to": [
    "https://www.w3.org/ns/activitystreams#Public",
    "https://yuforia.com/forum/anything"
  ]
}
```
_A new Note is created in the forum, referencing the original via "delegatedFor" and adding the default context of the forum_
```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://www.yuforium.com/community/v1"
  ],
  "id": "https://yuforia.com/forum/anything/note/another-id",
  "type": "Note",
  "delegatedFor": "https://mastodon.social/cpmoser/note/some-id",
  "context": "https://yuforium.com/topic/anything"
}
```

It's advisable but not necessary to pass the `delegatedFor` property to the community at large (but a good idea if changes are made to the note).

_You can also POST directly to the forum outbox like your own and it will be excluded from your Activity Stream (should require authentication)_
```json
{
  "type": "Note",
  "name": "A note",
  "to": [
    "https://www.w3.org/ns/activitystreams#Public"
  ]
}
```

_Forums encapsulate topics using the context property_
```json
{
  "type": "Service",
  "name": "The anything community",
  "summary": "Representation of /topic/anything on a specific site",
  "context": [
    "https://yuforium.com/topic/anything",
    "https://yuforium.com/topic/general"
  ]
}
```

### Resource Types TL;DR
- A topic is a facilitates information exchange for a community (acting as a common point of reference for a community)
- A forum is a public endpoint on a server and distributes content with other forums and the larger community
- A community is an ephemeral representation of all forums that are joined together by a topic

### Topics
Topics are the glue that forums use to distribute community content.  They are semi-authoritative entities for the context that they represent:

```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://www.yuforium.com/community/v1"
  ],
  "type": "Topic",
  "id": "https://yuforia.com/topic/anything",
  "summary": "Only ANYTHING can be discussed here",
  "inbox": "https://yuforia.com/topic/anything/inbox",
  "outbox": "https://yuforia.com/topic/anything/outbox",
  "following": "https://yuforia.com/topic/anything/following",
  "followers": "https://yuforia.com/topic/anything/followers"
}
```

Topics are *Actors* since they should contain the typical endpoints that an actor would need, such as *followers* and *following*.

_https://yuforia.com/topic/anything/following_
```json
{
  "@contenxt": "https://www.w3.org/ns/activitystreams",
  "type": "Collection",
  "items": [
    "https://www.yuforia.com/forum/anything"
  ]
}
```

_https://yuforia.com/topic/anything/followers_
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Collection",
  "items": [
    "https://www.yuforia.com/forum/anything"
  ]
}
```

These semi-authoritative entities may go against the idea of federation, therefore:
- Forums can have multiple contexts
- Forums aren't required to follow the rules of their respective contexts - the caveat is that other forums (or the authoritative topic) may see them as "unofficial" or unvetted participants.

A topic can be completely unauthoritative, for example this forum uses an ephemeral topic:
```json
{
  "id": "https://yuforia.com/forum/anything",
  "context": {
    "id": null,
    "type": "Topic",
    "name": "anything"
  }
}
```

Without an authoritative context, however, a forum will need to manually `follow` another forum to distribute content.

### Topic vs. Community?
Should we use the terminology `topic` or `community`?  A topic implies _something to be discussed_ whereas a community _declares an explicit entity_.

While Yuforium currently implements the _topic_ paradigm, there's no reason we coudn't provide a _community_ resource that works the same way:

```json
{
  "type": "Community",
  "id": "https://yuforia.com/community/anything"
}
```

### Forums
Forums are conduits to the larger, distributed community.  They are endpoints that can be a source


## Private Communities
We could use public key encryption to pass content around.

## About
Yuforium is built on the excellent and Angular friendly NestJS framework.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
