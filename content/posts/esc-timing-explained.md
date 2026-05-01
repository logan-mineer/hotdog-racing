---
title: "ESC Timing Explained: Can, Boost, and Turbo"
date: "2026-04-30"
slug: "esc-timing-explained"
description: "What can timing, boost timing, and turbo timing actually do to your power curve — and why it matters for RC drift."
type: "guide"
---

If you've ever stared at your ESC software wondering what the difference between can timing, boost timing, and turbo timing actually is, you're not alone. These three settings all affect power delivery, but they do it in different ways and at different points in the throttle range.

## Can Timing

Can timing is set mechanically — it's the physical position of the stator inside the motor can. Higher timing advances when the magnetic field peaks relative to the rotor position, which increases top-end RPM at the cost of efficiency and heat.

For RC drift, can timing is usually set once during a build and left alone. It establishes a baseline. Most drift motors run somewhere in the 10–30° range.

## Boost Timing

Boost timing is added electronically by the ESC, on top of whatever can timing you've set. The key difference from turbo is *when* it kicks in: boost timing engages at a set throttle position and ramps in progressively from there.

This gives you control over mid-range response. More boost timing = more aggressive mid-throttle punch. In drift, this is where most of the interesting tuning happens — too much and the car kicks unpredictably, too little and transitions feel dead.

## Turbo Timing

Turbo timing is the most aggressive of the three. It adds a burst of timing at full throttle, typically with a delay (the "turbo delay" setting) that controls how long after you hit full throttle the boost kicks in.

The turbo delay is what separates turbo from boost in feel. A short delay gives you an immediate spike. A longer delay lets the car settle before the extra timing comes in — which is usually more controllable in a drift context.

## The Interaction

These three settings stack on top of each other, which is why small changes can have large effects. If you're troubleshooting sudden power delivery, it's worth zeroing boost and turbo timing out and adding them back one at a time.

The ESC Settings tool on this site lets you see these interactions visually — adjust a slider and watch the curve change. That's the fastest way to build intuition for how the numbers translate to actual feel on the track.
