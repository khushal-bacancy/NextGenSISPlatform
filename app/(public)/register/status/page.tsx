import { RegistrationStatus } from "@/components/registration/registration-status";

export const metadata = {
  title: "Registration Status",
  description: "Check the status of your student registration request."
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function RegistrationStatusPage({ searchParams }: Props) {
  const resolved = await searchParams;
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-start justify-center px-4 py-10">
      <RegistrationStatus email={resolved?.email} />
    </div>
  );
}
