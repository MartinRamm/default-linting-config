import { expectTypeOf } from 'expect-type';
import { HELLO_WORLD } from 'src/helloWorld';

//these are useless sample test, please don't write tests like this!
expectTypeOf(HELLO_WORLD).toBeString();

expectTypeOf(HELLO_WORLD).not.toBeBoolean();
function test(param: boolean) {}
// @ts-expect-error
test(HELLO_WORLD);
