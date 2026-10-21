"use client";

import { useEffect, useState } from "react";
import { admin } from "@/lib/admin/client";
import type { User } from "@/lib/blog/types";
import { Inbox } from "@/components/admin/Inbox";

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    admin
      .get<User>("auth/me")
      .then(setUser)
      .catch(() => undefined);
  }, []);
  return <Inbox user={user} />;
}
