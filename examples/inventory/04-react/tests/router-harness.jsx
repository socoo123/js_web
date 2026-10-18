import { MemoryRouter } from "react-router";
import App from "../src/App.jsx";

export function TestApp({ initialEntries = ["/products"], loadProduct }) {
  return <MemoryRouter initialEntries={initialEntries}><App loadProduct={loadProduct} /></MemoryRouter>;
}
