import IssueDetails from "@/app/components/IssueDetails";

export default function IssuePage({ params }) {
  return <IssueDetails issueId={params.id} />;
}
