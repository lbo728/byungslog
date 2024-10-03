import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark-dimmed.css";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    // highlight(code, lang, info) {
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

export async function markedWriteContent(
  inputContent: string,
  outputElement: HTMLDivElement,
) {
  outputElement.innerHTML = await marked.parse(inputContent);
}

export async function markedReadContent(inputContent: string): Promise<string> {
  return await marked.parse(inputContent);
}
