declare module 'mammoth' {
  interface Result {
    value: string;
    messages: any[];
  }

  interface Options {
    convertImage?: (element: any) => any;
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    styleMap?: string[];
  }

  function extractRawText(input: { arrayBuffer: ArrayBuffer } | { path: string }): Promise<Result>;
  function convertToHtml(input: { arrayBuffer: ArrayBuffer } | { path: string }, options?: Options): Promise<Result>;
  function convertToMarkdown(input: { arrayBuffer: ArrayBuffer } | { path: string }, options?: Options): Promise<Result>;

  export { extractRawText, convertToHtml, convertToMarkdown, Result, Options };
}
