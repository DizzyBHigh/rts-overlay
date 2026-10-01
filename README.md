# RTS Overlay

RTS Overlay is the shared presentation and configuration layer for RTS extensions.

## Architecture

Streamer.bot remains the controller and persistent configuration authority.

RTS Overlay provides:

- the development and configuration interface
- shared presentation configuration
- extension namespaces
- shared overlay runtime services
- WebSocket communication with Streamer.bot

Streamer.bot stores the configuration in Globals and controls when and how the overlay is used.

## Repository layout

- `overlay/` - browser-side overlay runtime and configuration UI.
- `overlay/core/` - shared RTS runtime, extension loader, configuration and WebSocket services.
- `streamerbot/` - Streamer.bot actions used to persist, migrate and synchronise overlay configuration.
- `site/rts.json` - RTS product and publishing configuration.

## Extension namespaces

Every extension runs inside its own namespace:

```
RTS
    |
    +-- core
    |
    +-- extensions
        +-- <extension-id>
```

Extensions register through the core runtime and keep their state and methods inside their own namespace. Extension ids are unique within the overlay runtime.

The overlay core owns shared services. Extensions consume those services through the core API rather than defining competing global functions.

Extension files are distributed through the RTS site. The overlay does not load source code directly from private extension repositories.

## Configuration

The shared configuration uses this structure:

```text
rts.overlay.configuration
    |
    +-- version
    +-- overlay
    +-- extensions
```

Each extension stores extension-specific configuration beneath its own id in `extensions`.

The configuration round trip is:

```
RTS Overlay
    |
    | request / save
    v
Streamer.bot
    |
    v
Streamer.bot Globals
    |
    | configuration events
    v
RTS Overlay
```

## Action Replay migration

`RTSOverlayMigration.cs` provides a one-time bridge from the existing Action Replay configuration globals into the shared configuration structure.

Action Replay remains the reference implementation during initial RTS Overlay development. It is not modified by this repository.

## Publishing

This repository is an RTS extension and uses the normal RTS extension publishing path.

The manifest is private so the product is available only to RTS administrators during development.

The overlay source is published from `overlay/` and the Streamer.bot import code uses the standard `RTS Extension - Import Code.txt` mechanism.
