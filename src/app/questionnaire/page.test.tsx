import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISCLAIMER_STORAGE_KEY } from "@/lib/disclaimer/storage";
import QuestionnairePage from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));

async function goToFichePaie(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("radio", { name: /Célibataire/i }));
  await user.click(screen.getByRole("button", { name: "Suivant" }));

  await screen.findByText(/Qu'est-ce que tu as touché/i);
  await user.click(screen.getByRole("checkbox", { name: /Un salaire/i }));
  await user.click(screen.getByRole("button", { name: "Suivant" }));

  await screen.findByText(/fiche de paie de décembre/i);
}

describe("QuestionnairePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
    replace.mockClear();
  });

  it("renders the first prompt, has no Précédent available, and advances on answer", async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await screen.findByText(/Quelle est ta situation/i);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /Célibataire/i }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    await screen.findByText(/Qu'est-ce que tu as touché/i);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeEnabled();
  });

  it("reveals fiche-paie-disponible once 'salaire' is checked on the revenus screen", async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await goToFichePaie(user);
  });

  it("Précédent returns to the previous prompt", async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await goToFichePaie(user);

    await user.click(screen.getByRole("button", { name: "Précédent" }));
    await screen.findByText(/Qu'est-ce que tu as touché/i);
  });

  it("redirects to / when the disclaimer has not been acknowledged", async () => {
    window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
    render(<QuestionnairePage />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
