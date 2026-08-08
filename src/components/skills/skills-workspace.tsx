"use client"

import { useMemo, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import {
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { saveSkillsAction } from "@/app/(main)/skills/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  type SkillCategory,
} from "@/lib/skills"

type EditableSkill = {
  id: string
  name: string
  category: SkillCategory
}

function normalizeSkills(skills: EditableSkill[]) {
  return skills.map(({ name, category }) => ({ name: name.trim(), category }))
}

function skillSnapshot(skills: EditableSkill[]) {
  return JSON.stringify(normalizeSkills(skills))
}

function SkillCategorySelect({
  value,
  onChange,
  label,
}: {
  value: SkillCategory
  onChange: (value: SkillCategory) => void
  label: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as SkillCategory)}
    >
      <SelectTrigger className="w-full" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SKILL_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {SKILL_CATEGORY_LABELS[category]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SkillsHero({ count }: { count: number }) {
  return (
    <section className="rounded-4xl border border-border/70 bg-linear-to-br from-card via-card to-secondary/45 px-6 py-8 shadow-lg sm:px-8 sm:py-10 dark:border-white/8 dark:from-background dark:via-card/25 dark:to-card/35">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <BrainCircuit className="size-3.5" />
            Skills management
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              Make your capabilities easy to scan.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Add the skills you want to claim publicly, group them by type, and
              order the strongest signals first. Skills are clearly shown as
              self-declared on your profile.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/70 px-5 py-4 text-sm dark:border-white/8">
          <span className="text-2xl font-semibold tracking-[-0.04em]">
            {count}
          </span>{" "}
          <span className="text-muted-foreground">of 30 skills added</span>
        </div>
      </div>
    </section>
  )
}

function AddSkillSection({
  count,
  onAdd,
}: {
  count: number
  onAdd: (name: string, category: SkillCategory) => boolean
}) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<SkillCategory>("technical")

  const addSkill = () => {
    if (onAdd(name, category)) setName("")
  }

  return (
    <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-8 dark:border-white/8 dark:bg-card/70">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Add a skill
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          What do you want to be known for?
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="new-skill">Skill name</Label>
          <Input
            id="new-skill"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addSkill()
              }
            }}
            placeholder="e.g. TypeScript"
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <SkillCategorySelect
            value={category}
            onChange={setCategory}
            label="New skill category"
          />
        </div>
        <Button
          type="button"
          onClick={addSkill}
          disabled={!name.trim() || count >= 30}
          className="rounded-full"
        >
          <Plus />
          Add skill
        </Button>
      </div>
    </section>
  )
}

function SkillRow({
  skill,
  index,
  last,
  onUpdate,
  onMove,
  onRemove,
}: {
  skill: EditableSkill
  index: number
  last: boolean
  onUpdate: (id: string, update: Partial<EditableSkill>) => void
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/55 p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-center dark:border-white/8">
      <Input
        value={skill.name}
        onChange={(event) => onUpdate(skill.id, { name: event.target.value })}
        aria-label={`Skill ${index + 1} name`}
        maxLength={60}
      />
      <SkillCategorySelect
        value={skill.category}
        onChange={(category) => onUpdate(skill.id, { category })}
        label={`${skill.name} category`}
      />
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          aria-label={`Move ${skill.name} up`}
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMove(index, 1)}
          disabled={last}
          aria-label={`Move ${skill.name} down`}
        >
          <ArrowDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(skill.id)}
          aria-label={`Remove ${skill.name}`}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

function SkillsListSection({
  skills,
  isDirty,
  isPending,
  onSave,
  onUpdate,
  onMove,
  onRemove,
}: {
  skills: EditableSkill[]
  isDirty: boolean
  isPending: boolean
  onSave: () => void
  onUpdate: (id: string, update: Partial<EditableSkill>) => void
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (id: string) => void
}) {
  return (
    <section className="rounded-4xl border border-border/70 bg-card/92 p-6 shadow-md sm:p-8 dark:border-white/8 dark:bg-card/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Public skill set
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Arrange your skills
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Edit labels in place and use the arrows to set their public order.
          </p>
        </div>
        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isPending}
          className="rounded-full"
        >
          {isPending ? <Spinner className="size-4" /> : <Save />}
          Save changes
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="mt-7 rounded-3xl border border-dashed border-border bg-secondary/25 px-6 py-12 text-center">
          <BrainCircuit className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-medium">No skills added yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a few focused skills to make your profile easier to understand.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {skills.map((skill, index) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              index={index}
              last={index === skills.length - 1}
              onUpdate={onUpdate}
              onMove={onMove}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function SkillsWorkspace({
  initialSkills,
}: {
  initialSkills: Array<{ id: string; name: string; category: string }>
}) {
  const parsedInitialSkills = useMemo(
    () =>
      initialSkills.map((skill) => ({
        ...skill,
        category: SKILL_CATEGORIES.includes(skill.category as SkillCategory)
          ? (skill.category as SkillCategory)
          : "technical",
      })),
    [initialSkills]
  )
  const [skills, setSkills] = useState<EditableSkill[]>(parsedInitialSkills)
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    skillSnapshot(parsedInitialSkills)
  )
  const draftId = useRef(0)

  const { execute, isPending } = useAction(saveSkillsAction, {
    onSuccess: ({ data }) => {
      if (data?.failure || !data?.skills) {
        toast.error(data?.failure ?? "We could not save your skills right now.")
        return
      }

      const persisted = data.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category as SkillCategory,
      }))
      setSkills(persisted)
      setSavedSnapshot(skillSnapshot(persisted))
      toast.success(data.success)
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "We could not save your skills right now."
      )
    },
  })

  const addSkill = (nameValue: string, category: SkillCategory) => {
    const name = nameValue.trim()
    if (!name) return false
    if (
      skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())
    ) {
      toast.error("That skill is already in your list.")
      return false
    }
    if (skills.length >= 30) {
      toast.error("You can add up to 30 skills.")
      return false
    }

    draftId.current += 1
    setSkills((current) => [
      ...current,
      { id: `new-${draftId.current}`, name, category },
    ])
    return true
  }

  const updateSkill = (id: string, update: Partial<EditableSkill>) => {
    setSkills((current) =>
      current.map((skill) =>
        skill.id === id ? { ...skill, ...update } : skill
      )
    )
  }

  const moveSkill = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= skills.length) return
    setSkills((current) => {
      const next = [...current]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  const saveSkills = () => {
    const normalized = normalizeSkills(skills)
    if (normalized.some((skill) => !skill.name)) {
      toast.error("Every skill needs a name.")
      return
    }
    const uniqueNames = new Set(
      normalized.map((skill) => skill.name.toLowerCase())
    )
    if (uniqueNames.size !== normalized.length) {
      toast.error("Each skill must be unique.")
      return
    }
    execute({ skills: normalized })
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-10">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_30%),linear-gradient(180deg,rgba(71,85,105,0.08),transparent_78%)]" />
      <SkillsHero count={skills.length} />
      <AddSkillSection count={skills.length} onAdd={addSkill} />
      <SkillsListSection
        skills={skills}
        isDirty={skillSnapshot(skills) !== savedSnapshot}
        isPending={isPending}
        onSave={saveSkills}
        onUpdate={updateSkill}
        onMove={moveSkill}
        onRemove={(id) =>
          setSkills((current) => current.filter((skill) => skill.id !== id))
        }
      />
    </div>
  )
}
