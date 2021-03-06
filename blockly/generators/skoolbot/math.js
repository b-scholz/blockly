/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Skoolbot for math blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Skoolbot.math');

goog.require('Blockly.Skoolbot');


Blockly.Skoolbot['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order = code < 0 ? Blockly.Skoolbot.ORDER_UNARY :
              Blockly.Skoolbot.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Skoolbot['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    ADD: [' + ', Blockly.Skoolbot.ORDER_ADDITIVE],
    MINUS: [' - ', Blockly.Skoolbot.ORDER_ADDITIVE],
    MULTIPLY: [' * ', Blockly.Skoolbot.ORDER_MULTIPLICATIVE],
    DIVIDE: [' / ', Blockly.Skoolbot.ORDER_MULTIPLICATIVE],
    POWER: [' ^ ', Blockly.Skoolbot.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Skoolbot.valueToCode(block, 'B', order) || '0';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Skoolbot['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Skoolbot.valueToCode(block, 'NUM',
        Blockly.Skoolbot.ORDER_UNARY) || '0';
    return ['-' + arg, Blockly.Skoolbot.ORDER_UNARY];
  }
  if (operator == 'POW10') {
    arg = Blockly.Skoolbot.valueToCode(block, 'NUM',
        Blockly.Skoolbot.ORDER_EXPONENTIATION) || '0';
    return ['10 ^ ' + arg, Blockly.Skoolbot.ORDER_EXPONENTIATION];
  }
  if (operator == 'ROUND') {
    arg = Blockly.Skoolbot.valueToCode(block, 'NUM',
        Blockly.Skoolbot.ORDER_ADDITIVE) || '0';
  } else {
    arg = Blockly.Skoolbot.valueToCode(block, 'NUM',
        Blockly.Skoolbot.ORDER_NONE) || '0';
  }
  switch (operator) {
    case 'ABS':
      code = 'math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'math.log(' + arg + ', 10)';
      break;
    case 'EXP':
      code = 'math.exp(' + arg + ')';
      break;
    case 'ROUND':
      // This rounds up.  Blockly does not specify rounding direction.
      code = 'math.floor(' + arg + ' + .5)';
      break;
    case 'ROUNDUP':
      code = 'math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.sin(math.rad(' + arg + '))';
      break;
    case 'COS':
      code = 'math.cos(math.rad(' + arg + '))';
      break;
    case 'TAN':
      code = 'math.tan(math.rad(' + arg + '))';
      break;
    case 'ASIN':
      code = 'math.deg(math.asin(' + arg + '))';
      break;
    case 'ACOS':
      code = 'math.deg(math.acos(' + arg + '))';
      break;
    case 'ATAN':
      code = 'math.deg(math.atan(' + arg + '))';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.Skoolbot.ORDER_HIGH];
};

Blockly.Skoolbot['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    PI: ['math.pi', Blockly.Skoolbot.ORDER_HIGH],
    E: ['math.exp(1)', Blockly.Skoolbot.ORDER_HIGH],
    GOLDEN_RATIO: ['(1 + math.sqrt(5)) / 2', Blockly.Skoolbot.ORDER_MULTIPLICATIVE],
    SQRT2: ['math.sqrt(2)', Blockly.Skoolbot.ORDER_HIGH],
    SQRT1_2: ['math.sqrt(1 / 2)', Blockly.Skoolbot.ORDER_HIGH],
    INFINITY: ['math.huge', Blockly.Skoolbot.ORDER_HIGH]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Skoolbot['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Skoolbot.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Skoolbot.ORDER_MULTIPLICATIVE) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.Skoolbot.provideFunction_(
        'math_isPrime',
        ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(n)',
         '  -- https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if n == 2 or n == 3 then',
         '    return true',
         '  end',
         '  -- False if n is NaN, negative, is 1, or not whole.',
         '  -- And false if n is divisible by 2 or 3.',
         '  if not(n > 1) or n % 1 ~= 0 or n % 2 == 0 or n % 3 == 0 then',
         '    return false',
         '  end',
         '  -- Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for x = 6, math.sqrt(n) + 1.5, 6 do',
         '    if n % (x - 1) == 0 or n % (x + 1) == 0 then',
         '      return false',
         '    end',
         '  end',
         '  return true',
         'end']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Skoolbot.ORDER_HIGH];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Skoolbot.valueToCode(block, 'DIVISOR',
          Blockly.Skoolbot.ORDER_MULTIPLICATIVE);
      // If 'divisor' is some code that evals to 0, Skoolbot will produce a nan.
      // Let's produce nil if we can determine this at compile-time.
      if (!divisor || divisor == '0') {
        return ['nil', Blockly.Skoolbot.ORDER_ATOMIC];
      }
      // The normal trick to implement ?: with and/or doesn't work here:
      //   divisor == 0 and nil or number_to_check % divisor == 0
      // because nil is false, so allow a runtime failure. :-(
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Skoolbot.ORDER_RELATIONAL];
};

Blockly.Skoolbot['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'DELTA',
      Blockly.Skoolbot.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Skoolbot.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + varName + ' + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Blockly.Skoolbot['math_round'] = Blockly.Skoolbot['math_single'];
// Trigonometry functions have a single operand.
Blockly.Skoolbot['math_trig'] = Blockly.Skoolbot['math_single'];

Blockly.Skoolbot['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Skoolbot.valueToCode(block, 'LIST',
      Blockly.Skoolbot.ORDER_NONE) || '{}';
  var functionName;

  // Functions needed in more than one case.
  function provideSum() {
    return Blockly.Skoolbot.provideFunction_(
        'math_sum',
        ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
         '  local result = 0',
         '  for _, v in ipairs(t) do',
         '    result = result + v',
         '  end',
         '  return result',
         'end']);
  }

  switch (func) {
    case 'SUM':
      functionName = provideSum();
      break;

    case 'MIN':
      // Returns 0 for the empty list.
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_min',
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local result = math.huge',
           '  for _, v in ipairs(t) do',
           '    if v < result then',
           '      result = v',
           '    end',
           '  end',
           '  return result',
           'end']);
      break;

    case 'AVERAGE':
      // Returns 0 for the empty list.
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_average',
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  return ' + provideSum() + '(t) / #t',
           'end']);
      break;

    case 'MAX':
      // Returns 0 for the empty list.
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_max',
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local result = -math.huge',
           '  for _, v in ipairs(t) do',
           '    if v > result then',
           '      result = v',
           '    end',
           '  end',
           '  return result',
           'end']);
      break;

    case 'MEDIAN':
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_median',
          // This operation excludes non-numbers.
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  -- Source: http://lua-users.org/wiki/SimpleStats',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local temp={}',
           '  for _, v in ipairs(t) do',
           '    if type(v) == "number" then',
           '      table.insert(temp, v)',
           '    end',
           '  end',
           '  table.sort(temp)',
           '  if #temp % 2 == 0 then',
           '    return (temp[#temp/2] + temp[(#temp/2)+1]) / 2',
           '  else',
           '    return temp[math.ceil(#temp/2)]',
           '  end',
           'end']);
      break;

    case 'MODE':
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_modes',
          // As a list of numbers can contain more than one mode,
          // the returned result is provided as an array.
          // The Skoolbot version includes non-numbers.
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  -- Source: http://lua-users.org/wiki/SimpleStats',
           '  local counts={}',
           '  for _, v in ipairs(t) do',
           '    if counts[v] == nil then',
           '      counts[v] = 1',
           '    else',
           '      counts[v] = counts[v] + 1',
           '    end',
           '  end',
           '  local biggestCount = 0',
           '  for _, v  in pairs(counts) do',
           '    if v > biggestCount then',
           '      biggestCount = v',
           '    end',
           '  end',
           '  local temp={}',
           '  for k, v in pairs(counts) do',
           '    if v == biggestCount then',
           '      table.insert(temp, k)',
           '    end',
           '  end',
           '  return temp',
           'end']);
      break;

    case 'STD_DEV':
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_standard_deviation',
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  local m',
           '  local vm',
           '  local total = 0',
           '  local count = 0',
           '  local result',
           '  m = #t == 0 and 0 or ' + provideSum() + '(t) / #t',
           '  for _, v in ipairs(t) do',
           "    if type(v) == 'number' then",
           '      vm = v - m',
           '      total = total + (vm * vm)',
           '      count = count + 1',
           '    end',
           '  end',
           '  result = math.sqrt(total / (count-1))',
           '  return result',
           'end']);
      break;

    case 'RANDOM':
      functionName = Blockly.Skoolbot.provideFunction_(
          'math_random_list',
          ['function ' + Blockly.Skoolbot.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return nil',
           '  end',
           '  return t[math.random(#t)]',
           'end']);
      break;

    default:
      throw Error('Unknown operator: ' + func);
  }
  return [functionName + '(' + list + ')', Blockly.Skoolbot.ORDER_HIGH];
};

Blockly.Skoolbot['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'DIVIDEND',
      Blockly.Skoolbot.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Skoolbot.valueToCode(block, 'DIVISOR',
      Blockly.Skoolbot.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Skoolbot.ORDER_MULTIPLICATIVE];
};

Blockly.Skoolbot['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'VALUE',
      Blockly.Skoolbot.ORDER_NONE) || '0';
  var argument1 = Blockly.Skoolbot.valueToCode(block, 'LOW',
      Blockly.Skoolbot.ORDER_NONE) || '-math.huge';
  var argument2 = Blockly.Skoolbot.valueToCode(block, 'HIGH',
      Blockly.Skoolbot.ORDER_NONE) || 'math.huge';
  var code = 'math.min(math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Skoolbot.ORDER_HIGH];
};

Blockly.Skoolbot['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'FROM',
      Blockly.Skoolbot.ORDER_NONE) || '0';
  var argument1 = Blockly.Skoolbot.valueToCode(block, 'TO',
      Blockly.Skoolbot.ORDER_NONE) || '0';
  var code = 'math.random(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Skoolbot.ORDER_HIGH];
};

Blockly.Skoolbot['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['math.random()', Blockly.Skoolbot.ORDER_HIGH];
};

Blockly.Skoolbot['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.Skoolbot.valueToCode(block, 'X',
      Blockly.Skoolbot.ORDER_NONE) || '0';
  var argument1 = Blockly.Skoolbot.valueToCode(block, 'Y',
      Blockly.Skoolbot.ORDER_NONE) || '0';
  return ['math.deg(math.atan2(' + argument1 + ', ' + argument0 + '))',
      Blockly.Skoolbot.ORDER_HIGH];
};
