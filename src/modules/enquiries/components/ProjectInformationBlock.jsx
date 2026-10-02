import { Trash2 } from "lucide-react";
import {
  FieldLabel,
  Input,
  Select,
  FormRow,
  FieldError,
} from "../../../shared/components/forms";
import { ScopeOfServicesTable } from "./ScopeOfServicesTable";
import { COUNTRIES, EMIRATES } from "../constants/enquiryStatus";
import { isUae } from "../schemas/enquiry.schema";

export function ProjectInformationBlock({
  index,
  project,
  activities,
  onChange,
  onRemove,
  removable,
  errors = {},
  lockSaved = false,
}) {
  const set = (patch) => onChange({ ...project, ...patch });
  const k = `projects.${index}`;
  const countries =
    COUNTRIES.includes(project.country) || !project.country
      ? COUNTRIES
      : [project.country, ...COUNTRIES];

  return (
    <div className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-ink-500 dark:text-ink-400">
          Project {index + 1}
        </p>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs font-medium text-signal-600 hover:text-signal-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove project
          </button>
        )}
      </div>

      <FormRow>
        <div className="sm:col-span-2">
          <FieldLabel required>Project name</FieldLabel>
          <Input
            value={project.projectName}
            aria-invalid={Boolean(errors[`${k}.projectName`])}
            onChange={(e) => set({ projectName: e.target.value })}
            placeholder="Proposed G+1 Villa at Dubai"
          />
          <FieldError>{errors[`${k}.projectName`]}</FieldError>
        </div>
        <div>
          <FieldLabel required>Country</FieldLabel>
          <Select
            value={project.country}
            aria-invalid={Boolean(errors[`${k}.country`])}
            onChange={(e) =>
              set({
                country: e.target.value,
                emirate: isUae(e.target.value) ? project.emirate : "",
              })
            }
          >
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <FieldError>{errors[`${k}.country`]}</FieldError>
        </div>
        <div>
          <FieldLabel required={isUae(project.country)}>Emirate</FieldLabel>
          <Select
            value={project.emirate}
            aria-invalid={Boolean(errors[`${k}.emirate`])}
            onChange={(e) => set({ emirate: e.target.value })}
            disabled={!isUae(project.country)}
          >
            <option value="">Select emirate…</option>
            {EMIRATES.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
          <FieldError>{errors[`${k}.emirate`]}</FieldError>
        </div>
      </FormRow>

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">
          Scope of services
        </p>
        <ScopeOfServicesTable
          scopes={project.scopeOfServices}
          activities={activities}
          onChange={(scopeOfServices) => set({ scopeOfServices })}
          errors={errors}
          prefix={`${k}.scope`}
          lockSaved={lockSaved}
        />
      </div>
    </div>
  );
}
