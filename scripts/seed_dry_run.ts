import * as fs from "fs";

async function main() {
  const datasetPaths = [
    "/mnt/user-uploads/perfumes_ptbr.json",
    "/tmp/user-uploads/perfumes_ptbr.json",
    "./perfumes_ptbr.json"
  ];
  
  let datasetPath = "";
  for (const p of datasetPaths) {
    if (fs.existsSync(p)) {
      datasetPath = p;
      break;
    }
  }

  if (datasetPath) {
    console.log("FOUND_DATASET:" + datasetPath);
  } else {
    console.log("NOT_FOUND");
  }
}
main();
