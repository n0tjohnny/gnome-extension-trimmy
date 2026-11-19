// Unit test for the trim rule shared by extension.js and prefs.js.
// Run: gjs -m tests/trim.test.js
import System from "system";
import {trim} from "../trim.js";

const BOTH = 0, START = 1, END = 2;
const cases = [
  // [mode, trim string, copied text, expected result]
  [BOTH, "", "  hi  ", "hi"],
  [START, "", "  hi  ", "hi  "],
  [END, "", "  hi  ", "  hi"],
  [BOTH, "", "\t\nhi\n", "hi"],
  [BOTH, "$", "  $ ls  ", "ls"],         // whitespace, string, whitespace again
  [BOTH, "$", "$ls$", "ls"],             // once at each end
  [START, "$", "$$ls", "$ls"],           // removed once, not repeatedly
  [END, "$", "$ls$", "$ls"],             // start untouched in end-only mode
  [BOTH, " $ ", "$ ls", "ls"],           // spaces around the trim string are ignored
  [BOTH, "$", "ls", "ls"],               // no match, nothing removed
  [BOTH, "$", "$", ""],                  // only the trim string: empty result
  [BOTH, "", "   ", ""],                 // only whitespace: empty result
  [BOTH, "", "", ""],
];

let failed = 0;
for (const [mode, str, input, want] of cases) {
  const got = trim(input, mode, str);
  if (got !== want) {
    failed++;
    print(`FAIL trim(${JSON.stringify(input)}, ${mode}, ${JSON.stringify(str)}) = ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}
print(`${cases.length - failed}/${cases.length} passed`);
if (failed) System.exit(1);
