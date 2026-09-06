import { ReactNode } from 'react';

import kitten_1 from 'img/kittens/kitten_1.jpg';
import kitten_2 from 'img/kittens/kitten_2.jpg';
import kitten_3 from 'img/kittens/kitten_3.jpg';
import kitten_4 from 'img/kittens/kitten_4.jpg';
import kitten_5 from 'img/kittens/kitten_5.jpg';
import kitten_6 from 'img/kittens/kitten_6.jpg';
import kitten_7 from 'img/kittens/kitten_7.jpg';
import kitten_8 from 'img/kittens/kitten_8.jpg';
import kitten_9 from 'img/kittens/kitten_9.jpg';
import kitten_10 from 'img/kittens/kitten_10.jpg';
import kitten_11 from 'img/kittens/kitten_11.jpg';
import kitten_12 from 'img/kittens/kitten_12.jpg';
import kitten_13 from 'img/kittens/kitten_13.jpg';

import { randIntBetween } from './Random';

const kittens: string[] = [
  kitten_1,
  kitten_2,
  kitten_3,
  kitten_4,
  kitten_5,
  kitten_6,
  kitten_7,
  kitten_8,
  kitten_9,
  kitten_10,
  kitten_11,
  kitten_12,
  kitten_13,
];

export const getKittenFromID = (id?: number | null): string =>
  id === null || id === undefined ? kittens[0] : kittens[id % 13];

export const getRandomKitten = (): string => kittens[randIntBetween(0, 14)];

export const hashProgram = (program: string): number => {
  let hash = 0;
  if (!program || program.length === 0) return 0;
  for (let i = 0; i < program.length; i += 1) {
    const chr = program.charCodeAt(i);

    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;

    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getKittenFromProgram = (program: string): ReactNode => {
  if (!program) return getRandomKitten();
  return kittens[Math.abs(hashProgram(program)) % 13];
};
