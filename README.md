# Meter — sovereign-identity provenance meter

A deterministic, dependency-free digital self-meter. It rates how **real**, **active**, and
**consistent** a digital identity is, using three signal layers:

- **Provenance** — where does this identity come from? (crypto keys, addresses, signatures)
- **Liveness** — is it actually active? (recent real activity)
- **Consistency** — does it hold together over time? (cross-references that align)

Pure function: no network, no LLM, no DOM. Same input → same output, so results are
reproducible and shareable via URL fragment.

## Usage (browser)

```html
<script src="meter-logic.js"></script>
<script>
  var r = meterLib.meter({
    key: '0x…',
    events: 'swap\ntransfer\nforge',
    crossrefs: 'anchored\nconsistent\nverified'
  });
  // r.verdict  → 'grounded' | 'ungrounded'
  // r.grounded → 0–1
  // r.provenance / r.liveness / r.consistency → 0–1
</script>
```

## Usage (Node)

```js
const { meter, hasCryptoSchema, METRIC_NAMES } = require('./meter-logic.js');
const r = meter({ key: '0x' + 'a'.repeat(64) });
// → { provenance: 0.85, liveness: 0, consistency: 0, grounded: 0, verdict: 'grounded', … }
```

## Signals

| signal | strong | weak |
|---|---|---|
| provenance | 64-hex key / bech32 / base64 | plain string |
| liveness | `swap`, `transfer`, `swap_eth` | `staggered`, `reused`, `revoked` |
| consistency | `consistent`, `aligned`, `verified`, `anchored`, `derived` | `birthday`, `echo`, `overwrite` |

## Test

```bash
node test-meter-logic.js   # 9/9 pass
```

## License

MIT
