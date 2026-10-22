// Unit tests for meter-logic.js
const meterMod = require('./meter-logic.js');
const meter = meterMod.meter;
const hasCryptoSchema = meterMod.hasCryptoSchema;

let passed = 0;
let failed = 0;

function check(name, cond, extra) {
  if (cond) { console.log('  PASS: ' + name); passed++; }
  else { console.log('  FAIL: ' + name + ' -> ' + extra); failed++; }
}

// Test 1: provenance with real crypto schema
let r = meter({ key: '0x51f3e2c1a7d9b40e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e', address: '', signature: '' });
console.log('  provenance:', r.provenance.toFixed(2), 'verdict:', r.verdict);
if (r.provenance >= 0.7) passed++; else { console.log('  FAIL: crypto key provenance too low'); failed++; }

// Test 2: no inputs -> ungrounded
r = meter({});
if (r.verdict === 'ungrounded' && r.grounded < 0.5) passed++; else { console.log('  FAIL: no-input verdict'); failed++; }

// Test 3: with key -> grounded
r = meter({ key: '0x51f3e2c1a7d9b40e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e' });
if (r.provenance >= 0.7 && r.verdict === 'grounded') passed++; else { console.log('  FAIL: key-alone groundedness'); failed++; }

// Test 4: liveness from events (multi-line)
r = meter({ events: 'swap\ntransfer\forge' });
console.log('  liveness:', r.liveness.toFixed(2));
if (r.liveness > 0 && r.liveness <= 1) passed++; else { console.log('  FAIL: liveness out of range'); failed++; }

// Test 5: consistency from crossrefs (multi-line)
r = meter({ crossrefs: 'anchored\nconsistent\nverified' });
console.log('  consistency:', r.consistency.toFixed(2));
if (r.consistency > 0.7 && r.consistency <= 1) passed++; else { console.log('  FAIL: consistency score'); failed++; }

// Test 6: hasCryptoSchema helper
if (hasCryptoSchema('0x' + 'a'.repeat(64)) === true) passed++; else { console.log('  FAIL: crypto schema detection'); failed++; }
if (hasCryptoSchema('hello') === false) passed++; else { console.log('  FAIL: should reject plain string'); failed++; }

// Test 7: empty input -> ungrounded verdict
r = meter({ events: '', crossrefs: '' });
if (r.verdict === 'ungrounded') passed++; else { console.log('  FAIL: empty verdict'); failed++; }

// Test 8: no input -> ungrounded
r = meter({});
if (r.verdict === 'ungrounded') passed++; else { console.log('  FAIL: no-input verdict'); failed++; }

console.log('\nMeter meter-logic.js unit tests: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
