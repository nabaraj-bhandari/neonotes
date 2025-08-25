# **Notes API Endpoints**

Base URL: `/api/notes`
All admin actions r - `title` (string) – required

- ` -`title` (string, optional)
- `content` (string, optional) – new content with inline images
- `pdfs` (file[], optional) – new PDF files. Original filenames will be used as titles.
- `pdfs` (object[], optional) – array of PDF objects to add, each containing:
  - `url` (string) – PDF URL
  - `title` (string) – PDF title
- `removePdfs` (string[], optional) – array of PDF URLs to removent` (string) – required, may include inline image URLs
- `pdfs` (file[]) – optional, up to 5 files. The original filename will be used as the PDF title.

- **Response:**e header: `x-admin-pass: <ADMIN_PASS>`

---

## 1️⃣ Get All Notes

**GET /**

- **Description:** Retrieve all notes sorted by newest first.
- **Request:** No body required.
- **Response:**

```json
[
  {
    "_id": "noteId",
    "title": "Note Title",
    "content": "Note content with inline images",
    "pdfs": [
      {
        "url": "pdf_link_1",
        "title": "PDF Title 1"
      },
      {
        "url": "pdf_link_2",
        "title": "PDF Title 2"
      }
    ],
    "createdAt": "2025-08-25T00:00:00Z"
  },
  ...
]
```

---

## 2️⃣ Get Note By ID

**GET /\:id**

- **Description:** Retrieve a single note by its ID.
- **Request:** URL parameter `id` (Note ID).
- **Response:**

```json
{
  "_id": "noteId",
  "title": "Note Title",
  "content": "Note content with inline images",
  "pdfs": ["pdf_link_1", "pdf_link_2"],
  "createdAt": "2025-08-25T00:00:00Z"
}
```

---

## 3️⃣ Create Note

**POST /**

- **Description:** Create a new note with optional PDF attachments.

- **Headers:** `x-admin-pass` required.

- **Body (multipart/form-data):**

  - `title` (string) – required
  - `content` (string) – required, may include inline image URLs
  - `pdfs` (file\[]) – optional, up to 5 files

- **Response:**

```json
{
  "_id": "noteId",
  "title": "Note Title",
  "content": "Note content with inline images",
  "pdfs": ["pdf_link_1", "pdf_link_2"],
  "createdAt": "2025-08-25T00:00:00Z"
}
```

---

## 4️⃣ Update Note

**PUT /\:id**

- **Description:** Update a note. Handles:

  - Updating `title` and `content`
  - Adding new PDFs (files or links)
  - Removing PDFs
  - Deleting removed inline images automatically

- **Headers:** `x-admin-pass` required

- **Body (multipart/form-data):**

  - `title` (string, optional)
  - `content` (string, optional) – new content with inline images
  - `pdfs` (file\[], optional) – new PDF files
  - `pdfs` (string\[], optional) – array of PDF links to add
  - `removePdfs` (string\[], optional) – array of PDF URLs to remove

- **Response:**

```json
{
  "_id": "noteId",
  "title": "Updated Title",
  "content": "Updated content with inline images",
  "pdfs": [
    {
      "url": "pdf_link",
      "title": "PDF Title"
    }
  ],
  "createdAt": "2025-08-25T00:00:00Z"
}
```

**Notes for Frontend:**

- Inline images removed from `content` will automatically be deleted from Cloudinary if they are in `/notes/images/`.
- New inline images should be uploaded via `/api/images` (see below) before inserting URLs into content.

---

## 5️⃣ Delete Note

**DELETE /\:id**

- **Description:** Delete a note by ID. Automatically deletes:

  - All PDFs
  - All inline images from Cloudinary

- **Headers:** `x-admin-pass` required

- **Response:**

```json
{
  "message": "Note deleted successfully",
  "existingNote": {
    "_id": "noteId",
    "title": "Note Title",
    "content": "Note content",
    "pdfs": [
      {
        "url": "pdf_link_1",
        "title": "PDF Title 1"
      }
    ]
  }
}
```

---

# **Inline Image API**

Base URL: `/api/images`

---

## 6️⃣ Upload Inline Image

**POST /**

- **Description:** Upload a single image for inline use in notes.

- **Headers:** `x-admin-pass` required

- **Body (multipart/form-data):**

  - `image` (file) – single image file

- **Response:**

```json
{
  "url": "https://res.cloudinary.com/.../notes/images/your_image.jpg"
}
```

**Frontend Notes:**

- The returned `url` should be inserted into the editor content.
- Only images in `/notes/images/` will be tracked and deleted automatically if removed from note content.
