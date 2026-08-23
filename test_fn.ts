import { getRecommendations } from "./src/services/perfume.functions";

async function run() {
  try {
    const results = await getRecommendations({ 
      data: {
        genero: "Feminino",
        familia: "Floral",
        ocasiao: "Noite/Festas",
        intensidade: "Intensa/Marcante",
        nota: "Rosa"
      }
    });
    console.log("RESULT_START");
    console.log(JSON.stringify(results));
    console.log("RESULT_END");
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
