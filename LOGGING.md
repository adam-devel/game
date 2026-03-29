# Logging

## API

`dbg(author, what, reason?)` or `dbg([author, status], what, reason?)`

| Arg | Purpose |
|-----|---------|
| `author` | Module name (string or [string, string]) |
| `what` | What happened |
| `reason` | Optional reason (appends ", reason=...") |

`reason` explains WHY, not WHAT. Data like message types, player turns, coordinates belong in `what`.

Examples:
```
[bot] connecting to server
[ws - onopen] socket open
[msg] received WAIT
[bot] waiting for opponent
```

With reason:
```
[bot] rejecting socket connection, reason=connection refused
```

## Layer Causation

An event at one layer may trigger action at another. Log both to localize causation:

```
[ws - onclose] socket closed
[bot] rejecting socket connection, reason=connection refused
```

Do **not** spread related logs across unrelated file locations.

## Future: Causation Chains

Each log renders on its own line. Causation is shown via UI grouping:

```
* [ws:onclose]       socket closed
* [bot]              rejecting socket connection

* [ws:onclose]       ...
* [bot]              ...
```
