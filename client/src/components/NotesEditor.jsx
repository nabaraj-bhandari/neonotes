import { useState, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "../styles/markdown.css";

export default function NotesEditor({
  initialTitle = "",
  initialContent = "",
  initialPdfs = [],
  isEdit = false,
  apiBaseUrl,
  adminPass,
  onSave,
  autoSave = false,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [pdfs, setPdfs] = useState(() =>
    initialPdfs
      .map((pdf) => {
        // Handle backend response format {url, title}
        if (pdf && typeof pdf === "object" && pdf.url) {
          return {
            ...pdf,
            isExisting: true,
          };
        }

        // Handle string URLs (legacy format)
        if (typeof pdf === "string") {
          return {
            url: pdf,
            title: pdf.split("/").pop() || "Untitled PDF",
            isExisting: true,
          };
        }

        return null;
      })
      .filter(Boolean)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PDF Dropzone
  const onPdfDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length + pdfs.length > 5) {
        toast.error("Maximum 5 PDF files allowed");
        return;
      }

      acceptedFiles.forEach((file) => {
        const defaultTitle = file.name.replace(/\.pdf$/i, "");
        const title = window.prompt(
          `Enter title for "${file.name}"`,
          defaultTitle
        );

        if (title === null) return; // Skip if user cancels

        setPdfs((prev) => [
          ...prev,
          {
            file: file,
            title: title.trim() || defaultTitle,
            isNew: true,
          },
        ]);
        toast.success(`PDF "${file.name}" added successfully`);
      });
    },
    [pdfs]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onPdfDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 5,
  });

  // Handle image upload and insertion
  const handleImageUpload = async (file, cursorPosition = content.length) => {
    try {
      // Extract clean filename without extension for default title
      const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
      const title = window.prompt(
        `Enter title for "${file.name}"`,
        defaultTitle
      );

      if (title === null) return; // User cancelled

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${apiBaseUrl}/images`, formData, {
        headers: { "x-admin-pass": adminPass },
      });

      if (res.data.url) {
        const imageMarkdown = `![${title.trim() || defaultTitle}](${
          res.data.url
        })`;
        setContent(
          (prev) =>
            prev.slice(0, cursorPosition) +
            imageMarkdown +
            prev.slice(cursorPosition)
        );
        toast.success(`Image "${file.name}" uploaded successfully`);
      }
    } catch (err) {
      toast.error(`Failed to upload image "${file.name}"`);
      console.error(err);
    }
  };

  // Unified handler for paste and drop events
  const handleImageTransfer = async (dataTransfer, cursorPosition) => {
    const imageFiles = Array.from(dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    // Upload images sequentially to maintain order
    for (const file of imageFiles) {
      await handleImageUpload(file, cursorPosition);
    }
  };

  // Remove PDF
  const handleRemovePdf = (index) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit note
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call parent's onSave with form data
      if (onSave) {
        // Separate new and existing PDFs
        const newPdfs = pdfs.filter((pdf) => !pdf.isExisting);
        const existingPdfs = pdfs
          .filter((pdf) => pdf.isExisting)
          .map((pdf) => pdf.url);

        await onSave({
          title,
          content,
          pdfs: newPdfs,
          pdfTitles: newPdfs.map((pdf) => pdf.title), // Send PDF titles separately
          existingPdfs,
        });

        // Reset form if not in edit mode
        if (!isEdit) {
          setTitle("");
          setContent("");
          setPdfs([]);
        }
      }
    } catch (err) {
      toast.error(isEdit ? "Failed to update note" : "Failed to create note");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 bg-gray-900 flex flex-col h-screen"
    >
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between bg-gray-800/50 backdrop-blur sticky top-0 z-10">
        <div className="flex-1 flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="bg-transparent text-xl text-gray-100 placeholder-gray-500 focus:outline-none flex-1"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-800 transition-colors"
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update"
              : "Create"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div
          data-color-mode="dark"
          className="flex-1 overflow-auto markdown-content"
        >
          <MDEditor
            value={content}
            onChange={setContent}
            height="calc(100vh - 73px)"
            textareaProps={{
              onPaste: (event) => {
                const hasImageFiles =
                  event?.clipboardData?.files?.length > 0 &&
                  Array.from(event.clipboardData.files).some((file) =>
                    file.type.startsWith("image/")
                  );

                if (hasImageFiles) {
                  event.preventDefault();
                  const cursorPos = event.target.selectionStart;
                  handleImageTransfer(event.clipboardData, cursorPos);
                }
              },
              onDrop: (event) => {
                const hasImageFiles =
                  event?.dataTransfer?.files?.length > 0 &&
                  Array.from(event.dataTransfer.files).some((file) =>
                    file.type.startsWith("image/")
                  );

                if (hasImageFiles) {
                  event.preventDefault();
                  const cursorPos = event.target.selectionStart;
                  handleImageTransfer(event.dataTransfer, cursorPos);
                }
              },
            }}
            preview="live"
            previewOptions={{
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [[rehypeKatex, { strict: false }], rehypeRaw],
            }}
            commands={[]}
            extraCommands={[
              {
                name: "image",
                keyCommand: "image",
                buttonProps: { "aria-label": "Insert Image" },
                icon: (
                  <svg viewBox="0 0 16 16" width="12px" height="12px">
                    <path
                      fill="currentColor"
                      d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
                    />
                    <path
                      fill="currentColor"
                      d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"
                    />
                  </svg>
                ),
                execute: (state) => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (file) handleImageUpload(file, state.selection.start);
                  };
                  input.click();
                },
              },
              {
                name: "latex",
                keyCommand: "latex",
                buttonProps: { "aria-label": "Insert LaTeX" },
                icon: (
                  <span style={{ fontFamily: "serif", fontWeight: "bold" }}>
                    ∑
                  </span>
                ),
                execute: (state) => {
                  const cursorPos = state.selection.start;
                  const beforeCursor = state.text.slice(0, cursorPos);
                  const afterCursor = state.text.slice(state.selection.end);
                  const latex = "$$\n\n$$";
                  setContent(beforeCursor + latex + afterCursor);
                },
              },
            ]}
          />
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-gray-800 bg-gray-800/50 backdrop-blur p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* PDF Upload */}
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">
                Attachments
              </h3>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-700 p-4 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
              >
                <input {...getInputProps()} />
                <p className="text-center text-gray-500 text-sm">
                  Drop PDF files here or click to select (max 5 files)
                </p>
              </div>
            </div>

            {/* PDF List */}
            {pdfs.length > 0 && (
              <div>
                <h3 className="text-gray-400 text-sm font-medium mb-2">
                  Attached Files
                </h3>
                <ul className="space-y-2">
                  {pdfs.map((pdf, i) => (
                    <li key={i} className="bg-gray-700/50 rounded-md p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm text-gray-300 truncate">
                          {pdf.isExisting && (
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <svg
                                className="w-4 h-4 inline"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                          <div className="flex flex-col">
                            <span className="truncate font-medium">
                              {pdf.isExisting
                                ? pdf.title || pdf.url.split("/").pop()
                                : pdf.title}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {pdf.isExisting
                                ? pdf.url.split("/").pop()
                                : pdf.file.name}
                            </span>
                          </div>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(i)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">
                Image Sizing Tips
              </h3>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Images are small & centered by default</li>
                <li>Add "medium" for mid-size images</li>
                <li>Add "large" for bigger images</li>
                <li>Add "full" for full-width images</li>
                <li>Add "left" or "right" to float images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
