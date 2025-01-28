import { prefetch } from "astro:prefetch";

import { supabase } from "../lib/supabase";

import uploadPost from "../service/uploadPost";
import uploadImage from "../service/uploadImage";

import { markedWriteContent } from "../utils/marked";
import { MarkdownParser } from "./customMarked";

interface TagList {
  tagList: string[];
}

export function handleEditorInit() {
  const marked = new MarkdownParser();

  const textareaElement = document.getElementById(
    "textarea",
  ) as HTMLTextAreaElement;
  const inputElement = document.getElementById("input") as HTMLTextAreaElement;
  const resultElement = document.getElementById("result") as HTMLDivElement;
  const titleElement = document.getElementById("title") as HTMLDivElement;
  const tagInputElement = document.getElementById(
    "tags-input",
  ) as HTMLInputElement;
  const tagWrapperElement = document.querySelector(
    ".tag-wrapper",
  ) as HTMLDivElement;
  const loginModal = document.getElementById("loginModal") as HTMLElement;
  const loginConfirmBtn = document.getElementById(
    "loginConfirmBtn",
  ) as HTMLElement;
  const loginCancelBtn = document.getElementById(
    "loginCancelBtn",
  ) as HTMLElement;

  let tagList: string[] = [];

  // Login handlers
  loginConfirmBtn?.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      alert("Login failed");
      return;
    }
    loginModal.style.display = "none";
  });

  loginCancelBtn?.addEventListener("click", () => {
    window.location.href = "/";
  });

  // Load saved values
  loadSavedValues();

  // Event listeners
  tagInputElement?.addEventListener("keyup", (e) =>
    handleTagInput(e, { tagList }),
  );
  inputElement?.addEventListener("keyup", () => {
    if (titleElement) titleElement.innerHTML = inputElement.value;
  });
  textareaElement?.addEventListener("keyup", async () => {
    if (resultElement) {
      // await markedWriteContent(textareaElement.value, resultElement);
      resultElement.innerHTML = marked.parse(textareaElement.value);
    }
  });

  // Button event listeners
  document
    .querySelector(".btn-primary")
    ?.addEventListener("click", () =>
      handleUploadClick(inputElement, textareaElement, tagList),
    );
  document
    .querySelector(".btn-previous")
    ?.addEventListener("click", () =>
      handlePreviousClick(inputElement, textareaElement, tagList),
    );
  document
    .querySelector(".btn-sub")
    ?.addEventListener("click", () =>
      handleSubClick(inputElement, textareaElement, tagList),
    );

  // Drag and drop handlers
  textareaElement?.addEventListener("drop", handleDrop);
  textareaElement?.addEventListener("dragover", (event) =>
    event.preventDefault(),
  );

  // Add tag handling functions to make them available in the closure
  function addTagToDOM(tag: string) {
    const tagElement = document.createElement("div");
    tagElement.classList.add("tag");
    tagElement.textContent = tag;

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "/icon-x-mono.svg";
    deleteIcon.alt = "delete icon";
    deleteIcon.addEventListener("click", () => removeTag(tag));

    tagElement.appendChild(deleteIcon);
    tagWrapperElement?.insertBefore(tagElement, tagInputElement);
  }

  function removeTag(tag: string) {
    const tagElements = tagWrapperElement?.querySelectorAll(".tag");
    tagElements?.forEach((tagElement) => {
      if (tagElement.textContent?.trim() === tag) {
        tagElement.remove();
      }
    });

    tagList = tagList.filter((t) => t !== tag);
    localStorage.setItem("draftTags", JSON.stringify(tagList));
  }

  // Load saved values from localStorage
  async function loadSavedValues() {
    const savedTitle = localStorage.getItem("draftTitle");
    const savedContent = localStorage.getItem("draftContent");
    const savedTags = localStorage.getItem("draftTags");

    if (savedTitle && titleElement) {
      titleElement.innerHTML = savedTitle;
    }
    if (savedContent && resultElement) {
      // await markedWriteContent(savedContent, resultElement);
      resultElement.innerHTML = marked.parse(savedContent);
    }
    if (savedTags) {
      tagList = JSON.parse(savedTags);
      tagList.forEach((tag) => addTagToDOM(tag));
    }
  }
}

// Tag input handler
function handleTagInput(event: KeyboardEvent, { tagList }: TagList) {
  const tagInputElement = document.getElementById(
    "tags-input",
  ) as HTMLInputElement;
  const tagWrapperElement = document.querySelector(
    ".tag-wrapper",
  ) as HTMLDivElement;

  if (event.key === "Enter" && tagInputElement.value.trim() !== "") {
    const newTag = tagInputElement.value.trim();

    if (!tagList.includes(newTag)) {
      tagList.push(newTag);
      addTagToDOM(newTag, tagWrapperElement, tagInputElement, tagList);
      tagInputElement.value = "";
      localStorage.setItem("draftTags", JSON.stringify(tagList));
    } else {
      alert("이미 존재하는 태그입니다!");
    }
  }
}

// Validation function
function validateInputs(
  title: string,
  content: string,
  tags: string[],
): boolean {
  if (!title.trim()) {
    alert("아직 제목을 작성하지 않았어요!");
    return false;
  }
  if (!content.trim()) {
    alert("아직 내용을 작성하지 않았어요!");
    return false;
  }
  if (!tags || tags.length === 0) {
    alert("아직 태그가 없어요!");
    return false;
  }
  return true;
}

// Upload handler
async function handleUploadClick(
  inputElement: HTMLTextAreaElement,
  textareaElement: HTMLTextAreaElement,
  tagList: string[],
) {
  const title = inputElement.value;
  const content = textareaElement.value;
  const tags = tagList;

  if (!validateInputs(title, content, tags)) {
    return;
  }

  if (confirm("이 내용으로 업로드 하시겠어요?")) {
    const result = await uploadPost(title, content, tags);
    if (result.success && result.id) {
      clearInputs(inputElement, textareaElement);
      const id = result.id;
      prefetch(`/blog/${id}`, { ignoreSlowConnection: true });
      window.location.href = `/blog/${id}`;
    } else {
      alert("포스트 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }
}

// Save draft handler
function handleSubClick(
  inputElement: HTMLTextAreaElement,
  textareaElement: HTMLTextAreaElement,
  tagList: string[],
) {
  saveDraft(inputElement, textareaElement, tagList);
  alert("임시 저장 되었어요!");
}

// Previous page handler
function handlePreviousClick(
  inputElement: HTMLTextAreaElement,
  textareaElement: HTMLTextAreaElement,
  tagList: string[],
) {
  if (confirm("작성 중인 내용이 있습니다. 임시 저장하고 나가시겠어요?")) {
    saveDraft(inputElement, textareaElement, tagList);
    window.location.href = "/";
  } else {
    clearInputs(inputElement, textareaElement);
    window.location.href = "/";
  }
}

// Save draft function
function saveDraft(
  inputElement: HTMLTextAreaElement,
  textareaElement: HTMLTextAreaElement,
  tagList: string[],
) {
  localStorage.setItem("draftTitle", inputElement.value);
  localStorage.setItem("draftContent", textareaElement.value);
  localStorage.setItem("draftTags", JSON.stringify(tagList));
}

// Clear inputs function
function clearInputs(
  inputElement: HTMLTextAreaElement,
  textareaElement: HTMLTextAreaElement,
) {
  const titleElement = document.getElementById("title") as HTMLElement;
  const resultElement = document.getElementById("result") as HTMLElement;
  const tagWrapperElement = document.querySelector(
    ".tag-wrapper",
  ) as HTMLElement;

  inputElement.value = "";
  textareaElement.value = "";
  if (titleElement) titleElement.innerHTML = "";
  if (resultElement) resultElement.innerHTML = "";

  // Clear tags
  const tagElements = tagWrapperElement?.querySelectorAll(".tag");
  tagElements?.forEach((tag) => tag.remove());

  // Clear localStorage
  localStorage.removeItem("draftTitle");
  localStorage.removeItem("draftTags");
  localStorage.removeItem("draftContent");
}

// Image drop handler
async function handleDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files;

  if (!files || files.length === 0) return;

  const file = files[0];
  const imageUrl = await uploadImage(file);

  if (imageUrl) {
    insertImageToMarkdown(imageUrl);
  }
}

// Insert image to markdown
function insertImageToMarkdown(url: string) {
  const textarea = document.getElementById("textarea") as HTMLTextAreaElement;

  if (textarea) {
    const markdownImage = `![](${url})\n`;
    const cursorPos = textarea.selectionStart ?? 0;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);

    textarea.value = textBefore + markdownImage + textAfter;
    textarea.selectionStart = textarea.selectionEnd =
      cursorPos + markdownImage.length;
    textarea.focus();
  } else {
    console.error("Textarea element not found");
  }
}

// Helper function to add tag to DOM
function addTagToDOM(
  tag: string,
  tagWrapperElement: HTMLElement,
  tagInputElement: HTMLInputElement,
  tagList: string[],
) {
  const tagElement = document.createElement("div");
  tagElement.classList.add("tag");
  tagElement.textContent = tag;

  const deleteIcon = document.createElement("img");
  deleteIcon.src = "/icon-x-mono.svg";
  deleteIcon.alt = "delete icon";
  deleteIcon.addEventListener("click", () =>
    removeTag(tag, tagWrapperElement, tagList),
  );

  tagElement.appendChild(deleteIcon);
  tagWrapperElement.insertBefore(tagElement, tagInputElement);
}

// Helper function to remove tag
function removeTag(
  tag: string,
  tagWrapperElement: HTMLElement,
  tagList: string[],
) {
  const tagElements = tagWrapperElement.querySelectorAll(".tag");
  tagElements.forEach((tagElement) => {
    if (tagElement.textContent?.trim() === tag) {
      tagElement.remove();
    }
  });

  const newTagList = tagList.filter((t) => t !== tag);
  localStorage.setItem("draftTags", JSON.stringify(newTagList));
  return newTagList;
}
