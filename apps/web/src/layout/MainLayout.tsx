import { PropsWithChildren } from "react";
import "./MainLayout.scss";
import { MainNavigation } from "./MainNavigation";

export const MainLayout  = (props: PropsWithChildren) => {
    return <main>
        <header></header>
        <section>
            <MainNavigation></MainNavigation>
        </section>
        <section>
            {props.children}
        </section>
        <footer></footer>
    </main>
}
