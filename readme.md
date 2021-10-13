# JSON-LD Context Integrity

## Why?

Currently when it comes to handling semantic data in a JSON-LD context the purpose is only about structuring the data in the document. This improvement intends to add the capability to make the JSON-LD Context document maintain integrity of the semantics used throughout the document. The reason the integrity of the semantics need to remain in tact is because when you're signing the semantics of a document, any changes to the structure will end up breaking the signature and affecting the validation process.

## How?

In this proposal we'll rely on extending 2 key features of JSON-LD 1.1 today as well as define an additional proposed term to maintain integrity of a definition. 

1. First let's take a look at the modification to the `@id` property. In this proposal we'll be adding a hashlink[draft-hl](https://datatracker.ietf.org/doc/html/draft-sporny-hashlink) to the id property which is generated using the algorithm defined [below](#hash-link-algorthm). 

2. Additionally, we'll extend the definition of the `@protected` reserved term to signal the intention of utilizing the hashlink to verify the term-scoped context. If `@protected` is defined as true, then the Hashlink MUST verify the scoped term context. Otherwise, it must error stating which property failed to verify in the context.

3. We'll add a new reserved term called the `@definition` term. The purpose of this term is to embed the semantics of the term within the context itself which will prevent semantic drift (changing what the term means) when combined with the hashlink validation. It's expected that this definition will be used by a developer to comprehend and understand the purpose of the term. The `@definition` value MUST be a String.

### Hash Link Algorithm

### Improvements

1. Generate an integrity protected context document based on a published context.

2. Generate a context pulling the definitions from schema.org for a set terms.

3. Build a website that allows people to easily generate contexts that can be published
