import { canonicalize } from "json-canonicalize";
import { hash } from "@stablelib/sha256";
import bs58 from "bs58";
import { addPrefix } from "multicodec";
import { Buffer } from "buffer";
import { parse } from "querystring";

export const generateTermDefinitionWithHashlink = (termName: string, termDefinition: any): any => {
  if (termDefinition["@definition"] === undefined) {
    throw new Error("It's expected that the @definition property MUST be defined.");
  }

  if (termDefinition["@id"] === undefined) {
    throw Error(`No @id property is defined for the term: ${termName}`);
  }
  const termId = termDefinition["@id"];

  const hashlinkedTerm = encodeHashlink(termDefinition);
  console.log(hashlinkedTerm);
  return {
    ...termDefinition,
    "@id": `${termId}?hl=${hashlinkedTerm}`,
  };
};

export const encodeHashlink = (data: any): string => {
  const MULTIBASE_ENCODING_PREFIX = "z";
  const canonicalizedTerm = canonicalize(data);
  const canonicalizedBytes = Uint8Array.from(Buffer.from(canonicalizedTerm, "utf-8"));
  const digestBytes = hash(canonicalizedBytes);
  const prefixedBytes = addPrefix("sha2-256", digestBytes);
  return `${MULTIBASE_ENCODING_PREFIX}${bs58.encode(prefixedBytes)}`;
};

export const decodeHashlink = (data: any): { validationData: any; hashlink: string } => {
  if (data["@id"] === undefined) {
    throw new Error("No @id property can be found.");
  }
  // TODO: Validate that the termId is a valid URL
  const termId: string = data["@id"];
  const parsedTermId = termId.split("?");

  // TODO fix this hack to make it not specific to where the query string is.
  // Should be able to find a library that can be used for this.
  const parsedQueryString = parse(parsedTermId[1]);

  if (parsedQueryString.hl === undefined) {
    throw new Error("No Hashlink was included on the term definition @id.");
  }
  if (typeof parsedQueryString.hl !== "string") {
    throw new Error("The hashlink query parameter is malformed.");
  }

  return {
    validationData: {
      ...data,
      "@id": parsedTermId[0],
    },
    hashlink: parsedQueryString.hl,
  };
};

export const validateTermDefinition = (termDefinition: any): boolean => {
  const { validationData, hashlink } = decodeHashlink(termDefinition);
  const regeneratedHashlink = encodeHashlink(validationData);
  // TODO abstract this logic more to compare across different multibase encodings of the hashlink
  return regeneratedHashlink === hashlink;
};

export const generateContext = (contextObject: object): any => {
  let integrityProtectedObject: any = {};
  for (const [key, value] of Object.entries(contextObject)) {
    if (typeof value === "object" && key === "@context") {
      integrityProtectedObject = {
        ...integrityProtectedObject,
        key: generateContext(value),
      };

      // handles term definition with @id prop
      if (typeof value === "object") {
        const termDefintion = generateTermDefinitionWithHashlink(key, value);
        integrityProtectedObject[key] = termDefintion;
      }

      if (typeof value != "object") {
        integrityProtectedObject[key] = value;
      }
    }

    return integrityProtectedObject;
  }
};
