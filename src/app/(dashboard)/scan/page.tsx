import { PageHeader } from "@/components/dashboard/page-header";
import { ScanResultPanel } from "@/components/scanner/scan-result-panel";

export default function ScanPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Scan Asset"
        description="Scan the destination first, then scan the tool to record a clean issue or return workflow in the field."
      />
      <ScanResultPanel />
    </div>
  );
}