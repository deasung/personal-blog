"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight } from "lowlight";
import { useCallback, useMemo, useRef, useState } from "react";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";

import { getApiBaseUrl } from "@/lib/api-client";

const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("java", java);
lowlight.register("c", c);
lowlight.register("cpp", cpp);
lowlight.register("bash", bash);
lowlight.register("json", json);
lowlight.register("html", html);
lowlight.register("css", css);

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function getFileExt(file: File) {
  const parts = file.name.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  return ext.toLowerCase();
}

async function uploadImageViaPresignedPost(file: File): Promise<string> {
  const token = localStorage.getItem("admin_token");
  if (!token) throw new Error("인증 토큰이 없습니다.");

  const presignPath =
    process.env.NEXT_PUBLIC_S3_PRESIGNED_POST_PATH || "/admin/aws/s3-presigned-post";
  const group = process.env.NEXT_PUBLIC_S3_UPLOAD_GROUP || "images";
  const fileExt = getFileExt(file);
  if (!fileExt) throw new Error("파일 확장자를 알 수 없습니다.");

  const qs = new URLSearchParams();
  qs.set("group", group);
  qs.set("file_ext", fileExt);

  const presignUrl = `${getApiBaseUrl()}${
    presignPath.startsWith("/") ? "" : "/"
  }${presignPath}?${qs.toString()}`;

  const presignRes = await fetch(presignUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!presignRes.ok) {
    throw new Error(`Presign 요청 실패 (${presignRes.status})`);
  }

  const presign = (await presignRes.json()) as {
    url: string;
    fields: Record<string, string>;
  };

  if (!presign?.url || !presign?.fields?.key) {
    throw new Error("Presign 응답이 올바르지 않습니다.");
  }

  // S3로 직접 업로드 (presigned POST)
  const uploadForm = new FormData();
  for (const [k, v] of Object.entries(presign.fields)) {
    uploadForm.append(k, v);
  }
  uploadForm.append("file", file);

  const s3Res = await fetch(presign.url, {
    method: "POST",
    body: uploadForm,
  });
  if (!s3Res.ok) {
    throw new Error("S3 업로드에 실패했습니다.");
  }

  // CloudFront URL 생성 (권장)
  const key = presign.fields.key;
  const cloudfrontBase = process.env.NEXT_PUBLIC_CDN_URL as
    | string
    | undefined;
  if (!cloudfrontBase) {
    throw new Error(
      "NEXT_PUBLIC_CDN_URL이 설정되지 않았습니다. (업로드 후 CloudFront URL로 삽입하기 위해 필수)"
    );
  }

  return `${String(cloudfrontBase).replace(/\/+$/, "")}/${key}`;
}

export default function TiptapEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // taskList는 별도 extension으로 제공
        // 기본값 사용
      }),
      Underline,
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: placeholder || "내용을 입력하세요...",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const canUseEditor = !!editor;

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL을 입력하세요", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("이미지 URL을 입력하세요");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const pickImageFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }

      setUploading(true);
      try {
        const url = await uploadImageViaPresignedPost(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert(err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const toolbarButtons = useMemo(
    () => [
      {
        label: "B",
        title: "Bold",
        onClick: () => editor?.chain().focus().toggleBold().run(),
        active: !!editor?.isActive("bold"),
      },
      {
        label: "I",
        title: "Italic",
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        active: !!editor?.isActive("italic"),
      },
      {
        label: "U",
        title: "Underline",
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
        active: !!editor?.isActive("underline"),
      },
      {
        label: "H2",
        title: "Heading 2",
        onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        active: !!editor?.isActive("heading", { level: 2 }),
      },
      {
        label: "•",
        title: "Bullet List",
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
        active: !!editor?.isActive("bulletList"),
      },
      {
        label: "1.",
        title: "Ordered List",
        onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        active: !!editor?.isActive("orderedList"),
      },
      {
        label: "☑",
        title: "Task List",
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        active: !!editor?.isActive("taskList"),
      },
      {
        label: "</>",
        title: "Code Block",
        onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
        active: !!editor?.isActive("codeBlock"),
      },
      {
        label: "⟸",
        title: "Align Left",
        onClick: () => editor?.chain().focus().setTextAlign("left").run(),
        active: !!editor?.isActive({ textAlign: "left" }),
      },
      {
        label: "≡",
        title: "Align Center",
        onClick: () => editor?.chain().focus().setTextAlign("center").run(),
        active: !!editor?.isActive({ textAlign: "center" }),
      },
      {
        label: "⟹",
        title: "Align Right",
        onClick: () => editor?.chain().focus().setTextAlign("right").run(),
        active: !!editor?.isActive({ textAlign: "right" }),
      },
      {
        label: "Link",
        title: "Link",
        onClick: setLink,
        active: !!editor?.isActive("link"),
      },
    ],
    [editor, setLink]
  );

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-2 dark:border-gray-600">
        {toolbarButtons.map((b) => (
          <button
            key={b.title}
            type="button"
            title={b.title}
            onClick={b.onClick}
            disabled={!canUseEditor}
            className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
              b.active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            }`}
          >
            {b.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={insertImageByUrl}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
          >
            이미지 URL
          </button>
          <button
            type="button"
            onClick={pickImageFile}
            disabled={uploading}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
          >
            {uploading ? "업로드 중..." : "이미지 업로드"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="hidden"
          />
        </div>
      </div>

      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

