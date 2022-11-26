import { defineConfig } from "cypress";
export default defineConfig({
    projectId: 't89mbd',
    component: {
        devServer: {
            framework: "create-react-app",
            bundler: "webpack",
        },
    },
});
