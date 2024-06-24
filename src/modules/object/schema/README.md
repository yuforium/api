# Schemas
Schemas represent interaction with an underlying database.  Yuforium uses MongoDB to represent Activity Streams `Objects` in the underlying collections as exact representations of the JSON-LD objects, with the addition of metadata fields that are represented with an underscore at the beginning of the field name.

Schemas are comprised of three different parts:

## Schema and Schema Class
This is the Nest JS Mongoose class definition using the `@Schema` decorator, and are typically named with the suffix `Record`, such as `ObjectRecord` or `ActorRecord`.  These classes are used to define the structure of the underlying MongoDB collection.

## Class Extender Functions
These are functions that extend the schema class with additional functionality.  This is done to keep the schema definition clean and to separate concerns.

## Types
These are TypeScript types that are used to define and validate the structure of the objects and underlying schemas and schema creation, and are automatically derived from the dto definitions.
