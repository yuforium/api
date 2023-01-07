# Yuforium API
_Yuforium is a federated community platform based on Activity Pub_

The Yuforium API and [UI](https://github.com/yuforium/ui) are currently deployed to [Yuforia.com](https://www.yuforia.com).

Yuforium federates communities so they are not constrained to a single entity, and attempts to federate them in the same way that the Internet is distributed, making communities operate across public exchange points.

## App Structure
The Yuforium API is built using the [NestJS framework](https://nestjs.com), and all Yuforium API code has been organized into modules in `src/modules`.

### Data Modules
Data in Yuforium is stored as ActivityPub objects.  Any additional fields that are not part of the ActivityPub specification start with an underscore character.  These fields are generally reserved for data operations (such as pointers to other documents).

Yuforium stores data in three collections, with a corresponding modules:

* **Activities** contain all activities sent or received
* **Objects** stores the current state of all tracked objects and can be considered a summation of all Activities
* **Users** contains all user login information.  In addition to providing services related to the Users collection, the `UserModule` provides functionality for managing ActivityPub related to a user, such as the Inbox, Outbox, and user related content endpoints.

### Other Modules

* **ActivityPub** handles server-to-server communication
* **Auth** handles user authentication
* **WellKnown** handles all `/.well-known` such as webfinger which are required for ActivityPub


## About
This API is designed to implement a [proposed community standard for Activity Pub](https://github.com/yuforium/activitypub-docs/blob/main/federation.md).  This project also uses the [Activity Streams](https://github.com/yuforium/activity-streams) package and has a [separate UI project](https://github.com/yuforium/ui) written in Angular.
