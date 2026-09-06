import React, {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowRight, Upload } from 'react-feather';
import { toast } from 'react-toastify';
import { PRIVACY_PAGE_ROUTE } from 'Routes';
import { useTheme } from 'styled-components';

import LoadingSpinner from 'components/display/LoadingSpinner';
import { BACKEND_ENDPOINT, TRANSCRIPT_PARSE_ENDPOINT } from 'constants/Api';
import {
  AWAITING_UPLOAD,
  DataUploadState,
  UPLOAD_FAILED,
  UPLOAD_PENDING,
  UPLOAD_SUCCESSFUL,
} from 'constants/DataUploadStates';
import { DATA_UPLOAD_SUCCESS, TRANSCRIPT_ERRORS } from 'constants/Messages';
import TranscriptUploadVideoMP4 from 'img/upload/transcript-import-chrome.mp4';
import TranscriptUploadVideoWebm from 'img/upload/transcript-import-chrome.webm';
import { ErrorResponse, TranscriptParseResponse } from 'types/Api';
import { makeAuthenticatedPOSTRequest } from 'utils/Api';
import { sleep } from 'utils/Misc';

import {
  ArrowWrapper,
  ContentSteps,
  ContentWrapper,
  ErrorMessage,
  GreyText,
  Header,
  InstructionText,
  Link,
  LongInstructionWrapper,
  NumberCircle,
  PrivacyPolicyHeader,
  PrivacyPolicyLink,
  PrivacyPolicyText,
  ScheduleStep3Wrapper,
  SkipStepWrapper,
  StepWrapper,
  TranscriptPrivacyPolicyWrapper,
  TranscriptStep1Video,
  TranscriptUploadBox,
} from './styles/DataUploadModals';

const privacyText = `
  Flow only uses your transcript so you can easily import your course
  history and leave reviews for courses you have taken. See our`;

export type TranscriptUploadModalContentProps = {
  onAfterUploadSuccess?: () => void;
  onSkip?: () => void;
  showSkipStepButton?: boolean;
};

const TranscriptUploadModalContent = ({
  onSkip = () => {},
  showSkipStepButton = false,
  onAfterUploadSuccess = () => {},
}: TranscriptUploadModalContentProps) => {
  const theme = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] =
    useState<DataUploadState>(AWAITING_UPLOAD);
  const [fileSizeError, setFileSizeError] = useState(false);

  const handleTranscriptClick = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const makeTranscriptRequest = async (file: File) => {
    setFileSizeError(false);

    if (!file) {
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 10) {
      setUploadState(UPLOAD_FAILED);
      setFileSizeError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploadState(UPLOAD_PENDING);
    const [, status] = await makeAuthenticatedPOSTRequest<
      FormData,
      TranscriptParseResponse | ErrorResponse
    >(`${BACKEND_ENDPOINT}${TRANSCRIPT_PARSE_ENDPOINT}`, formData, {});

    if (status === 200) {
      await sleep(500);
      setUploadState(UPLOAD_SUCCESSFUL);
      toast(DATA_UPLOAD_SUCCESS);
      if (onAfterUploadSuccess) {
        onAfterUploadSuccess();
      }
      onSkip();
    } else {
      setUploadState(UPLOAD_FAILED);
    }
  };

  const preventDefault = (e: Event) => e.preventDefault();

  const onDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (fileInputRef && fileInputRef.current && fileInputRef.current.files) {
      await makeTranscriptRequest(fileInputRef.current.files[0]);
    }
  };

  const handleTranscriptDrop = async (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await makeTranscriptRequest(e.dataTransfer.files[0]);
  };

  useEffect(() => {
    window.addEventListener('dragover', preventDefault, false);
    window.addEventListener('drop', preventDefault, false);

    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const uploadContent = () => {
    if (uploadState === UPLOAD_PENDING) {
      return <LoadingSpinner />;
    }

    return (
      <>
        {uploadState === UPLOAD_FAILED && (
          <ErrorMessage>
            {fileSizeError
              ? TRANSCRIPT_ERRORS.file_too_big
              : TRANSCRIPT_ERRORS.default_transcript}
          </ErrorMessage>
        )}
        <Upload height={100} width={60} color={theme.dark3} />
        <GreyText>Drag and drop your transcript file here!</GreyText>
      </>
    );
  };

  return (
    <ContentWrapper>
      <Header>Upload your transcript</Header>
      <ContentSteps>
        <StepWrapper>
          <LongInstructionWrapper>
            <NumberCircle>1</NumberCircle>
            <InstructionText>
              Follow the
              <Link
                href="https://uwaterloo.ca/quest/help/students/how-do-i/unofficial-transcript"
                target="_blank"
                rel="noopener noreferrer"
              >
                instructions here
              </Link>
              to download your transcript as a PDF file
            </InstructionText>
          </LongInstructionWrapper>
          <TranscriptStep1Video loop muted controls preload="meta">
            <source src={TranscriptUploadVideoMP4} type="video/mp4" />
            <source src={TranscriptUploadVideoWebm} type="video/webm" />
          </TranscriptStep1Video>
        </StepWrapper>

        <ArrowWrapper>
          <ArrowRight color={theme.accent} height={100} width={80} />
        </ArrowWrapper>

        <StepWrapper>
          <LongInstructionWrapper>
            <NumberCircle>2</NumberCircle>
            <InstructionText>Upload your transcript file</InstructionText>
          </LongInstructionWrapper>
          <ScheduleStep3Wrapper>
            <form
              onClick={handleTranscriptClick}
              onDrop={handleTranscriptDrop}
              onDragOver={onDragOver}
              encType="multipart/form-data"
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <TranscriptUploadBox uploadState={uploadState}>
                {uploadContent()}
              </TranscriptUploadBox>
            </form>
            <TranscriptPrivacyPolicyWrapper>
              <PrivacyPolicyHeader>
                We do not store your grades.
              </PrivacyPolicyHeader>
              <PrivacyPolicyText>
                {privacyText}
                <PrivacyPolicyLink to={PRIVACY_PAGE_ROUTE} onClick={onSkip}>
                  privacy policy
                </PrivacyPolicyLink>
                for more information
              </PrivacyPolicyText>
            </TranscriptPrivacyPolicyWrapper>
          </ScheduleStep3Wrapper>
        </StepWrapper>
      </ContentSteps>
      {showSkipStepButton && (
        <SkipStepWrapper onClick={onSkip}>skip this step &gt;</SkipStepWrapper>
      )}
    </ContentWrapper>
  );
};

export default TranscriptUploadModalContent;
