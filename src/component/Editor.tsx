import { prefetch } from "astro:prefetch";

import { useState, useEffect, useRef } from "preact/hooks";

import uploadPost from "../service/uploadPost";
import uploadImage from "../service/uploadImage";

import { Markyfy } from "markyfy";
import "../style/markdown.css";

interface EditorProps {
  savedTitle?: string;
  savedContent?: string;
  savedTags?: string[];
}

const marked = new Markyfy();

export default function Editor({
  savedTitle = "",
  savedContent = "",
  savedTags = [],
}: EditorProps) {
  const [title, setTitle] = useState(savedTitle);
  const [content, setContent] = useState(savedContent);
  const [tags, setTags] = useState<string[]>(savedTags);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(title, content); // 상태가 변화할 때마다 확인
  }, [title, content]);

  useEffect(() => {
    loadSavedValues();
  }, []);

  useEffect(() => {
    setPreview(marked.parse(content));
  }, [content]);

  const loadSavedValues = () => {
    const savedTitle = localStorage.getItem("draftTitle");
    const savedContent = localStorage.getItem("draftContent");
    const savedTags = localStorage.getItem("draftTags");

    if (savedTitle) setTitle(savedTitle);
    if (savedContent) {
      setContent(savedContent);
      setPreview(marked.parse(savedContent));
    }
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
  };

  const handleTagInput = (e: KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        setTagInput("");
        localStorage.setItem("draftTags", JSON.stringify(newTags));
      } else {
        alert("이미 존재하는 태그입니다!");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    localStorage.setItem("draftTags", JSON.stringify(newTags));
  };

  const validateInputs = () => {
    if (!title.trim()) {
      alert("아직 제목을 작성하지 않았어요!");
      return false;
    }
    if (!content.trim()) {
      alert("아직 내용을 작성하지 않았어요!");
      return false;
    }
    if (tags.length === 0) {
      alert("아직 태그가 없어요!");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateInputs()) return;

    if (confirm("이 내용으로 업로드 하시겠어요?")) {
      const result = await uploadPost(title, content, tags);
      if (result.success && result.id) {
        clearInputs();
        prefetch(`/blog/${result.id}`, { ignoreSlowConnection: true });
        window.location.href = `/blog/${result.id}`;
      } else {
        alert("포스트 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const saveDraft = () => {
    localStorage.setItem("draftTitle", title);
    localStorage.setItem("draftContent", content);
    localStorage.setItem("draftTags", JSON.stringify(tags));
    alert("임시 저장 되었어요!");
  };

  const handlePrevious = () => {
    if (confirm("작성 중인 내용이 있습니다. 임시 저장하고 나가시겠어요?")) {
      saveDraft();
      window.location.href = "/";
    } else {
      clearInputs();
      window.location.href = "/";
    }
  };

  const clearInputs = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setPreview("");
    localStorage.removeItem("draftTitle");
    localStorage.removeItem("draftContent");
    localStorage.removeItem("draftTags");
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    const imageUrl = await uploadImage(file);

    if (imageUrl && textareaRef.current) {
      const markdownImage = `![](${imageUrl})\n`;
      const cursorPos = textareaRef.current.selectionStart ?? 0;
      const newContent =
        content.substring(0, cursorPos) +
        markdownImage +
        content.substring(cursorPos);

      setContent(newContent);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = cursorPos + markdownImage.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div class="editor">
      <div class="form">
        <input
          type="text"
          class="title"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => {
            setTitle((e.target as HTMLInputElement).value);
          }}
        />

        <div class="tag-wrapper">
          <input
            ref={tagInputRef}
            type="text"
            class="input"
            placeholder="태그를 입력해주세요"
            value={tagInput}
            onChange={(e) => setTagInput((e.target as HTMLInputElement).value)}
            onKeyUp={handleTagInput}
          />
          {tags.map((tag) => (
            <div class="tag" key={tag}>
              {tag}
              <img
                src="/icon-x-mono.svg"
                alt="delete icon"
                onClick={() => removeTag(tag)}
              />
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          placeholder="이제 이야기를 시작하세요"
          value={content}
          onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        />

        <div class="button-nav">
          <div class="btn-previous" onClick={handlePrevious}>
            <img src="/icon-arrow-back-dark.svg" alt="left icon" />
            <span>나가기</span>
          </div>
          <div class="btn-wrapper">
            <div class="btn-sub" onClick={saveDraft}>
              임시 저장
            </div>
            <div class="btn-primary" onClick={handleUpload}>
              업로드
            </div>
          </div>
        </div>
      </div>

      <div class="preview">
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
