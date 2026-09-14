import React from 'react';
import { X } from 'react-feather';
import ReactModal from 'react-modal';
import { Slot } from '@radix-ui/react-slot';

import { cn } from 'lib/utils';

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialog = () => {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }

  return context;
};

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, type, ...props }, ref) => {
    const { setOpen } = useDialog();
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? 'button'}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
        {...props}
      />
    );
  },
);
DialogTrigger.displayName = 'DialogTrigger';

interface DialogContentProps {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  overlayClassName?: string;
  shouldCloseOnOverlayClick?: boolean;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
}

const DialogContent = ({
  children,
  ariaLabel,
  className,
  overlayClassName,
  shouldCloseOnOverlayClick = true,
  onAfterOpen,
  onAfterClose,
}: DialogContentProps) => {
  const { open, setOpen } = useDialog();

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={() => setOpen(false)}
      onAfterOpen={onAfterOpen}
      onAfterClose={onAfterClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      contentLabel={ariaLabel}
      overlayClassName={cn(
        'fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-dark1/50 p-md',
        overlayClassName,
      )}
      className={cn(
        'relative my-auto max-h-full w-full max-w-lg overflow-y-auto rounded-card bg-white p-lg font-inter text-dark1 shadow-box outline-none',
        className,
      )}
    >
      {children}
    </ReactModal>
  );
};

interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, type, ...props }, ref) => {
    const { setOpen } = useDialog();
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? 'button'}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  },
);
DialogClose.displayName = 'DialogClose';

const DialogCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <DialogClose
    ref={ref}
    aria-label="Close dialog"
    className={cn(
      'absolute right-md top-md z-10 flex h-lg w-lg cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-dark3 transition-colors hover:text-dark1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  >
    <X aria-hidden="true" size={24} />
  </DialogClose>
));
DialogCloseButton.displayName = 'DialogCloseButton';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-xs pr-xl', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'm-0 font-anderson text-2xl font-extrabold leading-none text-dark1',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('m-0 font-inter text-md font-regular text-dark2', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-lg flex flex-col-reverse gap-sm mobileLarge:flex-row mobileLarge:justify-end',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogCloseButton,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
