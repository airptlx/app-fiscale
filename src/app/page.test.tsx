import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

describe("Home", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockClear();
  });

  it("disables Commencer until the disclaimer checkbox is checked, then navigates on click", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = await screen.findByRole("button", { name: "Commencer" });
    expect(button).toBeDisabled();

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(button).toBeEnabled();

    await user.click(button);
    expect(push).toHaveBeenCalledWith("/questionnaire");
  });
});
