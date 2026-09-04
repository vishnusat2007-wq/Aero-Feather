import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REVERSE_CLOSE_END_MOBILE,
  advanceScrub,
  getForwardAnim,
  getReverseExplodedOpacity,
  getReverseCloseAmount,
  getScrollAnim,
  isAssembledPose,
  isFullyClosed,
  isReverseAssembledPose,
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

  it("crossfades the moving slices before unmounting them on reverse", () => {
    const visible = pose(0.6, 1);
    const fading = pose(0.4, 1);
    const assembled = pose(0.15, 1);

    assert.equal(getReverseExplodedOpacity(visible), 1);
    assert.ok(getReverseExplodedOpacity(fading) > 0);
    assert.ok(getReverseExplodedOpacity(fading) < 1);
    assert.equal(getReverseExplodedOpacity(assembled), 0);
    assert.equal(false, isReverseAssembledPose(fading));
    assert.equal(true, isReverseAssembledPose(assembled));
  });
});

describe("advanceScrub peak tracking", () => {
  it("keeps the high-water peak on reverse and resets at 0", () => {
    let scrub = advanceScrub({ progress: 0, peak: 0 }, 0.4);
    scrub = advanceScrub(scrub, 0.9);
    assert.equal(scrub.peak, 0.9);
    scrub = advanceScrub(scrub, 0.3);
    assert.equal(scrub.peak, 0.9);
    assert.equal(scrub.progress, 0.3);
    scrub = advanceScrub(scrub, 0);
    assert.deepEqual(scrub, { progress: 0, peak: 0 });
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
