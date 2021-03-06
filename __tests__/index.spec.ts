import { generateTermDefinitionWithHashlink, decodeHashlink, validateTermDefinition, generateContext } from "../src/index";

describe("create integrity protected term definitions", () => {
  it("Should successfully generates an integrity protected term definition", () => {
    const termName = "name";
    const termDefinition = {
      "@protected": true,
      "@id": "http://schema.org/name",
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };

    const termDefintionWithIntegrity = generateTermDefinitionWithHashlink(termName, termDefinition);
    expect(termDefintionWithIntegrity["@id"] !== termDefinition["@id"]).toBe(true);
    expect(termDefintionWithIntegrity).toMatchObject({
      "@protected": true,
      "@id": "http://schema.org/name?hl=z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE",
      "@definition": "The name of the citizenship document.",
      type: "@type",
    });
  });

    it("Should fail generates an integrity protected term definition because the @definition is missing", () => {
      const termName = "name";
      const termDefinition = {
        "@protected": true,
        "@id": "http://schema.org/name",
        type: "@type",
      };

      expect(() => {
        generateTermDefinitionWithHashlink(termName, termDefinition);
      }).toThrowError("It's expected that the @definition property MUST be defined.");
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
        "@id": baseId,
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
describe("validates integrity protected term definitions", () => {
  it("Should successfully validate an integrity protected term definition", () => {
    const termDefinition = {
      "@protected": true,
      "@id": "http://schema.org/name?hl=z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE",
      "@definition": "The name of the citizenship document.",
      type: "@type",
    };
    const result = validateTermDefinition(termDefinition);
    expect(result).toBe(true);
  });

    it("Should fail validate an integrity protected term definition because it's been modified", () => {
      const termDefinition = {
        "@protected": true,
        "@id": "http://schema.org/name?hl=z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE",
        "@definition": "This definition has been changed.",
        type: "@type",
      };
      const result = validateTermDefinition(termDefinition);
      expect(result).toBe(false);
    });
});

describe("generates an integrity protected context file", () => {
  const context = {
    "@context": {
      "@version": 1.2,
      "name": {
      "@protected": true,
      "@id": "http://schema.org/name",
      "@definition": "The name of the citizenship document.",
      "type": "@type"
      }
    }
  };

  const expectedResult = {
    "@context": {
      "@version": 1.2,
      name: {
        "@protected": true,
        "@id": "http://schema.org/name?hl=z6auZj6TcoreKaT6m6E3ETvBxgDKcLfBhwKCKoKJZGW3oE",
        "@definition": "The name of the citizenship document.",
        type: "@type",
      },
    },
  };

  const result = generateContext(context);
  expect(result).toBe(expectedResult);
});
