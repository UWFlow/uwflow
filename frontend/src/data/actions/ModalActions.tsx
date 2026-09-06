/* Type definitions */
export const NOTIFICATION_EMAIL_MODAL_OPEN = 'NOTIFICATION_EMAIL_MODAL_OPEN';
export const NOTIFICATION_EMAIL_MODAL_CLOSE = 'NOTIFICATION_EMAIL_MODAL_CLOSE';

export interface NotificationEmailModalState {
  notificationEmailModalOpen: boolean;
}

interface NotificationEmailModalOpenAction {
  type: typeof NOTIFICATION_EMAIL_MODAL_OPEN;
}

interface NotificationEmailModalCloseAction {
  type: typeof NOTIFICATION_EMAIL_MODAL_CLOSE;
}

export type NotificationEmailModalAction =
  | NotificationEmailModalOpenAction
  | NotificationEmailModalCloseAction;

/* Action definitions */
export const notificationEmailModalOpen =
  (): NotificationEmailModalOpenAction => ({
    type: NOTIFICATION_EMAIL_MODAL_OPEN,
  });

export const notificationEmailModalClose =
  (): NotificationEmailModalCloseAction => ({
    type: NOTIFICATION_EMAIL_MODAL_CLOSE,
  });
