import { Trash2 } from "lucide-react";
import { FieldLabel, Input, Select, FormRow } from "../../../shared/components/forms";
import { ScopeOfServicesTable } from "./ScopeOfServicesTable";
import { COUNTRIES, EMIRATES } from "../constants/enquiryStatus";

export function ProjectInformationBlock({ index, project, activities, onChange, onRemove, removable }) {
  const set = (patch) => onChange({ ...project, ...patch });

  return (
    <div className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-ink-500 dark:text-ink-400">Project {index + 1}</p>
        {removable && (
          <button type="button" onClick={onRemove} className="flex items-center gap-1 text-xs font-medium text-signal-600 hover:text-signal-700">
            <Trash2 className="h-3.5 w-3.5" />
            Remove project
          </button>
        )}
      </div>

      <FormRow cols={1}>
        <div>
          <FieldLabel required>Project name</FieldLabel>
          <Input required value={project.projectName} onChange={(e) => set({ projectName: e.target.value })} placeholder="Proposed G+1 Villa at Dubai" />
        </div>
      </FormRow>

      <div className="mt-4">
        <FormRow>
          <div>
            <FieldLabel>Country</FieldLabel>
            <Select value={project.country} onChange={(e) => set({ country: e.target.value, emirate: "" })}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Emirate</FieldLabel>
            <Select
              value={project.emirate}
              onChange={(e) => set({ emirate: e.target.value })}
              disabled={project.country !== "United Arab Emirates"}
            >
              <option value="">Select emirate…</option>
              {EMIRATES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </Select>
          </div>
        </FormRow>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">Scope of services</p>
        <ScopeOfServicesTable
          scopes={project.scopeOfServices}
          activities={activities}
          onChange={(scopeOfServices) => set({ scopeOfServices })}
        />
      </div>
    </div>
  );
}
