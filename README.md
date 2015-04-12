fingdex
====

- experimental, you probably don't want to use this yet
- a fingdex is not a database: it's an index.
- append log entries, which updates an internal state and produces a stream of entries
- you can layer indexes on top of each other. each one decides how to update its internal state, and what entries (if any) to stream out.

Notes
----

- because the data stream is modeled as a fifo queue, each fingdex should (in most cases) only source 1 other fingdex.
- reads are always synchronous so to handle async IO, something needs to push data into the fingdex and then possibly inform the consumer that new entries are available.
