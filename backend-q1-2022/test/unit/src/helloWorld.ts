import { describe, expect, test } from '@jest/globals';
import { HELLO_WORLD } from 'src/helloWorld';

describe('helloWorld', () => {
  test('stupid sample test', () => {
    //this is a complete useless sample test. don't ever write tests like this please!
    expect(HELLO_WORLD).toBe('Hello, World!');
  });
});
