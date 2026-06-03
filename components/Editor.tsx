"use client";
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";

// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import ImageTool from "@editorjs/image";
// @ts-ignore
import Quote from "@editorjs/quote";

interface EditorProps {
  onChange: (data: any) => void;
  initialData?: any;
}

export default function Editor({ onChange, initialData }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Почніть писати тут...",
      data: initialData || { blocks: [] },
      async onChange(api) {
        const data = await api.saver.save();
        onChange(data);
      },
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Введіть заголовок",
            levels: [2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered"
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Введіть цитату",
            captionPlaceholder: "Автор цитати",
          },
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: "/api/upload",
            },
            field: "image",
          }
        }
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return <div id="editorjs" className="w-full min-h-[200px]" />;
}