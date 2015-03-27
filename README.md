fingdex
====

- a fingdex is not a database: it's an index.
- add entries, which updates an internal state and produces a stream of entries
- you can layer indexes on top of each other. each one decides how to update its internal state, and what entries (if any) to stream out.
