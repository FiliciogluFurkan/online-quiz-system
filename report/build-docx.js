const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, ImageRun, PageBreak, TableOfContents, ExternalHyperlink,
  VerticalMergeType, VerticalAlign, Header, TabStopType, TabStopPosition,
} = require("docx");

const ROOT = __dirname;
const MD = path.join(ROOT, "CSE444-Project-Report.md");
const OUT = path.join(ROOT, "CSE444-Project-Report.docx");
const CONTENT_WIDTH = 9360; // US Letter, 1" margins (DXA)
const MAX_IMG_PX = 600;     // max image width in px (~6.25in at 96dpi)

const mermaidImages = [
  path.join(ROOT, "diagrams", "architecture.png"),
  path.join(ROOT, "diagrams", "class-diagram.png"),
];
let mermaidIdx = 0;

function pngSize(file) {
  const b = fs.readFileSync(file);
  // PNG IHDR: width at byte 16, height at byte 20 (big-endian)
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  return { w, h };
}

function imageParagraph(file, caption) {
  if (!fs.existsSync(file)) {
    return [new Paragraph({ children: [new TextRun({ text: `[missing image: ${file}]`, italics: true, color: "CC0000" })] })];
  }
  const { w, h } = pngSize(file);
  let dw = w, dh = h;
  if (dw > MAX_IMG_PX) { dh = Math.round(dh * (MAX_IMG_PX / dw)); dw = MAX_IMG_PX; }
  const out = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({
        type: "png",
        data: fs.readFileSync(file),
        transformation: { width: dw, height: dh },
        altText: { title: caption || "figure", description: caption || "figure", name: caption || "figure" },
      })],
    }),
  ];
  if (caption) {
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "555555" })],
    }));
  }
  return out;
}

// Inline parser: **bold**, `code`, [text](url)
function parseInline(text, base = {}) {
  const runs = [];
  // tokenize
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    if (m[1]) {
      runs.push(new TextRun({ text: m[2], bold: true, ...base }));
    } else if (m[3]) {
      runs.push(new TextRun({ text: m[4], font: "Consolas", size: (base.size || 22) - 2, ...base }));
    } else if (m[5]) {
      const label = m[6], url = m[7];
      if (/^https?:\/\//.test(url)) {
        runs.push(new ExternalHyperlink({ link: url, children: [new TextRun({ text: label, style: "Hyperlink" })] }));
      } else {
        runs.push(new TextRun({ text: label, ...base }));
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...base }));
  return runs.length ? runs : [new TextRun({ text: "", ...base })];
}

function colWidths(n) {
  const base = Math.floor(CONTENT_WIDTH / n);
  const arr = Array(n).fill(base);
  arr[n - 1] = CONTENT_WIDTH - base * (n - 1);
  return arr;
}

function buildTable(rows) {
  const ncols = rows[0].length;
  const widths = colWidths(ncols);
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const nrows = rows.length;

  // Determine vertical-merge role per cell: an empty body cell continues the
  // cell above; the nearest non-empty cell above it starts the merge.
  // role[r][c] = "restart" | "continue" | null
  const role = rows.map(r => r.map(() => null));
  for (let c = 0; c < ncols; c++) {
    for (let r = 1; r < nrows; r++) {
      if (rows[r][c].trim() === "") {
        role[r][c] = "continue";
        // walk up to the start of this merge run and mark it restart
        let k = r - 1;
        while (k >= 1 && rows[k][c].trim() === "") k--;
        if (k >= 1) role[k][c] = "restart";
      }
    }
  }

  const trs = rows.map((cells, ri) => new TableRow({
    tableHeader: ri === 0,
    children: cells.map((c, ci) => {
      const r = role[ri][ci];
      const opts = {
        borders,
        width: { size: widths[ci], type: WidthType.DXA },
        shading: ri === 0 ? { fill: "1F3864", type: ShadingType.CLEAR, color: "auto" } : { fill: "FFFFFF", type: ShadingType.CLEAR, color: "auto" },
        margins: { top: 60, bottom: 60, left: 110, right: 110 },
        verticalAlign: VerticalAlign.CENTER,
      };
      if (r === "continue") {
        opts.verticalMerge = VerticalMergeType.CONTINUE;
        opts.children = [new Paragraph({ spacing: { after: 0 }, children: [] })];
      } else {
        if (r === "restart") opts.verticalMerge = VerticalMergeType.RESTART;
        opts.children = [new Paragraph({
          spacing: { after: 0 },
          children: parseInline(c, ri === 0 ? { bold: true, color: "FFFFFF", size: 20 } : { size: 20 }),
        })];
      }
      return new TableCell(opts);
    }),
  }));
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: trs,
  });
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map(x => x.trim());
}

const md = fs.readFileSync(MD, "utf8");
const lines = md.split(/\r?\n/);

// find start of section 1
let start = lines.findIndex(l => /^##\s+1\.\s+Introduction/.test(l));
if (start < 0) start = 0;

const body = [];
let i = start;
while (i < lines.length) {
  let line = lines[i];

  // blank
  if (line.trim() === "") { i++; continue; }

  // horizontal rule
  if (/^---+$/.test(line.trim())) { i++; continue; }

  // code fence
  if (line.trim().startsWith("```")) {
    const lang = line.trim().slice(3).trim().toLowerCase();
    const buf = [];
    i++;
    while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(lines[i]); i++; }
    i++; // skip closing fence
    if (lang === "mermaid") {
      const img = mermaidImages[mermaidIdx++];
      const cap = mermaidIdx === 1 ? "Figure 3.1 — System architecture" : "Figure 3.2 — Domain class diagram";
      body.push(...imageParagraph(img, cap));
    } else {
      // code block: monospace shaded lines
      buf.forEach((cl, idx) => body.push(new Paragraph({
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR, color: "auto" },
        spacing: { before: idx === 0 ? 80 : 0, after: idx === buf.length - 1 ? 120 : 0 },
        children: [new TextRun({ text: cl || " ", font: "Consolas", size: 18 })],
      })));
    }
    continue;
  }

  // image ![alt](path)
  const im = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
  if (im) {
    const cap = im[1];
    let p = im[2];
    const abs = path.resolve(ROOT, p);
    body.push(...imageParagraph(abs, cap));
    i++;
    continue;
  }

  // headings
  let hm = line.match(/^(#{2,4})\s+(.*)$/);
  if (hm) {
    const level = hm[1].length; // 2,3,4
    const txt = hm[2].trim();
    const heading = level === 2 ? HeadingLevel.HEADING_1 : level === 3 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
    body.push(new Paragraph({ heading, children: parseInline(txt) }));
    i++;
    continue;
  }

  // table
  if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) && lines[i + 1].includes("-")) {
    const rows = [];
    rows.push(splitRow(line));
    i += 2; // skip header + separator
    while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(splitRow(lines[i])); i++; }
    body.push(buildTable(rows));
    body.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    continue;
  }

  // blockquote
  if (line.trim().startsWith(">")) {
    const txt = line.trim().replace(/^>\s?/, "");
    body.push(new Paragraph({
      indent: { left: 480 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: "1F3864", space: 12 } },
      spacing: { before: 80, after: 80 },
      children: parseInline(txt, { italics: true }),
    }));
    i++;
    continue;
  }

  // bullet list
  if (/^\s*[-*]\s+/.test(line)) {
    while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
      const indent = lines[i].match(/^(\s*)/)[1].length;
      const lvl = indent >= 2 ? 1 : 0;
      const txt = lines[i].replace(/^\s*[-*]\s+/, "");
      body.push(new Paragraph({ numbering: { reference: "bullets", level: lvl }, spacing: { after: 40 }, children: parseInline(txt) }));
      i++;
    }
    continue;
  }

  // numbered list
  if (/^\s*\d+\.\s+/.test(line)) {
    while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
      const txt = lines[i].replace(/^\s*\d+\.\s+/, "");
      body.push(new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 40 }, children: parseInline(txt) }));
      i++;
    }
    continue;
  }

  // paragraph
  body.push(new Paragraph({ spacing: { after: 120 }, children: parseInline(line.trim()) }));
  i++;
}

// ---- Title page (matches the provided template layout) ----
const bigTitle = (t, before) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: before || 0, after: 40, line: 340 },
  children: [new TextRun({ text: t, size: 44, font: "Calibri", color: "000000" })],
});
const title = [
  bigTitle("CSE 444 Software Engineering II", 1500),
  bigTitle("Project Report"),
  bigTitle("for"),
  bigTitle("Online Quiz and Exam System"),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1700, after: 40 },
    children: [new TextRun({ text: "1.0", size: 22, font: "Calibri" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: "June 19, 2026", size: 22, font: "Calibri" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400, after: 120 },
    children: [new TextRun({ text: "Prepared by", bold: true, size: 22, font: "Calibri" })] }),
  ...["Alper Kaan Güler", "Furkan Filicioğlu", "Ömer Faruk Koç", "Yunus Emre Türk"].map(n =>
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 },
      children: [new TextRun({ text: n, size: 22, font: "Calibri" })] })),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- TOC (title is a plain styled paragraph so it does not list itself) ----
const toc = [
  new Paragraph({ spacing: { after: 200 },
    children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 30, font: "Calibri", color: "1F3864" })] }),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Calibri", color: "1F3864" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, font: "Calibri", color: "2E4D7B" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Calibri", color: "333333" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 280 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
      ]},
    ],
  },
  sections: [{
    properties: {
      titlePage: true, // first page (cover) gets the empty "first" header
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({ children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB", space: 4 } },
        children: [
          new TextRun({ text: "Online Quiz and Exam System — Term Project Report", size: 16, color: "777777" }),
          new TextRun({ text: "\tIssue 1.0 · June 2026", size: 16, color: "777777" }),
        ],
      })] }),
    },
    children: [...title, ...toc, ...body],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("Wrote", OUT, "(" + buf.length + " bytes)");
  console.log("Mermaid images used:", mermaidIdx);
});
