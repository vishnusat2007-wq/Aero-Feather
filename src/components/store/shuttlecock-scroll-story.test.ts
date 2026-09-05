import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABOVE_TRACK_PX,
  BELOW_TRACK_PX,
  CLOSED_PROGRESS,
  FALLBACK_REOPEN,
  HERO_TRACK_SCROLL_PX,
  REVERSE_CLOSE_END_MOBILE,
  advanceScrub,
  applyHeroScrub,
  getForwardAnim,
  getAssembledOpacity,
  getReverseExplodedOpacity,
  getReverseCloseAmount,
  getScrollAnim,
  isAssembledPose,
  isCloseLocked,
  isFullyClosed,
  isReversingPlayback,
  readHeroTrack,
  shouldMountExplodedLayers,
  shouldShowExplodedLayers,
} from "./shuttlecock-scroll-story.ts";

const mobile = { closeEnd: REVERSE_CLOSE_END_MOBILE };
const idle = { progress: 0, peak: 0, closing: false, freeExit: false };

function pose(progress: number, peak = progress) {
  return getScrollAnim(progress, { peak, ...mobile });
}

describe("forward opening is unchanged", () => {
  it("matches getForwardAnim while climbing the peak", () => {
    for (const p of [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1]) {
      const peak = p;
      const fromScroll = getScrollAnim(p, { peak, ...mobile });
      if (p < CLOSED_PROGRESS) {
        assert.equal(fromScroll.openAmount, 0);
        assert.equal(fromScroll.featherLift, 0);
        assert.equal(fromScroll.bindingLift, 0);
        continue;
      }
      const fromForward = getForwardAnim(p);
      assert.equal(fromScroll.openAmount, fromForward.openAmount);
      assert.equal(fromScroll.featherLift, fromForward.featherLift);
      assert.equal(fromScroll.bindingLift, fromForward.bindingLift);
      assert.equal(fromScroll.chapter, fromForward.chapter);
    }
  });

  it("maps five equal chapter windows for five scroll clicks", () => {
    assert.equal(getForwardAnim(0.1).chapter, 0);
    assert.equal(getForwardAnim(0.3).chapter, 1);
    assert.equal(getForwardAnim(0.5).chapter, 2);
    assert.equal(getForwardAnim(0.7).chapter, 3);
    assert.equal(getForwardAnim(0.9).chapter, 4);
    assert.equal(HERO_TRACK_SCROLL_PX, 520);
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
    let scrub = { ...idle };
    for (const raw of [0.2, 0.5, 0.8, 1]) scrub = advanceScrub(scrub, raw);

    const closing = getScrollAnim(0.5, { peak: scrub.peak, closing: true, ...mobile });
    scrub = advanceScrub(scrub, 0.5);
    const jittered = advanceScrub(scrub, 0.504);
    const afterJitter = getScrollAnim(jittered.progress, {
      peak: jittered.peak,
      closing: jittered.closing,
      ...mobile,
    });

    assert.equal(jittered.peak, 1);
    assert.equal(jittered.progress, 0.5);
    assert.equal(jittered.closing, true);
    assert.ok(closing.openAmount < 0.2, "mid-reverse should already be mostly closed");
    assert.ok(
      afterJitter.openAmount <= closing.openAmount + 1e-9,
      `jitter exploded the shuttle: openAmount=${afterJitter.openAmount}`,
    );
    assert.ok(afterJitter.featherLift <= closing.featherLift + 1e-9);
    assert.equal(false, shouldMountExplodedLayers(afterJitter, jittered));
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

  it("unmounts exploded crops and rings on the first reverse frame", () => {
    const crest = getReverseExplodedOpacity(1, 1, REVERSE_CLOSE_END_MOBILE);
    assert.equal(crest, 1);
    assert.equal(false, isReversingPlayback(1, 1));
    assert.equal(true, shouldShowExplodedLayers(getForwardAnim(1), false));

    for (const p of [0.999, 0.98, 0.9, 0.7, 0.5, 0.3]) {
      const anim = pose(p, 1);
      assert.equal(true, isReversingPlayback(p, 1), `p=${p} should be reversing`);
      assert.equal(
        0,
        getReverseExplodedOpacity(p, 1, REVERSE_CLOSE_END_MOBILE),
        `exploded opacity still up at p=${p}`,
      );
      assert.equal(
        false,
        shouldShowExplodedLayers(anim, true),
        `mid-close still showing slices at p=${p} open=${anim.openAmount}`,
      );
      assert.equal(1, getAssembledOpacity(anim, true));
    }
  });

  it("keeps exploded layers while opening (unchanged choreography)", () => {
    for (const p of [0.3, 0.5, 0.7, 0.9, 1]) {
      const anim = getForwardAnim(p);
      assert.equal(false, isReversingPlayback(p, p));
      assert.equal(true, shouldShowExplodedLayers(anim, false));
      assert.ok(getAssembledOpacity(anim, false) < 1);
    }
  });
});

describe("advanceScrub peak tracking", () => {
  it("keeps the high-water peak on reverse and at 0", () => {
    let scrub = advanceScrub(idle, 0.4);
    scrub = advanceScrub(scrub, 0.9);
    assert.equal(scrub.peak, 0.9);
    scrub = advanceScrub(scrub, 0.3);
    assert.equal(scrub.peak, 0.9);
    assert.equal(scrub.progress, 0.3);
    assert.equal(scrub.closing, true);
    scrub = advanceScrub(scrub, 0);
    assert.deepEqual(scrub, { progress: 0, peak: 0.9, closing: true, freeExit: false });
  });

  it("resets the peak only when the user is above the track", () => {
    let scrub = advanceScrub(idle, 1);
    scrub = advanceScrub(scrub, 0);
    assert.equal(scrub.peak, 1);
    scrub = advanceScrub(scrub, 0, { aboveTrack: true });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: false });
  });
});

describe("Android close bounce cannot re-explode", () => {
  function openThenCloseToZero() {
    let scrub = { ...idle };
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
      const anim = getScrollAnim(next.progress, {
        peak: next.peak,
        closing: next.closing,
        ...mobile,
      });
      assert.equal(next.progress, 0, `bounce ${bounce} raised progress`);
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
      assert.equal(false, shouldMountExplodedLayers(anim, next));
    }
  });

  it("does not jump to chapter-1 explode after settle-at-0 then raw 0.22", () => {
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
    let scrub = { ...idle };
    for (const raw of [0.4, 0.8, 1, 0.5]) scrub = advanceScrub(scrub, raw);
    const resumed = advanceScrub(scrub, 0.55, { intentOpen: true });
    const anim = getScrollAnim(resumed.progress, {
      peak: resumed.peak,
      closing: resumed.closing,
      ...mobile,
    });
    const exploded = getForwardAnim(0.55);
    assert.equal(resumed.peak, 1);
    assert.equal(resumed.progress, 0.5);
    assert.equal(resumed.closing, true);
    assert.ok(
      anim.openAmount < exploded.openAmount * 0.5,
      `mid-rewind resume exploded: open=${anim.openAmount} forward=${exploded.openAmount}`,
    );
    assert.equal(false, shouldMountExplodedLayers(anim, resumed));
  });

  it("starts a fresh forward open when the user intends to open from the start", () => {
    const closed = openThenCloseToZero();
    const opened = advanceScrub(closed, 0.25, { intentOpen: true });
    const anim = getScrollAnim(opened.progress, { peak: opened.peak, ...mobile });
    const forward = getForwardAnim(0.25);
    assert.equal(opened.closing, false);
    assert.equal(opened.peak, 0.25);
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
    assert.equal(first.belowTrack, false);
    const innerHeight = readHeroTrack({ trackTop, trackHeight, viewportHeight: 844 });
    assert.ok(
      Math.abs(innerHeight.raw - first.raw) > 0.02,
      "window.innerHeight as viewport would jitter progress on URL-bar resize",
    );
  });

  it("applyHeroScrub: settle at top then bounce stays assembled", () => {
    const viewportHeight = 844;
    const trackHeight = viewportHeight + HERO_TRACK_SCROLL_PX;
    let scrub = { ...idle };
    scrub = applyHeroScrub(scrub, {
      trackTop: -(trackHeight - viewportHeight),
      trackHeight,
      viewportHeight,
    });
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
    let scrub = { progress: 0, peak: 1, closing: true, freeExit: false };
    scrub = applyHeroScrub(scrub, {
      trackTop: 240,
      trackHeight: 844 + HERO_TRACK_SCROLL_PX,
      viewportHeight: 844,
    });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: false });
    scrub = applyHeroScrub(scrub, {
      trackTop: -0.3 * HERO_TRACK_SCROLL_PX,
      trackHeight: 844 + HERO_TRACK_SCROLL_PX,
      viewportHeight: 844,
      intentOpen: true,
    });
    const anim = getScrollAnim(scrub.progress, { peak: scrub.peak, ...mobile });
    const forward = getForwardAnim(scrub.progress);
    assert.equal(anim.openAmount, forward.openAmount);
    assert.equal(anim.featherLift, forward.featherLift);
  });
});

describe("free exit after scrolling into the page below", () => {
  const viewportHeight = 844;
  const trackHeight = viewportHeight + HERO_TRACK_SCROLL_PX;
  const scrollable = trackHeight - viewportHeight;

  it("readHeroTrack marks belowTrack once past the sticky range", () => {
    const atEnd = readHeroTrack({
      trackTop: -scrollable,
      trackHeight,
      viewportHeight,
    });
    assert.equal(atEnd.belowTrack, false);
    assert.ok(atEnd.raw >= 0.985);

    const past = readHeroTrack({
      trackTop: -scrollable - BELOW_TRACK_PX - 1,
      trackHeight,
      viewportHeight,
    });
    assert.equal(past.belowTrack, true);
  });

  it("below the track latches freeExit and clears the peak", () => {
    let scrub = advanceScrub(idle, 1);
    scrub = advanceScrub(scrub, 1, { belowTrack: true });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: true });
  });

  it("freeExit keeps the shuttle assembled while scrolling back up the track", () => {
    let scrub = { progress: 0, peak: 0, closing: false, freeExit: true };
    for (const raw of [0.9, 0.6, 0.3, 0.1]) {
      scrub = advanceScrub(scrub, raw);
      assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: true });
      assert.equal(true, isAssembledPose(pose(scrub.progress)));
    }
  });

  it("freeExit clears near the top so the next down opens without needing aboveTrack", () => {
    let scrub = { progress: 0, peak: 0, closing: false, freeExit: true };
    scrub = advanceScrub(scrub, 0.02);
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: false });

    scrub = { progress: 0, peak: 0, closing: false, freeExit: true };
    scrub = advanceScrub(scrub, 0.2, { intentOpen: true });
    // Still mid-track on the way up — stay free (do not reopen from below).
    assert.equal(scrub.freeExit, true);
    assert.equal(scrub.progress, 0);

    scrub = advanceScrub({ progress: 0, peak: 0, closing: false, freeExit: true }, 0.04, {
      intentOpen: true,
    });
    assert.equal(scrub.freeExit, false);
    assert.equal(scrub.closing, false);
    assert.equal(scrub.progress, 0.04);
  });

  it("applyHeroScrub: past the story then back up never reverse-explodes", () => {
    let scrub = { ...idle };
    scrub = applyHeroScrub(scrub, {
      trackTop: -scrollable,
      trackHeight,
      viewportHeight,
      intentOpen: true,
    });
    assert.equal(scrub.progress, 1);

    scrub = applyHeroScrub(scrub, {
      trackTop: -scrollable - BELOW_TRACK_PX - 20,
      trackHeight,
      viewportHeight,
    });
    assert.equal(scrub.freeExit, true);
    assert.equal(scrub.progress, 0);

    for (const top of [-scrollable * 0.8, -scrollable * 0.4, -80]) {
      scrub = applyHeroScrub(scrub, { trackTop: top, trackHeight, viewportHeight });
      assert.equal(scrub.freeExit, true, `lost freeExit at top=${top}`);
      assert.equal(scrub.progress, 0);
      assert.equal(true, isAssembledPose(pose(scrub.progress)));
      assert.equal(false, shouldMountExplodedLayers(pose(scrub.progress), scrub));
    }

    // Near the top of the track — freeExit clears without needing aboveTrack.
    scrub = applyHeroScrub(scrub, { trackTop: -10, trackHeight, viewportHeight });
    assert.equal(scrub.freeExit, false);
    assert.equal(scrub.progress, 0);
  });

  it("above the track clears freeExit so the next down opens again", () => {
    let scrub = { progress: 0, peak: 0, closing: false, freeExit: true };
    scrub = applyHeroScrub(scrub, {
      trackTop: ABOVE_TRACK_PX + 40,
      trackHeight,
      viewportHeight,
    });
    assert.deepEqual(scrub, { progress: 0, peak: 0, closing: false, freeExit: false });

    scrub = applyHeroScrub(scrub, {
      trackTop: -0.35 * scrollable,
      trackHeight,
      viewportHeight,
      intentOpen: true,
    });
    assert.equal(scrub.freeExit, false);
    assert.equal(scrub.closing, false);
    assert.ok(scrub.progress > CLOSED_PROGRESS);
    const anim = getScrollAnim(scrub.progress, { peak: scrub.peak, ...mobile });
    assert.equal(anim.openAmount, getForwardAnim(scrub.progress).openAmount);
    assert.equal(true, shouldMountExplodedLayers(anim, scrub));
  });
});

describe("reverse-mode lock stays assembled-PNG-only while closing", () => {
  function openThenStartClose() {
    let scrub = { ...idle };
    for (const raw of [0.2, 0.5, 0.8, 1, 0.72]) {
      scrub = advanceScrub(scrub, raw);
    }
    return scrub;
  }

  it("latches closing on the first reverse sample and ignores later increases", () => {
    const locked = openThenStartClose();
    assert.equal(locked.closing, true);
    assert.equal(locked.peak, 1);
    assert.equal(true, isCloseLocked(locked));

    for (const bump of [0.73, 0.8, 0.95, 1]) {
      const next = advanceScrub(locked, bump, { intentOpen: true });
      assert.equal(next.closing, true, `bump ${bump} dropped the lock`);
      assert.equal(next.progress, locked.progress);
      assert.equal(next.peak, 1);
    }
  });

  it("keeps closing=true when progress is unchanged (pause mid-close)", () => {
    const locked = openThenStartClose();
    const paused = advanceScrub(locked, locked.progress);
    assert.deepEqual(paused, locked);
    assert.equal(paused.closing, true);
  });

  it("never mounts exploded layers on any reverse-mode frame", () => {
    let scrub = { ...idle };
    for (const raw of [0.15, 0.4, 0.7, 1]) scrub = advanceScrub(scrub, raw);
    const crestAnim = getForwardAnim(1);
    assert.equal(true, shouldMountExplodedLayers(crestAnim, scrub));
    scrub = advanceScrub(scrub, 0.999);
    assert.equal(scrub.closing, true);
    assert.equal(false, shouldMountExplodedLayers(crestAnim, scrub));
    for (let p = 0.95; p >= 0; p = Math.round((p - 0.05) * 100) / 100) {
      scrub = advanceScrub(scrub, p);
      const anim = getScrollAnim(scrub.progress, {
        peak: scrub.peak,
        closing: scrub.closing,
        ...mobile,
      });
      assert.equal(scrub.closing, true, `lost lock at p=${p}`);
      assert.equal(
        false,
        shouldMountExplodedLayers(anim, scrub),
        `exploded layers mounted at p=${p} open=${anim.openAmount}`,
      );
      assert.equal(false, shouldShowExplodedLayers(anim, true));
      assert.equal(1, getAssembledOpacity(anim, true));
    }
  });

  it("getScrollAnim closing=true never takes the forward explode path if p > peak", () => {
    const forward = getForwardAnim(0.55);
    const locked = getScrollAnim(0.55, { peak: 0.3, closing: true, ...mobile });
    assert.ok(
      locked.openAmount < forward.openAmount,
      `closing with p>peak used forward explode: ${locked.openAmount}`,
    );
    assert.equal(false, shouldMountExplodedLayers(locked, { closing: true, progress: 0.55, peak: 0.3 }));
  });

  it("touchend settle 0 then URL-bar / rubber-band jumps stay locked and slice-free", () => {
    let scrub = { ...idle };
    for (const raw of [0.25, 0.6, 1, 0.4, 0.1, 0]) scrub = advanceScrub(scrub, raw);
    assert.deepEqual(scrub, { progress: 0, peak: 1, closing: true, freeExit: false });

    for (const jump of [0.03, 0.09, 0.15, 0.22, 0.28, 0.35]) {
      const next = advanceScrub(scrub, jump);
      const anim = getScrollAnim(next.progress, {
        peak: next.peak,
        closing: next.closing,
        ...mobile,
      });
      assert.equal(next.progress, 0, `jump ${jump} raised progress`);
      assert.equal(next.peak, 1);
      assert.equal(next.closing, true);
      assert.equal(true, isAssembledPose(anim));
      assert.equal(false, shouldMountExplodedLayers(anim, next));
    }
  });

  it("only a clear new open from progress≈0 with intent leaves the lock", () => {
    let scrub = { progress: 0, peak: 1, closing: true, freeExit: false };
    scrub = advanceScrub(scrub, 0.4, { intentOpen: true });
    assert.equal(scrub.closing, false);
    assert.equal(scrub.peak, 0.4);
    const anim = getScrollAnim(scrub.progress, { peak: scrub.peak, ...mobile });
    const forward = getForwardAnim(0.4);
    assert.equal(anim.openAmount, forward.openAmount);
    assert.ok(anim.openAmount > 0.12, `expected exploded open, got ${anim.openAmount}`);
    assert.equal(true, shouldMountExplodedLayers(anim, scrub));
  });

  it("a no-touch jump below FALLBACK_REOPEN from 0 does not reopen", () => {
    const closed = { progress: 0, peak: 1, closing: true, freeExit: false };
    const bounced = advanceScrub(closed, FALLBACK_REOPEN - 0.02);
    assert.equal(bounced.closing, true);
    assert.equal(bounced.progress, 0);
    assert.equal(bounced.peak, 1);
  });
});

describe("rubber-band trackTop is not above-track", () => {
  it("treats small positive trackTop as still on the shuttle", () => {
    for (const top of [2, 8, 24, 48, 80, ABOVE_TRACK_PX]) {
      const sample = readHeroTrack({
        trackTop: top,
        trackHeight: 844 + HERO_TRACK_SCROLL_PX,
        viewportHeight: 844,
      });
      assert.equal(sample.aboveTrack, false, `trackTop ${top} ended the session`);
    }
  });

  it("applyHeroScrub: 12–80px rubber-band after close keeps the lock", () => {
    const trackHeight = 844 + HERO_TRACK_SCROLL_PX;
    const viewportHeight = 844;
    let scrub = { progress: 0, peak: 1, closing: true, freeExit: false };
    for (const top of [12, 40, 80]) {
      scrub = applyHeroScrub(scrub, { trackTop: top, trackHeight, viewportHeight });
      assert.equal(scrub.closing, true, `trackTop ${top} cleared closing`);
      assert.equal(scrub.peak, 1, `trackTop ${top} dropped the peak`);
    }
  });

  it("applyHeroScrub: clearly above the track still ends the session", () => {
    const ended = applyHeroScrub(
      { progress: 0, peak: 1, closing: true, freeExit: false },
      { trackTop: ABOVE_TRACK_PX + 40, trackHeight: 844 + HERO_TRACK_SCROLL_PX, viewportHeight: 844 },
    );
    assert.deepEqual(ended, { progress: 0, peak: 0, closing: false, freeExit: false });
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
    assert.equal(true, isFullyClosed(0.19));
    assert.equal(false, isFullyClosed(0.2));
  });
});
