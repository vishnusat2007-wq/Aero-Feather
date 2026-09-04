import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateNewPassword } from "./password";

describe("validateNewPassword", () => {
  it("rejects passwords shorter than 6 characters", () => {
    assert.equal(
      validateNewPassword("abcde", "abcde"),
      "Password must be at least 6 characters",
    );
  });

  it("rejects mismatched confirmation", () => {
    assert.equal(
      validateNewPassword("secret1", "secret2"),
      "Passwords do not match",
    );
  });

  it("accepts matching passwords of at least 6 characters", () => {
    assert.equal(validateNewPassword("secret1", "secret1"), null);
  });
});
