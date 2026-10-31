import { CourseReviewDistributionFragment } from 'generated/graphql';

export type Distribution = {
  hasDistribution: boolean;
  displayName: string;
  buckets: Buckets;
  total: number;
};

export type Buckets = Array<{
  value: number;
  count: number;
}>;

export const createOrderedBuckets = (
  buckets: CourseReviewDistributionFragment['course_easy_buckets'],
): Buckets => {
  // Create a map of existing values to counts
  const bucketMap = buckets.reduce<{ [key: number]: number }>((acc, bucket) => {
    if (bucket.value !== null && bucket.count !== null) {
      acc[bucket.value] = Number(bucket.count);
    }
    return acc;
  }, {});

  // Create ordered array with all values 4-0, using 0 for missing counts
  return [4, 3, 2, 1, 0].map((value) => ({
    value,
    count: bucketMap[value] || 0,
  }));
};
