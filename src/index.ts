import { canonicalize } from "json-canonicalize";
import { hash } from "@stablelib/sha256";
import bs58 from 'bs58';
import { addPrefix } from "multicodec";
import { Buffer } from "buffer";

export const generateTermDefinitionWithHashlink = (termName: string, termDefinition: any): any => {
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

export const validateTermDefinition = (termDefinition: any): boolean => {
  throw Error("Not Implemented");
};