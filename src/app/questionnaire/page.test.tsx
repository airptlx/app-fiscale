import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISCLAIMER_STORAGE_KEY } from "@/lib/disclaimer/storage";
import QuestionnairePage from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));

describe("QuestionnairePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
    replace.mockClear();
  });

  it("renders the first prompt, has no Précédent available, and advances on answer", async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await screen.findByText(/Êtes-vous célibataire/i);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Oui" }));

    await screen.findByText(/fiche de paie de décembre 2025/i);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeEnabled();
  });

  it("Précédent returns to the previous prompt", async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await user.click(await screen.findByRole("button", { name: "Oui" }));
    await screen.findByText(/fiche de paie de décembre 2025/i);

    await user.click(screen.getByRole("button", { name: "Précédent" }));
    await screen.findByText(/Êtes-vous célibataire/i);
  });

  it("redirects to / when the disclaimer has not been acknowledged", async () => {
    window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
    render(<QuestionnairePage />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
