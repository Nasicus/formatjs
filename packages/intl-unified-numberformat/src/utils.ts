import {repeat, endsWith} from 'lodash';

export interface RawNumberFormatResult {
  formattedString: string;
  roundedNumber: number;
  integerDigitsCount: number;
}

// TODO: dedup with intl-pluralrules
// https://tc39.es/proposal-unified-intl-numberformat/section11/numberformat_proposed_out.html#sec-torawfixed
export function toRawFixed(
  x: number,
  minFraction: number,
  maxFraction: number
): RawNumberFormatResult {
  const f = maxFraction;
  let n: number;
  {
    const exactSolve = x * (10**f);
    const roundDown = Math.floor(exactSolve);
    const roundUp = Math.ceil(exactSolve);
    n = (exactSolve - roundDown < roundUp - exactSolve) ? roundDown : roundUp;
  }
  const xFinal = x / (10**f)
  let m = n === 0 ? '0' : n.toString()
  let int: number
  if (f !== 0) {
    let k = m.length;
    if (k <= f) {
      const z = repeat('0', f + 1 - k);
      m = z + m;
      k = f + 1;
    }
    const a = m.slice(0, k - f);
    const b = m.slice(k - f);
    m = `${a}.${b}`;
    int = a.length;
  } else {
    int = m.length;
  }
  let cut = maxFraction - minFraction;
  while (cut > 0 && endsWith(m, '0')) {
    m = m.slice(0, -1);
    cut--;
  }
  if (endsWith(m, '.')) {
    m = m.slice(0, -1);
  }
  return {formattedString: m, roundedNumber: xFinal, integerDigitsCount: int};
}

// https://tc39.es/proposal-unified-intl-numberformat/section11/numberformat_proposed_out.html#sec-torawprecision
export function toRawPrecision(
  x: number,
  minPrecision: number,
  maxPrecision: number
): RawNumberFormatResult {
  const p = maxPrecision;
  let m: string;
  let e: number;
  let xFinal: number;
  if (x === 0) {
    m = repeat('0', p);
    e = 0;
    xFinal = 0;
  } else {
    e = Math.floor(Math.log(x) / Math.log(10));
    let n: number;
    {
      const exactSolve = x / Math.pow(10, e - p + 1);
      const roundDown = Math.floor(exactSolve);
      const roundUp = Math.ceil(exactSolve);
      n = exactSolve - roundDown < roundUp - exactSolve ? roundDown : roundUp;
    }
    m = n.toString();
    xFinal = n * Math.pow(10, e - p + 1);
  }
  let int: number;
  if (e >= p - 1) {
    m = m + repeat('0', e - p + 1);
    int = e + 1;
  } else if (e >= 0) {
    m = `${m.slice(0, e + 1)}.${m.slice(e + 1)}`;
    int = e + 1;
  } else {
    m = `0.${repeat('0', -e - 1)}${m}`;
    int = 1;
  }
  if (m.indexOf('.') >= 0 && maxPrecision > minPrecision) {
    let cut = maxPrecision - minPrecision;
    while (cut > 0 && endsWith(m, '0')) {
      m = m.slice(0, -1);
      cut--;
    }
    if (endsWith(m, '.')) {
      m = m.slice(0, -1);
    }
  }
  return {formattedString: m, roundedNumber: xFinal, integerDigitsCount: int};
}
