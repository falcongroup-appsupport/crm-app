import { FieldLabel, Input, Select, FormRow } from "../../../shared/components/forms";
import { FileUpload } from "../../../shared/components/forms/FileUpload";
import { PROJECT_LEADS } from "../constants/enquiryStatus";

export function SiteVisitFormSection({ siteVisit, onChange, permitFiles, onPermitFilesChange }) {
  const set = (patch) => onChange({ ...siteVisit, ...patch });
  const required = Boolean(siteVisit.siteVisitRequired);

  return (
    <div className="space-y-4">
      <FormRow>
        <div>
          <FieldLabel>Site visit</FieldLabel>
          <Select
            value={required ? "REQUIRED" : "SELECT"}
            onChange={(e) => set({ siteVisitRequired: e.target.value === "REQUIRED" })}
          >
            <option value="SELECT">Select</option>
            <option value="REQUIRED">Required</option>
          </Select>
        </div>
        {required && (
          <div>
            <FieldLabel>Gate pass</FieldLabel>
            <Select
              value={siteVisit.gatePassRequired ? "REQUIRED" : "SELECT"}
              onChange={(e) => set({ gatePassRequired: e.target.value === "REQUIRED" })}
            >
              <option value="SELECT">Select</option>
              <option value="REQUIRED">Required</option>
            </Select>
          </div>
        )}
      </FormRow>

      {required && (
        <>
          <FormRow>
            <div>
              <FieldLabel>Site visit assigned to</FieldLabel>
              <Select value={siteVisit.siteVisitAssignedTo || ""} onChange={(e) => set({ siteVisitAssignedTo: e.target.value })}>
                <option value="">Select…</option>
                {PROJECT_LEADS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>Site visit date</FieldLabel>
              <Input type="datetime-local" value={siteVisit.siteVisitDate || ""} onChange={(e) => set({ siteVisitDate: e.target.value })} />
            </div>
          </FormRow>

          <FormRow>
            <div>
              <FieldLabel>Contact person</FieldLabel>
              <Input value={siteVisit.contactPerson || ""} onChange={(e) => set({ contactPerson: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Contact number</FieldLabel>
              <Input value={siteVisit.contactNumber || ""} onChange={(e) => set({ contactNumber: e.target.value })} />
            </div>
          </FormRow>

          <FormRow cols={1}>
            <div>
              <FieldLabel>Google map link</FieldLabel>
              <Input value={siteVisit.googleMapLink || ""} onChange={(e) => set({ googleMapLink: e.target.value })} placeholder="https://maps.google.com/…" />
            </div>
          </FormRow>

          {siteVisit.gatePassRequired && (
            <FileUpload label="Attach permit copy" files={permitFiles} onChange={onPermitFilesChange} />
          )}
        </>
      )}
    </div>
  );
}
