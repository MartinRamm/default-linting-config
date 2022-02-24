The typescript typing system is tested here, using
[expect-type](https://github.com/mmkal/ts/tree/main/packages/expect-type#readme). This includes both positive test cases
(that are supposed to compile without errors) and negative test cases (that are supposed to cause compile errors,
marked with `// @ts-expect-error`).

The code in this folder is never run in the node context (e.g. to catch runtime errors), but only run against the
typescript compiler. If you want to write unit tests, use the `unit` folder in the `test` root folder.

Word of caution: you really only want to write tests like this to ensure the correctness of complex type definitions.
Do not use this for contract testing, those tests bring no value and only increase the cost of code change!
