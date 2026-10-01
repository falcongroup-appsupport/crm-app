import { FieldLabel, Input, Select, FormRow, FieldError } from "../../../shared/components/forms";
import { FileUpload } from "../../../shared/components/forms/FileUpload";
import { PROJECT_LEADS } from "../constants/enquiryStatus";

export function SiteVisitFormSection({ siteVisit, onChange, permitFiles, onPermitFilesChange, allowUploads = true, maxSizeMB = 0, errors = {} }) {
  const sv = siteVisit ?? {};
  const set = (patch) => onChange({ ...sv, ...patch });
  const required = Boolean(sv.siteVisitRequired);
  const err = (key) => errors[`siteVisit.${key}`];
  const assignees = PROJECT_LEADS.filter((p) => p !== "No Lead");
  const assigneeOptions = sv.siteVisitAssignedTo && !assignees.includes(sv.siteVisitAssignedTo) ? [sv.siteVisitAssignedTo, ...assignees] : assignees;

  return (
    <div className="space-y-4">
      <FormRow>
        <div>
          <FieldLabel>Site visit</FieldLabel>
          <Select value={required ? "REQUIRED" : "SELECT"} onChange={(e) => set({ siteVisitRequired: e.target.value === "REQUIRED" })}>
            <option value="SELECT">Not required</option>
            <option value="REQUIRED">Required</option>
          </Select>
        </div>
        {required && (
          <>
            <div>
              <FieldLabel>Gate pass</FieldLabel>
              <Select value={sv.gatePassRequired ? "REQUIRED" : "SELECT"} onChange={(e) => set({ gatePassRequired: e.target.value === "REQUIRED" })}>
                <option value="SELECT">Not required</option>
                <option value="REQUIRED">Required</option>
              </Select>
            </div>
            <div>
              <FieldLabel required>Site visit assigned to</FieldLabel>
              <Select value={sv.siteVisitAssignedTo || ""} aria-invalid={Boolean(err("siteVisitAssignedTo"))} onChange={(e) => set({ siteVisitAssignedTo: e.target.value })}>
                <option value="">Select…</option>
                {assigneeOptions.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <FieldError>{err("siteVisitAssignedTo")}</FieldError>
            </div>
            <div>
              <FieldLabel required>Site visit date</FieldLabel>
              <Input type="datetime-local" value={sv.siteVisitDate || ""} aria-invalid={Boolean(err("siteVisitDate"))} onChange={(e) => set({ siteVisitDate: e.target.value })} />
              <FieldError>{err("siteVisitDate")}</FieldError>
            </div>
            <div>
              <FieldLabel required>Contact person</FieldLabel>
              <Input value={sv.contactPerson || ""} aria-invalid={Boolean(err("contactPerson"))} onChange={(e) => set({ contactPerson: e.target.value })} />
              <FieldError>{err("contactPerson")}</FieldError>
            </div>
            <div>
              <FieldLabel required>Contact number</FieldLabel>
              <Input type="tel" value={sv.contactNumber || ""} aria-invalid={Boolean(err("contactNumber"))} onChange={(e) => set({ contactNumber: e.target.value })} placeholder="+971 5X XXX XXXX" />
              <FieldError>{err("contactNumber")}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Google map link</FieldLabel>
              <Input value={sv.googleMapLink || ""} aria-invalid={Boolean(err("googleMapLink"))} onChange={(e) => set({ googleMapLink: e.target.value })} placeholder="https://maps.google.com/…" />
              <FieldError>{err("googleMapLink")}</FieldError>
            </div>
          </>
        )}
      </FormRow>

      {required && allowUploads && sv.gatePassRequired && (
        <FileUpload label="Attach permit copy" files={permitFiles} onChange={onPermitFilesChange} defaultType="PERMIT" maxSizeMB={maxSizeMB} />
      )}
    </div>
  );
}
