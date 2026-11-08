import { createElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "@/pages/Home";

describe("simple citizen home", () => {
  it("starts with search and three choices instead of operational counters", () => {
    render(createElement(Home));
    expect(
      screen.getByRole("button", { name: "Cerca un argomento o una persona" }),
    ).toBeVisible();
    const choices = screen.getByRole("region", {
      name: "Oppure scegli da dove partire",
    });
    expect(within(choices).getAllByRole("link")).toHaveLength(3);
    expect(
      screen.queryByText("Numeri disponibili adesso"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Fonte in attivazione")).not.toBeInTheDocument();
  });
  it("keeps secondary destinations available on request", () => {
    render(createElement(Home));
    const link = screen.getByRole("link", {
      name: "Mappe del territorio",
      hidden: true,
    });
    expect(link.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Altri argomenti e strumenti"));
    expect(link.closest("details")).toHaveAttribute("open");
    expect(link).toHaveAttribute("href", "/atlante-territoriale");
  });
  it("retains source coverage and update limitations in an explicit disclosure", () => {
    render(createElement(Home));
    expect(screen.getByText(/La copertura è parziale/)).toBeInTheDocument();
    expect(screen.getByText(/Ultimo controllo:/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Controlla gli aggiornamenti",
        hidden: true,
      }),
    ).toHaveAttribute("href", "/stato-monitoraggio");
    expect(
      screen.getByText(/Una notizia non conferma da sola/),
    ).toBeInTheDocument();
  });
});
