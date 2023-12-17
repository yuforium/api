# MongoDB Database Structure
Records stored in Yuforium's MongoDB driver are stored as their Activity Streams representation with the addition of metadata fields (prefixed with the underscore character) which should be ignored in responses and are only used for query operations.

## Metadata and Cached Fields
### `_actor` Field
The `_actor` field identifies any actors associated with the object.  This includes objects that would appear in a feed, so specifically a user's internal database id for objects that they sent, or the user's internal database id for activities directed to them and sent to their inbox.

A top level `Service` object representing a domain is a root object and would not have an `_actor` set. follows:
```json
{
    "type": "Service",
    "_id": ObjectID("64d72245a66ee071653a3dbb"),
    "id": "https://yuforia.com",
    "_actor": null,
    "_path": null,
    "_pathId": "yuforia.com"
}
```
