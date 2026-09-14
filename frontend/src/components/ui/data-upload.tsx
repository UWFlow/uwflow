import React from 'react';
import { Clipboard, Upload } from 'react-feather';

import { cn } from 'lib/utils';

export type DataUploadState = 'awaiting' | 'success' | 'error';

const stateBorder = {
  awaiting: 'border-accent',
  success: 'border-primary',
  error: 'border-red',
};

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  accept?: string;
  onFileChange?: (file: File | null) => void;
  state?: DataUploadState;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept = '.pdf,application/pdf',
      className,
      onFileChange,
      state = 'awaiting',
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState('');
    const selectFile = (file: File | null) => {
      setFileName(file?.name ?? '');
      onFileChange?.(file);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-[318px] w-[500px] max-w-full cursor-pointer flex-col items-center justify-center rounded-card border-[3px] border-solid bg-light2 text-center hover:brightness-hover',
          stateBorder[state],
          className,
        )}
        aria-label="Upload Transcript File"
        onClick={(event) => {
          if (event.target !== inputRef.current) inputRef.current?.click();
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFile(event.dataTransfer.files[0] ?? null);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        {...props}
      >
        <input
          ref={inputRef}
          accept={accept}
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <Upload
          aria-hidden="true"
          className="text-dark3"
          height={100}
          width={60}
        />
        <span className="max-w-[160px] font-anderson text-lg font-semibold text-dark3">
          {fileName || 'Drag And Drop Your Transcript File Here!'}
        </span>
      </div>
    );
  },
);
FileUpload.displayName = 'FileUpload';

export interface PasteBoxProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: DataUploadState;
}

const PasteBox = React.forwardRef<HTMLTextAreaElement, PasteBoxProps>(
  ({ className, state = 'awaiting', ...props }, ref) => (
    <div
      className={cn(
        'relative flex h-[280px] w-[300px] max-w-full flex-col items-center justify-center rounded-card border-[3px] border-solid bg-light2 hover:brightness-hover',
        stateBorder[state],
      )}
    >
      <Clipboard
        aria-hidden="true"
        className="text-dark3"
        height={100}
        width={60}
      />
      <span className="max-w-[160px] text-center font-anderson text-lg font-semibold text-dark3">
        Paste Here! (Ctrl+V)
      </span>
      <textarea
        ref={ref}
        className={cn(
          'absolute inset-0 z-10 h-full w-full resize-none border-0 bg-transparent p-sm font-inter text-md text-dark1 outline-none',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
PasteBox.displayName = 'PasteBox';

export { FileUpload, PasteBox };
