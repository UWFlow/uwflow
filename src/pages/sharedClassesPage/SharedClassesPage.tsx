import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Users } from 'react-feather';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@apollo/client';
import {
  AcceptSharedGroupInviteMutation,
  AcceptSharedGroupInviteMutationVariables,
  CreateSharedGroupMutation,
  CreateSharedGroupMutationVariables,
  GetSharedGroupsQuery,
  GetSharedGroupsQueryVariables,
  RemoveSharedGroupMembershipMutation,
  RemoveSharedGroupMembershipMutationVariables,
} from 'generated/graphql';

import LoadingSpinner from 'components/display/LoadingSpinner';
import AccentButton from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import { Button } from 'components/ui/button';
import { AUTH_MODAL } from 'constants/Modal';
import { RootState } from 'data/reducers/RootReducer';
import {
  ACCEPT_SHARED_GROUP_INVITE,
  CREATE_SHARED_GROUP,
  REMOVE_SHARED_GROUP_MEMBERSHIP,
} from 'graphql/mutations/SharedClasses';
import { GET_SHARED_GROUPS } from 'graphql/queries/user/SharedClasses';
import useModal from 'hooks/useModal';
import { getUserId } from 'utils/Auth';

import { acceptEmailedInvite } from './api';
import { getCreateGroupErrorMessage } from './errors';
import GroupDetail from './GroupDetail';

const wrapperClasses =
  'mx-auto flex min-h-page w-full max-w-screen-desktop flex-col gap-lg bg-light1 px-md py-xl';

interface GroupSummary {
  id: number;
  name: string;
  status: 'member' | 'pending';
  member_count: number;
}

const SharedClassesPage = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const [openModal] = useModal();
  const history = useHistory();
  const location = useLocation();
  const handledInviteRef = useRef<string | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [acceptingEmailedInvite, setAcceptingEmailedInvite] = useState(false);

  const { data, loading, error, refetch } = useQuery<
    GetSharedGroupsQuery,
    GetSharedGroupsQueryVariables
  >(GET_SHARED_GROUPS, {
    variables: { userId: getUserId() },
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  });

  const [createGroup] = useMutation<
    CreateSharedGroupMutation,
    CreateSharedGroupMutationVariables
  >(CREATE_SHARED_GROUP);
  const [acceptGroupInvite] = useMutation<
    AcceptSharedGroupInviteMutation,
    AcceptSharedGroupInviteMutationVariables
  >(ACCEPT_SHARED_GROUP_INVITE);
  const [removeGroupMembership] = useMutation<
    RemoveSharedGroupMembershipMutation,
    RemoveSharedGroupMembershipMutationVariables
  >(REMOVE_SHARED_GROUP_MEMBERSHIP);

  const groups: GroupSummary[] = (data?.shared_group ?? []).flatMap((group) => {
    const status = group.membership[0]?.status;
    if (status !== 'member' && status !== 'pending') return [];
    return [
      {
        id: group.id,
        name: group.name,
        status,
        member_count: group.members_aggregate.aggregate?.count ?? 0,
      },
    ];
  });

  useEffect(() => {
    if (error) toast('Could not load your groups.');
  }, [error]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const secret = params.get('invite');
    const clearInviteFromUrl = () => {
      params.delete('invite');
      const search = params.toString();
      history.replace({
        pathname: location.pathname,
        search: search ? `?${search}` : '',
      });
    };

    if (!secret || handledInviteRef.current === secret) return;
    if (!/^[0-9a-f]{32}$/i.test(secret)) {
      handledInviteRef.current = secret;
      toast('This group invitation link is invalid.');
      clearInviteFromUrl();
      return;
    }
    if (!isLoggedIn) return;

    handledInviteRef.current = secret;
    let cancelled = false;
    setAcceptingEmailedInvite(true);
    acceptEmailedInvite(secret)
      .then((groupId) => {
        if (cancelled) return;
        setAcceptingEmailedInvite(false);
        setSelected(groupId);
        toast('Group invitation accepted.');
        refetch().catch(() => {
          toast(
            'The invitation was accepted, but your groups could not refresh.',
          );
        });
        clearInviteFromUrl();
      })
      .catch(() => {
        if (cancelled) return;
        setAcceptingEmailedInvite(false);
        toast('This group invitation is invalid or no longer available.');
        clearInviteFromUrl();
      });

    return () => {
      cancelled = true;
    };
  }, [history, isLoggedIn, location.pathname, location.search, refetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const result = await createGroup({
        variables: { name: newName.trim() },
      });
      const group = result.data?.insert_shared_group_one;
      if (!group) throw new Error('group was not created');
      setNewName('');
      await refetch();
      setSelected(group.id);
    } catch (createError) {
      toast(getCreateGroupErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  };

  const handleRespond = async (id: number, accept: boolean) => {
    try {
      if (accept) {
        const result = await acceptGroupInvite({
          variables: { groupId: id },
        });
        if (result.data?.update_shared_group_member?.affected_rows !== 1) {
          throw new Error('invite was not accepted');
        }
      } else {
        const result = await removeGroupMembership({
          variables: { groupId: id },
        });
        if (result.data?.delete_shared_group_member?.affected_rows !== 1) {
          throw new Error('invite was not declined');
        }
      }
      await refetch();
    } catch {
      toast('Could not update the invite.');
    }
  };

  const body = () => {
    if (!isLoggedIn) {
      const hasEmailedInvite = Boolean(
        new URLSearchParams(location.search).get('invite'),
      );
      return (
        <div className="flex flex-col items-start gap-md rounded-card border border-light3 bg-white p-lg">
          <p className="text-md text-dark2">
            {hasEmailedInvite
              ? 'Log in or sign up to accept this group invitation.'
              : 'Log in to make a group and see which classes you share with friends.'}
          </p>
          <Button
            className="font-semibold"
            onClick={() =>
              openModal(
                AUTH_MODAL,
                hasEmailedInvite
                  ? { onAfterLogin: () => {}, onAfterSignup: () => {} }
                  : undefined,
              )
            }
          >
            {hasEmailedInvite ? 'Continue' : 'Log in'}
          </Button>
        </div>
      );
    }

    if (loading || acceptingEmailedInvite) return <LoadingSpinner />;

    if (selected !== null) {
      return (
        <GroupDetail
          groupId={selected}
          onBack={() => setSelected(null)}
          onChanged={() => {
            refetch();
          }}
        />
      );
    }

    const invites = groups.filter((g) => g.status === 'pending');
    const mine = groups.filter((g) => g.status === 'member');

    return (
      <>
        <div className="flex flex-col">
          <h1 className="font-anderson text-4xl font-extrabold leading-tight text-dark1 tabletDown:text-3xl">
            Shared Classes
          </h1>
          <p className="text-body text-dark2">
            Make a group, invite friends by email, and see the classes you have
            together.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-sm rounded-card border border-light3 bg-white p-md shadow-box"
        >
          <h2 className="text-xl font-bold text-dark1">Create a group</h2>
          <div className="flex flex-col gap-sm tablet:flex-row tablet:items-center">
            <div className="min-w-0 flex-1">
              <Textbox
                text={newName}
                setText={setNewName}
                placeholder="Group name, e.g. Study crew"
                maxLength={80}
                options={{ width: '100%' }}
              />
            </div>
            <AccentButton type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create group'}
            </AccentButton>
          </div>
        </form>

        {invites.length > 0 && (
          <div className="flex flex-col gap-sm">
            <h2 className="text-xl font-bold text-dark1">Invites</h2>
            {invites.map((g) => (
              <div
                key={g.id}
                className="flex min-w-0 flex-col items-start gap-sm rounded-card border border-light3 bg-white p-md shadow-box tablet:flex-row tablet:items-center tablet:justify-between"
              >
                <span className="min-w-0 max-w-full break-words text-md font-semibold text-dark1">
                  {g.name}
                </span>
                <div className="flex shrink-0 flex-wrap gap-sm">
                  <Button
                    size="sm"
                    className="font-semibold"
                    onClick={() => handleRespond(g.id, true)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    className="font-semibold"
                    onClick={() => handleRespond(g.id, false)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-sm">
          <h2 className="text-xl font-bold text-dark1">Your groups</h2>
          {mine.length === 0 ? (
            <p className="text-sm text-dark2">
              No groups yet. Create one above to get started.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-sm p-0">
              {mine.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(g.id)}
                    className="group flex w-full items-center gap-md rounded-card border border-light3 bg-white p-md text-left font-inter shadow-box transition-all duration-hover ease-hover hover:border-primary"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light2 text-primary">
                      <Users size={18} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-md font-semibold text-dark1">
                        {g.name}
                      </span>
                      <span className="text-xs text-dark3">
                        {g.member_count}{' '}
                        {g.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-dark3 transition-transform duration-hover ease-hover group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={wrapperClasses}>
      <Helmet>
        <title>Shared Classes | UW Flow</title>
      </Helmet>
      {body()}
    </div>
  );
};

export default SharedClassesPage;
