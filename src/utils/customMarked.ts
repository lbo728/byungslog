export interface Token {
  type: string;
  raw: string;
  text?: string;
  depth?: number;
  items?: Token[];
  lang?: string;
  header?: string;
}

export interface ParserOptions {
  gfm?: boolean;
  breaks?: boolean;
  headerIds?: boolean;
}

export class MarkdownParser {
  private options: ParserOptions;
  private tokens: Token[] = [];

  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      headerIds: true,
      ...options,
    };
  }

  parse(markdown: string): string {
    this.tokens = this.tokenize(markdown);
    return this.tokensToHtml(this.tokens);
  }

  private tokenize(markdown: string): Token[] {
    const tokens: Token[] = [];
    const lines = markdown.split("\n");

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("```")) {
        const token = this.captureCodeBlock(lines, i);
        tokens.push(token);
        i += token.raw.split("\n").length;
        continue;
      }

      if (line.startsWith("#")) {
        tokens.push(this.captureHeader(line));
        i++;
        continue;
      }

      if (line.includes("`")) {
        tokens.push(...this.captureInlineCode(line));
        i++;
        continue;
      }

      tokens.push({
        type: "paragraph",
        raw: line,
        text: line,
      });

      i++;
    }

    return tokens;
  }

  private captureCodeBlock(lines: string[], start: number): Token {
    const content: string[] = [];
    let i = start + 1;
    const lang = lines[start].slice(3).trim();

    while (i < lines.length && !lines[i].startsWith("```")) {
      content.push(lines[i]);
      i++;
    }

    return {
      type: "code_block",
      raw: lines.slice(start, i + 1).join("\n"),
      text: content.join("\n"),
      lang,
    };
  }

  private captureHeader(line: string): Token {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) {
      return {
        type: "paragraph",
        raw: line,
        text: line,
      };
    }

    return {
      type: "header",
      raw: line,
      text: match[2],
      depth: match[1].length,
      header: this.options.headerIds ? this.slugify(match[2]) : undefined,
    };
  }

  private captureInlineCode(line: string): Token[] {
    const tokens: Token[] = [];
    let lastIndex = 0;
    let inCode = false;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === "`") {
        if (inCode) {
          tokens.push({
            type: "code",
            raw: line.slice(lastIndex, i + 1),
            text: line.slice(lastIndex + 1, i),
          });
        } else {
          if (lastIndex < i) {
            tokens.push({
              type: "text",
              raw: line.slice(lastIndex, i),
              text: line.slice(lastIndex, i),
            });
          }
        }
        lastIndex = i + 1;
        inCode = !inCode;
      }
    }

    if (lastIndex < line.length) {
      tokens.push({
        type: "text",
        raw: line.slice(lastIndex),
        text: line.slice(lastIndex),
      });
    }

    return tokens;
  }

  private tokensToHtml(tokens: Token[]): string {
    return tokens
      .map((token) => {
        switch (token.type) {
          case "code_block":
            return `<pre><code class="language-${token.lang}">${this.escapeHtml(token.text || "")}</code></pre>`;

          case "header":
            const id = token.header ? ` id="${token.header}"` : "";
            return `<h${token.depth}${id}>${token.text}</h${token.depth}>`;

          case "code":
            return `<code>${this.escapeHtml(token.text || "")}</code>`;

          case "text":
          case "paragraph":
            return `<p>${token.text}</p>`;

          default:
            return "";
        }
      })
      .join("\n");
  }

  generateToc(markdown: string): string {
    const tokens = this.tokenize(markdown);
    const headers = tokens.filter((token) => token.type === "header");

    return headers
      .map((header) => {
        const indent = "  ".repeat((header.depth || 1) - 1);
        const link = header.header ? `#${header.header}` : "";
        return `${indent}- [${header.text}](${link})`;
      })
      .join("\n");
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
      .replace(/'/g, "&#39;");
  }
}
