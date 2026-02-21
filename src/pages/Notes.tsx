import { FormEvent, useEffect, useMemo, useState } from "react"

type TodoItem = {
  id: string
  text: string
  done: boolean
}

type NoteItem = {
  id: string
  title: string
  content: string
  todos: TodoItem[]
  createdAt: string
  updatedAt: string
}

type PersistedState = {
  notes: NoteItem[]
  selectedNoteId: string | null
  inboxTodos: TodoItem[]
}

const STORAGE_KEY = "metro_notes_state_v1"

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
const nowIso = () => new Date().toISOString()

const createNewNote = (): NoteItem => {
  const timestamp = nowIso()
  return {
    id: createId(),
    title: "New note",
    content: "",
    todos: [],
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value))

const escapeHtml = (input: string) =>
  input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const formatInlineMarkup = (input: string) => {
  const escaped = escapeHtml(input)
  const codeTokens: string[] = []
  const withCodeTokens = escaped.replace(/`([^`]+)`/g, (_, codeText: string) => {
    const token = `@@CODE_${codeTokens.length}@@`
    codeTokens.push(`<code>${codeText}</code>`)
    return token
  })

  const formatted = withCodeTokens
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

  return formatted.replace(/@@CODE_(\d+)@@/g, (_, index: string) => codeTokens[Number(index)] ?? "")
}

const renderMarkup = (input: string) => {
  const lines = input.split(/\r?\n/)
  const html: string[] = []
  let inUnordered = false
  let inOrdered = false

  const closeLists = () => {
    if (inUnordered) {
      html.push("</ul>")
      inUnordered = false
    }
    if (inOrdered) {
      html.push("</ol>")
      inOrdered = false
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      closeLists()
      html.push('<div class="notes-preview-gap"></div>')
      return
    }

    if (/^###\s+/.test(trimmed)) {
      closeLists()
      html.push(`<h3>${formatInlineMarkup(trimmed.replace(/^###\s+/, ""))}</h3>`)
      return
    }

    if (/^##\s+/.test(trimmed)) {
      closeLists()
      html.push(`<h2>${formatInlineMarkup(trimmed.replace(/^##\s+/, ""))}</h2>`)
      return
    }

    if (/^#\s+/.test(trimmed)) {
      closeLists()
      html.push(`<h1>${formatInlineMarkup(trimmed.replace(/^#\s+/, ""))}</h1>`)
      return
    }

    const checklistMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/)
    if (checklistMatch) {
      if (inOrdered) {
        html.push("</ol>")
        inOrdered = false
      }
      if (!inUnordered) {
        html.push('<ul class="notes-preview-list notes-preview-checklist">')
        inUnordered = true
      }
      const done = checklistMatch[1].toLowerCase() === "x"
      const text = formatInlineMarkup(checklistMatch[2])
      html.push(`<li>${done ? "☑" : "☐"} ${text}</li>`)
      return
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      if (inOrdered) {
        html.push("</ol>")
        inOrdered = false
      }
      if (!inUnordered) {
        html.push('<ul class="notes-preview-list">')
        inUnordered = true
      }
      html.push(`<li>${formatInlineMarkup(bulletMatch[1])}</li>`)
      return
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (orderedMatch) {
      if (inUnordered) {
        html.push("</ul>")
        inUnordered = false
      }
      if (!inOrdered) {
        html.push('<ol class="notes-preview-list">')
        inOrdered = true
      }
      html.push(`<li>${formatInlineMarkup(orderedMatch[1])}</li>`)
      return
    }

    closeLists()
    html.push(`<p>${formatInlineMarkup(trimmed)}</p>`)
  })

  closeLists()
  return html.join("")
}

const loadState = (): PersistedState => {
  const fallbackNote = createNewNote()
  const fallbackState: PersistedState = {
    notes: [fallbackNote],
    selectedNoteId: fallbackNote.id,
    inboxTodos: []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallbackState

    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const notes = Array.isArray(parsed.notes) && parsed.notes.length > 0 ? parsed.notes : fallbackState.notes
    const selectedNoteId = typeof parsed.selectedNoteId === "string" ? parsed.selectedNoteId : notes[0].id
    const inboxTodos = Array.isArray(parsed.inboxTodos) ? parsed.inboxTodos : []
    return { notes, selectedNoteId, inboxTodos }
  } catch {
    return fallbackState
  }
}

export default function Notes() {
  const [state, setState] = useState<PersistedState>(() => loadState())
  const [query, setQuery] = useState("")
  const [inboxDraft, setInboxDraft] = useState("")
  const [noteTodoDraft, setNoteTodoDraft] = useState("")
  const [mode, setMode] = useState<"edit" | "preview">("edit")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return state.notes
    return state.notes.filter(
      (note) => note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
    )
  }, [query, state.notes])

  const selectedNote = useMemo(
    () => state.notes.find((note) => note.id === state.selectedNoteId) ?? null,
    [state.notes, state.selectedNoteId]
  )

  const previewHtml = useMemo(
    () => renderMarkup(selectedNote?.content ?? ""),
    [selectedNote?.content]
  )

  const setSelectedNoteField = (field: "title" | "content", value: string) => {
    if (!selectedNote) return
    const updatedAt = nowIso()
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              [field]: value,
              updatedAt
            }
          : note
      )
    }))
  }

  const addNote = () => {
    const note = createNewNote()
    setState((prev) => ({
      ...prev,
      notes: [note, ...prev.notes],
      selectedNoteId: note.id
    }))
    setMode("edit")
  }

  const deleteSelectedNote = () => {
    if (!selectedNote) return
    setState((prev) => {
      if (prev.notes.length <= 1) {
        const replacement = createNewNote()
        return {
          ...prev,
          notes: [replacement],
          selectedNoteId: replacement.id
        }
      }
      const nextNotes = prev.notes.filter((note) => note.id !== selectedNote.id)
      return {
        ...prev,
        notes: nextNotes,
        selectedNoteId: nextNotes[0]?.id ?? null
      }
    })
  }

  const addNoteTodo = (event: FormEvent) => {
    event.preventDefault()
    const text = noteTodoDraft.trim()
    if (!selectedNote || !text) return

    const nextTodo: TodoItem = { id: createId(), text, done: false }
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              todos: [...note.todos, nextTodo],
              updatedAt: nowIso()
            }
          : note
      )
    }))
    setNoteTodoDraft("")
  }

  const toggleNoteTodo = (todoId: string) => {
    if (!selectedNote) return
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              todos: note.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)),
              updatedAt: nowIso()
            }
          : note
      )
    }))
  }

  const removeNoteTodo = (todoId: string) => {
    if (!selectedNote) return
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              todos: note.todos.filter((todo) => todo.id !== todoId),
              updatedAt: nowIso()
            }
          : note
      )
    }))
  }

  const addInboxTodo = (event: FormEvent) => {
    event.preventDefault()
    const text = inboxDraft.trim()
    if (!text) return
    const todo: TodoItem = { id: createId(), text, done: false }
    setState((prev) => ({ ...prev, inboxTodos: [todo, ...prev.inboxTodos] }))
    setInboxDraft("")
  }

  const toggleInboxTodo = (todoId: string) => {
    setState((prev) => ({
      ...prev,
      inboxTodos: prev.inboxTodos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo))
    }))
  }

  const removeInboxTodo = (todoId: string) => {
    setState((prev) => ({
      ...prev,
      inboxTodos: prev.inboxTodos.filter((todo) => todo.id !== todoId)
    }))
  }

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <p className="notes-kicker">Notes</p>
          <h1>Notes & Tasks</h1>
          <p>Your notes are saved locally in this browser.</p>
        </div>
        <button type="button" className="notes-btn" onClick={addNote}>
          + New Note
        </button>
      </header>

      <section className="notes-layout">
        <aside className="notes-sidebar">
          <input
            className="notes-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes..."
          />

          <div className="notes-list">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={`notes-list-item ${note.id === state.selectedNoteId ? "is-active" : ""}`}
                onClick={() => setState((prev) => ({ ...prev, selectedNoteId: note.id }))}
              >
                <strong>{note.title || "Untitled note"}</strong>
                <span>{formatDateTime(note.updatedAt)}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="notes-editor">
          {selectedNote && (
            <>
              <div className="notes-editor-head">
                <input
                  className="notes-title-input"
                  type="text"
                  value={selectedNote.title}
                  onChange={(event) => setSelectedNoteField("title", event.target.value)}
                  placeholder="Note title"
                />
                <div className="notes-actions">
                  <button
                    type="button"
                    className={`notes-tab ${mode === "edit" ? "is-active" : ""}`}
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`notes-tab ${mode === "preview" ? "is-active" : ""}`}
                    onClick={() => setMode("preview")}
                  >
                    Preview
                  </button>
                  <button type="button" className="notes-btn notes-btn-danger" onClick={deleteSelectedNote}>
                    Delete
                  </button>
                </div>
              </div>

              {mode === "edit" ? (
                <textarea
                  className="notes-content-input"
                  value={selectedNote.content}
                  onChange={(event) => setSelectedNoteField("content", event.target.value)}
                  placeholder={"Write your note here...\n\nTry markup:\n# Heading\n- bullet\n1. numbered\n- [x] done"}
                />
              ) : (
                <div className="notes-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}

              <section className="notes-todos">
                <div className="notes-section-head">
                  <h2>Checklist</h2>
                </div>
                <form className="notes-inline-form" onSubmit={addNoteTodo}>
                  <input
                    type="text"
                    value={noteTodoDraft}
                    onChange={(event) => setNoteTodoDraft(event.target.value)}
                    placeholder="Add checklist item..."
                  />
                  <button type="submit" className="notes-btn">
                    Add
                  </button>
                </form>

                <ul className="notes-todo-list">
                  {selectedNote.todos.map((todo) => (
                    <li key={todo.id}>
                      <label>
                        <input type="checkbox" checked={todo.done} onChange={() => toggleNoteTodo(todo.id)} />
                        <span className={todo.done ? "is-done" : ""}>{todo.text}</span>
                      </label>
                      <button type="button" onClick={() => removeNoteTodo(todo.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </section>

      <section className="notes-inbox">
        <div className="notes-section-head">
          <h2>Quick Todos</h2>
          <span>{state.inboxTodos.length} items</span>
        </div>
        <form className="notes-inline-form" onSubmit={addInboxTodo}>
          <input
            type="text"
            value={inboxDraft}
            onChange={(event) => setInboxDraft(event.target.value)}
            placeholder="Add a quick task..."
          />
          <button type="submit" className="notes-btn">
            Add
          </button>
        </form>

        <ul className="notes-todo-list">
          {state.inboxTodos.map((todo) => (
            <li key={todo.id}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => toggleInboxTodo(todo.id)} />
                <span className={todo.done ? "is-done" : ""}>{todo.text}</span>
              </label>
              <button type="button" onClick={() => removeInboxTodo(todo.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
