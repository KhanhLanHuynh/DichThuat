"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBar } from "@/components/layout/StatusBar";
import { ParagraphSidebar } from "@/components/paragraphs/ParagraphSidebar";
import { TranslationWorkspace } from "@/components/editor/TranslationWorkspace";
import {
  TranslateOverlay,
  type TranslatePhase,
} from "@/components/editor/TranslateOverlay";
import { GlossarySidebar } from "@/components/glossary/GlossarySidebar";
import { GlossaryEditModal } from "@/components/glossary/GlossaryEditModal";
import { ContextModal } from "@/components/editor/ContextModal";
import type { GlossaryTerm } from "@/lib/glossary";
import { dedupeByZh, findTermsInText } from "@/lib/glossary";
import {
  countChineseChars,
  countVietnameseWords,
  getContentParagraphIndices,
  prevContentParagraphIndex,
  nextContentParagraphIndex,
  joinParagraphs,
  splitParagraphs,
  paragraphsFromFullText,
} from "@/lib/paragraphs";
import type { ParagraphViewMode } from "@/components/paragraphs/ParagraphNav";
import type { ProjectData } from "@/lib/files";

interface EditorClientProps {
  projectId: string;
  initial: ProjectData & { terms: GlossaryTerm[]; user?: { username: string } | null };
}

export function EditorClient({ projectId, initial }: EditorClientProps) {
  const [zhParagraphs, setZhParagraphs] = useState(initial.zhParagraphs);
  const [hvParagraphs, setHvParagraphs] = useState(initial.hvParagraphs);
  const [viParagraphs, setViParagraphs] = useState(initial.viParagraphs);
  const [sourceFiles, setSourceFiles] = useState(initial.sourceFiles);
  const [currentSource, setCurrentSource] = useState(initial.currentSource);
  const [terms, setTerms] = useState(initial.terms);
  const contentIndices = useMemo(
    () =>
      getContentParagraphIndices(zhParagraphs, hvParagraphs, viParagraphs),
    [zhParagraphs, hvParagraphs, viParagraphs]
  );
  const [paragraphIndex, setParagraphIndex] = useState(
    () => contentIndices[0] ?? 0
  );
  const [viewMode, setViewMode] = useState<ParagraphViewMode>("single");
  const [search, setSearch] = useState("");
  const [syncScroll, setSyncScroll] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [translatingLayer, setTranslatingLayer] = useState<"hv" | "vi" | null>(
    null
  );
  const [translateProgress, setTranslateProgress] = useState<{
    index: number;
    total: number;
  } | null>(null);
  const [translateStatus, setTranslateStatus] =
    useState<TranslatePhase>("connecting");
  const [lastSaved, setLastSaved] = useState(
    initial.lastSaved?.vi ?? initial.lastSaved?.hv
  );
  const [alignmentWarning, setAlignmentWarning] = useState(
    initial.alignment.message
  );
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [glossarySaving, setGlossarySaving] = useState(false);
  const [glossaryError, setGlossaryError] = useState<string | undefined>();

  const zhFull = useMemo(() => joinParagraphs(zhParagraphs), [zhParagraphs]);
  const hvFull = useMemo(() => joinParagraphs(hvParagraphs), [hvParagraphs]);
  const viFull = useMemo(() => joinParagraphs(viParagraphs), [viParagraphs]);

  const displayZh =
    viewMode === "all" ? zhFull : (zhParagraphs[paragraphIndex] ?? "");
  const displayHv =
    viewMode === "all" ? hvFull : (hvParagraphs[paragraphIndex] ?? "");
  const displayVi =
    viewMode === "all" ? viFull : (viParagraphs[paragraphIndex] ?? "");

  const activeTerms = findTermsInText(
    viewMode === "all" ? zhFull : (zhParagraphs[paragraphIndex] ?? ""),
    terms
  );
  const totalZhChars = zhParagraphs.reduce(
    (s, p) => s + countChineseChars(p),
    0
  );
  const totalViWords = viParagraphs.reduce(
    (s, p) => s + countVietnameseWords(p),
    0
  );
  const totalParagraphs = Math.max(
    zhParagraphs.length,
    hvParagraphs.length,
    viParagraphs.length
  );

  useEffect(() => {
    fetch(`/api/projects/${projectId}/lock`, { method: "POST" }).catch(() => {});
    return () => {
      fetch(`/api/projects/${projectId}/lock`, { method: "DELETE" }).catch(
        () => {}
      );
    };
  }, [projectId]);

  const updateAlignmentWarning = useCallback(
    (hv: string[], vi: string[]) => {
      const zhCount = zhParagraphs.length;
      const hvCount = hv.length;
      const viCount = vi.length;
      if (zhCount === hvCount && zhCount === viCount) {
        setAlignmentWarning(undefined);
      } else {
        setAlignmentWarning(`ZH ${zhCount} · HV ${hvCount} · VI ${viCount}`);
      }
    },
    [zhParagraphs.length]
  );

  const updateHv = useCallback(
    (v: string) => {
      if (viewMode === "all") {
        const split = splitParagraphs(v);
        if (split.length !== zhParagraphs.length) {
          setAlignmentWarning(
            `Edited ${split.length} lines · ZH ${zhParagraphs.length}`
          );
        }
        const nextHv = paragraphsFromFullText(v, zhParagraphs.length);
        setHvParagraphs(nextHv);
        updateAlignmentWarning(nextHv, viParagraphs);
      } else {
        setHvParagraphs((prev) => {
          if (prev[paragraphIndex] === v) return prev;
          const next = [...prev];
          next[paragraphIndex] = v;
          return next;
        });
      }
      setDirty(true);
    },
    [paragraphIndex, viewMode, zhParagraphs.length, viParagraphs, updateAlignmentWarning]
  );

  const updateVi = useCallback(
    (v: string) => {
      if (viewMode === "all") {
        const split = splitParagraphs(v);
        if (split.length !== zhParagraphs.length) {
          setAlignmentWarning(
            `Edited ${split.length} lines · ZH ${zhParagraphs.length}`
          );
        }
        const nextVi = paragraphsFromFullText(v, zhParagraphs.length);
        setViParagraphs(nextVi);
        updateAlignmentWarning(hvParagraphs, nextVi);
      } else {
        setViParagraphs((prev) => {
          if (prev[paragraphIndex] === v) return prev;
          const next = [...prev];
          next[paragraphIndex] = v;
          return next;
        });
      }
      setDirty(true);
    },
    [paragraphIndex, viewMode, zhParagraphs.length, hvParagraphs, updateAlignmentWarning]
  );

  const seriesPrefix = `sources/${initial.manifest.series}/`;

  const sourceLabel = useCallback(
    (filePath: string) =>
      filePath.startsWith(seriesPrefix)
        ? filePath.slice(seriesPrefix.length)
        : filePath,
    [seriesPrefix]
  );

  const sourceSubtitle = useCallback(
    (filePath: string) => {
      const label = sourceLabel(filePath).replace(/\.zh\.md$/i, "");
      return `${initial.manifest.series} · ${label}`;
    },
    [initial.manifest.series, sourceLabel]
  );

  const applyChapterData = useCallback(
    (data: {
      zhParagraphs: string[];
      hvParagraphs: string[];
      viParagraphs: string[];
      currentSource: string;
      sourceFiles?: string[];
      alignment?: { message?: string };
      lastSaved?: { zh?: string; hv?: string; vi?: string };
    }) => {
      setZhParagraphs(data.zhParagraphs);
      setHvParagraphs(data.hvParagraphs);
      setViParagraphs(data.viParagraphs);
      setCurrentSource(data.currentSource);
      if (data.sourceFiles) setSourceFiles(data.sourceFiles);
      setAlignmentWarning(data.alignment?.message);
      setLastSaved(data.lastSaved?.vi ?? data.lastSaved?.hv);
      const indices = getContentParagraphIndices(
        data.zhParagraphs,
        data.hvParagraphs,
        data.viParagraphs
      );
      setParagraphIndex(indices[0] ?? 0);
      setDirty(false);
    },
    []
  );

  const handleSourceChange = async (path: string) => {
    if (path === currentSource) return;
    if (dirty && !confirm("You have unsaved changes. Switch source file anyway?")) {
      return;
    }
    setLoadingSource(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}?source=${encodeURIComponent(path)}`
      );
      if (!res.ok) throw new Error("Failed to load source file");
      const data = await res.json();
      applyChapterData(data);
    } catch {
      alert("Failed to load source file.");
    } finally {
      setLoadingSource(false);
    }
  };

  const resolveUploadRelativePath = (file: File): string => {
    const name = file.name.replace(/\\/g, "/");
    if (name.includes("/")) return name;
    const volume = initial.manifest.volume;
    if (volume && !name.startsWith(`${volume}/`)) {
      return `${volume}/${name}`;
    }
    return name;
  };

  const handleSourceUpload = async (file: File) => {
    if (!/\.zh\.md$/i.test(file.name)) {
      alert("Source file must have .zh.md extension.");
      return;
    }
    if (dirty && !confirm("You have unsaved changes. Upload a new source file anyway?")) {
      return;
    }

    const relativePath = resolveUploadRelativePath(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("relativePath", relativePath);

    const postUpload = async (overwrite: boolean) => {
      setUploading(true);
      try {
        const url = `/api/projects/${projectId}/sources${
          overwrite ? "?overwrite=1" : ""
        }`;
        const res = await fetch(url, { method: "POST", body: formData });
        if (res.status === 409) {
          if (
            confirm(
              `A file already exists at ${relativePath}. Overwrite it?`
            )
          ) {
            await postUpload(true);
          }
          return;
        }
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Upload failed");
        }
        const data = await res.json();
        applyChapterData(data);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    };

    await postUpload(false);
  };

  const handleSourceRemove = async () => {
    if (!currentSource) return;
    if (dirty && !confirm("Bạn có thay đổi chưa lưu. Vẫn xóa tệp nguồn này?")) {
      return;
    }
    if (
      !confirm(
        `Xóa ${sourceLabel(currentSource)} và các bản dịch kèm theo? Thao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    setRemoving(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/sources?source=${encodeURIComponent(currentSource)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Remove failed");
      }
      const data = await res.json();
      applyChapterData(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Remove failed.");
    } finally {
      setRemoving(false);
    }
  };

  const handleGlossarySave = async (hv: string, vi: string) => {
    if (!editingTerm) return;
    setGlossarySaving(true);
    setGlossaryError(undefined);
    try {
      const res = await fetch(`/api/projects/${projectId}/glossary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zh: editingTerm.zh, hv, vi }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        term?: GlossaryTerm;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Glossary save failed");
      }
      if (data.term) {
        setTerms((prev) =>
          prev.map((t) => (t.zh === data.term!.zh ? data.term! : t))
        );
      }
      setEditingTerm(null);
    } catch (e) {
      setGlossaryError(
        e instanceof Error ? e.message : "Glossary save failed"
      );
    } finally {
      setGlossarySaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePath: currentSource,
          hvParagraphs,
          viParagraphs,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setDirty(false);
      setLastSaved(new Date().toISOString());
      setAlignmentWarning(data.alignment?.message);
      if (data.sourceFiles) setSourceFiles(data.sourceFiles);
    } catch {
      alert("Failed to save. Check you are logged in.");
    } finally {
      setSaving(false);
    }
  };

  const streamChapterTranslate = async (layer: "hv" | "vi") => {
    if (
      dirty &&
      !confirm(
        "You have unsaved changes. Machine-translate anyway? This will overwrite translation fields."
      )
    ) {
      return;
    }

    setTranslatingLayer(layer);
    setTranslateStatus("connecting");
    setTranslateProgress(null);
    const tokenBuffers = new Map<number, string>();

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sourcePath: currentSource,
          layer,
          scope: "chapter",
          editorHv: hvParagraphs,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Translation request failed");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const eventMatch = part.match(/^event: (\w+)\ndata: ([\s\S]+)$/);
          if (!eventMatch) continue;
          const [, event, dataStr] = eventMatch;
          const data = JSON.parse(dataStr) as {
            token?: string;
            paragraphIndex?: number;
            text?: string;
            index?: number;
            total?: number;
            message?: string;
            added?: GlossaryTerm[];
            warning?: string;
            alignmentWarning?: string;
            phase?: TranslatePhase;
          };
          if (event === "status" && data.phase) {
            setTranslateStatus(data.phase);
          }
          if (
            event === "progress" &&
            data.index !== undefined &&
            data.total !== undefined
          ) {
            setTranslateProgress({ index: data.index, total: data.total });
          }
          if (
            event === "token" &&
            data.token !== undefined &&
            data.paragraphIndex !== undefined
          ) {
            const idx = data.paragraphIndex;
            const next = (tokenBuffers.get(idx) ?? "") + data.token;
            tokenBuffers.set(idx, next);
            if (layer === "hv") {
              setHvParagraphs((prev) => {
                const copy = [...prev];
                copy[idx] = next;
                return copy;
              });
            } else {
              setViParagraphs((prev) => {
                const copy = [...prev];
                copy[idx] = next;
                return copy;
              });
            }
          }
          if (
            event === "paragraph" &&
            data.paragraphIndex !== undefined &&
            data.text !== undefined
          ) {
            const idx = data.paragraphIndex;
            tokenBuffers.set(idx, data.text);
            if (layer === "hv") {
              setHvParagraphs((prev) => {
                const copy = [...prev];
                copy[idx] = data.text!;
                return copy;
              });
            } else {
              setViParagraphs((prev) => {
                const copy = [...prev];
                copy[idx] = data.text!;
                return copy;
              });
            }
          }
          if (event === "glossary") {
            if (data.added && data.added.length > 0) {
              setTerms((prev) => dedupeByZh([...prev, ...data.added!]));
            }
          }
          if (event === "done" && data.alignmentWarning) {
            setAlignmentWarning(data.alignmentWarning);
          }
          if (event === "error") throw new Error(data.message);
        }
      }
      setDirty(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslatingLayer(null);
      setTranslateProgress(null);
      setTranslateStatus("connecting");
    }
  };

  const handleSelectParagraph = (index: number) => {
    setViewMode("single");
    setParagraphIndex(index);
  };

  const handleSelectAll = () => {
    setViewMode("all");
  };

  const goPrev = () => {
    if (viewMode === "all") return;
    setParagraphIndex((i) =>
      prevContentParagraphIndex(zhParagraphs, hvParagraphs, viParagraphs, i)
    );
  };
  const goNext = () => {
    if (viewMode === "all") return;
    setParagraphIndex((i) =>
      nextContentParagraphIndex(zhParagraphs, hvParagraphs, viParagraphs, i)
    );
  };

  const atFirstContent =
    contentIndices.length === 0 || paragraphIndex <= contentIndices[0];
  const atLastContent =
    contentIndices.length === 0 ||
    paragraphIndex >= contentIndices[contentIndices.length - 1];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && e.altKey && viewMode === "single") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowDown" && e.altKey && viewMode === "single") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title={initial.manifest.title}
        subtitle={sourceSubtitle(currentSource)}
        lastSaved={lastSaved}
        saving={saving}
        sourceFiles={sourceFiles}
        selectedSource={currentSource}
        sourceLabel={sourceLabel}
        loadingSource={loadingSource}
        uploading={uploading}
        removing={removing}
        canRemoveSource={Boolean(currentSource)}
        onSourceChange={handleSourceChange}
        onSourceUpload={handleSourceUpload}
        onSourceRemove={handleSourceRemove}
        onSave={handleSave}
        onTranslateHv={() => streamChapterTranslate("hv")}
        onTranslateVi={() => streamChapterTranslate("vi")}
        translatingLayer={translatingLayer}
        translateProgress={translateProgress}
        translateStatus={translateStatus}
        username={initial.user?.username}
      />
      <div className="flex min-h-0 flex-1">
        <ParagraphSidebar
          zhParagraphs={zhParagraphs}
          hvParagraphs={hvParagraphs}
          viParagraphs={viParagraphs}
          viewMode={viewMode}
          activeIndex={paragraphIndex}
          search={search}
          onSearchChange={setSearch}
          onSelectAll={handleSelectAll}
          onSelect={handleSelectParagraph}
        />
        <main className="relative flex min-w-0 flex-1 flex-col">
          {translatingLayer && (
            <TranslateOverlay
              layer={translatingLayer}
              phase={translateStatus}
              progress={translateProgress}
            />
          )}
          <TranslationWorkspace
            viewMode={viewMode}
            zhParagraph={displayZh}
            hvParagraph={displayHv}
            viParagraph={displayVi}
            paragraphIndex={paragraphIndex}
            totalParagraphs={totalParagraphs}
            atFirstContent={atFirstContent}
            atLastContent={atLastContent}
            syncScroll={syncScroll}
            onHvChange={updateHv}
            onViChange={updateVi}
            onSyncScrollChange={setSyncScroll}
            onPrev={goPrev}
            onNext={goNext}
            onContext={
              viewMode === "single" ? () => setShowContext(true) : undefined
            }
          />
        </main>
        <GlossarySidebar
          terms={terms}
          activeTerms={activeTerms}
          onEditTerm={(t) => {
            setGlossaryError(undefined);
            setEditingTerm(t);
          }}
        />
      </div>
      <StatusBar
        projectName={initial.manifest.series}
        sourceEdition={initial.manifest.source_edition}
        zhChars={totalZhChars}
        viWords={totalViWords}
        synced={!dirty && !saving}
        alignmentWarning={alignmentWarning}
      />
      {showContext && (
        <ContextModal
          paragraphIndex={paragraphIndex}
          zhParagraphs={zhParagraphs}
          hvParagraphs={hvParagraphs}
          viParagraphs={viParagraphs}
          totalParagraphs={totalParagraphs}
          onClose={() => setShowContext(false)}
        />
      )}
      {editingTerm && (
        <GlossaryEditModal
          term={editingTerm}
          saving={glossarySaving}
          error={glossaryError}
          onSave={handleGlossarySave}
          onClose={() => {
            if (!glossarySaving) setEditingTerm(null);
          }}
        />
      )}
    </div>
  );
}


