import { FormBuilder } from "@/components/builder/FormBuilder";
import { MobileBuilderGate } from "@/components/builder/MobileBuilderGate";

export default function FormBuilderPage() {
  return (
    <MobileBuilderGate>
      <FormBuilder />
    </MobileBuilderGate>
  );
}
