import { Marked } from "marked";

const marked = new Marked();

export async function markedWriteContent(
  inputContent: string,
  outputElement: HTMLDivElement,
) {
  outputElement.innerHTML = await marked.parse(inputContent);
}

export async function markedReadContent(inputContent: string): Promise<string> {
  return await marked.parse(inputContent);
}
