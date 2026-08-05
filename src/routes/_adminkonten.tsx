import { createFileRoute } from "@tanstack/react-router";
import { AdminKontenShell } from "../components/AdminKontenShell";


export const Route = createFileRoute("/_adminkonten")({
  component: AdminKontenShell,
});
