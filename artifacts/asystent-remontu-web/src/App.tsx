import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Marketing from "@/pages/Marketing";
import Support from "@/pages/Support";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/asystent-remontu" component={Marketing} />
      <Route path="/pomoc" component={Support} />
      <Route path="/polityka-prywatnosci" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
