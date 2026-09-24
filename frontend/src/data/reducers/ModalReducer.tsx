import {
  NOTIFICATION_EMAIL_MODAL_CLOSE,
  NOTIFICATION_EMAIL_MODAL_OPEN,
  NotificationEmailModalAction,
  NotificationEmailModalState,
} from 'data/actions/ModalActions';

const DEFAULT_STATE: NotificationEmailModalState = {
  notificationEmailModalOpen: false,
};

export default (
  state = DEFAULT_STATE,
  action: NotificationEmailModalAction,
) => {
  switch (action.type) {
    case NOTIFICATION_EMAIL_MODAL_OPEN:
      return {
        ...state,
        notificationEmailModalOpen: true,
      };
    case NOTIFICATION_EMAIL_MODAL_CLOSE:
      return {
        ...state,
        notificationEmailModalOpen: false,
      };
    default:
      break;
  }
  return state;
};
