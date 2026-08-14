import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANSWERS_STORAGE_KEY } from "@/lib/questionnaire/answers-storage";
import ResultPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function seedAnswers(answers: Record<string, unknown>) {
  window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
}

describe("ResultPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders 1AJ on the Détail tab, and again on the Cases à vérifier tab", async () => {
    const user = userEvent.setup();
    seedAnswers({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    });
    render(<ResultPage />);

    expect((await screen.findAllByText("1AJ")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/28\s?000/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/estimation/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Cases à vérifier" }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("1AJ")).toBeInTheDocument();
  });

  it("renders a warning for the estimation-path scenario", async () => {
    seedAnswers({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": false,
      "salaire-brut-annuel-2025": 35_000,
    });
    render(<ResultPage />);

    await screen.findByText(/Points de vigilance/i);
    expect(screen.getByText(/utilisé ici/i)).toBeInTheDocument();
  });

  it("renders the unsupported-situation message when situation-conjugale is 'autre'", async () => {
    seedAnswers({ "situation-conjugale": "autre" });
    render(<ResultPage />);

    await screen.findByText(/parent isolé/i);
  });

  it("renders a recap table listing every case, but not the code-less computed lines", async () => {
    const user = userEvent.setup();
    seedAnswers({
      "situation-conjugale": "celibataire",
      revenus: ["salaire", "chomage"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 20_000,
      "montant-chomage-2025": 5_000,
    });
    render(<ResultPage />);

    await user.click(await screen.findByRole("tab", { name: "Cases à vérifier" }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("1AJ")).toBeInTheDocument();
    expect(within(table).getByText("1AP")).toBeInTheDocument();
    expect(
      within(table).queryByText(/Impôt sur le revenu/i),
    ).not.toBeInTheDocument();
  });

  it("shows no Conseils tab when there is nothing to advise on", async () => {
    seedAnswers({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    });
    render(<ResultPage />);

    await screen.findByRole("tab", { name: "Détail" });
    expect(screen.queryByRole("tab", { name: "Conseils" })).not.toBeInTheDocument();
  });

  it("shows the crypto foreign-account conseil on its own tab when checked", async () => {
    const user = userEvent.setup();
    seedAnswers({
      "situation-conjugale": "celibataire",
      revenus: ["salaire"],
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
      "activites-annexes": ["crypto"],
    });
    render(<ResultPage />);

    await user.click(await screen.findByRole("tab", { name: "Conseils" }));
    expect(screen.getByText(/3916-bis/)).toBeInTheDocument();
  });
});
