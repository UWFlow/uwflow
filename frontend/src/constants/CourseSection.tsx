export const LEC = 'LEC';
export const LAB = 'LAB';
export const TUT = 'TUT';

// All section codes that exist in the order they should appear in a course schedule.
export const SECTION_CODES = [
  // theoretical components
  'LEC', // lecture: the usual lecture format.
  'OLN', // online: rare term for online lectures. [ACINTY]
  'RDG', // reading: independent study under ~1-1 supervision. [CS 690B in 1201]
  // interactive components
  'CLN', // clinic: analysis of cases. [OPTOM, PHARM]
  'DIS', // discussion: group discussions under supervision. [PSCI 231]
  'ORL', // oral conversation: practicing a foreign language. [FR 192]
  'SEM', // seminar: less formal lecture + project/paper presentations. [SE 101]
  // practical components
  'ESS', // essay: just writing essays, apparently... [ENGL 495]
  'FLD', // field studies: work with primary materials in the field. [EARTH 260]
  'FLT', // flight training: planes! [AVIA]
  'LAB', // laboratory: practical tasks, often with special equipment. [ECE 240]
  'PRA', // practicum: supervised placement in a work setting. [SWREN]
  'PRJ', // project: the student independently produces a deliverable. [WKRPT]
  'STU', // studio: coaching based on applied skill execution. [FINE 100]
  'WRK', // work term: co-op. [COOP]
  'WSP', // workshop: independent project work under supervision [SVENT]
  // supplementary components
  'TUT', // tutorial: usually a TA going over sample problems.
  // examination components
  'ENS', // ensemble: evaluation of musical performance. [MUSIC]
  'TST', // test: usually mid-term exam.
];

// Maps each section code to its index in SECTION_CODES.
export const SECTION_ORDER = SECTION_CODES.reduce(
  (map: { [key: string]: number }, type, i) => {
    map[type] = i;
    return map;
  },
  {},
);
