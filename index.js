import weaviate from "weaviate-ts-client";
import { readdirSync, readFileSync } from "fs";

const args = process.argv.slice(2);

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

// function toBase64(file) {
//   return readFileSync(file, "base64");
// }

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

// Builder pattern?
const schemaRes = await client.schema.getter().do();

console.log(schemaRes);

const existingClass = schemaRes.classes.find(
  ({ class: className }) => className === "Meme"
);

const migrateClass = async () => {
  const schemaConfig = {
    class: "Meme",
    vectorizer: "img2vec-neural",
    // Hierarchical Navigable Small Worlds graph indexing
    vectorIndexTYpe: "hnsw",
    moduleConfig: {
      "img2vec-neural": {
        imageFields: ["image"],
      },
    },
    properties: [
      {
        name: "image",
        dataType: ["blob"],
      },
      {
        name: "text",
        dataType: ["string"],
      },
    ],
  };

  await client.schema.classCreator().withClass(schemaConfig).do();
};

const vectoriseImageData = async () => {
  const folderName = "inputImages";
  const inputFiles = readdirSync(`./${folderName}`);

  const promises = inputFiles.map(async (imgFile) => {
    console.log("Path: ", imgFile);

    if (imgFile.startsWith(".")) {
      console.log("SKIP - dot file");
      return;
    }

    const img = readFileSync(`./${folderName}/${imgFile}`);
    const imageName = imgFile.split(".")[0].split("_").join(" ");
    const b64 = Buffer.from(img).toString("base64");

    await client.data
      .creator()
      .withClassName("Meme")
      .withProperties({
        image: b64,
        text: imageName,
      })
      .do();
  });

  await Promise.all(promises);
};

const queryImages = async () => {
  const test = Buffer.from(readFileSync("./queryImage/spongebob.jpg")).toString(
    "base64"
  );

  const resImage = await client.graphql
    .get()
    .withClassName("Meme")
    .withFields(["image", "text"])
    .withNearImage({ image: test })
    .withLimit(5)
    .do();

  // Write result to filesystem
  console.log(resImage.data.Get.Meme.map(({ text }) => text));
  // const result = resImage.data.Get.Meme[0].image;
  // writeFileSync("./result.jpg", result, "base64");
};

if (!existingClass) {
  console.log("Meme class does not exist - migrate");
  await migrateClass();
}

if (args.includes("--vectorise")) {
  await vectoriseImageData();
}

if (args.includes("--query")) {
  await queryImages();
}

console.log("DONE ✅");
