import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import { findFootnoteRefAtPos } from "./footnotes";

const footnoteMark = Decoration.mark({
  class: "cm-footnote-ref",
});

function buildFootnoteDecorations(doc: string): DecorationSet {
  const decorations: ReturnType<typeof footnoteMark.range>[] = [];
  const re = /\[\^([\w-]+)\](?!:)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(doc)) !== null) {
    decorations.push(
      footnoteMark.range(match.index, match.index + match[0].length)
    );
  }
  return Decoration.set(decorations, true);
}

const footnoteDecorationsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildFootnoteDecorations(view.state.doc.toString());
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildFootnoteDecorations(
          update.state.doc.toString()
        );
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export type FootnoteClickHandler = (
  id: string,
  anchor: DOMRect
) => void;

/** CodeMirror extension: highlight `[^id]` markers and handle clicks. */
export function footnoteClickExtension(
  onClickRef: { current: FootnoteClickHandler | null }
) {
  return [
    footnoteDecorationsPlugin,
    EditorView.baseTheme({
      ".cm-footnote-ref": {
        textDecoration: "underline",
        textDecorationColor: "var(--color-accent, #2563eb)",
        textUnderlineOffset: "2px",
        cursor: "pointer",
      },
    }),
    EditorView.domEventHandlers({
      click(event, view) {
        const handler = onClickRef.current;
        if (!handler) return false;

        const pos = view.posAtCoords({
          x: event.clientX,
          y: event.clientY,
        });
        if (pos == null) return false;

        const ref = findFootnoteRefAtPos(view.state.doc.toString(), pos);
        if (!ref) return false;

        const coords = view.coordsAtPos(ref.from);
        if (!coords) return false;

        const anchor = new DOMRect(
          coords.left,
          coords.top,
          coords.right - coords.left,
          coords.bottom - coords.top
        );
        handler(ref.id, anchor);
        return true;
      },
    }),
  ];
}
