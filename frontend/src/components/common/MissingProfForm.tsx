import React, { useState } from 'react';

import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { BACKEND_ENDPOINT, PROF_SUBMIT_ENDPOINT } from 'constants/Api';
import { PROF_SUBMISSION_ERRORS } from 'constants/Messages';
import { makeAuthenticatedPOSTRequest } from 'utils/Api';

type MissingProfFormProps = {
  courseId: number;
};

const MissingProfForm = ({ courseId }: MissingProfFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const [response, status] = await makeAuthenticatedPOSTRequest<
        { name: string; course_id: number },
        { error?: string }
      >(`${BACKEND_ENDPOINT}${PROF_SUBMIT_ENDPOINT}`, {
        name,
        course_id: courseId,
      });
      if (status >= 400) {
        setError(
          PROF_SUBMISSION_ERRORS[response.error ?? ''] ??
            PROF_SUBMISSION_ERRORS.default,
        );
      } else {
        setSubmitted(true);
      }
    } catch {
      setError(PROF_SUBMISSION_ERRORS.default);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <p role="status" className="mb-lg mt-0 text-sm text-dark2">
        Thanks! We’ll check this professor before adding them. You can still
        post your course review now.
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="link"
        size="inline"
        className="mb-lg text-sm"
        onClick={() => setOpen(true)}
      >
        Can’t find your professor?
      </Button>
    );
  }

  return (
    <form className="mb-lg" onSubmit={handleSubmit}>
      <div className="flex items-center gap-sm">
        <Input
          aria-label="Professor’s full name"
          placeholder="Professor’s full name"
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          state={error ? 'error' : 'default'}
          autoFocus
        />
        <Button type="submit" disabled={submitting || name.trim().length < 2}>
          Submit
        </Button>
      </div>
      {error && (
        <p role="alert" className="mb-0 mt-sm text-sm text-red">
          {error}
        </p>
      )}
    </form>
  );
};

export default MissingProfForm;
