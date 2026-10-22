"use strict";

/** Digital identity provenance meter (pure, no DOM/network). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.meterLib = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var METRIC_NAMES = ["provenance", "liveness", "consistency", "groundedness"];
  var HIGH_PROV = ["consistent", "aligned", "verified", "anchored", "derived"];
  var HIGH_EVENTS = ["swap", "transfer", "swap_eth"];
  var MED_EVENTS = ["nft_mint", "forge", "fn_apply", "create", "invoice", "block"];
  var LOW_EVENTS = ["staggered", "birthday", "reused", "echo", "overwrite", "revoked"];

  function coerceArr(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return typeof x === 'string' && x.trim(); });
    if (v && typeof v === "object") {
      var out = [];
      for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k) && typeof v[k] === 'string' && v[k].trim()) out.push(v[k]);
      return out;
    }
    if (typeof v === "string") {
      return v.split(/\n|,/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return [];
  }

  function cleanStr(s) { return typeof s === 'string' ? s.trim() : ''; }

  function hasCryptoSchema(s) {
    return /[0-9a-fA-F]{64}/.test(s) ||
      /^[13][a-zA-Z0-9]{33,43}$/.test(s) ||
      /^[A-Za-z0-9+/]{40,}={0,2}$/.test(s);
  }

  function provenanceScore(key, address, signature) {
    key = cleanStr(key); address = cleanStr(address); signature = cleanStr(signature);
    if (hasCryptoSchema(key) || hasCryptoSchema(address) || hasCryptoSchema(signature)) return 0.85;
    if (key || address || signature) return 0.45;
    return 0.1;
  }

  function livenessScore(events) {
    var arr = coerceArr(events);
    if (!arr.length) return 0;
    var scored = arr.map(function (e) {
      var t = cleanStr(e).toLowerCase();
      if (HIGH_EVENTS.indexOf(t) !== -1) return 2;
      if (MED_EVENTS.indexOf(t) !== -1) return 1;
      if (LOW_EVENTS.indexOf(t) !== -1) return 0.2;
      return 0.5;
    });
    return scored.reduce(function (a, b) { return a + b; }, 0) / (scored.length * 2);
  }

  function consistencyScore(crossrefs) {
    var arr = coerceArr(crossrefs);
    if (!arr.length) return 0;
    var scored = arr.map(function (x) {
      var t = cleanStr(x).toLowerCase();
      if (HIGH_PROV.indexOf(t) !== -1) return 0.9;
      if (t === "consistent" || t === "verified" || t === "aligned") return 0.85;
      if (t === "anchored" || t === "derived") return 0.6;
      if (LOW_EVENTS.indexOf(t) !== -1) return 0.25;
      return 0.5;
    });
    return scored.reduce(function (a, b) { return a + b; }, 0) / (scored.length * 0.9);
  }

  function meter(inputs) {
    var p = inputs || {};
    var key = cleanStr(p.key);
    var address = cleanStr(p.address);
    var signature = cleanStr(p.signature);
    var events = p.events || "";
    var crossrefs = p.crossrefs || "";
    var provenance = provenanceScore(key, address, signature);
    var liveness = livenessScore(events);
    var consistency = consistencyScore(crossrefs);
    var grounded = Math.min(provenance, liveness, consistency);
    return {
      provenance: provenance, liveness: liveness, consistency: consistency,
      grounded: grounded,
      verdict: (provenance >= 0.5 || liveness >= 0.5) ? "grounded" : "ungrounded",
      metrics: METRIC_NAMES,
      eventCount: coerceArr(events).length,
      refCount: coerceArr(crossrefs).length
    };
  }

  return { meter: meter, METRIC_NAMES: METRIC_NAMES, hasCryptoSchema: hasCryptoSchema };
});
