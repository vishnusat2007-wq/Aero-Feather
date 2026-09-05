import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSEMBLED_OPEN_AMOUNT,
  CHAPTERS,
  CHAPTER_BOUNDS,
  CLOSED_PROGRESS,
  getAssembledOpacity,
  getChapterIndex,
  getChapterProgress,
  getHeroStage,
  getScrollAnim,
  isAssembledPose,
  isFullyClosed,
  readHeroTrack,
  shouldShowExplodedLayers,
} from "./shuttlecock-scroll-story.ts";

describe("chapter mapping", () => {
  it("has five chapters numbered 01–05", () => {
    assert.equal(CHAPTERS.length, 5);
    assert.deepEqual(
      CHAPTERS.map((c) => c.num),
      ["01", "02", "03", "04", "05"],
    );
  });

  it("maps progress to the right chapter window", () => {
    assert.equal(getChapterIndex(0), 0);
    assert.equal(getChapterIndex(0.05), 0);
    assert.equal(getChapterIndex(0.2), 1);
    assert.equal(getChapterIndex(0.4), 2);
    assert.equal(getChapterIndex(0.6), 3);
    assert.equal(getChapterIndex(0.8), 4);
    assert.equal(getChapterIndex(1), 4);
  });

  it("local chapter progress runs 0→1 inside a window", () => {
    assert.equal(getChapterProgress(CHAPTER_BOUNDS[1]), 0);
    assert.ok(getChapterProgress(0.18) > 0 && getChapterProgress(0.18) < 1);
    assert.deepEqual(getHeroStage(0.2), { num: "02", label: "FEATHER" });
  });
});

describe("pose is a pure function of progress (no fighting on reverse)", () => {
  it("returns the same pose for the same progress regardless of call order", () => {
    const downward = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].map((p) => getScrollAnim(p));
    const upward = [1, 0.9, 0.7, 0.5, 0.3, 0.1, 0].map((p) => getScrollAnim(p));
    // Reverse the upward samples so they line up with the downward progresses.
    upward.reverse();
    downward.forEach((pose, i) => assert.deepEqual(pose, upward[i]));
  });

  it("is assembled through the intro hold", () => {
    for (const p of [0, 0.04, CLOSED_PROGRESS - 0.001]) {
      const anim = getScrollAnim(p);
      assert.equal(anim.openAmount, 0);
      assert.equal(anim.featherLift, 0);
      assert.equal(anim.bindingLift, 0);
      assert.equal(true, isAssembledPose(anim));
      assert.equal(false, shouldShowExplodedLayers(anim));
    }
  });

  it("is fully separated at the end so reverse just reassembles it", () => {
    const end = getScrollAnim(1);
    assert.equal(end.chapter, 4);
    assert.ok(end.featherLift > 0);
    assert.ok(end.bindingLift > 0);
    assert.equal(true, shouldShowExplodedLayers(end));
  });

  it("separates the parts through the middle of the track", () => {
    const mid = getScrollAnim(0.5);
    assert.ok(mid.openAmount > ASSEMBLED_OPEN_AMOUNT);
    assert.ok(mid.featherLift > 0);
    assert.equal(true, shouldShowExplodedLayers(mid));
    assert.ok(getAssembledOpacity(mid) < 1);
  });
});

describe("progressive reveal", () => {
  it("opens monotonically from the intro to fully separated", () => {
    assert.ok(getScrollAnim(0.3).openAmount > getScrollAnim(0.1).openAmount);
    assert.ok(getScrollAnim(0.6).openAmount >= getScrollAnim(0.3).openAmount);
    assert.ok(getScrollAnim(1).openAmount > getScrollAnim(0.6).openAmount - 1e-9);
  });

  it("shows the cork part (05) near the end", () => {
    const corkStage = getScrollAnim(0.8);
    assert.equal(corkStage.chapter, 4);
    assert.ok(corkStage.corkGlow > 0);
    assert.equal(true, shouldShowExplodedLayers(corkStage));
  });

  it("lifts feathers before binding before cork", () => {
    const feathersStage = getScrollAnim(0.2);
    const bindingStage = getScrollAnim(0.58);
    assert.ok(feathersStage.featherLift > 0);
    assert.ok(feathersStage.bindingLift === 0);
    assert.ok(bindingStage.bindingLift > 0);
  });

  it("never reports exploded slices once the assembled PNG is opaque", () => {
    for (let p = 0; p <= 1.0001; p += 0.05) {
      const anim = getScrollAnim(p);
      if (anim.openAmount <= ASSEMBLED_OPEN_AMOUNT) {
        assert.equal(false, shouldShowExplodedLayers(anim));
        assert.equal(true, isAssembledPose(anim));
        assert.equal(1, getAssembledOpacity(anim));
      }
    }
  });
});

describe("intro hold", () => {
  it("treats the intro chapter as fully closed", () => {
    assert.equal(true, isFullyClosed(0.07));
    assert.equal(false, isFullyClosed(0.2));
  });
});

describe("hero track progress", () => {
  it("computes raw 0→1 progress from the layout box", () => {
    assert.equal(readHeroTrack({ trackTop: 0, trackHeight: 2100, viewportHeight: 700 }), 0);
    assert.equal(readHeroTrack({ trackTop: -700, trackHeight: 2100, viewportHeight: 700 }), 0.5);
    assert.equal(readHeroTrack({ trackTop: -1400, trackHeight: 2100, viewportHeight: 700 }), 1);
  });

  it("clamps above the track and past the end", () => {
    assert.equal(readHeroTrack({ trackTop: 200, trackHeight: 2100, viewportHeight: 700 }), 0);
    assert.equal(readHeroTrack({ trackTop: -5000, trackHeight: 2100, viewportHeight: 700 }), 1);
  });

  it("is stable against URL-bar jitter when the sticky pane height is passed", () => {
    const a = readHeroTrack({ trackTop: -400, trackHeight: 2100, viewportHeight: 700 });
    const b = readHeroTrack({ trackTop: -400, trackHeight: 2100, viewportHeight: 700 });
    assert.equal(a, b);
    assert.equal(a, 400 / 1400);
  });
});
