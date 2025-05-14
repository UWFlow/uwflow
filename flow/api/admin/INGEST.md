Raw Ingested JSON:

```
{
    "term_code": 1249,
    "term_name": "Fall 2024",
    "data": [
      {
        "course_code": "acc760",
        "course_id": 32,
        "instructor": "Andrew Bauer",
        "scraped_at": "2025-05-02 09:50 PM"
      },
      {
        "course_code": "acc760",
        "course_id": 32,
        "instructor": "Kaishu Wu,",
        "scraped_at": "2025-05-02 09:50 PM"
      },
      {
        "course_code": "actsc221",
        "course_id": 47,
        "instructor": "Brent Matheson",
        "scraped_at": "2025-05-02 09:50 PM"
      },
      {
        "course_code": "actsc231",
        "course_id": 49,
        "instructor": "Fan Yang",
        "scraped_at": "2025-05-02 09:50 PM"
      },
      {
        "course_code": "actsc232",
        "course_id": 50,
        "instructor": "Fan Yang",
        "scraped_at": "2025-05-02 09:50 PM"
      }
    ]
}
```

#1: Normalize Instructor Name and Generate ProfCode

```
{
    {
        "course_id": 32,
        "prof_code" "andrew_bauer",
        "instructor": "Andrew Bauer",
    },
    {
        "course_id": 32,
        "prof_code": "kaishu_wu",
        "instructor": "Kaishu Wu,",
    },
    {
        "course_id": 47,
        "prof_code": "brent_matheson",
        "instructor": "Brent Matheson",
    },
}
```

#2: Load data into memory in SQL called insert_prof_teaches_delta with new Similarity Score

#3: Within SQL, categorize into Insert Prof, Update Course, Ignore or Ambiguous:

> Insert image of categorization here!

```
{
    {
        "course_id": 32,
        "prof_code" "andrew_bauer",
        "instructor": "Andrew Bauer",
        "prof_id": 1
        "categorize": "INSERT_AND_ADD_PROF"
    },
    {
        "course_id": 32,
        "prof_code": "kaishu_wu",
        "instructor": "Kaishu Wu,",
        "prof_id": 2
        "categorize": "INSERT"
    },
    {
        "course_id": 47,
        "prof_code": "brent_matheson",
        "instructor": "Brent Matheson",
        "categorize": "AMBIGUOUS
    },
}
```

#4: Extract all UPDATE_TEACH entries and insert (code, name)

```
CREATE TABLE prof (
  id SERIAL PRIMARY KEY,
  -- unique handle of the form first(_middle)?_last
  code TEXT NOT NULL
    CONSTRAINT prof_code_unique UNIQUE,
  name TEXT NOT NULL
    CONSTRAINT prof_name_length CHECK (LENGTH(name) <= 256),
  picture_url TEXT
);
```

#5: Within Delta Table, annotate with prof_id joining on prof_code for INSERT_AND_ADD_PROF and INSERT

#6: Insert from Delta Table into prof_teaches_course table

#7: Return Results data structure with data update stats

#8: Save Delta Table as JSON in addition to AMBIGUOUS entires as raw JSON
