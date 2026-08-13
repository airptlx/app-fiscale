import { render, screen, within } from "@testing-library/react";
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

  it("renders the three expected lines for the exact-path scenario", async () => {
    seedAnswers({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    });
    render(<ResultPage />);

    expect((await screen.findAllByText("1AJ")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/28\s?000/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/estimation/i)).not.toBeInTheDocument();
  });

  it("renders a warning for the estimation-path scenario", async () => {
    seedAnswers({
      "situation-conjugale": "celibataire",
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
    seedAnswers({
      "situation-conjugale": "celibataire",
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 20_000,
      chomage: true,
      "montant-chomage-2025": 5_000,
    });
    render(<ResultPage />);

    await screen.findByText(/Cases à vérifier/i);
    const table = screen.getByRole("table");
    expect(within(table).getByText("1AJ")).toBeInTheDocument();
    expect(within(table).getByText("1AP")).toBeInTheDocument();
    expect(
      within(table).queryByText(/Impôt sur le revenu/i),
    ).not.toBeInTheDocument();
  });
});
