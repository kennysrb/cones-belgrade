import { render, screen } from "@testing-library/react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";

test("Input renders label and is required", () => {
  render(<Input label="Email" name="email" required />);
  expect(screen.getByLabelText(/email/i)).toBeRequired();
});

test("Textarea wires htmlFor correctly", () => {
  render(<Textarea label="Message" name="message" />);
  expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
});

test("Select renders options", () => {
  render(
    <Select label="Role" name="role">
      <option value="player">Player</option>
      <option value="fan">Fan</option>
    </Select>
  );
  expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Fan" })).toBeInTheDocument();
});
