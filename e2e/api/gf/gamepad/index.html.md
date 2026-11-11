# Overview

> Documentation index: https://frontend-tools.coherent-labs.com/llms.txt lists every page of this documentation as Markdown; the full text is in https://frontend-tools.coherent-labs.com/llms-full.txt.

Source: https://frontend-tools.coherent-labs.com/e2e/api/gf/gamepad/

The Gameface E2E framework provides a rich set of tools for testing UI behavior driven by gamepad input. It can fully simulate gamepad interactions and works seamlessly with UIs that use the interaction manager gamepad system for handling gamepad-driven navigation and actions.

Gamepad testing can be performed through the global `gf` object as well as through individual `GamefaceGamepad` instances.

Using the `gf` object, you can connect or disconnect multiple mocked gamepads.

Each time you call `gf.connectGamepad`, a new `GamefaceGamepad` instance is created, allowing you to continue your test workflow through its methods such as `press`, `hold`, `release`, and more.
