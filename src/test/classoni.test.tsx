import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { nextGlow, plans, quizCorrect } from "@/lib/classoni";
import Player from "@/screens/Player";
import ClassoniApp from "@/components/ClassoniApp";

afterEach(cleanup);
describe("Classoni rules", () => {
 it("uses exact UGX plan prices", () => { expect(plans.map(p => p.price)).toEqual([1000,4000,10000]); });
 it("uses exact advertised plan savings", () => { expect(plans.map(p => p.saving)).toEqual([null,43,67]); });
 it("advances Apply to Explain to Quiz to Posts and finishes", () => { expect([nextGlow("apply"),nextGlow("explain"),nextGlow("quiz"),nextGlow("posts")]).toEqual(["explain","quiz","posts",null]); });
 it("accepts B and rejects other MCQ choices", () => { expect(quizCorrect("B")).toBe(true); for(const letter of ["A","C","D"])expect(quizCorrect(letter)).toBe(false); });
 it("starts at Welcome and navigates to input", async () => {render(<ClassoniApp/>);fireEvent.click(screen.getByRole("button",{name:"Start Learning"})); expect(await screen.findByRole("textbox",{name:"Course unit / Subject"})).toBeInTheDocument();});
 it("keeps Apply solution hidden until Solve", () => {render(<Player navigate={vi.fn()}/>);fireEvent.click(screen.getByRole("button",{name:"Apply"}));expect(screen.queryByText(/21.9 grams/)).not.toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Solve"}));expect(screen.getByText(/21.9 grams/)).toBeInTheDocument();});
 it("opens premium plans, never the manual-only paywall", () => {const navigate=vi.fn();render(<Player navigate={navigate}/>);fireEvent.click(screen.getByRole("button",{name:"Go Premium"}));expect(navigate).toHaveBeenCalledWith("premiumPlans");expect(navigate).not.toHaveBeenCalledWith("paywall");});
 it("does not award quiz points", () => {render(<Player navigate={vi.fn()}/>);fireEvent.click(screen.getByRole("button",{name:"Quiz"}));fireEvent.click(screen.getByRole("button",{name:/B\) The myosin/}));expect(screen.getByText("Correct!")).toBeInTheDocument();expect(screen.getByText("12 pts")).toBeInTheDocument();});
 it("pauses captions without resetting the current word", () => {vi.useFakeTimers();render(<Player navigate={vi.fn()}/>);const before=document.querySelector('[data-highlighted="true"]')?.textContent;fireEvent.click(screen.getByRole("button",{name:"Apply"}));vi.advanceTimersByTime(2000);expect(document.querySelector('[data-highlighted="true"]')?.textContent).toBe(before);vi.useRealTimers();});
});
