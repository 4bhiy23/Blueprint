# Question Types and API Contract

Blueprint supports the following question types in a builder node's `type` field:

| Type | Stored answer | Server-side validation |
| --- | --- | --- |
| `text` | String | Non-empty only when required. |
| `paragraph` | String | Non-empty only when required. Maximum 1,000 characters. |
| `number` | String | Must convert to a JavaScript number. |
| `email` | String | Must match the application's email format. |
| `date` | `YYYY-MM-DD` | Must be a real calendar date. |
| `datetime` | `YYYY-MM-DDTHH:mm` (seconds optional) | Must contain a real calendar date and a 24-hour time. |
| `time` | `HH:mm` (seconds optional) | Must be a valid 24-hour time. |
| `rating` | Integer string | Must be an integer from `1` through `ratingMax`. |
| `select` / `radio` | Option ID | Exactly one option ID belonging to the question. |
| `checkbox` | Option IDs | One or more option IDs belonging to the question when required. |

All answers are stored in `answers.value` except choice answers, which are stored through `answers.option_id`. The response-detail API converts stored option IDs back into their option labels.

## Builder payload

`PUT /api/v2/forms/:id/builder` accepts all types through the shared `BuilderSchema`. Every node includes the rating fields below; they are only persisted for `rating` nodes and are cleared for other types.

```json
{
  "id": "fb9580e4-b988-4c6d-a1e8-9081191818a4",
  "type": "rating",
  "position": { "x": 160, "y": 240 },
  "data": {
    "title": "How likely are you to recommend us?",
    "description": "",
    "required": true,
    "options": [],
    "ratingMax": 10,
    "ratingLowLabel": "Not likely",
    "ratingHighLabel": "Very likely"
  }
}
```

`ratingMax` defaults to `5`, must be a positive integer, and defines a scale that always begins at `1`. The endpoint labels are optional strings with a maximum length of 255 characters. Options are valid only for `select`, `radio`, and `checkbox` nodes.

The builder API rejects malformed nodes and protects published forms from structural changes. Close a published form before changing questions or rating settings.

## Public read and submission APIs

`GET /api/v2/public/forms/:publicId` returns `ratingMax`, `ratingLowLabel`, and `ratingHighLabel` for every question. Consumers use those fields only for `rating` questions.

`POST /api/v2/public/forms/:publicId/responses` submits each non-choice answer as `value`; the value stays a string even for number and rating questions. For example:

```json
{
  "answers": [
    { "questionId": "fb9580e4-b988-4c6d-a1e8-9081191818a4", "value": "2026-08-13" },
    { "questionId": "7a002e73-af3e-44c4-91d8-7c143657c978", "value": "8" }
  ],
  "completionMs": 42000
}
```

The API validates question ownership, required answers, option ownership, and type-specific values before storing a response. A malformed or out-of-range value returns `400` and no partial response is written.

## Database migration

Migration `packages/db/drizzle/0005_question_type_extensions.sql` adds the five enum values plus nullable `rating_max`, `rating_low_label`, and `rating_high_label` columns to `questions`. Apply this migration before deploying an API or web client that uses the new types.
