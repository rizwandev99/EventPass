import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("F2 Guest Session Architecture & No-Auth Rules", () => {
  it("AC-F2-5: project has no auth library in package.json and no route named login, signup or sign-in", () => {
    const pkgPath = path.resolve(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    const forbiddenAuthLibs = [
      "next-auth",
      "@auth/core",
      "@auth/nextjs",
      "passport",
      "clerk",
      "@clerk/nextjs",
      "lucia",
      "supabase-auth-helpers",
      "@supabase/auth-helpers-nextjs",
      "firebase-admin",
      "auth0",
      "jsonwebtoken",
    ];

    for (const lib of forbiddenAuthLibs) {
      expect(allDeps[lib], `Forbidden auth library found in package.json: ${lib}`).toBeUndefined();
    }

    // Check routes in src/app for login, signup, sign-in
    const appDir = path.resolve(__dirname, "../../src/app");
    function checkForbiddenRoutes(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const lower = entry.name.toLowerCase();
          expect(["login", "signup", "sign-in", "signin"].includes(lower), `Forbidden route directory found: ${lower}`).toBe(false);
          checkForbiddenRoutes(path.join(dir, entry.name));
        }
      }
    }
    checkForbiddenRoutes(appDir);
  });
});
