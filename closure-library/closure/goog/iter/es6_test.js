// Copyright 2017 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('goog.iter.es6Test');
goog.setTestOnly('goog.iter.es6Test');

const testSuite = goog.require('goog.testing.testSuite');
const {ShimIterable} = goog.require('goog.iter.es6');
const {range, toArray} = goog.require('goog.iter');
goog.require('goog.testing.jsunit');

/** @return {!Iterator<number>} */
function* gen() {
  yield* [1, 3, 5];
}

/** @return {!ShimIterable<number>} */
function fromEs6Iterator() {
  return ShimIterable.of(gen());
}

/** @return {!ShimIterable<number>} */
function fromEs6Iterable() {
  return ShimIterable.of({
    [Symbol.iterator]() {
      return gen();
    }
  });
}

/** @return {!ShimIterable<number>} */
function fromGoogIterator() {
  return ShimIterable.of(range(1, 6, 2));
}

/** @return {!ShimIterable<number>} */
function fromGoogIterable() {
  return ShimIterable.of({
    __iterator__() {
      return range(1, 6, 2);
    }
  });
}

testSuite({

  // Start with ES6

  testEs6IterableAsIterable() {
    const iter = fromEs6Iterable();
    assertArrayEquals([1, 3, 5], toArray(iter));
    assertArrayEquals([1, 3, 5], [...iter]);
    assertArrayEquals([1, 3, 5], toArray(iter));
    assertArrayEquals([1, 3, 5], [...iter]);
  },

  testEs6IterableToEs6Iterator() {
    assertArrayEquals([1, 3, 5], toArray(fromEs6Iterable().toEs6()));
    assertArrayEquals([1, 3, 5], [...fromEs6Iterable().toEs6()]);
  },

  testEs6IterableToGoogIterator() {
    assertArrayEquals([1, 3, 5], toArray(fromEs6Iterable().toGoog()));
    assertArrayEquals([1, 3, 5], [...fromEs6Iterable().toGoog()]);
  },

  testEs6IteratorAsIterable() {
    assertArrayEquals([1, 3, 5], toArray(fromEs6Iterator()));
    assertArrayEquals([1, 3, 5], [...fromEs6Iterator()]);
  },

  testEs6IteratorToEs6Iterator() {
    assertArrayEquals([1, 3, 5], toArray(fromEs6Iterator().toEs6()));
    assertArrayEquals([1, 3, 5], [...fromEs6Iterator().toEs6()]);
  },

  testEs6IteratorToGoogIterator() {
    assertArrayEquals([1, 3, 5], toArray(fromEs6Iterator().toGoog()));
    assertArrayEquals([1, 3, 5], [...fromEs6Iterator().toGoog()]);
  },

  // Start with Goog

  testGoogIterableAsIterable() {
    const iter = fromGoogIterable();
    assertArrayEquals([1, 3, 5], toArray(iter));
    assertArrayEquals([1, 3, 5], [...iter]);
    assertArrayEquals([1, 3, 5], toArray(iter));
    assertArrayEquals([1, 3, 5], [...iter]);
  },

  testGoogIterableToEs6Iterator() {
    assertArrayEquals([1, 3, 5], toArray(fromGoogIterable().toEs6()));
    assertArrayEquals([1, 3, 5], [...fromGoogIterable().toEs6()]);
  },

  testGoogIterableToGoogIterator() {
    assertArrayEquals([1, 3, 5], toArray(fromGoogIterable().toGoog()));
    assertArrayEquals([1, 3, 5], [...fromGoogIterable().toGoog()]);
  },

  testGoogIteratorAsIterable() {
    assertArrayEquals([1, 3, 5], toArray(fromGoogIterator()));
    assertArrayEquals([1, 3, 5], [...fromGoogIterator()]);
  },

  testGoogIteratorToEs6Iterator() {
    assertArrayEquals([1, 3, 5], toArray(fromGoogIterator().toEs6()));
    assertArrayEquals([1, 3, 5], [...fromGoogIterator().toEs6()]);
  },

  testGoogIteratorToGoogIterator() {
    assertArrayEquals([1, 3, 5], toArray(fromGoogIterator().toGoog()));
    assertArrayEquals([1, 3, 5], [...fromGoogIterator().toGoog()]);
  },

  // Misc tests

  testMultipleConversions() {
    const iter = fromGoogIterable();
    assertArrayEquals([1, 3, 5], [...iter.toEs6()]);
    assertArrayEquals([1, 3, 5], [...iter.toGoog()]);
    assertArrayEquals([1, 3, 5], [...iter.toGoog().toEs6()]);
    assertArrayEquals([1, 3, 5], [...iter.toEs6().toGoog()]);
  },

  testExhaustedAfterConversionToIterator() {
    let iter = fromGoogIterable().toEs6();
    assertArrayEquals([1, 3, 5], [...iter.toEs6()]);
    assertArrayEquals([], [...iter]);

    iter = fromGoogIterable().toEs6();
    assertArrayEquals([1, 3, 5], [...iter.toGoog()]);
    assertArrayEquals([], [...iter]);

    iter = fromGoogIterable().toGoog();
    assertArrayEquals([1, 3, 5], [...iter.toEs6()]);
    assertArrayEquals([], [...iter]);

    iter = fromGoogIterable().toGoog();
    assertArrayEquals([1, 3, 5], [...iter.toGoog()]);
    assertArrayEquals([], [...iter]);
  },
});
