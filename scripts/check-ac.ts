import fs from "fs";
import path from "path";

export interface AcceptanceCriterion {
  id: string;
  feature: string;
  testType: string;
  description: string;
}

export interface TestMatch {
  file: string;
  line: number;
  testTitle: string;
}

export function parsePRD(prdPath: string): Map<string, AcceptanceCriterion> {
  const content = fs.readFileSync(prdPath, "utf8");
  const acMap = new Map<string, AcceptanceCriterion>();
  const regex = /\*\*(AC-F(\d+)-(\d+))\*\*\s*\\?\[(.*?)\]\s*([\s\S]*?)(?=\n-|\n###|\n##|$)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const featureNum = match[2];
    const testType = match[4].replace(/\\/g, "").trim();
    const description = match[5].trim().split("\n")[0];

    acMap.set(id, {
      id,
      feature: `F${featureNum}`,
      testType,
      description,
    });
  }

  return acMap;
}

export function parseProgress(progressPath: string): Set<string> {
  const doneFeatures = new Set<string>();
  if (!fs.existsSync(progressPath)) return doneFeatures;

  const content = fs.readFileSync(progressPath, "utf8");
  const lines = content.split("\n");

  for (const line of lines) {
    // Matches e.g. "| **F1** | App Shell... | Done |" or "- [x] F1"
    const match = line.match(/\b\*{0,2}(F\d+)\*{0,2}\b.*?\b(Done|Completed)\b/i);
    if (match) {
      doneFeatures.add(match[1].toUpperCase());
    }
  }

  return doneFeatures;
}

export function findTestFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== ".next" &&
        file !== ".git" &&
        file !== ".agents" &&
        file !== "dist" &&
        file !== "build"
      ) {
        findTestFiles(fullPath, fileList);
      }
    } else if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export function scanTests(testFiles: string[]): Map<string, TestMatch[]> {
  const matches = new Map<string, TestMatch[]>();
  // Matches e.g. it('AC-F1-1: ...') or test("AC-F1-1 ...") or describe('AC-F1-1', ...)
  const testRegex = /(?:it|test|describe)(?:\.skip|\.only)?\s*\(\s*['"`](AC-F\d+-\d+)[:\s\-](.*?)['"`]/g;

  for (const file of testFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let m: RegExpExecArray | null;
      while ((m = testRegex.exec(lines[i])) !== null) {
        const acId = m[1];
        const title = m[2].trim();
        const list = matches.get(acId) || [];
        list.push({
          file: path.relative(process.cwd(), file),
          line: i + 1,
          testTitle: title,
        });
        matches.set(acId, list);
      }
    }
  }

  return matches;
}

export function runCheck() {
  const prdPath = path.resolve("docs/PRD.md");
  const progressPath = path.resolve("PROGRESS.md");

  if (!fs.existsSync(prdPath)) {
    console.error("ERROR: docs/PRD.md not found.");
    process.exit(1);
  }

  const allAcs = parsePRD(prdPath);
  const doneFeatures = parseProgress(progressPath);
  const testFiles = [
    ...findTestFiles(path.resolve("src")),
    ...findTestFiles(path.resolve("tests")),
  ];
  const foundTests = scanTests(testFiles);

  const args = process.argv.slice(2);
  const checkAll = args.includes("--all");
  const featureArgIndex = args.indexOf("--feature");
  const specificFeature = featureArgIndex !== -1 ? args[featureArgIndex + 1]?.toUpperCase() : null;

  console.log(`\n======================================================`);
  console.log(`EventPass PRD Acceptance Criteria (AC) Verification`);
  console.log(`Found ${allAcs.size} total ACs in docs/PRD.md across 10 features`);
  console.log(`Features marked Done in PROGRESS.md: ${doneFeatures.size > 0 ? Array.from(doneFeatures).join(", ") : "None yet (in progress)"}`);
  console.log(`Scanned ${testFiles.length} test files`);
  console.log(`======================================================\n`);

  let totalChecked = 0;
  let totalMissing = 0;
  const missingByFeature: Record<string, string[]> = {};

  const features = Array.from(new Set(Array.from(allAcs.values()).map((a) => a.feature))).sort(
    (a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))
  );

  for (const feat of features) {
    if (specificFeature && feat !== specificFeature) {
      continue;
    }

    const isDone = doneFeatures.has(feat);
    // If specificFeature is given, check it. If checkAll is given, check it. Otherwise, check only features marked Done.
    const shouldEnforce = checkAll || (specificFeature ? true : isDone);
    const acs = Array.from(allAcs.values()).filter((a) => a.feature === feat);

    let featPassed = 0;
    const featMissing: string[] = [];

    for (const ac of acs) {
      if (ac.id === "AC-F10-12") {
        // Special manual smoke verification
        const smokeExists = fs.existsSync(path.resolve("docs/ai-smoke.md"));
        if (smokeExists) {
          featPassed++;
        } else if (shouldEnforce) {
          featMissing.push(ac.id);
        }
        continue;
      }

      const match = foundTests.get(ac.id);
      if (match && match.length > 0) {
        featPassed++;
      } else {
        if (shouldEnforce) {
          featMissing.push(ac.id);
        }
      }
    }

    const statusTag = isDone ? "[DONE]" : "[IN PROGRESS]";
    console.log(
      `${feat.padEnd(5)} ${statusTag.padEnd(15)} : ${featPassed}/${acs.length} ACs covered`
    );

    if (featMissing.length > 0 && shouldEnforce) {
      missingByFeature[feat] = featMissing;
      totalMissing += featMissing.length;
      console.log(`   -> MISSING: ${featMissing.join(", ")}`);
    }

    if (shouldEnforce) {
      totalChecked += acs.length;
    }
  }

  console.log(`\n------------------------------------------------------`);
  if (totalMissing > 0) {
    console.error(`FAILED: ${totalMissing} Acceptance Criteria missing automated tests!`);
    process.exit(1);
  } else {
    if (totalChecked > 0) {
      console.log(`SUCCESS: All ${totalChecked} enforced Acceptance Criteria have matching automated tests!`);
    } else {
      console.log(`SUCCESS: Verification harness passed. Features currently in progress.`);
    }
    process.exit(0);
  }
}

if (require.main === module) {
  runCheck();
}
