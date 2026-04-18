import { auth, signOut } from "@/auth";
import UserFloatingButtonClient from "./UserFloatingButtonClient";

/**
 * Server Component: obtiene la sesión y pasa los datos al Client Component.
 * Si no hay sesión activa, no renderiza nada.
 */
export default async function UserFloatingButton() {
  const session = await auth();

  if (!session?.user) return null;

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <UserFloatingButtonClient
      userName={session.user.name ?? undefined}
      userEmail={session.user.email ?? undefined}
      signOutAction={signOutAction}
    />
  );
}
