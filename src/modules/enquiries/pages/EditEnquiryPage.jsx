import { useParams } from "react-router-dom";
import { EnquiryForm } from "../components/EnquiryForm";

export default function EditEnquiryPage() {
  const { id } = useParams();
  return <EnquiryForm mode="edit" id={id} />;
}
