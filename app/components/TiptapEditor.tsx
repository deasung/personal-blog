"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
import { createLowlight } from "lowlight";
import { useCallback, useEffect, useState } from "react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      /**
       * 문단/헤딩 정렬을 설정합니다.
       */
      setTextAlign: (
        alignment: "left" | "center" | "right" | "justify"
      ) => ReturnType;
      /**
       * 정렬을 초기화합니다.
       */
      unsetTextAlign: () => ReturnType;
    };
  }
}

// 지원할 언어들 import
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";

// lowlight 인스턴스 생성 및 언어 등록
const lowlight = createLowlight();

lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("java", java);
lowlight.register("c", c);
lowlight.register("cpp", cpp);
lowlight.register("csharp", csharp);
lowlight.register("bash", bash);
lowlight.register("shell", shell);
lowlight.register("sh", shell);
lowlight.register("sql", sql);
lowlight.register("json", json);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("go", go);
lowlight.register("rust", rust);
lowlight.register("php", php);
lowlight.register("ruby", ruby);
lowlight.register("swift", swift);
lowlight.register("kotlin", kotlin);

// 폰트 사이즈 확장
const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace("px", "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// 텍스트 정렬 확장 (외부 패키지 없이 간단 구현)
const TextAlignExt = Extension.create({
  name: "textAlign",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
      defaultAlignment: null as null | "left" | "center" | "right" | "justify",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) => {
              if (!attributes.textAlign) return {};
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: "left" | "center" | "right" | "justify") =>
        ({ commands, state }) => {
          // 선택된 위치 기준으로 heading/paragraph 중 "실제로 적용 가능한" 타입에만 적용
          const types = (this.options.types as string[]) ?? [];
          const $from = state.selection.$from;

          for (let depth = $from.depth; depth > 0; depth--) {
            const name = $from.node(depth).type.name;
            if (types.includes(name)) {
              return commands.updateAttributes(name, { textAlign: alignment });
            }
          }

          // fallback: 현재 selection에 활성화된 타입이 있으면 적용
          return types.some((type) =>
            commands.updateAttributes(type, { textAlign: alignment })
          );
        },
      unsetTextAlign:
        () =>
        ({ commands, state }) => {
          const types = (this.options.types as string[]) ?? [];
          const $from = state.selection.$from;

          for (let depth = $from.depth; depth > 0; depth--) {
            const name = $from.node(depth).type.name;
            if (types.includes(name)) {
              return commands.resetAttributes(name, "textAlign");
            }
          }

          return types.some((type) =>
            commands.resetAttributes(type, "textAlign")
          );
        },
    };
  },
});

function closeDetailsDropdown(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  const details = el?.closest?.("details");
  if (details) details.removeAttribute("open");
}

function IconAlignLeft({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-blue-700 dark:text-blue-400" : "text-current"}
      aria-hidden="true"
    >
      <path
        d="M4 6h16M4 10h10M4 14h16M4 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlignCenter({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-blue-700 dark:text-blue-400" : "text-current"}
      aria-hidden="true"
    >
      <path
        d="M4 6h16M7 10h10M4 14h16M7 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlignRight({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-blue-700 dark:text-blue-400" : "text-current"}
      aria-hidden="true"
    >
      <path
        d="M4 6h16M10 10h10M4 14h16M10 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlignJustify({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-blue-700 dark:text-blue-400" : "text-current"}
      aria-hidden="true"
    >
      <path
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconList() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6h12M9 12h12M9 18h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 6h.01M5 12h.01M5 18h.01"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
}: TiptapEditorProps) {
  const [currentFontFamily, setCurrentFontFamily] = useState("");
  const [currentFontSize, setCurrentFontSize] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: false, // 기본 코드블록 비활성화 (하이라이팅 버전 사용)
      }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      FontSize,
      TextAlignExt,
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // HTML을 그대로 저장 (서버에서 마크다운으로 변환하거나 HTML을 저장할 수 있음)
      const html = editor.getHTML();
      onChange(html);

      // 폰트 및 폰트 사이즈 상태 업데이트
      const attrs = editor.getAttributes("textStyle");
      setCurrentFontFamily(attrs.fontFamily || "");
      setCurrentFontSize(attrs.fontSize || "");
    },
    onSelectionUpdate: ({ editor }) => {
      // 선택 변경 시 폰트 및 폰트 사이즈 상태 업데이트
      const attrs = editor.getAttributes("textStyle");
      setCurrentFontFamily(attrs.fontFamily || "");
      setCurrentFontSize(attrs.fontSize || "");
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // content prop이 변경되면 에디터 내용 업데이트
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("admin_token");
        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        const response = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "이미지 업로드에 실패했습니다.");
        }

        // 업로드된 이미지를 에디터에 삽입
        if (result.data?.url) {
          editor.chain().focus().setImage({ src: result.data.url }).run();
        }
      } catch (error) {
        console.error("Image upload error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다."
        );
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const addImage = useCallback(() => {
    if (!editor) return;

    // 파일 입력 다이얼로그 열기
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 dark:border-gray-600">
          {/* 텍스트 스타일 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("bold")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("underline")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            title="밑줄"
            aria-label="밑줄"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("strike")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <s>S</s>
          </button>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Heading 드롭다운 (기존 H1/H2/H3/P 버튼 대체) */}
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 [&::-webkit-details-marker]:hidden">
              <span className="select-none">H</span>
              <span className="select-none text-xs opacity-70">▾</span>
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  editor.chain().focus().setParagraph().run();
                  closeDetailsDropdown(e.target);
                }}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                  editor.isActive("paragraph")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="w-6 text-gray-500 dark:text-gray-400">P</span>
                <span>문단</span>
              </button>
              {([1, 2, 3, 4] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    // 드롭다운에서는 toggle이 아니라 "항상 설정"이 UX가 좋음
                    editor.chain().focus().setHeading({ level }).run();
                    closeDetailsDropdown(e.target);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    editor.isActive("heading", { level })
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="w-6 text-gray-500 dark:text-gray-400">
                    H{level}
                  </span>
                  <span>Heading {level}</span>
                </button>
              ))}
            </div>
          </details>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 정렬 아이콘 그룹 */}
          {(() => {
            const isLeft = editor.isActive({ textAlign: "left" });
            const isCenter = editor.isActive({ textAlign: "center" });
            const isRight = editor.isActive({ textAlign: "right" });
            const isJustify = editor.isActive({ textAlign: "justify" });

            const baseBtn =
              "rounded px-2 py-2 text-sm font-medium transition-colors";
            const onCls =
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            const offCls =
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600";

            return (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  disabled={
                    !editor.can().chain().focus().setTextAlign("left").run()
                  }
                  className={`${baseBtn} ${isLeft ? onCls : offCls}`}
                  title="왼쪽 정렬 (Ctrl/Cmd+Shift+L)"
                  aria-label="왼쪽 정렬"
                >
                  <IconAlignLeft active={isLeft} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  disabled={
                    !editor.can().chain().focus().setTextAlign("center").run()
                  }
                  className={`${baseBtn} ${isCenter ? onCls : offCls}`}
                  title="가운데 정렬 (Ctrl/Cmd+Shift+E)"
                  aria-label="가운데 정렬"
                >
                  <IconAlignCenter active={isCenter} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  disabled={
                    !editor.can().chain().focus().setTextAlign("right").run()
                  }
                  className={`${baseBtn} ${isRight ? onCls : offCls}`}
                  title="오른쪽 정렬 (Ctrl/Cmd+Shift+R)"
                  aria-label="오른쪽 정렬"
                >
                  <IconAlignRight active={isRight} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  disabled={
                    !editor.can().chain().focus().setTextAlign("justify").run()
                  }
                  className={`${baseBtn} ${isJustify ? onCls : offCls}`}
                  title="양쪽 정렬 (Ctrl/Cmd+Shift+J)"
                  aria-label="양쪽 정렬"
                >
                  <IconAlignJustify active={isJustify} />
                </button>
              </div>
            );
          })()}

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 폰트 패밀리 */}
          <select
            onChange={(e) => {
              const fontFamily = e.target.value;
              if (fontFamily === "") {
                editor.chain().focus().unsetFontFamily().run();
                setCurrentFontFamily("");
              } else {
                editor.chain().focus().setFontFamily(fontFamily).run();
                setCurrentFontFamily(fontFamily);
              }
            }}
            value={currentFontFamily}
            className="rounded px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <option value="">폰트</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
            <option value="Palatino">Palatino</option>
            <option value="Garamond">Garamond</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Impact">Impact</option>
            <option value="Monaco">Monaco</option>
            <option value="Menlo">Menlo</option>
            <option value="Consolas">Consolas</option>
          </select>

          {/* 폰트 사이즈 */}
          <select
            onChange={(e) => {
              const fontSize = e.target.value;
              if (fontSize === "") {
                editor.chain().focus().unsetFontSize().run();
                setCurrentFontSize("");
              } else {
                editor.chain().focus().setFontSize(fontSize).run();
                setCurrentFontSize(fontSize);
              }
            }}
            value={currentFontSize}
            className="rounded px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <option value="">크기</option>
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
            <option value="48">48px</option>
            <option value="64">64px</option>
          </select>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* List 드롭다운 (기존 Bullet/Ordered 버튼 대체) */}
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 [&::-webkit-details-marker]:hidden">
              <IconList />
              <span className="select-none text-xs opacity-70">▾</span>
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  // heading 상태에서는 리스트 토글이 막힐 수 있어 문단으로 변환 후 토글
                  const ok = editor.chain().focus().toggleBulletList().run();
                  if (!ok) {
                    editor
                      .chain()
                      .focus()
                      .setParagraph()
                      .toggleBulletList()
                      .run();
                  }
                  closeDetailsDropdown(e.target);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                  editor.isActive("bulletList")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="w-6 text-gray-500 dark:text-gray-400">•</span>
                <span>Bullet List</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  const ok = editor.chain().focus().toggleOrderedList().run();
                  if (!ok) {
                    editor
                      .chain()
                      .focus()
                      .setParagraph()
                      .toggleOrderedList()
                      .run();
                  }
                  closeDetailsDropdown(e.target);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                  editor.isActive("orderedList")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="w-6 text-gray-500 dark:text-gray-400">1.</span>
                <span>Ordered List</span>
              </button>
            </div>
          </details>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("blockquote")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            인용
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            title="구분선"
            aria-label="구분선"
          >
            ―
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
            className="rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            title="서식 지우기"
            aria-label="서식 지우기"
          >
            서식지우기
          </button>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 코드 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("code")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            코드
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            코드블록
          </button>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 링크 및 이미지 */}
          <button
            type="button"
            onClick={setLink}
            className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
              editor.isActive("link")
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            링크
          </button>
          <button
            type="button"
            onClick={addImage}
            disabled={uploading}
            className="rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {uploading ? "업로드 중..." : "이미지"}
          </button>

          {/* 구분선 */}
          <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 실행 취소/다시 실행 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ↷
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="min-h-[400px] max-h-[600px] overflow-y-auto"
      />
    </div>
  );
}
