# Field guide to the Aurora workbench

The Aurora workbench is a fictional tool for arranging small glowing objects on a desk. This guide exists to exercise **every content type** the markdown adapter supports, while still reading like a _real_ manual. If you can read this page comfortably from top to bottom, rendering works.

Everything below the table of contents is organized into chapters. The table of contents itself is generated from the chapter headings — it is not written in this file.

## Getting started

Unpack the workbench and place it on a flat surface. The power switch is on the back, next to the port labeled `AUX-2`. Flip it and wait for the status lamp to turn a steady green.

Before the first run you should check three things:

- The base plate sits level and does not wobble
- The **calibration dial** points at zero
- No _stray objects_ rest on the sensor strip
- The label on the back reads:\
  Aurora Mark II, 40 watts

Once the lamp is green, run the self test from a terminal:

```sh
aurora selftest --verbose
```

If the self test passes, the workbench prints `all systems nominal` and you are ready for the next chapter. If it fails, see the [troubleshooting chapter](#troubleshooting) below, or write to [support](mailto:support@example.com).

## Arranging objects

Objects are arranged in rounds. A round has exactly four phases, and the order matters:

1. Sweep the surface with the soft brush
2. Place the anchor object in the center
3. Add satellites clockwise, smallest first
4. Lock the arrangement with the `freeze` command

The `freeze` command takes the round number as its only argument:

```js
import { freeze } from 'aurora';

// Lock the third round and return a receipt.
const receipt = await freeze(3);
console.log(receipt.checksum);
```

A note on spacing: satellites should sit close, but never touch. The manual distance is two finger widths,\
measured at the widest point of each object.

### Choosing an anchor

Any object heavier than 40 grams can serve as an anchor. Glass objects work best because the sensor strip reads them reliably. Painted objects are fine as long as the paint is not metallic.

### Satellite etiquette

Satellites are everything that is not the anchor. Keep them small, keep them odd in number, and rotate the whole set a quarter turn between rounds. This paragraph is deliberately wrapped
across several source lines to prove that soft
line wraps render as ordinary spaces.

#### Edge cases for pedants

Very small satellites (under 5 grams) may be stacked in pairs. This is the only sanctioned form of stacking.

##### A truly minor remark

Heading level five is the deepest level the schema supports, and this is what it looks like.

## The command line

The `aurora` binary ships with the workbench. The three commands you will actually use:

- `aurora selftest` — checks the hardware and prints a report
- `aurora rounds` — lists all frozen rounds with their checksums
- `aurora thaw` — unlocks the most recent round (**destructive**, asks for confirmation)

Global flags go before the command, like `aurora --quiet rounds`. The full reference lives on the [project website](https://example.com/aurora/reference), and the legacy docs are still served over [plain http](http://legacy.example.com/aurora) for older workbenches.

Configuration is a single file:

```
# ~/.config/aurora/config.ini
brightness = 7
persist_rounds = true
port = AUX-2
```

## Troubleshooting

Work through this list from top to bottom. Most problems are the first item.

1. The status lamp is off — the power switch is also off
2. The lamp blinks red — a satellite touches the anchor
3. The lamp blinks yellow — the calibration dial drifted, turn it back to zero
4. `freeze` exits with code 2 — the round is empty, place objects first

If none of that helps, thaw the last round and start over. Details on the freeze/thaw cycle are back in the [arranging chapter](/kitchen-sink#arranging-objects).

## Parts and accessories

A markdown list where every item follows the `**title** — description — meta` convention renders as a descriptive listing instead of a plain list. The meta segment is optional:

- **Soft brush** — Sweeps the surface between rounds without scratching it
- **Calibration weight** — Exactly 40 grams, for verifying the dial — sold separately
- **Travel case** — Foam-lined, fits the workbench and twelve satellites

<!-- This comment is invisible on the rendered page — HTML comments are the only raw HTML the converter accepts. -->

## 2038 and beyond

A chapter title that starts with a digit, to prove heading anchors handle it. The roadmap for the fictional year 2038 includes louder status lamps, a second sensor strip, and — at long last — support for even numbers of satellites.

## Colophon

This page is generated from `content/kitchen-sink.md` at request time. It is read-only by design: the pencil is gone, and pressing the edit shortcut does nothing. The rest of the site remains editable as usual.

Cross-references between sections use the usual markdown convention — a fragment made from the heading text, like [choosing an anchor](#choosing-an-anchor) or the chapter on [the command line](#the-command-line). If you skipped straight to the end, begin again with [getting started](#getting-started).
