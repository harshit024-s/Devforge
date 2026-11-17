const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAuthToken,
  verifyAuthToken,
  requireAuth,
  requireAdmin,
} = require("./auth");
const { registerSchema } = require("../validators/auth.validator");

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("auth tokens identify their subject and reject tampering", () => {
  const token = createAuthToken("user-123");

  assert.equal(verifyAuthToken(token).sub, "user-123");
  assert.throws(() => verifyAuthToken(`${token}invalid`));
});

test("admin middleware requires a verified administrator", () => {
  const response = createResponse();
  let continued = false;

  requireAdmin({ authUser: { role: "STUDENT" } }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 403);
  assert.equal(continued, false);

  requireAdmin({ authUser: { role: "ADMIN" } }, response, () => {
    continued = true;
  });

  assert.equal(continued, true);
});

test("authentication middleware rejects requests without a bearer token", async () => {
  const response = createResponse();
  let continued = false;

  await requireAuth({ get: () => undefined }, response, () => {
    continued = true;
  });

  assert.equal(response.statusCode, 401);
  assert.equal(continued, false);
});

test("registration validation preserves required-field errors", () => {
  const result = registerSchema.safeParse({});

  assert.equal(result.success, false);
  assert.equal(
    result.error.issues.find((issue) => issue.path[0] === "name").message,
    "Name is required"
  );
  assert.equal(
    result.error.issues.find((issue) => issue.path[0] === "email").message,
    "Email is required"
  );
});
