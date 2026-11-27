import test from "node:test";
import assert from "node:assert/strict";
import { isListenQualified, isBattleListenQualified, requiredCompetitorVotes } from "../shared/competition.ts";

test("requires at least half of each track, rounded up to a whole second", () => {
  assert.equal(isListenQualified(30, 60), true);
  assert.equal(isListenQualified(29, 60), false);
  assert.equal(isListenQualified(31, 61), true);
  assert.equal(isListenQualified(30, 61), false);
});

test("rejects invalid durations and listened values", () => {
  assert.equal(isListenQualified(-1, 60), false);
  assert.equal(isListenQualified(10, 0), false);
  assert.equal(isListenQualified(61, 60), false);
});

test("keeps free listeners eligible to vote but assigns no competitor quota", () => {
  assert.equal(requiredCompetitorVotes("free", 1), 0);
});

test("applies regular and VIP voting quotas, with every third cycle reduced to one", () => {
  assert.equal(requiredCompetitorVotes("regular", 1), 5);
  assert.equal(requiredCompetitorVotes("vip", 1), 3);
  assert.equal(requiredCompetitorVotes("regular", 3), 1);
  assert.equal(requiredCompetitorVotes("vip", 6), 1);
});

test("rejects unknown tiers and invalid cycle numbers safely", () => {
  assert.equal(requiredCompetitorVotes("unknown", 1), 0);
  assert.equal(requiredCompetitorVotes("regular", 0), 5);
});

test("a battle vote requires at least half of both competing tracks", () => {
  assert.equal(isBattleListenQualified(30, 60, 45, 90), true);
  assert.equal(isBattleListenQualified(30, 60, 44, 90), false);
  assert.equal(isBattleListenQualified(29, 60, 90, 90), false);
});
