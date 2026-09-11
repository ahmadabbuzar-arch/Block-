/**
 * experiments.js
 * Wraps the multi-step "Test It" workflow (Setup -> Procedure -> Test ->
 * Result) around the firestore.js data layer, so ui.js only deals with
 * plain objects.
 */

function startTest(myth) {
  const existing = getMyTests().find((t) => t.mythId === myth.id && t.status !== "Completed");
  if (existing) return existing;

  const test = {
    id: `test_${Date.now()}`,
    mythId: myth.id,
    title: myth.title,
    edition: myth.edition,
    version: myth.version,
    status: "In Progress",
    step: 1,
    attempts: [],
    result: null,
    notes: "",
    published: false,
    createdAt: Date.now()
  };
  upsertTest(test);
  return test;
}

function recordAttempt(testId, attempt) {
  const test = getTestById(testId);
  if (!test) return null;
  test.attempts.push({ ...attempt, at: Date.now() });
  upsertTest(test);
  return test;
}

function finalizeResult(testId, result, notes) {
  const test = getTestById(testId);
  if (!test) return null;
  test.result = result;
  test.notes = notes || test.notes;
  test.status = "Completed";
  test.step = 4;
  upsertTest(test);
  return test;
}

function publishTest(testId) {
  const test = getTestById(testId);
  if (!test) return null;
  test.published = true;
  upsertTest(test);
  const user = getCurrentUser();
  publishResult({
    experimentId: test.mythId,
    title: test.title,
    creator: user ? user.displayName : "Anonymous Creator",
    result: test.result,
    edition: test.edition,
    version: test.version,
    notes: test.notes,
    attempts: test.attempts.length,
    createdAt: Date.now()
  });
  return test;
}
