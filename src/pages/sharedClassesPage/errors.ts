import { ApolloError } from '@apollo/client';

// TODO: Centralize GraphQL error translation in a shared frontend utility,
// mapping server error codes/constraints to user-facing messages across pages.
export const getCreateGroupErrorMessage = (error: unknown): string => {
  const duplicateName =
    error instanceof ApolloError &&
    error.graphQLErrors.some(
      ({ extensions, message }) =>
        extensions?.code === 'constraint-violation' &&
        message.includes('shared_group_created_by_name_key'),
    );

  return duplicateName
    ? 'You already have a group with this name. Please choose a different name.'
    : 'Could not create the group.';
};
