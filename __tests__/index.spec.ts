import { generateTermDefinitionWithHashlink, decodeHashlink } from "../src/index";

describe("create integrity protected term definitions", () => {
  it("Should successfully generates an integrity protected term definition", async () => {
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

describe("decodes the hashlink", () => {
  it("Should successfully decode the hashlink", () => {
    const baseId = "http://schema.org/name";
    const hashlink = "z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE";
    const termDefinition = {
      "@protected": true,
      "@id": `${baseId}?hl=${hashlink}`,
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };
    const result = decodeHashlink(termDefinition);
    expect(result).toMatchObject({
      validationData: {
        ...termDefinition,
        "@id": baseId
      },
      hashlink,
    });
  });

  it("Should fail to decode the hashlink because the @id property is missing", () => {
    const termDefinition = {
      "@protected": true,
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };
    expect(() => {
      decodeHashlink(termDefinition);
    }).toThrowError("No @id property can be found.");
  });

  it("Should fail to decode the hashlink because the @id property is missing a hashlink", () => {
    const baseId = "http://schema.org/name";
    const termDefinition = {
      "@protected": true,
      "@id": `${baseId}`,
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };
    expect(() => {
      decodeHashlink(termDefinition);
    }).toThrowError("No Hashlink was included on the term definition @id.");
  });

  it.skip("Should fail to decode the hashlink because the hashlink query parameter is malformed", () => {
    // TODO find data that will make parse function return as string[] which would throw the error
    const baseId = "http://schema.org/name";
    const malformedHashlinkQueryString = "hl=xyz&#x26;hl=123";
    const termDefinition = {
      "@protected": true,
      "@id": `${baseId}?${malformedHashlinkQueryString}`,
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };    
    expect(() => {
      const result = decodeHashlink(termDefinition);
      console.log(JSON.stringify(result));
    }).toThrowError("The hashlink query parameter is malformed.");
  });
});