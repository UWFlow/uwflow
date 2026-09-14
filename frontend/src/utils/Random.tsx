export const randBetween = (start: number, end: number): number => {
  return Math.random() * (end - start) + start;
};

export const randIntBetween = (start: number, end: number): number => {
  return Math.floor(randBetween(start, end));
};

export const shouldDoWithProbablity = (probability: number): boolean => {
  return Math.random() < probability;
};

export const randString = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
