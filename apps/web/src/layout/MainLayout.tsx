import "./MainLayout.scss";
import { MainNavigation } from "./MainNavigation";

export const MainLayout  = () => {
    return <main>
        <header></header>
        <section>
            <MainNavigation></MainNavigation>
        </section>
        <section>
            <header></header>
            <section></section>
            <footer></footer>
        </section>
        <footer></footer>
    </main>
}
