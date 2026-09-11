import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
} from 'react-feather';
import { toast } from 'react-toastify';
import { useMutation } from '@apollo/client';
import {
  DeleteSharedGroupMutation,
  DeleteSharedGroupMutationVariables,
  RemoveSharedGroupMembershipMutation,
  RemoveSharedGroupMembershipMutationVariables,
} from 'generated/graphql';

import { Calendar, CalendarEvent, WEEKDAY_LABELS } from 'components/calendar';
import {
  CourseColor,
  DEFAULT_COURSE_COLOR,
  getCourseColors,
} from 'components/calendar/courseColors';
import Avatar from 'components/display/Avatar';
import LoadingSpinner from 'components/display/LoadingSpinner';
import Tooltip from 'components/display/Tooltip';
import AccentButton from 'components/input/Button';
import Textbox from 'components/input/Textbox';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import {
  DELETE_SHARED_GROUP,
  REMOVE_SHARED_GROUP_MEMBERSHIP,
} from 'graphql/mutations/SharedClasses';
import { getKittenFromID } from 'utils/Kitten';
import { weekDayLetters } from 'utils/Misc';

import {
  fetchGroup,
  formatMeeting,
  GroupDetail as GroupDetailData,
  GroupMember,
  inviteToGroup,
  SharedClass,
} from './api';
import MemberAvatar from './MemberAvatar';

interface Props {
  groupId: number;
  onBack: () => void;
  onChanged: () => void;
}

const MemberChip = ({ member }: { member: GroupMember }) => {
  const pending = member.status === 'pending';
  return (
    <span className="flex max-w-full items-center gap-xs rounded-card border border-light3 bg-white py-xs pl-xs pr-sm">
      <Avatar
        src={getKittenFromID(member.user_id)}
        alt=""
        size="sm"
        className={pending ? 'opacity-50' : undefined}
      />
      <span className="min-w-0 break-words text-sm text-dark1">
        {member.name}
      </span>
      {pending && <span className="text-xs text-dark3">pending</span>}
    </span>
  );
};

// Flatten shared classes into calendar blocks: one per meeting per weekday it
// runs on. days come as tokens matching weekDayLetters (M, T, W, Th, F).
const toCalendarEvents = (
  classes: SharedClass[],
  membersById: Map<number, GroupMember>,
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  classes.forEach((c) => {
    const sharedMembers = c.member_ids.flatMap((id) => {
      const member = membersById.get(id);
      if (!member) return [];
      return [member];
    });
    c.meetings.forEach((m, mi) => {
      const { start_seconds: startSeconds, end_seconds: endSeconds } = m;
      if (startSeconds === null || endSeconds === null) return;
      m.days.forEach((day) => {
        const dayIndex = weekDayLetters.indexOf(day);
        if (dayIndex < 0 || dayIndex > 4) return;
        events.push({
          id: `${c.section_id}-${mi}-${day}`,
          dayIndex,
          startMinutes: Math.round(startSeconds / 60),
          endMinutes: Math.round(endSeconds / 60),
          colorKey: c.course_code,
          title: `${c.course_code.toUpperCase()} · ${c.section_name}`,
          subtitle: sharedMembers.length ? (
            <div className="flex h-5 items-center gap-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sharedMembers.map((member) => (
                <MemberAvatar key={member.user_id} member={member} />
              ))}
            </div>
          ) : undefined,
          location: m.location ?? undefined,
        });
      });
    });
  });
  return events;
};

const SharedClassCard = ({
  shared,
  members,
  color,
}: {
  shared: SharedClass;
  color: CourseColor;
  members: GroupMember[];
}) => (
  <li className="flex flex-col gap-sm rounded-card border border-light3 bg-white p-md shadow-box">
    <div className="flex flex-wrap items-center gap-sm">
      <Badge variant="outline" className={`${color.fill} ${color.rail}`}>
        {shared.section_name}
      </Badge>
      <span className="text-md font-semibold text-primary">
        {shared.course_code.toUpperCase()}
      </span>
      <span className="min-w-0 break-words text-md text-dark1">
        {shared.course_name}
      </span>
    </div>

    {shared.meetings.length > 0 && (
      <div className="flex flex-col gap-xs">
        {shared.meetings.map((m, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-sm text-sm text-dark2"
          >
            <span className="flex items-center gap-xs">
              <Clock size={14} /> {formatMeeting(m)}
            </span>
            {m.location && (
              <span className="flex items-center gap-xs">
                <MapPin size={14} /> {m.location}
              </span>
            )}
          </div>
        ))}
      </div>
    )}

    <div className="flex flex-wrap items-center gap-xs border-t border-light2 pt-sm">
      {members.map((m) => (
        <Tooltip key={m.user_id} content={m.name}>
          <Avatar src={getKittenFromID(m.user_id)} alt={m.name} size="sm" />
        </Tooltip>
      ))}
      <span className="min-w-0 break-words text-sm text-dark2">
        {members.map((m) => m.name).join(', ')}
      </span>
    </div>
  </li>
);

const GroupDetail = ({ groupId, onBack, onChanged }: Props) => {
  const [group, setGroup] = useState<GroupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const [removeGroupMembership] = useMutation<
    RemoveSharedGroupMembershipMutation,
    RemoveSharedGroupMembershipMutationVariables
  >(REMOVE_SHARED_GROUP_MEMBERSHIP);
  const [deleteGroup] = useMutation<
    DeleteSharedGroupMutation,
    DeleteSharedGroupMutationVariables
  >(DELETE_SHARED_GROUP);

  const load = async () => {
    try {
      setGroup(await fetchGroup(groupId));
    } catch {
      toast('Could not load this group.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // load closes over groupId only; refetch when the selected group changes.
  }, [groupId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setNotice(null);
    try {
      await inviteToGroup(groupId, email.trim());
      setNotice({ kind: 'success', text: `Invite sent to ${email.trim()}.` });
      setEmail('');
      await load();
    } catch {
      setNotice({ kind: 'error', text: 'Could not send the invite.' });
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    try {
      const result = await removeGroupMembership({
        variables: { groupId },
      });
      if (result.data?.delete_shared_group_member?.affected_rows !== 1) {
        throw new Error('membership was not removed');
      }
      onChanged();
      onBack();
    } catch {
      toast('Could not leave the group.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${group?.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const result = await deleteGroup({ variables: { groupId } });
      if (result.data?.delete_shared_group?.affected_rows !== 1) {
        throw new Error('group was not deleted');
      }
      onChanged();
      onBack();
    } catch {
      toast('Could not delete the group.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!group) return null;

  const members = group.members.filter((m) => m.status === 'member');
  const pending = group.members.filter((m) => m.status === 'pending');
  const membersById = new Map(group.members.map((m) => [m.user_id, m]));

  const events = toCalendarEvents(group.shared_classes, membersById);
  const eventHours = events.flatMap((e) => [
    e.startMinutes / 60,
    e.endMinutes / 60,
  ]);
  const minHour = eventHours.length ? Math.floor(Math.min(...eventHours)) : 8;
  const maxHour = eventHours.length ? Math.ceil(Math.max(...eventHours)) : 18;
  const courseColors = getCourseColors(
    group.shared_classes.map((shared) => shared.course_code),
  );

  return (
    <div className="flex min-w-0 flex-col gap-lg">
      <Button
        type="button"
        variant="link"
        size="inline"
        onClick={onBack}
        className="flex w-fit items-center gap-xs"
      >
        <ArrowLeft size={16} /> All groups
      </Button>

      <div className="flex min-w-0 flex-col items-start gap-md tablet:flex-row tablet:items-center tablet:justify-between">
        <h1 className="min-w-0 w-full break-words font-anderson text-2xl font-extrabold text-dark1 tablet:flex-1 tablet:text-3xl">
          {group.name}
        </h1>
        <div className="flex shrink-0 flex-wrap gap-sm">
          {group.is_creator && (
            <Button
              variant="subtle"
              size="sm"
              className="font-semibold text-red"
              onClick={handleDelete}
            >
              Delete group
            </Button>
          )}
          <Button
            variant="subtle"
            size="sm"
            className="font-semibold"
            onClick={handleLeave}
          >
            Leave group
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-dark3">
          Members
        </span>
        <div className="flex flex-wrap gap-sm">
          {members.map((m) => (
            <MemberChip key={m.user_id} member={m} />
          ))}
          {pending.map((m) => (
            <MemberChip key={m.user_id} member={m} />
          ))}
        </div>
      </div>

      <form
        onSubmit={handleInvite}
        className="flex flex-col gap-sm rounded-card border border-light3 bg-white p-md shadow-box"
      >
        <span className="text-sm font-semibold text-dark1">
          Invite a friend
        </span>
        <div className="flex flex-col gap-sm tablet:flex-row tablet:items-center">
          <div className="min-w-0 flex-1">
            <Textbox
              text={email}
              setText={(value) => {
                setEmail(value);
                if (notice) setNotice(null);
              }}
              placeholder="Email"
              maxLength={256}
              error={notice?.kind === 'error'}
              options={{ width: '100%', type: 'email' }}
            />
          </div>
          <AccentButton type="submit" disabled={inviting}>
            {inviting ? 'Sending...' : 'Send invite'}
          </AccentButton>
        </div>
        {notice && (
          <span
            className={`flex items-center gap-xs text-sm ${
              notice.kind === 'success' ? 'text-primary' : 'text-red'
            }`}
          >
            {notice.kind === 'success' ? (
              <CheckCircle size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {notice.text}
          </span>
        )}
        {group.invited_emails.length > 0 && (
          <div className="flex flex-wrap items-center gap-xs pt-xs">
            <span className="text-xs text-dark3">Waiting to join:</span>
            {group.invited_emails.map((invitedEmail) => (
              <span
                key={invitedEmail}
                className="max-w-full break-all rounded-card bg-light2 px-sm py-xs text-xs text-dark2"
              >
                {invitedEmail}
              </span>
            ))}
          </div>
        )}
      </form>

      <div className="flex flex-col gap-sm">
        <h2 className="text-xl font-bold text-dark1">Classes you share</h2>
        {group.shared_classes.length === 0 ? (
          <div className="rounded-card border border-dashed border-light3 bg-white p-lg text-center text-sm text-dark2">
            No shared classes yet. Once two or more members are in the same
            section, it shows up here.
          </div>
        ) : (
          <>
            {events.length > 0 && (
              <div className="hidden rounded-card border border-light3 bg-white p-md shadow-box tablet:block">
                <Calendar
                  dayLabels={WEEKDAY_LABELS}
                  events={events}
                  colorKeys={Array.from(courseColors.keys())}
                  minHour={minHour}
                  maxHour={maxHour}
                  interactive={false}
                  showHeader={false}
                />
              </div>
            )}
            <ul className="m-0 flex list-none flex-col gap-sm p-0">
              {group.shared_classes.map((shared) => {
                const sharedMembers = shared.member_ids.flatMap((memberId) => {
                  const member = membersById.get(memberId);
                  return member ? [member] : [];
                });
                return (
                  <SharedClassCard
                    key={shared.section_id}
                    shared={shared}
                    color={
                      courseColors.get(shared.course_code) ??
                      DEFAULT_COURSE_COLOR
                    }
                    members={sharedMembers}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
