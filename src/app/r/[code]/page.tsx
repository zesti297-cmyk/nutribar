import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface ReferralPageProps {
  params: Promise<{ code: string }>;
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { code } = await params;
  const cookieStore = await cookies();

  cookieStore.set("referral_code", code.toUpperCase(), {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  redirect(`/login/translator?ref=${code.toUpperCase()}`);
}
