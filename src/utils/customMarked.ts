import { SyntaxHighlighter } from "./SyntaxHighlighter";

export type TokenType =
  | "paragraph"
  | "header"
  | "code_block"
  | "code"
  | "bold"
  | "italic"
  | "link"
  | "list"
  | "list_item"
  | "blockquote"
  | "text";

export interface Token {
  type: TokenType;
  raw: string;
  text?: string;
  depth?: number;
  items?: Token[];
  lang?: string;
  url?: string;
  children?: Token[];
}

export interface ParserOptions {
  gfm?: boolean;
  breaks?: boolean;
  headerIds?: boolean;
  sanitize?: boolean;
}

export class MarkdownParser {
  private options: Required<ParserOptions>;
  private syntaxHighlighter: SyntaxHighlighter;

  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      headerIds: true,
      sanitize: true,
      ...options,
    };
    this.syntaxHighlighter = new SyntaxHighlighter();
  }

  parse(markdown: string): string {
    try {
      const tokens = this.tokenize(markdown);
      return this.tokensToHtml(tokens);
    } catch (error) {
      console.error("Parsing error:", error);
      return this.escapeHtml(markdown);
    }
  }

  private tokenize(markdown: string): Token[] {
    const tokens: Token[] = [];
    const lines = markdown.trim().split("\n");

    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i];

        if (line.startsWith("#")) {
          tokens.push(this.parseHeader(line));
          continue;
        }

        if (line.startsWith(">")) {
          const blockquote = this.parseBlockquote(lines, i);
          tokens.push(blockquote.token);
          i = blockquote.newIndex;
          continue;
        }

        if (line.startsWith("```")) {
          const codeBlock = this.parseCodeBlock(lines, i);
          tokens.push(codeBlock.token);
          i = codeBlock.newIndex;
          continue;
        }

        if (line.match(/^[*-+]\s/) || line.match(/^\d+\.\s/)) {
          const list = this.parseList(lines, i);
          tokens.push(list.token);
          i = list.newIndex;
          continue;
        }

        if (line.trim()) {
          tokens.push({
            type: "paragraph",
            raw: line,
            children: this.parseInline(line),
          });
        }
      } catch (error) {
        console.error(`Error parsing line ${i + 1}:`, error);
        tokens.push({
          type: "paragraph",
          raw: lines[i],
          text: this.escapeHtml(lines[i]),
        });
      }
    }

    return tokens;
  }

  private parseInline(text: string): Token[] {
    const tokens: Token[] = [];
    let current = "";
    let i = 0;

    while (i < text.length) {
      // Bold
      if (text.startsWith("**", i) || text.startsWith("__", i)) {
        const marker = text.substr(i, 2);
        const end = text.indexOf(marker, i + 2);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "bold",
            raw: text.slice(i, end + 2),
            text: text.slice(i + 2, end),
          });
          i = end + 2;
          current = "";
          continue;
        }
      }

      // Italic
      if (text[i] === "*" || text[i] === "_") {
        const end = text.indexOf(text[i], i + 1);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "italic",
            raw: text.slice(i, end + 1),
            text: text.slice(i + 1, end),
          });
          i = end + 1;
          current = "";
          continue;
        }
      }

      // Inline code
      if (text[i] === "`") {
        const end = text.indexOf("`", i + 1);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "code",
            raw: text.slice(i, end + 1),
            text: text.slice(i + 1, end),
          });
          i = end + 1;
          current = "";
          continue;
        }
      }

      // Link
      if (text[i] === "[") {
        const titleEnd = text.indexOf("]", i);
        if (titleEnd !== -1 && text[titleEnd + 1] === "(") {
          const urlEnd = text.indexOf(")", titleEnd + 2);
          if (urlEnd !== -1) {
            if (current)
              tokens.push({ type: "text", raw: current, text: current });
            tokens.push({
              type: "link",
              raw: text.slice(i, urlEnd + 1),
              text: text.slice(i + 1, titleEnd),
              url: text.slice(titleEnd + 2, urlEnd),
            });
            i = urlEnd + 1;
            current = "";
            continue;
          }
        }
      }

      current += text[i];
      i++;
    }

    if (current) {
      tokens.push({ type: "text", raw: current, text: current });
    }

    return tokens;
  }
  private parseHeader(line: string): Token {
    const match = line.match(/^(#{1,6})(\s+(.+))?$/);
    if (!match) {
      return {
        type: "paragraph",
        raw: line,
        children: this.parseInline(line),
      };
    }

    if (!match[2]) {
      return {
        type: "paragraph",
        raw: line,
        children: this.parseInline(line),
      };
    }

    return {
      type: "header",
      raw: line,
      text: match[3],
      depth: match[1].length,
      children: this.parseInline(match[3]),
    };
  }

  private parseBlockquote(
    lines: string[],
    startIndex: number,
  ): { token: Token; newIndex: number } {
    const content: string[] = [];
    let i = startIndex;

    while (
      i < lines.length &&
      (lines[i].startsWith(">") || lines[i].trim() === "")
    ) {
      if (lines[i].trim() !== "") {
        content.push(lines[i].slice(1).trim());
      }
      i++;
    }

    return {
      token: {
        type: "blockquote",
        raw: lines.slice(startIndex, i).join("\n"),
        children: this.tokenize(content.join("\n")),
      },
      newIndex: i - 1,
    };
  }

  private parseCodeBlock(
    lines: string[],
    startIndex: number,
  ): { token: Token; newIndex: number } {
    const content: string[] = [];
    let i = startIndex + 1;
    const lang = lines[startIndex].slice(3).trim();

    while (i < lines.length && !lines[i].startsWith("```")) {
      content.push(lines[i]);
      i++;
    }

    if (i >= lines.length) {
      throw new Error("Unclosed code block");
    }

    return {
      token: {
        type: "code_block",
        raw: lines.slice(startIndex, i + 1).join("\n"),
        text: content.join("\n"),
        lang,
      },
      newIndex: i,
    };
  }

  private parseList(
    lines: string[],
    startIndex: number,
  ): { token: Token; newIndex: number } {
    const items: Token[] = [];
    let i = startIndex;
    const isOrdered = lines[i].match(/^\d+\.\s/) !== null;
    const pattern = isOrdered ? /^\d+\.\s/ : /^[*-+]\s/;

    while (
      i < lines.length &&
      (lines[i].match(pattern) || lines[i].trim() === "")
    ) {
      if (lines[i].trim() !== "") {
        const content = lines[i].replace(pattern, "");
        items.push({
          type: "list_item",
          raw: lines[i],
          children: this.parseInline(content),
        });
      }
      i++;
    }

    return {
      token: {
        type: "list",
        raw: lines.slice(startIndex, i).join("\n"),
        items,
      },
      newIndex: i - 1,
    };
  }

  private tokensToHtml(tokens: Token[]): string {
    return tokens
      .map((token) => {
        switch (token.type) {
          case "header":
            const id = this.options.headerIds
              ? ` id="${this.slugify(token.text || "")}"`
              : "";
            return `<h${token.depth}${id}>${this.renderChildren(token.children)}</h${token.depth}>`;
          case "code_block":
            const highlighted = this.syntaxHighlighter.highlight(
              token.text || "",
              token.lang || "",
            );
            return `
            <pre><code class="language-${token.lang || ""}">${highlighted}</code></pre>
            <style>
              .token.keyword { color: #569cd6; }
              .token.string { color: #ce9178; }
              .token.comment { color: #6a9955; }
              .token.number { color: #b5cea8; }
              .token.boolean { color: #569cd6; }
              .token.type { color: #4ec9b0; }
              .token.class { color: #4ec9b0; }
            </style>
          `;

          case "paragraph":
            return `<p>${this.renderChildren(token.children)}</p>`;

          case "blockquote":
            return `<blockquote>${this.tokensToHtml(token.children || [])}</blockquote>`;

          case "list":
            const tag = token.items?.[0]?.raw.match(/^\d+\.\s/) ? "ol" : "ul";
            return `<${tag}>${token.items
              ?.map((item) => `<li>${this.renderChildren(item.children)}</li>`)
              .join("")}</${tag}>`;

          case "bold":
            return `<strong>${this.escapeHtml(token.text || "")}</strong>`;

          case "italic":
            return `<em>${this.escapeHtml(token.text || "")}</em>`;

          case "code":
            return `<code>${this.escapeHtml(token.text || "")}</code>`;

          case "link":
            const url = this.options.sanitize
              ? this.sanitizeUrl(token.url || "")
              : token.url;
            return `<a href="${url}">${this.escapeHtml(token.text || "")}</a>`;

          default:
            return this.escapeHtml(token.text || "");
        }
      })
      .join("\n");
  }

  private renderChildren(children?: Token[]): string {
    if (!children) return "";
    return children.map((child) => this.tokensToHtml([child])).join("");
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "javascript:" ? "" : url;
    } catch {
      return url;
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
