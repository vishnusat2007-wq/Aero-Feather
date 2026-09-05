import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REVERSE_CLOSE_END_MOBILE,
  advanceScrub,
  applyHeroScrub,
  getForwardAnim,
  getReverseExplodedOpacity,
  getReverseCloseAmount,
  getScrollAnim,
  isAssembledPose,
  isFullyClosed,
  isReverseAssembledPose,
  readHeroTrack,
  shouldShowExplodedLayers,
} from "./shuttlecock-scroll-story.ts";

const mobile = { closeEnd: REVERSE_CLOSE_END_MOBILE };

function pose(progress: number, peak = progress) {
  return getScrollAnim(progress, { peak, ...mobile });
}

describe("forward opening is unchanged", () => {
  it("matches getForwardAnim while climbing the peak", () => {
    for (const p of [0, 0.04, 0.08, 0.2, 0.4, 0.62, 0.8, 1]) {
      const peak = p;
      const fromScroll = getScrollAnim(p, { peak, ...mobile });
      const fromForward = p < 0.08 ? getScrollAnim(0) : getForwardAnim(p);
      if (p < 0.08) {
        assert.equal(fromScroll.openAmount, 0);
        assert.equal(fromScroll.featherLift, 0);
        assert.equal(fromScroll.bindingLift, 0);
        continue;
      }
      assert.equal(fromScroll.openAmount, fromForward.openAmount);
      assert.equal(fromScroll.featherLift, fromForward.featherLift);
      assert.equal(fromScroll.bindingLift, fromForward.bindingLift);
      assert.equal(fromScroll.chapter, fromForward.chapter);
    }
  });
});

describe("reverse close returns to the assembled start pose", () => {
  it("is fully assembled at progress 0 with zero lifts", () => {
    const anim = pose(0, 1);
    assert.equal(anim.openAmount, 0);
    assert.equal(anim.featherLift, 0);
    assert.equal(anim.bindingLift, 0);
    assert.equal(anim.featherSpread, 0);
    assert.equal(true, isAssembledPose(anim));
    assert.equal(false, shouldShowExplodedLayers(anim));
  });

  it("is fully assembled at the mobile close end", () => {
    const anim = pose(REVERSE_CLOSE_END_MOBILE, 1);
    assert.equal(anim.openAmount, 0);
    assert.equal(anim.featherLift, 0);
    assert.equal(anim.bindingLift, 0);
    assert.equal(true, isAssembledPose(anim));
    assert.equal(false, shouldShowExplodedLayers(anim));
  });

  it("closes monotonically from peak=1 — no re-explode through chapter 3", () => {
    let prevOpen = Number.POSITIVE_INFINITY;
    let prevFeather = Number.POSITIVE_INFINITY;
    let prevBind = Number.POSITIVE_INFINITY;
    for (let p = 1; p >= 0; p = Math.round((p - 0.02) * 100) / 100) {
      const anim = pose(p, 1);
      assert.ok(anim.openAmount <= prevOpen + 1e-9, `openAmount rose at p=${p}`);
      assert.ok(anim.featherLift <= prevFeather + 1e-9, `featherLift rose at p=${p}`);
      assert.ok(anim.bindingLift <= prevBind + 1e-9, `bindingLift rose at p=${p}`);
      prevOpen = anim.openAmount;
      prevFeather = anim.featherLift;
      prevBind = anim.bindingLift;
    }
    assert.equal(prevOpen, 0);
    assert.equal(prevFeather, 0);
    assert.equal(prevBind, 0);
  });

  it("does not jump to an exploded chapter when progress jitters up by 0.004", () => {
    let scrub = { progress: 0, peak: 0 };
    for (const raw of [0.2, 0.5, 0.8, 1]) scrub = advanceScrub(scrub, raw);

    const closing = getScrollAnim(0.5, { peak: scrub.peak, ...mobile });
    scrub = advanceScrub(scrub, 0.5);
    const jittered = advanceScrub(scrub, 0.504);
    const afterJitter = getScrollAnim(jittered.progress, { peak: jittered.peak, ...mobile });

    assert.equal(jittered.peak, 1);
    assert.ok(closing.openAmount < 0.2, "mid-reverse should already be mostly closed");
    assert.ok(
      afterJitter.openAmount < 0.25,
      `jitter exploded the shuttle: openAmount=${afterJitter.openAmount}`,
    );
    assert.ok(afterJitter.featherLift < 20, `jitter featherLift=${afterJitter.featherLift}`);
    assert.ok(!shouldShowExplodedLayers(afterJitter) || afterJitter.openAmount <= closing.openAmount + 0.05);
  });

  it("never shows exploded slices once the assembled PNG is opaque", () => {
    for (let p = 1; p >= 0; p -= 0.05) {
      const anim = pose(p, 1);
      if (anim.openAmount <= 0.12) {
        assert.equal(false, shouldShowExplodedLayers(anim));
        assert.equal(true, isAssembledPose(anim));
      }
    }
  });

  it("still assembled if Android stalls at progress 0.15 after a full open", () => {
    const anim = pose(0.15, 1);
    assert.equal(true, isAssembledPose(anim));
    assert.equal(false, shouldShowExplodedLayers(anim));
    assert.ok(anim.featherLift < 8);
    assert.ok(anim.bindingLift < 8);
  });

  it("hands reverse closing to the intact PNG before crop edges can poke through", () => {
    const justReversed = 0.98;
    const fading = 0.97;
    const handedOff = 0.9;

    assert.ok(getReverseExplodedOpacity(justReversed, 1, REVERSE_CLOSE_END_MOBILE) > 0);
    assert.ok(getReverseExplodedOpacity(justReversed, 1, REVERSE_CLOSE_END_MOBILE) < 1);
    assert.ok(getReverseExplodedOpacity(fading, 1, REVERSE_CLOSE_END_MOBILE) > 0);
    assert.ok(getReverseExplodedOpacity(fading, 1, REVERSE_CLOSE_END_MOBILE) < 1);
    assert.equal(getReverseExplodedOpacity(handedOff, 1, REVERSE_CLOSE_END_MOBILE), 0);
    assert.equal(false, isReverseAssembledPose(pose(handedOff, 1)));
    assert.equal(true, isReverseAssembledPose(pose(0.15, 1)));
  });
});

describe("advanceScrub peak tracking", () => {
  it("keeps the high-water peak on reverse and at 0", () => {
    let scrub = advanceScrub({ progress: 0, peak: 0, closing: false }, 0.4);
    scrub = advanceScrub(scrub, 0.9);
    assert.equal(scrub.peak, 0.9);
    scrub = advanceScrub(scrub, 0.3);
    assert.equal(scrub.peak, 0.9);
    assert.equal(scrub.progress, 0.3);
    assert.equal(scrub.closing, true);
    scrub = advanceScrub(scrub, 0);
    assert.deepEqual(scrub, { progress: 0, peak: 0.9, closing: true });
  });

  it("resets the peak only when the user is above the track", () => {
    let scrub = advanceScrub({ progress: 0, peak: 0, closing: false }, 1);
    scrub = advanceScrub(scrub, 0);
    assert.equal(scrub.peak, 1);
    scrub = advanceScrub(scrub, 0, { aboveTrack: true });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false });
  });
});

describe("Android close bounce cannot re-explode", () => {
  function openThenCloseToZero() {
    let scrub = { progress: 0, peak: 0, closing: false };
    for (const raw of [0.2, 0.5, 0.8, 1, 0.6, 0.2, 0.06, 0]) {
      scrub = advanceScrub(scrub, raw);
    }
    return scrub;
  }

  it("keeps the close peak after a touchend-style snap to 0", () => {
    const scrub = openThenCloseToZero();
    assert.equal(scrub.progress, 0);
    assert.equal(scrub.peak, 1);
    assert.equal(scrub.closing, true);
  });

  it("stays fully assembled when progress bounces 0 → 0.09 / 0.15 / 0.20 with no open intent", () => {
    const closed = openThenCloseToZero();
    for (const bounce of [0.04, 0.08, 0.09, 0.12, 0.15, 0.2]) {
      const next = advanceScrub(closed, bounce);
      const anim = pose(next.progress, next.peak);
      assert.equal(next.peak, 1, `bounce ${bounce} dropped the peak`);
      assert.equal(next.closing, true);
      assert.ok(
        anim.openAmount < 0.02,
        `bounce ${bounce} openAmount=${anim.openAmount}`,
      );
      assert.ok(anim.featherLift < 2, `bounce ${bounce} featherLift=${anim.featherLift}`);
      assert.ok(anim.bindingLift < 2);
      assert.equal(true, isAssembledPose(anim));
      assert.equal(false, shouldShowExplodedLayers(anim));
    }
  });

  it("does not jump to chapter-1 explode after settle-at-0 then raw 0.22", () => {
    // Production-after-PR-10 failure: touchend snapped progress to 0 (peak 0),
    // then Android rubber-band / URL-bar delivered 0.22 as a new forward open.
    const closed = openThenCloseToZero();
    const bounced = advanceScrub(closed, 0.22);
    const anim = pose(bounced.progress, bounced.peak);
    assert.equal(bounced.peak, 1);
    assert.ok(
      anim.openAmount < 0.12,
      `0.22 bounce exploded: openAmount=${anim.openAmount} peak=${bounced.peak}`,
    );
    assert.ok(anim.featherLift < 8, `0.22 bounce featherLift=${anim.featherLift}`);
    assert.equal(false, shouldShowExplodedLayers(anim));
  });

  it("keeps the close peak if the user scrolls down again mid-rewind", () => {
    let scrub = { progress: 0, peak: 0, closing: false };
    for (const raw of [0.4, 0.8, 1, 0.5]) scrub = advanceScrub(scrub, raw);
    const resumed = advanceScrub(scrub, 0.55, { intentOpen: true });
    const anim = pose(resumed.progress, resumed.peak);
    const exploded = getForwardAnim(0.55);
    assert.equal(resumed.peak, 1);
    assert.equal(resumed.closing, true);
    assert.ok(
      anim.openAmount < exploded.openAmount * 0.5,
      `mid-rewind resume exploded: open=${anim.openAmount} forward=${exploded.openAmount}`,
    );
  });

  it("starts a fresh forward open when the user intends to open from the start", () => {
    const closed = openThenCloseToZero();
    const opened = advanceScrub(closed, 0.2, { intentOpen: true });
    const anim = getScrollAnim(opened.progress, { peak: opened.peak, ...mobile });
    const forward = getForwardAnim(0.2);
    assert.equal(opened.closing, false);
    assert.equal(opened.peak, 0.2);
    assert.equal(anim.openAmount, forward.openAmount);
    assert.equal(anim.featherLift, forward.featherLift);
    assert.equal(anim.chapter, forward.chapter);
  });
});

describe("hero track progress is stable when the URL bar toggles", () => {
  it("is stable when the caller passes the sticky pane height", () => {
    const trackTop = -400;
    const trackHeight = 2100;
    const sticky = 700;
    const first = readHeroTrack({ trackTop, trackHeight, viewportHeight: sticky });
    const again = readHeroTrack({ trackTop, trackHeight, viewportHeight: sticky });
    assert.equal(first.raw, 400 / 1400);
    assert.equal(again.raw, first.raw);
    const innerHeight = readHeroTrack({ trackTop, trackHeight, viewportHeight: 844 });
    assert.ok(
      Math.abs(innerHeight.raw - first.raw) > 0.02,
      "window.innerHeight as viewport would jitter progress on URL-bar resize",
    );
  });

  it("applyHeroScrub: settle at top then bounce stays assembled", () => {
    const trackHeight = 300 * 844;
    const viewportHeight = 844;
    let scrub = { progress: 0, peak: 0, closing: false };
    scrub = applyHeroScrub(scrub, { trackTop: -(trackHeight - viewportHeight), trackHeight, viewportHeight });
    assert.equal(scrub.progress, 1);
    scrub = applyHeroScrub(scrub, { trackTop: -40, trackHeight, viewportHeight });
    scrub = applyHeroScrub(scrub, { trackTop: 0, trackHeight, viewportHeight });
    assert.equal(scrub.progress, 0);
    assert.equal(scrub.peak, 1);

    const bounceTop = -0.2 * (trackHeight - viewportHeight);
    const bounced = applyHeroScrub(scrub, { trackTop: bounceTop, trackHeight, viewportHeight });
    const anim = pose(bounced.progress, bounced.peak);
    assert.equal(bounced.closing, true);
    assert.equal(true, isAssembledPose(anim));
    assert.equal(false, shouldShowExplodedLayers(anim));
    assert.ok(anim.featherLift < 8);
  });

  it("applyHeroScrub: above the track ends the session so a new open is forward", () => {
    let scrub = { progress: 0, peak: 1, closing: true };
    scrub = applyHeroScrub(scrub, {
      trackTop: 240,
      trackHeight: 300 * 844,
      viewportHeight: 844,
    });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false });
    scrub = applyHeroScrub(scrub, {
      trackTop: -0.2 * (300 * 844 - 844),
      trackHeight: 300 * 844,
      viewportHeight: 844,
      intentOpen: true,
    });
    const anim = getScrollAnim(scrub.progress, { peak: scrub.peak, ...mobile });
    const forward = getForwardAnim(scrub.progress);
    assert.equal(anim.openAmount, forward.openAmount);
    assert.equal(anim.featherLift, forward.featherLift);
  });
});

describe("close amount reaches 1 only near the start", () => {
  it("is still opening the close at mid-track (not already closed at 0.68)", () => {
    const mid = getReverseCloseAmount(0.68, 1, REVERSE_CLOSE_END_MOBILE);
    assert.ok(mid < 1, `close already finished at 0.68: ${mid}`);
    assert.ok(mid > 0.2);
    assert.equal(getReverseCloseAmount(0.12, 1, REVERSE_CLOSE_END_MOBILE), 1);
    assert.equal(getReverseCloseAmount(0, 1, REVERSE_CLOSE_END_MOBILE), 1);
  });

  it("treats the intro chapter as fully closed", () => {
    assert.equal(true, isFullyClosed(0.07));
    assert.equal(false, isFullyClosed(0.2));
  });
});
