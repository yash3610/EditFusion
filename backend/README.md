# EditFusion Backend

## Setup
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:

```bash
pnpm install
```

3. Start the API:

```bash
pnpm run dev
```

## API
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google/callback`
- `POST /api/auth/google/token`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/uploads/image`
- `POST /api/ai/background-remove`
- `POST /api/ai/enhance`
- `POST /api/ai/cartoon`
- `POST /api/ai/anime`
- `POST /api/ai/sketch`
- `POST /api/ai/object-remove`
- `POST /api/convert/docx`
- `POST /api/convert/pptx`
- `POST /api/convert/xlsx`
- `POST /api/convert/pdf-to/docx`
- `POST /api/convert/pdf-to/pptx`
- `POST /api/convert/pdf-to/xlsx`
- `POST /api/convert/batch`

## Document conversion
Install LibreOffice on the host machine to enable Word/PPT/Excel to PDF conversion.
