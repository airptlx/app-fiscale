import { render, screen } from "@testing-library/react";
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
      "situation-familiale-simple": true,
      "fiche-paie-disponible": true,
      "salaire-net-imposable-2025": 28_000,
    });
    render(<ResultPage />);

    await screen.findByText("1AJ");
    expect(screen.getAllByText(/28\s?000/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/estimation/i)).not.toBeInTheDocument();
  });

  it("renders a warning for the estimation-path scenario", async () => {
    seedAnswers({
      "situation-familiale-simple": true,
      "fiche-paie-disponible": false,
      "salaire-brut-annuel-2025": 35_000,
    });
    render(<ResultPage />);

    await screen.findByText(/Points de vigilance/i);
    expect(screen.getByText(/utilisé ici/i)).toBeInTheDocument();
  });

  it("renders the unsupported-situation message when situation-familiale-simple is false", async () => {
    seedAnswers({ "situation-familiale-simple": false });
    render(<ResultPage />);

    await screen.findByText(/seule la situation/i);
  });
});
