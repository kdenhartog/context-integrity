import { generateTermDefinitionWithHashlink } from "../src/index";

describe("create integrity protected term definitions", () => {
  it("Successfully generates an integrity protected term definition", async () => {
    const termName = "name";
    const termDefinition = {
      "@protected": true,
      "@id": "http://schema.org/name",
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };

    const termDefintionWithIntegrity = await generateTermDefinitionWithHashlink(termName, termDefinition);
    console.log(termDefintionWithIntegrity);
    expect(termDefintionWithIntegrity["@id"] !== termDefinition["@id"]).toBe(true);
    expect(termDefintionWithIntegrity).toMatchObject({
      "@protected": true,
      "@id": "http://schema.org/name?hl=z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE",
      "@definition": "The name of the citizenship document.",
      type: "@type",
    });
  });

  it("Should fail to generate an integrity protected fails because the @id is missing", () => {
    const termName = "name";
    const termDefinition = {
      "@protected": true,
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };
    expect(() => {
      generateTermDefinitionWithHashlink(termName, termDefinition);
    }).toThrowError(`No @id property is defined for the term: ${termName}`);
  });
});
