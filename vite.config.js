import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": "/src" } // 선택: 절대경로 import용
    }
});
